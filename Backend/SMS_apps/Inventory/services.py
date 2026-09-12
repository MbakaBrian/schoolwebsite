from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from .models import (
    Store,
    InventoryLocation,
    InventoryItem,
    InventoryStock,
    InventoryTransaction,
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def _get_item(item_id):
    """
    Get an active inventory item.

    The item's Department and SubDepartment are now
    managed through the central Department/SubDepartment
    models in the Receipts app.
    """

    try:
        return (
            InventoryItem.objects
            .select_related(
                "department",
                "subdepartment",
            )
            .get(
                pk=item_id,
                is_active=True,
            )
        )

    except InventoryItem.DoesNotExist:
        raise ValueError(
            "Inventory item does not exist or is inactive."
        )


def _get_store(store_id):
    """
    Get an active Store.
    """

    if not store_id:
        return None

    try:
        return Store.objects.get(
            pk=store_id,
            is_active=True,
        )

    except Store.DoesNotExist:
        raise ValueError(
            "Store does not exist or is inactive."
        )


def _get_inventory_location(location_id):
    """
    Get an active Inventory Location.
    """

    if not location_id:
        return None

    try:
        return InventoryLocation.objects.get(
            pk=location_id,
            is_active=True,
        )

    except InventoryLocation.DoesNotExist:
        raise ValueError(
            "Inventory location does not exist or is inactive."
        )


def _validate_single_location(
    store_id=None,
    inventory_location_id=None,
):
    """
    Ensure exactly one location is supplied.
    """

    if bool(store_id) == bool(inventory_location_id):
        raise ValueError(
            "Provide exactly one location: "
            "store_id or inventory_location_id."
        )


def _get_stock(
    item,
    store=None,
    inventory_location=None,
    lock=False,
):
    """
    Get the stock record for an item/location.

    If lock=True, the row is locked using select_for_update()
    so concurrent stock operations cannot modify it simultaneously.
    """

    if bool(store) == bool(inventory_location):
        raise ValueError(
            "Stock must belong to exactly one location."
        )

    queryset = InventoryStock.objects

    if lock:
        queryset = queryset.select_for_update()

    if store:
        return queryset.filter(
            item=item,
            store=store,
        ).first()

    return queryset.filter(
        item=item,
        inventory_location=inventory_location,
    ).first()


def _get_or_create_stock(
    item,
    store=None,
    inventory_location=None,
):
    """
    Get or create a stock record.

    This function should only be used inside an atomic
    transaction.
    """

    stock = _get_stock(
        item=item,
        store=store,
        inventory_location=inventory_location,
        lock=True,
    )

    if stock:
        return stock

    return InventoryStock.objects.create(
        item=item,
        store=store,
        inventory_location=inventory_location,
        quantity=Decimal("0.00"),
    )


def _generate_transaction_id():
    """
    Generate transaction IDs such as:

        INV-2026-00001
        INV-2026-00002
    """

    year = timezone.now().year

    prefix = f"INV-{year}-"

    last_transaction = (
        InventoryTransaction.objects
        .filter(
            transaction_id__startswith=prefix
        )
        .order_by("-transaction_id")
        .first()
    )

    if last_transaction:

        try:
            last_number = int(
                last_transaction.transaction_id.split("-")[-1]
            )

        except (ValueError, IndexError):
            last_number = 0

    else:
        last_number = 0

    return f"{prefix}{last_number + 1:05d}"


# ============================================================
# ADD INVENTORY
# ============================================================

@transaction.atomic
def add_inventory_stock(
    *,
    item_id,
    store_id=None,
    inventory_location_id=None,
    quantity,
    reason,
    notes=None,
    user,
):
    """
    Add inventory to a Store or Inventory Location.
    """

    _validate_single_location(
        store_id=store_id,
        inventory_location_id=inventory_location_id,
    )

    quantity = Decimal(str(quantity))

    if quantity <= 0:
        raise ValueError(
            "Quantity must be greater than zero."
        )

    item = _get_item(item_id)

    store = _get_store(store_id)

    inventory_location = _get_inventory_location(
        inventory_location_id
    )

    stock = _get_or_create_stock(
        item=item,
        store=store,
        inventory_location=inventory_location,
    )

    previous_quantity = stock.quantity

    resulting_quantity = (
        previous_quantity + quantity
    )

    stock.quantity = resulting_quantity

    stock.save(
        update_fields=[
            "quantity",
            "updated_at",
        ]
    )

    inventory_transaction = InventoryTransaction.objects.create(
        transaction_id=_generate_transaction_id(),

        transaction_type=InventoryTransaction.ADDITION,

        item=item,

        destination_store=store,

        destination_inventory_location=inventory_location,

        quantity=quantity,

        destination_previous_quantity=previous_quantity,

        destination_resulting_quantity=resulting_quantity,

        created_by=user,

        reason=reason,

        notes=notes,
    )

    return inventory_transaction


# ============================================================
# REMOVE INVENTORY
# ============================================================

@transaction.atomic
def remove_inventory_stock(
    *,
    item_id,
    store_id=None,
    inventory_location_id=None,
    quantity,
    reason,
    notes=None,
    user,
):
    """
    Remove inventory from a Store or Inventory Location.

    The operation is rejected if the requested quantity
    is greater than the available stock.
    """

    _validate_single_location(
        store_id=store_id,
        inventory_location_id=inventory_location_id,
    )

    quantity = Decimal(str(quantity))

    if quantity <= 0:
        raise ValueError(
            "Quantity must be greater than zero."
        )

    item = _get_item(item_id)

    store = _get_store(store_id)

    inventory_location = _get_inventory_location(
        inventory_location_id
    )

    stock = _get_stock(
        item=item,
        store=store,
        inventory_location=inventory_location,
        lock=True,
    )

    if not stock:
        raise ValueError(
            "No stock record exists at this location."
        )

    previous_quantity = stock.quantity

    if quantity > previous_quantity:
        raise ValueError(
            f"Insufficient stock. "
            f"Available quantity: {previous_quantity}."
        )

    resulting_quantity = (
        previous_quantity - quantity
    )

    if resulting_quantity < 0:
        raise ValueError(
            "Stock quantity cannot become negative."
        )

    stock.quantity = resulting_quantity

    stock.save(
        update_fields=[
            "quantity",
            "updated_at",
        ]
    )

    inventory_transaction = InventoryTransaction.objects.create(
        transaction_id=_generate_transaction_id(),

        transaction_type=InventoryTransaction.REMOVAL,

        item=item,

        source_store=store,

        source_inventory_location=inventory_location,

        quantity=quantity,

        source_previous_quantity=previous_quantity,

        source_resulting_quantity=resulting_quantity,

        created_by=user,

        reason=reason,

        notes=notes,
    )

    return inventory_transaction


# ============================================================
# TRANSFER INVENTORY
# ============================================================

@transaction.atomic
def transfer_inventory_stock(
    *,
    item_id,

    source_store_id=None,
    source_inventory_location_id=None,

    destination_store_id=None,
    destination_inventory_location_id=None,

    quantity,
    reason,
    notes=None,
    user,
):
    """
    Transfer inventory between any two locations.

    Supported:

        Store -> Store
        Store -> Inventory Location
        Inventory Location -> Store
        Inventory Location -> Inventory Location

    The operation is atomic.
    """

    _validate_single_location(
        store_id=source_store_id,
        inventory_location_id=source_inventory_location_id,
    )

    _validate_single_location(
        store_id=destination_store_id,
        inventory_location_id=destination_inventory_location_id,
    )

    quantity = Decimal(str(quantity))

    if quantity <= 0:
        raise ValueError(
            "Quantity must be greater than zero."
        )

    item = _get_item(item_id)

    source_store = _get_store(
        source_store_id
    )

    source_location = _get_inventory_location(
        source_inventory_location_id
    )

    destination_store = _get_store(
        destination_store_id
    )

    destination_location = _get_inventory_location(
        destination_inventory_location_id
    )

    # --------------------------------------------------------
    # Prevent same location transfer
    # --------------------------------------------------------

    if (
        source_store
        and destination_store
        and source_store.id == destination_store.id
    ):
        raise ValueError(
            "Source and destination cannot be the same."
        )

    if (
        source_location
        and destination_location
        and source_location.id == destination_location.id
    ):
        raise ValueError(
            "Source and destination cannot be the same."
        )

    # --------------------------------------------------------
    # Get source stock WITH LOCK
    # --------------------------------------------------------

    source_stock = _get_stock(
        item=item,
        store=source_store,
        inventory_location=source_location,
        lock=True,
    )

    if not source_stock:
        raise ValueError(
            "No stock record exists at the source location."
        )

    source_previous_quantity = (
        source_stock.quantity
    )

    if quantity > source_previous_quantity:
        raise ValueError(
            f"Insufficient stock at source. "
            f"Available quantity: "
            f"{source_previous_quantity}."
        )

    # --------------------------------------------------------
    # Get destination stock WITH LOCK
    # --------------------------------------------------------

    destination_stock = _get_stock(
        item=item,
        store=destination_store,
        inventory_location=destination_location,
        lock=True,
    )

    if not destination_stock:

        destination_stock = InventoryStock.objects.create(
            item=item,
            store=destination_store,
            inventory_location=destination_location,
            quantity=Decimal("0.00"),
        )

        destination_previous_quantity = Decimal(
            "0.00"
        )

    else:

        destination_previous_quantity = (
            destination_stock.quantity
        )

    # --------------------------------------------------------
    # Calculate resulting quantities
    # --------------------------------------------------------

    source_resulting_quantity = (
        source_previous_quantity - quantity
    )

    destination_resulting_quantity = (
        destination_previous_quantity + quantity
    )

    if source_resulting_quantity < 0:
        raise ValueError(
            "Source stock cannot become negative."
        )

    # --------------------------------------------------------
    # Update source
    # --------------------------------------------------------

    source_stock.quantity = (
        source_resulting_quantity
    )

    source_stock.save(
        update_fields=[
            "quantity",
            "updated_at",
        ]
    )

    # --------------------------------------------------------
    # Update destination
    # --------------------------------------------------------

    destination_stock.quantity = (
        destination_resulting_quantity
    )

    destination_stock.save(
        update_fields=[
            "quantity",
            "updated_at",
        ]
    )

    # --------------------------------------------------------
    # Create transfer transaction
    # --------------------------------------------------------

    inventory_transaction = InventoryTransaction.objects.create(
        transaction_id=_generate_transaction_id(),

        transaction_type=InventoryTransaction.TRANSFER,

        item=item,

        # SOURCE
        source_store=source_store,

        source_inventory_location=source_location,

        source_previous_quantity=source_previous_quantity,

        source_resulting_quantity=source_resulting_quantity,

        # DESTINATION
        destination_store=destination_store,

        destination_inventory_location=destination_location,

        destination_previous_quantity=destination_previous_quantity,

        destination_resulting_quantity=destination_resulting_quantity,

        # MOVEMENT
        quantity=quantity,

        # AUDIT
        created_by=user,

        reason=reason,

        notes=notes,
    )

    return inventory_transaction


# ============================================================
# ADJUST INVENTORY
# ============================================================

@transaction.atomic
def adjust_inventory_stock(
    *,
    item_id,
    store_id=None,
    inventory_location_id=None,
    adjusted_quantity,
    reason,
    notes=None,
    user,
):
    """
    Adjust stock after a physical stock count.

    Example:

        System quantity: 100
        Physical count:   97

        Difference: -3
        New stock: 97
    """

    _validate_single_location(
        store_id=store_id,
        inventory_location_id=inventory_location_id,
    )

    adjusted_quantity = Decimal(
        str(adjusted_quantity)
    )

    if adjusted_quantity < 0:
        raise ValueError(
            "Adjusted quantity cannot be negative."
        )

    item = _get_item(item_id)

    store = _get_store(
        store_id
    )

    inventory_location = _get_inventory_location(
        inventory_location_id
    )

    stock = _get_stock(
        item=item,
        store=store,
        inventory_location=inventory_location,
        lock=True,
    )

    if not stock:

        stock = InventoryStock.objects.create(
            item=item,
            store=store,
            inventory_location=inventory_location,
            quantity=Decimal("0.00"),
        )

    previous_quantity = stock.quantity

    difference = (
        adjusted_quantity - previous_quantity
    )

    stock.quantity = adjusted_quantity

    stock.save(
        update_fields=[
            "quantity",
            "updated_at",
        ]
    )

    adjustment_amount = abs(difference)

    inventory_transaction = InventoryTransaction.objects.create(
        transaction_id=_generate_transaction_id(),

        transaction_type=InventoryTransaction.ADJUSTMENT,

        item=item,

        source_store=store,

        source_inventory_location=inventory_location,

        quantity=adjustment_amount,

        source_previous_quantity=previous_quantity,

        source_resulting_quantity=adjusted_quantity,

        adjusted_quantity=adjusted_quantity,

        created_by=user,

        reason=reason,

        notes=notes,
    )

    return inventory_transaction