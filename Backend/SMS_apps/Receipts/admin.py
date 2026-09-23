from django.contrib import admin

from .models import (
    Receipt,
    ReceiptItem,
    Department,
    SubDepartment,
)


# ============================================================
# DEPARTMENT ADMIN
# ============================================================

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """
    Admin configuration for receipt departments.
    """

    list_display = (
        "name",
        "code",
        "is_active",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "name",
        "code",
    )

    list_filter = (
        "is_active",
    )

    ordering = (
        "name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


# ============================================================
# SUB-DEPARTMENT ADMIN
# ============================================================

@admin.register(SubDepartment)
class SubDepartmentAdmin(admin.ModelAdmin):
    """
    Admin configuration for receipt sub-departments.
    """

    list_display = (
        "name",
        "department",
        "code",
        "is_active",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "name",
        "code",
        "department__name",
    )

    list_filter = (
        "is_active",
        "department",
    )

    ordering = (
        "department__name",
        "name",
    )

    autocomplete_fields = (
        "department",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


# ============================================================
# RECEIPT ITEM INLINE
# ============================================================

class ReceiptItemInline(admin.TabularInline):
    """
    Display receipt items directly inside the Receipt admin page.
    """

    model = ReceiptItem

    extra = 1

    fields = (
        "item_name",
        "department",
        "subdepartment",
        "quantity",
        "unit",
        "unit_price",
        "total",
    )

    readonly_fields = (
        "total",
    )

    autocomplete_fields = (
        "department",
        "subdepartment",
    )


# ============================================================
# RECEIPT ADMIN
# ============================================================

@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    """
    Admin configuration for receipts.

    Receipt items are managed directly from the Receipt page.
    """

    list_display = (
        "receipt_id",
        "store",
        "payment_method",
        "date",
        "payment_reference",
        "total",
        "recorded_by",
        "created_at",
    )

    search_fields = (
        "receipt_id",
        "store",
        "payment_reference",
        "description",
        "recorded_by__username",
        "recorded_by__first_name",
        "recorded_by__last_name",
    )

    list_filter = (
        "payment_method",
        "date",
        "store",
    )

    date_hierarchy = "date"

    ordering = (
        "-date",
        "-created_at",
    )

    readonly_fields = (
        "receipt_id",
        "total",
        "created_at",
        "updated_at",
    )

    autocomplete_fields = (
        "recorded_by",
    )

    inlines = (
        ReceiptItemInline,
    )


# ============================================================
# RECEIPT ITEM ADMIN
# ============================================================

@admin.register(ReceiptItem)
class ReceiptItemAdmin(admin.ModelAdmin):
    """
    Admin configuration for individual receipt items.
    """

    list_display = (
        "receipt",
        "item_name",
        "department",
        "subdepartment",
        "quantity",
        "unit",
        "unit_price",
        "total",
    )

    search_fields = (
        "item_name",
        "receipt__receipt_id",
        "department__name",
        "subdepartment__name",
    )

    list_filter = (
        "department",
        "unit",
    )

    ordering = (
        "-receipt__date",
        "-receipt__created_at",
    )

    readonly_fields = (
        "total",
    )

    autocomplete_fields = (
        "receipt",
        "department",
        "subdepartment",
    )

