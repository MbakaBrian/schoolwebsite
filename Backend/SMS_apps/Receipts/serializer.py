from rest_framework import serializers

from .models import (
    Receipt,
    ReceiptItem,
    Department,
    SubDepartment,
)


class SubDepartmentSerializer(serializers.ModelSerializer):
    """
    Serializer for subdepartments.

    Used by the frontend to populate the subdepartment dropdown
    based on the selected department.
    """

    class Meta:
        model = SubDepartment

        fields = [
            "id",
            "name",
            "code",
            "department",
            "is_active",
        ]

        read_only_fields = [
            "id",
        ]


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Serializer for departments.

    Includes only active subdepartments belonging to this department.
    This allows the frontend to request a department and receive
    only its respective subdepartments.
    """

    subdepartments = serializers.SerializerMethodField()

    class Meta:
        model = Department

        fields = [
            "id",
            "name",
            "code",
            "is_active",
            "subdepartments",
        ]

        read_only_fields = [
            "id",
            "subdepartments",
        ]

    def get_subdepartments(self, obj):
        subdepartments = obj.subdepartments.filter(
            is_active=True
        )

        return SubDepartmentSerializer(
            subdepartments,
            many=True,
        ).data


class ReceiptItemSerializer(serializers.ModelSerializer):
    """
    Serializer for individual receipt items.

    The receipt is determined by the URL when creating an item:

        POST /api/receipts/<receipt_id>/items/add/

    Therefore, `receipt` is read-only from the client's perspective.

    Department and subdepartment are selected by the frontend.

    The frontend should only display subdepartments belonging to the
    selected department, but the relationship is also validated here
    on the backend for security and data integrity.
    """

    department_display = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    subdepartment_display = serializers.CharField(
        source="subdepartment.name",
        read_only=True,
    )

    unit_display = serializers.CharField(
        source="get_unit_display",
        read_only=True,
    )

    receipt_id = serializers.CharField(
        source="receipt.receipt_id",
        read_only=True,
    )

    class Meta:
        model = ReceiptItem

        fields = [
            "id",
            "receipt",
            "receipt_id",

            "item_name",

            "department",
            "department_display",

            "subdepartment",
            "subdepartment_display",

            "quantity",
            "unit",
            "unit_display",
            "unit_price",
            "total",
        ]

        read_only_fields = [
            "id",
            "receipt",
            "receipt_id",

            "department_display",
            "subdepartment_display",

            "unit_display",
            "total",
        ]

    def validate(self, attrs):
        """
        Ensure the selected subdepartment belongs to
        the selected department.
        """

        department = attrs.get("department")
        subdepartment = attrs.get("subdepartment")

        if subdepartment:
            if subdepartment.department_id != department.id:
                raise serializers.ValidationError({
                    "subdepartment": (
                        "The selected subdepartment does not "
                        "belong to the selected department."
                    )
                })

        return attrs

    def create(self, validated_data):
        """
        Create a ReceiptItem.

        The receipt is normally injected by the view:

            serializer.save(receipt=receipt)
        """

        return ReceiptItem.objects.create(
            **validated_data
        )


class ReceiptSerializer(serializers.ModelSerializer):
    """
    Serializer for receipts.
    """

    recorded_by = serializers.ReadOnlyField(
        source="recorded_by.username"
    )

    payment_method_display = serializers.CharField(
        source="get_payment_method_display",
        read_only=True,
    )

    items = ReceiptItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Receipt

        fields = [
            "receipt_id",
            "store",
            "payment_method",
            "payment_method_display",
            "date",
            "payment_reference",
            "description",
            "recorded_by",
            "attachment",
            "total",
            "items",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "receipt_id",
            "recorded_by",
            "total",
            "items",
            "created_at",
            "updated_at",
        ]


class DepartmentSummarySerializer(serializers.Serializer):
    """
    Shape of each row in the department breakdown
    returned by the receipt summary endpoint.
    """

    department = serializers.CharField()

    total = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    item_count = serializers.IntegerField()

    receipt_count = serializers.IntegerField()