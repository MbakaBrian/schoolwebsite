from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    EnrollmentViewSet,
    GalleryImageViewSet,
    EventViewSet,
    TeamMemberViewSet,
    FacilityViewSet,
    ProgramViewSet,
    AboutHistoryViewSet,
    AboutHistoryImageViewSet,
)

router = DefaultRouter()

router.register(
    r"enrollments",
    EnrollmentViewSet,
    basename="enrollment",
)

router.register(
    r"gallery",
    GalleryImageViewSet,
    basename="gallery",
)

router.register(
    r"events",
    EventViewSet,
    basename="event",
)

router.register(
    r"team",
    TeamMemberViewSet,
    basename="team",
)

router.register(
    r"facilities",
    FacilityViewSet,
    basename="facility",
)

router.register(
    r"programs",
    ProgramViewSet,
    basename="program",
)

router.register(
    r"about/history",
    AboutHistoryViewSet,
    basename="history",
)

router.register(
    r"about/history-images",
    AboutHistoryImageViewSet,
    basename="history-images",
)

urlpatterns = [
    path("", include(router.urls)),
]