from decimal import Decimal

from django.db.models import Q
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Store,
    InventoryLocation,
    InventoryItem,
    InventoryStock,
    InventoryTransaction,
)

from .serializers import (
    StoreSerializer,
    InventoryLocationSerializer,
    InventoryItemSerializer,
    InventoryStockSerializer,
    InventoryTransactionSerializer,
)

from .services import (
    add_inventory_stock,
    remove_inventory_stock,
    transfer_inventory_stock,
    adjust_inventory_stock,
)


# ============================================================
# STORE VIEWSET
# ============================================================

class StoreViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for Stores.
    """

    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Store.objects.all()

        # ----------------------------------------------------
        # Filter active/inactive stores
        # ----------------------------------------------------

        is_active = self.request.query_params.get("is_active")

        if is_active is not None:
            if is_active.lower() == "true":
                queryset = queryset.filter(is_active=True)

            elif is_active.lower() == "false":
                queryset = queryset.filter(is_active=False)

        # ----------------------------------------------------
        # Search
        # ----------------------------------------------------

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(short_description__icontains=search)
                | Q(long_description__icontains=search)
            )

        return queryset.order_by("name")

    @action(
        detail=True,
        methods=["post"],
        url_path="deactivate",
    )
    def deactivate(self, request, pk=None):
        """
        Soft-delete/deactivate a Store.
        """

        store = self.get_object()

        store.is_active = False
        store.save(update_fields=["is_active", "updated_at"])

        return Response(
            {
                "message": "Store deactivated successfully.",
                "store": StoreSerializer(
                    store,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="activate",
    )
    def activate(self, request, pk=None):
        """
        Reactivate a Store.
        """

        store = self.get_object()

        store.is_active = True
        store.save(update_fields=["is_active", "updated_at"])

        return Response(
            {
                "message": "Store activated successfully.",
                "store": StoreSerializer(
                    store,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# INVENTORY LOCATION VIEWSET
# ============================================================

class InventoryLocationViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for Inventory Locations.

    Examples:
        - Grade 1 Yellow
        - Computer Lab
        - Staff Room
        - Head Teacher's Office
    """

    queryset = InventoryLocation.objects.all()
    serializer_class = InventoryLocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = InventoryLocation.objects.all()

        # ----------------------------------------------------
        # Filter active/inactive
        # ----------------------------------------------------

        is_active = self.request.query_params.get("is_active")

        if is_active is not None:
            if is_active.lower() == "true":
                queryset = queryset.filter(is_active=True)

            elif is_active.lower() == "false":
                queryset = queryset.filter(is_active=False)

        # ----------------------------------------------------
        # Search
        # ----------------------------------------------------

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
            )

        return queryset.order_by("name")

    @action(
        detail=True,
        methods=["post"],
        url_path="deactivate",
    )
    def deactivate(self, request, pk=None):
        """
        Soft-delete/deactivate an Inventory Location.
        """

        location = self.get_object()

        location.is_active = False
        location.save(update_fields=["is_active", "updated_at"])

        return Response(
            {
                "message": "Inventory location deactivated successfully.",
                "location": InventoryLocationSerializer(
                    location,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="activate",
    )
    def activate(self, request, pk=None):
        """
        Reactivate an Inventory Location.
        """

        location = self.get_object()

        location.is_active = True
        location.save(update_fields=["is_active", "updated_at"])

        return Response(
            {
                "message": "Inventory location activated successfully.",
                "location": InventoryLocationSerializer(
                    location,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# INVENTORY ITEM VIEWSET
# ============================================================

class InventoryItemViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for Inventory Items.

    Department and SubDepartment are database-managed
    foreign keys.

    Example:

        Department:
            JSS

        SubDepartments:
            Grade 7
            Grade 8
            Grade 9
    """

    queryset = (
        InventoryItem.objects
        .select_related(
            "department",
            "subdepartment",
        )
        .all()
    )

    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            InventoryItem.objects
            .select_related(
                "department",
                "subdepartment",
            )
        )

        # ----------------------------------------------------
        # Active / inactive
        # ----------------------------------------------------

        is_active = self.request.query_params.get("is_active")

        if is_active is not None:

            if is_active.lower() == "true":
                queryset = queryset.filter(is_active=True)

            elif is_active.lower() == "false":
                queryset = queryset.filter(is_active=False)

        # ----------------------------------------------------
        # Department filter
        #
        # Example:
        # /inventory/items/?department=3
        # ----------------------------------------------------

        department = self.request.query_params.get("department")

        if department:
            queryset = queryset.filter(
                department_id=department
            )

        # ----------------------------------------------------
        # SubDepartment filter
        #
        # Example:
        # /inventory/items/?subdepartment=7
        # ----------------------------------------------------

        subdepartment = self.request.query_params.get(
            "subdepartment"
        )

        if subdepartment:
            queryset = queryset.filter(
                subdepartment_id=subdepartment
            )

        # ----------------------------------------------------
        # Unit filter
        # ----------------------------------------------------

        unit = self.request.query_params.get("unit")

        if unit:
            queryset = queryset.filter(
                unit=unit
            )

        # ----------------------------------------------------
        # Search
        # ----------------------------------------------------

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(department__name__icontains=search)
                | Q(subdepartment__name__icontains=search)
            )

        return queryset.order_by("name")

    # ========================================================
    # DEACTIVATE
    # ========================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="deactivate",
    )
    def deactivate(self, request, pk=None):
        """
        Deactivate an inventory item without destroying history.
        """

        item = self.get_object()

        item.is_active = False
        item.save(update_fields=["is_active", "updated_at"])

        return Response(
            {
                "message": "Inventory item deactivated successfully.",
                "item": InventoryItemSerializer(
                    item,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )

    # ========================================================
    # ACTIVATE
    # ========================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="activate",
    )
    def activate(self, request, pk=None):
        """
        Reactivate an inventory item.
        """

        item = self.get_object()

        item.is_active = True
        item.save(update_fields=["is_active", "updated_at"])

        return Response(
            {
                "message": "Inventory item activated successfully.",
                "item": InventoryItemSerializer(
                    item,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )

    # ========================================================
    # ITEM STOCK
    # ========================================================

    @action(
        detail=True,
        methods=["get"],
        url_path="stock",
    )
    def stock(self, request, pk=None):
        """
        Return all locations where this item currently exists.
        """

        item = self.get_object()

        stocks = (
            InventoryStock.objects
            .filter(item=item)
            .select_related(
                "item",
                "item__department",
                "item__subdepartment",
                "store",
                "inventory_location",
            )
            .order_by(
                "store__name",
                "inventory_location__name",
            )
        )

        serializer = InventoryStockSerializer(
            stocks,
            many=True,
            context={"request": request},
        )

        return Response(serializer.data)


# ============================================================
# INVENTORY STOCK VIEWSET
# ============================================================

class InventoryStockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Current inventory stock.

    Stock should NOT be directly edited through PUT/PATCH.

    All changes must happen through:

        - add-stock
        - remove-stock
        - transfer-stock
        - adjust-stock
    """

    queryset = (
        InventoryStock.objects
        .select_related(
            "item",
            "item__department",
            "item__subdepartment",
            "store",
            "inventory_location",
        )
    )

    serializer_class = InventoryStockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            InventoryStock.objects
            .select_related(
                "item",
                "item__department",
                "item__subdepartment",
                "store",
                "inventory_location",
            )
        )

        # ----------------------------------------------------
        # Item
        # ----------------------------------------------------

        item_id = self.request.query_params.get("item")

        if item_id:
            queryset = queryset.filter(
                item_id=item_id
            )

        # ----------------------------------------------------
        # Store
        # ----------------------------------------------------

        store_id = self.request.query_params.get("store")

        if store_id:
            queryset = queryset.filter(
                store_id=store_id
            )

        # ----------------------------------------------------
        # Inventory Location
        # ----------------------------------------------------

        location_id = self.request.query_params.get(
            "inventory_location"
        )

        if location_id:
            queryset = queryset.filter(
                inventory_location_id=location_id
            )

        # ----------------------------------------------------
        # Department
        # ----------------------------------------------------

        department = self.request.query_params.get(
            "department"
        )

        if department:
            queryset = queryset.filter(
                item__department_id=department
            )

        # ----------------------------------------------------
        # SubDepartment
        # ----------------------------------------------------

        subdepartment = self.request.query_params.get(
            "subdepartment"
        )

        if subdepartment:
            queryset = queryset.filter(
                item__subdepartment_id=subdepartment
            )

        # ----------------------------------------------------
        # Search item / department / subdepartment
        # ----------------------------------------------------

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(item__name__icontains=search)
                | Q(item__department__name__icontains=search)
                | Q(item__subdepartment__name__icontains=search)
            )

        # ----------------------------------------------------
        # Only stock greater than zero
        # ----------------------------------------------------

        has_stock = self.request.query_params.get(
            "has_stock"
        )

        if has_stock == "true":
            queryset = queryset.filter(
                quantity__gt=0
            )

        elif has_stock == "false":
            queryset = queryset.filter(
                quantity=0
            )

        return queryset.order_by(
            "item__name"
        )

    # ========================================================
    # ADD STOCK
    # ========================================================

    @action(
        detail=False,
        methods=["post"],
        url_path="add",
    )
    def add_stock(self, request):
        """
        Add inventory to a Store or Inventory Location.
        """

        item_id = request.data.get("item_id")
        store_id = request.data.get("store_id")

        location_id = request.data.get(
            "inventory_location_id"
        )

        quantity = request.data.get("quantity")
        reason = request.data.get("reason")
        notes = request.data.get("notes")

        # ----------------------------------------------------
        # Required fields
        # ----------------------------------------------------

        if not item_id:
            return Response(
                {"error": "item_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity is None:
            return Response(
                {"error": "quantity is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not reason:
            return Response(
                {"error": "reason is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Exactly one destination
        # ----------------------------------------------------

        if bool(store_id) == bool(location_id):
            return Response(
                {
                    "error": (
                        "Provide exactly one of "
                        "store_id or inventory_location_id."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Quantity conversion
        # ----------------------------------------------------

        try:
            quantity = Decimal(str(quantity))

        except (TypeError, ValueError):
            return Response(
                {"error": "Invalid quantity."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= 0:
            return Response(
                {
                    "error": (
                        "Quantity must be greater than zero."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Service
        # ----------------------------------------------------

        try:
            transaction = add_inventory_stock(
                item_id=item_id,
                store_id=store_id,
                inventory_location_id=location_id,
                quantity=quantity,
                reason=reason,
                notes=notes,
                user=request.user,
            )

        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Stock added successfully.",
                "transaction": InventoryTransactionSerializer(
                    transaction,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )

    # ========================================================
    # REMOVE STOCK
    # ========================================================

    @action(
        detail=False,
        methods=["post"],
        url_path="remove",
    )
    def remove_stock(self, request):
        """
        Remove stock from a Store or Inventory Location.
        """

        item_id = request.data.get("item_id")
        store_id = request.data.get("store_id")

        location_id = request.data.get(
            "inventory_location_id"
        )

        quantity = request.data.get("quantity")
        reason = request.data.get("reason")
        notes = request.data.get("notes")

        # ----------------------------------------------------
        # Required fields
        # ----------------------------------------------------

        if not item_id:
            return Response(
                {"error": "item_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity is None:
            return Response(
                {"error": "quantity is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not reason:
            return Response(
                {"error": "reason is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Exactly one location
        # ----------------------------------------------------

        if bool(store_id) == bool(location_id):
            return Response(
                {
                    "error": (
                        "Provide exactly one of "
                        "store_id or inventory_location_id."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Quantity conversion
        # ----------------------------------------------------

        try:
            quantity = Decimal(str(quantity))

        except (TypeError, ValueError):
            return Response(
                {"error": "Invalid quantity."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= 0:
            return Response(
                {
                    "error": (
                        "Quantity must be greater than zero."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Service
        # ----------------------------------------------------

        try:
            transaction = remove_inventory_stock(
                item_id=item_id,
                store_id=store_id,
                inventory_location_id=location_id,
                quantity=quantity,
                reason=reason,
                notes=notes,
                user=request.user,
            )

        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Stock removed successfully.",
                "transaction": InventoryTransactionSerializer(
                    transaction,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )

    # ========================================================
    # TRANSFER STOCK
    # ========================================================

    @action(
        detail=False,
        methods=["post"],
        url_path="transfer",
    )
    def transfer_stock(self, request):
        """
        Transfer stock between any two inventory locations.

        Supported:

            Store -> Store
            Store -> Inventory Location
            Inventory Location -> Store
            Inventory Location -> Inventory Location
        """

        item_id = request.data.get("item_id")

        source_store_id = request.data.get(
            "source_store_id"
        )

        source_location_id = request.data.get(
            "source_inventory_location_id"
        )

        destination_store_id = request.data.get(
            "destination_store_id"
        )

        destination_location_id = request.data.get(
            "destination_inventory_location_id"
        )

        quantity = request.data.get("quantity")
        reason = request.data.get("reason")
        notes = request.data.get("notes")

        # ----------------------------------------------------
        # Required fields
        # ----------------------------------------------------

        if not item_id:
            return Response(
                {"error": "item_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity is None:
            return Response(
                {"error": "quantity is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not reason:
            return Response(
                {"error": "reason is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Source validation
        # ----------------------------------------------------

        if bool(source_store_id) == bool(source_location_id):
            return Response(
                {
                    "error": (
                        "Provide exactly one source location."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Destination validation
        # ----------------------------------------------------

        if (
            bool(destination_store_id)
            == bool(destination_location_id)
        ):
            return Response(
                {
                    "error": (
                        "Provide exactly one destination "
                        "location."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Quantity
        # ----------------------------------------------------

        try:
            quantity = Decimal(str(quantity))

        except (TypeError, ValueError):
            return Response(
                {"error": "Invalid quantity."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= 0:
            return Response(
                {
                    "error": (
                        "Quantity must be greater than zero."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Service
        # ----------------------------------------------------

        try:
            transaction = transfer_inventory_stock(
                item_id=item_id,

                source_store_id=source_store_id,
                source_inventory_location_id=source_location_id,

                destination_store_id=destination_store_id,
                destination_inventory_location_id=destination_location_id,

                quantity=quantity,
                reason=reason,
                notes=notes,

                user=request.user,
            )

        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Stock transferred successfully.",
                "transaction": InventoryTransactionSerializer(
                    transaction,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )

    # ========================================================
    # ADJUST STOCK
    # ========================================================

    @action(
        detail=False,
        methods=["post"],
        url_path="adjust",
    )
    def adjust_stock(self, request):
        """
        Adjust stock after a physical stock count.

        The user provides the ACTUAL physical quantity.

        The service calculates the difference between
        the previous quantity and the physical quantity.
        """

        item_id = request.data.get("item_id")

        store_id = request.data.get("store_id")

        location_id = request.data.get(
            "inventory_location_id"
        )

        adjusted_quantity = request.data.get(
            "adjusted_quantity"
        )

        reason = request.data.get("reason")
        notes = request.data.get("notes")

        # ----------------------------------------------------
        # Required fields
        # ----------------------------------------------------

        if not item_id:
            return Response(
                {"error": "item_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if adjusted_quantity is None:
            return Response(
                {
                    "error": (
                        "adjusted_quantity is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not reason:
            return Response(
                {"error": "reason is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Location
        # ----------------------------------------------------

        if bool(store_id) == bool(location_id):
            return Response(
                {
                    "error": (
                        "Provide exactly one of "
                        "store_id or inventory_location_id."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Actual quantity
        # ----------------------------------------------------

        try:
            adjusted_quantity = Decimal(
                str(adjusted_quantity)
            )

        except (TypeError, ValueError):
            return Response(
                {
                    "error": (
                        "Invalid adjusted quantity."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if adjusted_quantity < 0:
            return Response(
                {
                    "error": (
                        "Adjusted quantity cannot be "
                        "negative."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Service
        # ----------------------------------------------------

        try:
            transaction = adjust_inventory_stock(
                item_id=item_id,

                store_id=store_id,
                inventory_location_id=location_id,

                adjusted_quantity=adjusted_quantity,

                reason=reason,
                notes=notes,

                user=request.user,
            )

        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Stock adjusted successfully.",
                "transaction": InventoryTransactionSerializer(
                    transaction,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# INVENTORY TRANSACTION VIEWSET
# ============================================================

class InventoryTransactionViewSet(
    viewsets.ReadOnlyModelViewSet
):
    """
    Read-only inventory transaction history.

    Transactions should NEVER be edited or deleted through
    the normal API.

    Stock changes create transactions automatically.
    """

    queryset = (
        InventoryTransaction.objects
        .select_related(
            "item",
            "item__department",
            "item__subdepartment",
            "created_by",
            "source_store",
            "source_inventory_location",
            "destination_store",
            "destination_inventory_location",
        )
    )

    serializer_class = InventoryTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            InventoryTransaction.objects
            .select_related(
                "item",
                "item__department",
                "item__subdepartment",
                "created_by",

                "source_store",
                "source_inventory_location",

                "destination_store",
                "destination_inventory_location",
            )
        )

        # ----------------------------------------------------
        # Transaction type
        # ----------------------------------------------------

        transaction_type = self.request.query_params.get(
            "transaction_type"
        )

        if transaction_type:
            queryset = queryset.filter(
                transaction_type=transaction_type
            )

        # ----------------------------------------------------
        # Item
        # ----------------------------------------------------

        item_id = self.request.query_params.get(
            "item"
        )

        if item_id:
            queryset = queryset.filter(
                item_id=item_id
            )

        # ----------------------------------------------------
        # Department
        # ----------------------------------------------------

        department = self.request.query_params.get(
            "department"
        )

        if department:
            queryset = queryset.filter(
                item__department_id=department
            )

        # ----------------------------------------------------
        # SubDepartment
        # ----------------------------------------------------

        subdepartment = self.request.query_params.get(
            "subdepartment"
        )

        if subdepartment:
            queryset = queryset.filter(
                item__subdepartment_id=subdepartment
            )

        # ----------------------------------------------------
        # User
        # ----------------------------------------------------

        user_id = self.request.query_params.get(
            "user"
        )

        if user_id:
            queryset = queryset.filter(
                created_by_id=user_id
            )

        # ----------------------------------------------------
        # Source Store
        # ----------------------------------------------------

        source_store_id = self.request.query_params.get(
            "source_store"
        )

        if source_store_id:
            queryset = queryset.filter(
                source_store_id=source_store_id
            )

        # ----------------------------------------------------
        # Source Inventory Location
        # ----------------------------------------------------

        source_location_id = self.request.query_params.get(
            "source_inventory_location"
        )

        if source_location_id:
            queryset = queryset.filter(
                source_inventory_location_id=source_location_id
            )

        # ----------------------------------------------------
        # Destination Store
        # ----------------------------------------------------

        destination_store_id = self.request.query_params.get(
            "destination_store"
        )

        if destination_store_id:
            queryset = queryset.filter(
                destination_store_id=destination_store_id
            )

        # ----------------------------------------------------
        # Destination Inventory Location
        # ----------------------------------------------------

        destination_location_id = self.request.query_params.get(
            "destination_inventory_location"
        )

        if destination_location_id:
            queryset = queryset.filter(
                destination_inventory_location_id=destination_location_id
            )

        # ----------------------------------------------------
        # Date filtering
        # ----------------------------------------------------

        date_from = self.request.query_params.get(
            "date_from"
        )

        date_to = self.request.query_params.get(
            "date_to"
        )

        if date_from:
            queryset = queryset.filter(
                created_at__date__gte=date_from
            )

        if date_to:
            queryset = queryset.filter(
                created_at__date__lte=date_to
            )

        # ----------------------------------------------------
        # Search
        # ----------------------------------------------------

        search = self.request.query_params.get(
            "search"
        )

        if search:
            queryset = queryset.filter(
                Q(transaction_id__icontains=search)
                | Q(item__name__icontains=search)
                | Q(item__department__name__icontains=search)
                | Q(item__subdepartment__name__icontains=search)
                | Q(reason__icontains=search)
                | Q(notes__icontains=search)
            )

        return queryset.order_by("-created_at")


# ============================================================
# INVENTORY DASHBOARD
# ============================================================

class InventoryDashboardView(
    viewsets.ViewSet
):
    """
    Inventory dashboard summary.
    """

    permission_classes = [IsAuthenticated]

    def list(self, request):
        """
        GET /api/inventory/dashboard/
        """

        today = timezone.localdate()

        # ----------------------------------------------------
        # Basic counts
        # ----------------------------------------------------

        total_stores = (
            Store.objects
            .filter(is_active=True)
            .count()
        )

        total_locations = (
            InventoryLocation.objects
            .filter(is_active=True)
            .count()
        )

        total_items = (
            InventoryItem.objects
            .filter(is_active=True)
            .count()
        )

        total_stock_records = (
            InventoryStock.objects
            .filter(quantity__gt=0)
            .count()
        )

        today_transactions = (
            InventoryTransaction.objects
            .filter(created_at__date=today)
            .count()
        )

        # ----------------------------------------------------
        # Recent transactions
        # ----------------------------------------------------

        recent_transactions = (
            InventoryTransaction.objects
            .select_related(
                "item",
                "item__department",
                "item__subdepartment",
                "created_by",

                "source_store",
                "source_inventory_location",

                "destination_store",
                "destination_inventory_location",
            )
            .order_by("-created_at")[:10]
        )

        recent_serializer = InventoryTransactionSerializer(
            recent_transactions,
            many=True,
            context={"request": request},
        )

        return Response(
            {
                "total_stores": total_stores,
                "total_inventory_locations": total_locations,
                "total_items": total_items,
                "total_stock_records": total_stock_records,
                "today_transactions": today_transactions,
                "recent_transactions": recent_serializer.data,
            }
        )