from rest_framework.routers import DefaultRouter
from .views import FeePaymentViewSet, GradeFeeStructureViewSet, TransportRouteViewSet, TransportStageViewSet

router = DefaultRouter()
router.register(r'fee-structures', GradeFeeStructureViewSet)
router.register(r'fee-payments', FeePaymentViewSet)
router.register(r'routes', TransportRouteViewSet)
router.register(r'stages', TransportStageViewSet)

urlpatterns = router.urls
