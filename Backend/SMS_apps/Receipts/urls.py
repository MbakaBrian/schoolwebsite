from django.urls import path

from .views import (
    ReceiptViewSet,
    ReceiptItemViewSet,
    DepartmentViewSet,
    SubDepartmentViewSet,
)


urlpatterns = [

    # ==========================================
    # Department URLs
    # ==========================================

    # List departments
    # GET /api/receipts/departments/
    # POST /api/receipts/departments/
    path(
        "departments/",
        DepartmentViewSet.as_view({
            "get": "list",
            "post": "create",
        }),
        name="department_list_create",
    ),

    # Department detail
    # GET /api/receipts/departments/<id>/
    # PUT/PATCH /api/receipts/departments/<id>/
    # DELETE /api/receipts/departments/<id>/
    path(
        "departments/<int:pk>/",
        DepartmentViewSet.as_view({
            "get": "retrieve",
            "put": "update",
            "patch": "partial_update",
            "delete": "destroy",
        }),
        name="department_detail",
    ),

    # Get subdepartments belonging to a department
    # GET /api/receipts/departments/<id>/subdepartments/
    path(
        "departments/<int:pk>/subdepartments/",
        DepartmentViewSet.as_view({
            "get": "subdepartments",
        }),
        name="department_subdepartments",
    ),


    # ==========================================
    # SubDepartment URLs
    # ==========================================

    # List / create subdepartments
    # GET /api/receipts/subdepartments/
    # POST /api/receipts/subdepartments/
    path(
        "subdepartments/",
        SubDepartmentViewSet.as_view({
            "get": "list",
            "post": "create",
        }),
        name="subdepartment_list_create",
    ),

    # SubDepartment detail
    # GET /api/receipts/subdepartments/<id>/
    # PUT/PATCH /api/receipts/subdepartments/<id>/
    # DELETE /api/receipts/subdepartments/<id>/
    path(
        "subdepartments/<int:pk>/",
        SubDepartmentViewSet.as_view({
            "get": "retrieve",
            "put": "update",
            "patch": "partial_update",
            "delete": "destroy",
        }),
        name="subdepartment_detail",
    ),


    # ==========================================
    # Receipt URLs
    # ==========================================

    # List receipts
    # GET /api/receipts/
    path(
        "",
        ReceiptViewSet.as_view({
            "get": "list",
        }),
        name="receipt_list",
    ),

    # Create receipt
    # POST /api/receipts/add/
    path(
        "add/",
        ReceiptViewSet.as_view({
            "post": "create",
        }),
        name="receipt_create",
    ),

    # Receipt summary
    # GET /api/receipts/summary/
    path(
        "summary/",
        ReceiptItemViewSet.as_view({
            "get": "summary",
        }),
        name="receipt_summary",
    ),

    # Receipt summary export
    # GET /api/receipts/summary/export/
    path(
        "summary/export/",
        ReceiptViewSet.as_view({
            "get": "export",
        }),
        name="export_receipt_summary",
    ),

    # Filtered expenditure export
    # GET /api/receipts/summary/export/filtered/
    path(
        "summary/export/filtered/",
        ReceiptItemViewSet.as_view({
            "get": "export",
        }),
        name="export_filtered_summary",
    ),


    # ==========================================
    # Receipt Item URLs
    # ==========================================

    # List receipt items / add receipt item
    # GET /api/receipts/<receipt_id>/items/add/
    # POST /api/receipts/<receipt_id>/items/add/
    path(
        "<str:receipt_id>/items/add/",
        ReceiptViewSet.as_view({
            "get": "items",
            "post": "items",
        }),
        name="receipt_item_create",
    ),

    # Update receipt item
    # PUT/PATCH /api/receipts/items/<item_id>/edit/
    path(
        "items/<int:item_id>/edit/",
        ReceiptItemViewSet.as_view({
            "put": "update",
            "patch": "partial_update",
        }),
        name="receipt_item_update",
    ),

    # Delete receipt item
    # DELETE /api/receipts/items/<item_id>/delete/
    path(
        "items/<int:item_id>/delete/",
        ReceiptItemViewSet.as_view({
            "delete": "destroy",
        }),
        name="receipt_item_delete",
    ),


    # ==========================================
    # Individual Receipt URLs
    # ==========================================

    # Update receipt
    # PUT/PATCH /api/receipts/<receipt_id>/edit/
    path(
        "<str:receipt_id>/edit/",
        ReceiptViewSet.as_view({
            "put": "update",
            "patch": "partial_update",
        }),
        name="receipt_update",
    ),

    # Delete receipt
    # DELETE /api/receipts/<receipt_id>/delete/
    path(
        "<str:receipt_id>/delete/",
        ReceiptViewSet.as_view({
            "delete": "destroy",
        }),
        name="receipt_delete",
    ),

    # Receipt detail
    # GET /api/receipts/<receipt_id>/
    path(
        "<str:receipt_id>/",
        ReceiptViewSet.as_view({
            "get": "retrieve",
        }),
        name="receipt_detail",
    ),

]