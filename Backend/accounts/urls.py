from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoleViewSet, UserProfileViewSet, UserViewSet, MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'roles', RoleViewSet)
router.register(r'user-profiles', UserProfileViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # JWT authentication
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),  # login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
