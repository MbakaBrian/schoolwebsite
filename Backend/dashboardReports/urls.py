# dashboard/urls.py
from django.urls import path
from .views import HeadTeacherDashboardView

urlpatterns = [
    path("headteacher/dashboard/", HeadTeacherDashboardView.as_view(), name="headteacher-dashboard"),
]
