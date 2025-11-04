from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, ParentViewSet, StreamViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'parents', ParentViewSet)
router.register(r'streams', StreamViewSet, basename='stream')
urlpatterns = router.urls
