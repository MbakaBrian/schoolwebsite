from django.db.models import Sum, Count
from django.http import HttpResponse

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

from .models import Receipt, ReceiptItem
from .serializer import (
    ReceiptSerializer,
    ReceiptItemSerializer,
    DepartmentSummarySerializer,
)


# ---------------------------------------------------------------------------
# Shared helper: builds the styled .xlsx header block used by both exports.
# ---------------------------------------------------------------------------
def _styled_workbook(sheet_title, subtitle, headers, column_widths):
    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = sheet_title

    worksheet["A1"] = "School I/O System"
    worksheet["A2"] = subtitle
    worksheet["A1"].font = Font(bold=True, size=16)
    worksheet["A2"].font = Font(bold=True, size=13)

    header_row = 4
    for column, header in enumerate(headers, start=1):
        cell = worksheet.cell(row=header_row, column=column, value=header)
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="343A40")
        cell.alignment = Alignment(horizontal="center")

    for index, width in enumerate(column_widths, start=1):
        worksheet.column_dimensions[get_column_letter(index)].width = width

    worksheet.freeze_panes = "A5"
    return workbook, worksheet, header_row


class ReceiptViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for Receipt.

    Replaces: receipt_list, receipt_detail, receipt_create,
    receipt_update, receipt_delete, receipt_item_create (via the
    nested `items` action), and export_receipt_summary (via `export`).

    Looked up by receipt_id (not the numeric pk) to match the original
    URLs, e.g. /<str:receipt_id>/.
    """

    queryset = Receipt.objects.select_related("recorded_by").prefetch_related("items").all()
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "receipt_id"

    def perform_create(self, serializer):
        # Same as the original receipt_create: recorded_by always comes
        # from the logged-in user, never from client input.
        serializer.save(recorded_by=self.request.user)

    def list(self, request, *args, **kwargs):
        # Preserves the total_expenditure figure receipt_list rendered
        # alongside the table.
        queryset = self.filter_queryset(self.get_queryset())
        total_expenditure = queryset.aggregate(total=Sum("total"))["total"] or 0

        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page if page is not None else queryset, many=True)
        data = serializer.data

        if page is not None:
            paginated = self.get_paginated_response(data)
            paginated.data["total_expenditure"] = total_expenditure
            return paginated

        return Response({
            "results": data,
            "total_expenditure": total_expenditure,
        })

    # -- GET/POST /<receipt_id>/items/add/ -----------------------------
    @action(detail=True, methods=["get", "post"], url_path="items")
    def items(self, request, receipt_id=None):
        """Replaces receipt_item_create: list a receipt's items, or add one."""
        receipt = self.get_object()

        if request.method == "POST":
            serializer = ReceiptItemSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            # receipt comes from the URL, exactly as before — never from
            # client-supplied data.
            serializer.save(receipt=receipt)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        items = receipt.items.all()
        serializer = ReceiptItemSerializer(items, many=True)
        return Response(serializer.data)

    # -- GET /summary/export/ -------------------------------------------
    @action(detail=False, methods=["get"], url_path="export")
    def export(self, request):
        """Replaces export_receipt_summary — identical workbook and styling."""
        receipts = self.filter_queryset(self.get_queryset())

        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        if date_from:
            receipts = receipts.filter(date__gte=date_from)
        if date_to:
            receipts = receipts.filter(date__lte=date_to)

        headers = ["Receipt ID", "Date", "Store", "Payment Method", "Total Expense", "Recorded By"]
        widths = [18, 15, 30, 20, 18, 20]
        workbook, worksheet, header_row = _styled_workbook(
            "Receipt Summary", "Receipt Summary", headers, widths
        )

        row = header_row + 1
        for receipt in receipts:
            worksheet.cell(row=row, column=1, value=receipt.receipt_id)
            worksheet.cell(row=row, column=2, value=receipt.date)
            worksheet.cell(row=row, column=3, value=receipt.store)
            worksheet.cell(row=row, column=4, value=receipt.get_payment_method_display())
            total_cell = worksheet.cell(row=row, column=5, value=float(receipt.total or 0))
            total_cell.number_format = "#,##0.00"
            worksheet.cell(row=row, column=6, value=receipt.recorded_by.username)
            row += 1

        total = receipts.aggregate(total=Sum("total"))["total"] or 0
        worksheet.cell(row=row + 1, column=4, value="TOTAL").font = Font(bold=True)
        total_cell = worksheet.cell(row=row + 1, column=5, value=float(total))
        total_cell.font = Font(bold=True)
        total_cell.number_format = "#,##0.00"

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="receipt_summary.xlsx"'
        workbook.save(response)
        return response





