from django.urls import path
from .views import ReceiptViewSet, ReceiptItemViewSet


urlpatterns = [

    # ==========================================
    # Receipt URLs
    # ==========================================

    path(
        "",
        ReceiptViewSet.as_view({"get": "list"}),
        name="receipt_list"
    ),

    path(
        "add/",
        ReceiptViewSet.as_view({"post": "create"}),
        name="receipt_create"
    ),

    path(
        "summary/",
        ReceiptItemViewSet.as_view({"get": "summary"}),
        name="receipt_summary"
    ),

    path(
        "summary/export/",
        ReceiptViewSet.as_view({"get": "export"}),
        name="export_receipt_summary"
    ),

    path(
        "summary/export/filtered/",
        ReceiptItemViewSet.as_view({"get": "export"}),
        name="export_filtered_summary"
    ),


    # ==========================================
    # Receipt Item URLs
    # ==========================================

    path(
        "<str:receipt_id>/items/add/",
        ReceiptViewSet.as_view({"get": "items", "post": "items"}),
        name="receipt_item_create"
    ),

    path(
        "items/<int:item_id>/edit/",
        ReceiptItemViewSet.as_view({"put": "update", "patch": "partial_update"}),
        name="receipt_item_update"
    ),

    path(
        "items/<int:item_id>/delete/",
        ReceiptItemViewSet.as_view({"delete": "destroy"}),
        name="receipt_item_delete"
    ),


    # ==========================================
    # Individual Receipt URLs
    # ==========================================

    path(
        "<str:receipt_id>/edit/",
        ReceiptViewSet.as_view({"put": "update", "patch": "partial_update"}),
        name="receipt_update"
    ),

    path(
        "<str:receipt_id>/delete/",
        ReceiptViewSet.as_view({"delete": "destroy"}),
        name="receipt_delete"
    ),

    path(
        "<str:receipt_id>/",
        ReceiptViewSet.as_view({"get": "retrieve"}),
        name="receipt_detail"
    ),

]