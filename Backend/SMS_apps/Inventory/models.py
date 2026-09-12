from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q

from school_backend.SMS_constants import UNIT_CHOICES

from SMS_apps.Receipts.models import (
    Department,
    SubDepartment,
)


# ============================================================
# STORE
# ============================================================

class Store(models.Model):
    """
    Represents a physical store in the school.

    Examples:
    - Main Store
    - Kitchen Store
    - Store 1
    """

    name = models.CharField(
        max_length=150,
        unique=True
    )

    short_description = models.CharField(
        max_length=255,
        blank=True
    )

    long_description = models.TextField(
        blank=True,
        null=True
    )

    store_manager = models.CharField(
        max_length=150,
        blank=True,
        null=True,
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["name"]

        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return self.name


# ============================================================
# INVENTORY LOCATION
# ============================================================

class InventoryLocation(models.Model):
    """
    Represents a location where inventory can be kept,
    other than a Store.

    Examples:
    - Grade 1 Yellow
    - Computer Lab
    - Staff Room
    - Head Teacher's Office
    """

    name = models.CharField(
        max_length=150,
        unique=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["name"]

        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return self.name


# ============================================================
# INVENTORY ITEM
# ============================================================

class InventoryItem(models.Model):
    """
    Represents an inventory item.

    Departments and subdepartments are managed centrally
    through the Receipts app.

    Example:
    - Exercise Books -> JSS -> Grade 7
    - Rice -> Catering/Dining -> Kitchen
    - Printer Paper -> ICT
    """

    name = models.CharField(
        max_length=200
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="inventory_items",
    )

    subdepartment = models.ForeignKey(
        SubDepartment,
        on_delete=models.PROTECT,
        related_name="inventory_items",
        blank=True,
        null=True,
    )

    unit = models.CharField(
        max_length=30,
        choices=UNIT_CHOICES
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["name"]

        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["department"]),
            models.Index(fields=["subdepartment"]),
            models.Index(fields=["is_active"]),
        ]

    def clean(self):
        """
        Ensure the selected subdepartment belongs
        to the selected department.
        """

        if self.subdepartment:

            if (
                self.subdepartment.department_id
                != self.department_id
            ):
                raise ValidationError({
                    "subdepartment": (
                        "The selected subdepartment must "
                        "belong to the selected department."
                    )
                })

    def __str__(self):
        if self.subdepartment:
            return (
                f"{self.name} "
                f"({self.department.name} - "
                f"{self.subdepartment.name})"
            )

        return (
            f"{self.name} "
            f"({self.department.name})"
        )


# ============================================================
# INVENTORY STOCK
# ============================================================

class InventoryStock(models.Model):
    """
    Represents the current quantity of an item at a location.

    A stock record can belong to either:
        - a Store
        - an InventoryLocation

    It MUST NOT belong to both.
    It MUST NOT belong to neither.
    """

    item = models.ForeignKey(
        InventoryItem,
        on_delete=models.PROTECT,
        related_name="stock_records"
    )

    store = models.ForeignKey(
        Store,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="stock_records"
    )

    inventory_location = models.ForeignKey(
        InventoryLocation,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="stock_records"
    )

    quantity = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00")
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["item__name"]

        constraints = [
            models.CheckConstraint(
                condition=Q(quantity__gte=0),
                name="inventory_stock_quantity_gte_zero"
            ),

            models.CheckConstraint(
                condition=(
                    Q(
                        store__isnull=False,
                        inventory_location__isnull=True
                    )
                    |
                    Q(
                        store__isnull=True,
                        inventory_location__isnull=False
                    )
                ),
                name="stock_exactly_one_location"
            ),

            models.UniqueConstraint(
                fields=["item", "store"],
                condition=Q(
                    store__isnull=False,
                    inventory_location__isnull=True
                ),
                name="unique_item_per_store"
            ),

            models.UniqueConstraint(
                fields=["item", "inventory_location"],
                condition=Q(
                    store__isnull=True,
                    inventory_location__isnull=False
                ),
                name="unique_item_per_inventory_location"
            ),
        ]

        indexes = [
            models.Index(fields=["item"]),
            models.Index(fields=["store"]),
            models.Index(fields=["inventory_location"]),
        ]

    def clean(self):

        if self.store and self.inventory_location:
            raise ValidationError(
                "Stock cannot belong to both a Store and an Inventory Location."
            )

        if not self.store and not self.inventory_location:
            raise ValidationError(
                "Stock must belong to either a Store or an Inventory Location."
            )

        if self.quantity < 0:
            raise ValidationError(
                "Stock quantity cannot be negative."
            )

    @property
    def location_name(self):

        if self.store:
            return self.store.name

        if self.inventory_location:
            return self.inventory_location.name

        return "Unknown Location"

    @property
    def location_type(self):

        if self.store:
            return "store"

        if self.inventory_location:
            return "inventory_location"

        return None

    def __str__(self):
        return (
            f"{self.item.name} - "
            f"{self.location_name}: "
            f"{self.quantity}"
        )


# ============================================================
# INVENTORY TRANSACTION
# ============================================================

class InventoryTransaction(models.Model):

    ADDITION = "addition"
    REMOVAL = "removal"
    TRANSFER = "transfer"
    ADJUSTMENT = "adjustment"

    TRANSACTION_TYPES = [
        (ADDITION, "Addition"),
        (REMOVAL, "Removal"),
        (TRANSFER, "Transfer"),
        (ADJUSTMENT, "Adjustment"),
    ]

    transaction_id = models.CharField(
        max_length=30,
        unique=True,
        editable=False
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPES
    )

    item = models.ForeignKey(
        InventoryItem,
        on_delete=models.PROTECT,
        related_name="transactions"
    )

    source_store = models.ForeignKey(
        Store,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="source_inventory_transactions"
    )

    source_inventory_location = models.ForeignKey(
        InventoryLocation,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="source_inventory_transactions"
    )

    destination_store = models.ForeignKey(
        Store,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="destination_inventory_transactions"
    )

    destination_inventory_location = models.ForeignKey(
        InventoryLocation,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="destination_inventory_transactions"
    )

    quantity = models.DecimalField(
        max_digits=14,
        decimal_places=2
    )

    source_previous_quantity = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True
    )

    source_resulting_quantity = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True
    )

    destination_previous_quantity = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True
    )

    destination_resulting_quantity = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True
    )

    adjusted_quantity = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="inventory_transactions"
    )

    reason = models.TextField()

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["transaction_type"]),
            models.Index(fields=["item"]),
            models.Index(fields=["created_by"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["source_store"]),
            models.Index(fields=["source_inventory_location"]),
            models.Index(fields=["destination_store"]),
            models.Index(fields=["destination_inventory_location"]),
        ]

    def clean(self):

        if self.quantity <= 0:
            raise ValidationError(
                "Transaction quantity must be greater than zero."
            )

        has_source_store = self.source_store is not None
        has_source_location = (
            self.source_inventory_location is not None
        )

        has_destination_store = (
            self.destination_store is not None
        )

        has_destination_location = (
            self.destination_inventory_location is not None
        )

        source_count = (
            int(has_source_store)
            + int(has_source_location)
        )

        destination_count = (
            int(has_destination_store)
            + int(has_destination_location)
        )

        if source_count > 1:
            raise ValidationError(
                "Source must be either a Store or an Inventory Location, "
                "not both."
            )

        if destination_count > 1:
            raise ValidationError(
                "Destination must be either a Store or an Inventory Location, "
                "not both."
            )

        if self.transaction_type == self.ADDITION:

            if source_count != 0:
                raise ValidationError(
                    "An addition cannot have a source location."
                )

            if destination_count != 1:
                raise ValidationError(
                    "An addition must have exactly one destination location."
                )

        elif self.transaction_type == self.REMOVAL:

            if source_count != 1:
                raise ValidationError(
                    "A removal must have exactly one source location."
                )

            if destination_count != 0:
                raise ValidationError(
                    "A removal cannot have a destination location."
                )

        elif self.transaction_type == self.TRANSFER:

            if source_count != 1:
                raise ValidationError(
                    "A transfer must have exactly one source location."
                )

            if destination_count != 1:
                raise ValidationError(
                    "A transfer must have exactly one destination location."
                )

            if (
                self.source_store
                and self.destination_store
                and self.source_store_id
                == self.destination_store_id
            ):
                raise ValidationError(
                    "Source and destination cannot be the same location."
                )

            if (
                self.source_inventory_location
                and self.destination_inventory_location
                and self.source_inventory_location_id
                == self.destination_inventory_location_id
            ):
                raise ValidationError(
                    "Source and destination cannot be the same location."
                )

        elif self.transaction_type == self.ADJUSTMENT:

            if source_count != 1:
                raise ValidationError(
                    "An adjustment must have exactly one source location."
                )

            if destination_count != 0:
                raise ValidationError(
                    "An adjustment cannot have a destination location."
                )

            if self.adjusted_quantity is None:
                raise ValidationError(
                    "An adjustment must specify the actual quantity."
                )

            if self.adjusted_quantity < 0:
                raise ValidationError(
                    "Adjusted quantity cannot be negative."
                )

        else:
            raise ValidationError(
                "Invalid inventory transaction type."
            )

    @property
    def source_location_name(self):

        if self.source_store:
            return self.source_store.name

        if self.source_inventory_location:
            return self.source_inventory_location.name

        return None

    @property
    def destination_location_name(self):

        if self.destination_store:
            return self.destination_store.name

        if self.destination_inventory_location:
            return self.destination_inventory_location.name

        return None

    def __str__(self):
        return (
            f"{self.transaction_id} - "
            f"{self.get_transaction_type_display()}"
        )