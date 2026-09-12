from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    StoreViewSet,
    InventoryLocationViewSet,
    InventoryItemViewSet,
    InventoryStockViewSet,
    InventoryTransactionViewSet,
    InventoryDashboardView,
)


# ============================================================
# ROUTER
# ============================================================

router = DefaultRouter()

router.register(
    r"stores",
    StoreViewSet,
    basename="inventory-stores",
)

router.register(
    r"locations",
    InventoryLocationViewSet,
    basename="inventory-locations",
)

router.register(
    r"items",
    InventoryItemViewSet,
    basename="inventory-items",
)

router.register(
    r"stock",
    InventoryStockViewSet,
    basename="inventory-stock",
)

router.register(
    r"transactions",
    InventoryTransactionViewSet,
    basename="inventory-transactions",
)

router.register(
    r"dashboard",
    InventoryDashboardView,
    basename="inventory-dashboard",
)


# ============================================================
# URLS
# ============================================================

urlpatterns = [
    path(
        "",
        include(router.urls)
    ),
]