class ReceiptItemViewSet(viewsets.ModelViewSet):
    """
    CRUD for ReceiptItem.

    Standard endpoints:
        GET    /api/receipt-items/
        POST   /api/receipt-items/
        GET    /api/receipt-items/<item_id>/
        PATCH  /api/receipt-items/<item_id>/
        DELETE /api/receipt-items/<item_id>/

    Additional endpoints:
        GET /api/receipt-items/summary/
        GET /api/receipt-items/export/

    Receipt filtering:
        /api/receipt-items/?receipt_id=RP-2026-00001
    """

    queryset = ReceiptItem.objects.select_related(
        "receipt",
        "receipt__recorded_by"
    ).all()

    serializer_class = ReceiptItemSerializer
    permission_classes = [IsAuthenticated]

    lookup_url_kwarg = "item_id"

    # ------------------------------------------------------------------
    # QUERYSET / FILTERING
    # ------------------------------------------------------------------
    def get_queryset(self):
        queryset = super().get_queryset()

        receipt_id = self.request.query_params.get("receipt_id")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        department = self.request.query_params.get("department")

        # Filter by receipt
        if receipt_id:
            queryset = queryset.filter(
                receipt__receipt_id=receipt_id
            )

        # Filter by date
        if date_from:
            queryset = queryset.filter(
                receipt__date__gte=date_from
            )

        if date_to:
            queryset = queryset.filter(
                receipt__date__lte=date_to
            )

        # Filter by department
        if department:
            queryset = queryset.filter(
                department=department
            )

        return queryset

    # ------------------------------------------------------------------
    # CREATE
    # ------------------------------------------------------------------
    def create(self, request, *args, **kwargs):
        """
        Create an item for a specific receipt.

        React sends:

        {
            "receipt_id": "RP-2026-00001",
            "item_name": "...",
            "department": "...",
            "quantity": 2,
            "unit": "pieces",
            "unit_price": 500
        }

        The receipt is resolved server-side.
        """

        receipt_id = request.data.get("receipt_id")

        if not receipt_id:
            return Response(
                {
                    "receipt_id": [
                        "Receipt ID is required."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            receipt = Receipt.objects.get(
                receipt_id=receipt_id
            )
        except Receipt.DoesNotExist:
            return Response(
                {
                    "receipt_id": [
                        "Receipt does not exist."
                    ]
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Do not pass receipt_id to the serializer if it isn't
        # an actual ReceiptItem model field.
        data = request.data.copy()
        data.pop("receipt_id", None)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        # Attach the receipt here.
        serializer.save(receipt=receipt)

        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    # ------------------------------------------------------------------
    # DELETE
    # ------------------------------------------------------------------
    def perform_destroy(self, instance):
        """
        ReceiptItem.delete() recalculates the parent receipt total.
        """
        instance.delete()

    # ------------------------------------------------------------------
    # SUMMARY
    # ------------------------------------------------------------------
    @action(
        detail=False,
        methods=["get"],
        url_path="summary"
    )
    def summary(self, request):

        items = self.get_queryset()

        total_expenditure = (
            items.aggregate(
                total=Sum("total")
            )["total"] or 0
        )

        total_items = items.count()

        total_receipts = (
            items.values("receipt")
            .distinct()
            .count()
        )

        department_summary = (
            items.values("department")
            .annotate(
                total=Sum("total"),
                item_count=Count("id"),
                receipt_count=Count(
                    "receipt",
                    distinct=True
                ),
            )
            .order_by("-total")
        )

        return Response({

            "total_expenditure": total_expenditure,

            "total_items": total_items,

            "total_receipts": total_receipts,

            "department_summary": DepartmentSummarySerializer(
                department_summary,
                many=True
            ).data,

            "date_from": request.query_params.get(
                "date_from"
            ),

            "date_to": request.query_params.get(
                "date_to"
            ),

            "selected_department": request.query_params.get(
                "department"
            ),

            "departments": ReceiptItem.DEPARTMENT_CHOICES,
        })

    # ------------------------------------------------------------------
    # EXCEL EXPORT
    # ------------------------------------------------------------------
    @action(
        detail=False,
        methods=["get"],
        url_path="export"
    )
    def export(self, request):

        items = self.get_queryset()

        headers = [
            "Receipt ID",
            "Date",
            "Store",
            "Item",
            "Department",
            "Quantity",
            "Unit",
            "Unit Price",
            "Total",
        ]

        widths = [
            18,
            15,
            30,
            30,
            25,
            12,
            15,
            18,
            18,
        ]

        workbook, worksheet, header_row = _styled_workbook(
            "Filtered Expenditure",
            "Filtered Expenditure Report",
            headers,
            widths,
        )

        row = header_row + 1

        for item in items:

            worksheet.cell(
                row=row,
                column=1,
                value=item.receipt.receipt_id
            )

            worksheet.cell(
                row=row,
                column=2,
                value=item.receipt.date
            )

            worksheet.cell(
                row=row,
                column=3,
                value=item.receipt.store
            )

            worksheet.cell(
                row=row,
                column=4,
                value=item.item_name
            )

            worksheet.cell(
                row=row,
                column=5,
                value=item.get_department_display()
            )

            worksheet.cell(
                row=row,
                column=6,
                value=float(item.quantity)
            )

            worksheet.cell(
                row=row,
                column=7,
                value=item.get_unit_display()
            )

            unit_price_cell = worksheet.cell(
                row=row,
                column=8,
                value=float(item.unit_price)
            )

            unit_price_cell.number_format = "#,##0.00"

            total_cell = worksheet.cell(
                row=row,
                column=9,
                value=float(item.total or 0)
            )

            total_cell.number_format = "#,##0.00"

            row += 1

        total = (
            items.aggregate(
                total=Sum("total")
            )["total"] or 0
        )

        worksheet.cell(
            row=row + 1,
            column=8,
            value="TOTAL"
        ).font = Font(bold=True)

        total_cell = worksheet.cell(
            row=row + 1,
            column=9,
            value=float(total)
        )

        total_cell.font = Font(bold=True)
        total_cell.number_format = "#,##0.00"

        response = HttpResponse(
            content_type=(
                "application/"
                "vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            )
        )

        response["Content-Disposition"] = (
            'attachment; '
            'filename="filtered_expenditure.xlsx"'
        )

        workbook.save(response)

        return response