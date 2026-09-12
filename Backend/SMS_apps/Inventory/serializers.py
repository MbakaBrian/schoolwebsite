from rest_framework import serializers

from .models import (
    Store,
    InventoryLocation,
    InventoryItem,
    InventoryStock,
    InventoryTransaction,
)


# ============================================================
# STORE SERIALIZER
# ============================================================

class StoreSerializer(serializers.ModelSerializer):
    """
    Serializer for Stores.

    Store manager is currently entered manually as a name.
    This will be changed to a Staff/User relationship later.
    """

    class Meta:
        model = Store

        fields = [
            "id",
            "name",
            "short_description",
            "long_description",
            "store_manager",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


# ============================================================
# INVENTORY LOCATION SERIALIZER
# ============================================================

class InventoryLocationSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for Inventory Locations.
    """

    class Meta:
        model = InventoryLocation

        fields = [
            "id",
            "name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


# ============================================================
# INVENTORY ITEM SERIALIZER
# ============================================================

class InventoryItemSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for Inventory Items.

    Departments and subdepartments come from the
    central Department/SubDepartment models in
    the Receipts app.
    """

    department_display = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    subdepartment_display = serializers.CharField(
        source="subdepartment.name",
        read_only=True,
        allow_null=True,
    )

    unit_display = serializers.CharField(
        source="get_unit_display",
        read_only=True,
    )

    class Meta:
        model = InventoryItem

        fields = [
            "id",
            "name",

            # Department
            "department",
            "department_display",

            # Subdepartment
            "subdepartment",
            "subdepartment_display",

            # Unit
            "unit",
            "unit_display",

            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "department_display",
            "subdepartment_display",
            "unit_display",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        """
        Ensure that the selected subdepartment belongs
        to the selected department.
        """

        department = attrs.get("department")
        subdepartment = attrs.get("subdepartment")

        if subdepartment:

            if not department:
                raise serializers.ValidationError({
                    "department": (
                        "A department is required when "
                        "selecting a subdepartment."
                    )
                })

            if (
                subdepartment.department_id
                != department.id
            ):
                raise serializers.ValidationError({
                    "subdepartment": (
                        "The selected subdepartment does not "
                        "belong to the selected department."
                    )
                })

        return attrs


# ============================================================
# INVENTORY STOCK SERIALIZER
# ============================================================

class InventoryStockSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for current stock.

    Stock quantity is READ-ONLY.

    Stock must be changed using:
        /stock/add/
        /stock/remove/
        /stock/transfer/
        /stock/adjust/
    """

    item_name = serializers.CharField(
        source="item.name",
        read_only=True,
    )

    item_unit = serializers.CharField(
        source="item.unit",
        read_only=True,
    )

    item_unit_display = serializers.CharField(
        source="item.get_unit_display",
        read_only=True,
    )

    department = serializers.IntegerField(
        source="item.department_id",
        read_only=True,
    )

    department_display = serializers.CharField(
        source="item.department.name",
        read_only=True,
    )

    subdepartment = serializers.IntegerField(
        source="item.subdepartment_id",
        read_only=True,
        allow_null=True,
    )

    subdepartment_display = serializers.CharField(
        source="item.subdepartment.name",
        read_only=True,
        allow_null=True,
    )

    location_name = serializers.CharField(
        read_only=True,
    )

    location_type = serializers.CharField(
        read_only=True,
    )

    store_name = serializers.CharField(
        source="store.name",
        read_only=True,
        allow_null=True,
    )

    inventory_location_name = serializers.CharField(
        source="inventory_location.name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = InventoryStock

        fields = [
            "id",

            # Item
            "item",
            "item_name",
            "item_unit",
            "item_unit_display",

            # Department
            "department",
            "department_display",

            # Subdepartment
            "subdepartment",
            "subdepartment_display",

            # Location
            "store",
            "store_name",

            "inventory_location",
            "inventory_location_name",

            "location_name",
            "location_type",

            # Quantity
            "quantity",

            # Dates
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",

            "item_name",
            "item_unit",
            "item_unit_display",

            "department",
            "department_display",

            "subdepartment",
            "subdepartment_display",

            "store_name",
            "inventory_location_name",

            "location_name",
            "location_type",

            "quantity",

            "created_at",
            "updated_at",
        ]


# ============================================================
# INVENTORY TRANSACTION SERIALIZER
# ============================================================

class InventoryTransactionSerializer(
    serializers.ModelSerializer
):
    """
    Read-only transaction history.

    Transactions are generated automatically when inventory
    changes.

    Users should NOT POST/PATCH/DELETE transactions directly.
    """

    item_name = serializers.CharField(
        source="item.name",
        read_only=True,
    )

    item_unit = serializers.CharField(
        source="item.unit",
        read_only=True,
    )

    unit_display = serializers.CharField(
        source="item.get_unit_display",
        read_only=True,
    )

    department = serializers.IntegerField(
        source="item.department_id",
        read_only=True,
    )

    department_display = serializers.CharField(
        source="item.department.name",
        read_only=True,
    )

    subdepartment = serializers.IntegerField(
        source="item.subdepartment_id",
        read_only=True,
        allow_null=True,
    )

    subdepartment_display = serializers.CharField(
        source="item.subdepartment.name",
        read_only=True,
        allow_null=True,
    )

    transaction_type_display = serializers.CharField(
        source="get_transaction_type_display",
        read_only=True,
    )

    created_by_name = serializers.SerializerMethodField()

    source_location_name = serializers.CharField(
        read_only=True,
    )

    destination_location_name = serializers.CharField(
        read_only=True,
    )

    class Meta:
        model = InventoryTransaction

        fields = [
            # ------------------------------------------------
            # Identification
            # ------------------------------------------------

            "id",
            "transaction_id",
            "transaction_type",
            "transaction_type_display",

            # ------------------------------------------------
            # Item
            # ------------------------------------------------

            "item",
            "item_name",
            "item_unit",
            "unit_display",

            # ------------------------------------------------
            # Department
            # ------------------------------------------------

            "department",
            "department_display",

            # ------------------------------------------------
            # Subdepartment
            # ------------------------------------------------

            "subdepartment",
            "subdepartment_display",

            # ------------------------------------------------
            # Source
            # ------------------------------------------------

            "source_store",
            "source_inventory_location",
            "source_location_name",

            # ------------------------------------------------
            # Destination
            # ------------------------------------------------

            "destination_store",
            "destination_inventory_location",
            "destination_location_name",

            # ------------------------------------------------
            # Quantities
            # ------------------------------------------------

            "quantity",

            "source_previous_quantity",
            "source_resulting_quantity",

            "destination_previous_quantity",
            "destination_resulting_quantity",

            "adjusted_quantity",

            # ------------------------------------------------
            # Audit
            # ------------------------------------------------

            "created_by",
            "created_by_name",

            "reason",
            "notes",

            "created_at",
        ]

        read_only_fields = [
            "id",
            "transaction_id",

            "transaction_type_display",

            "item_name",
            "item_unit",
            "unit_display",

            "department",
            "department_display",

            "subdepartment",
            "subdepartment_display",

            "source_location_name",
            "destination_location_name",

            "quantity",

            "source_previous_quantity",
            "source_resulting_quantity",

            "destination_previous_quantity",
            "destination_resulting_quantity",

            "adjusted_quantity",

            "created_by",
            "created_by_name",

            "created_at",
        ]

    def get_created_by_name(self, obj):

        if not obj.created_by:
            return None

        return (
            obj.created_by.get_full_name()
            or obj.created_by.username
        )