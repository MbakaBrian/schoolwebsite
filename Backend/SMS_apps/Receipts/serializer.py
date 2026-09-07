from rest_framework import serializers

from .models import Receipt, ReceiptItem


class ReceiptItemSerializer(serializers.ModelSerializer):
    """
    Serializer for individual receipt items.

    The receipt is determined by the URL when creating an item:
        POST /api/receipts/<receipt_id>/items/add/

    Therefore, `receipt` is read-only from the client's perspective
    and is assigned by the view using:

        serializer.save(receipt=receipt)

    The total is also calculated by ReceiptItem.save(), so it should
    never be supplied by the frontend.
    """

    department_display = serializers.CharField(
        source="get_department_display",
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
            "unit_display",
            "total",
        ]

    def create(self, validated_data):
        """
        Create a ReceiptItem.

        Normally the ReceiptItem is created through
        ReceiptViewSet.items(), where the receipt is injected:

            serializer.save(receipt=receipt)

        Because `receipt` is read-only, it will not be expected
        from the frontend request.
        """
        return ReceiptItem.objects.create(**validated_data)


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