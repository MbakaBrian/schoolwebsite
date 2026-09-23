from django.urls import path

from .views import (
    StaffListCreateView,
    StaffDetailView,

    StaffRefereeListCreateView,
    StaffRefereeDetailView,

    StaffRoleListCreateView,
    StaffRoleDetailView,

    StaffRoleAssignmentListCreateView,
    StaffRoleAssignmentDetailView,
)


app_name = "staff"


urlpatterns = [

    # ========================================================
    # STAFF
    # ========================================================

    path(
        "",
        StaffListCreateView.as_view(),
        name="staff-list-create",
    ),

    path(
        "<int:pk>/",
        StaffDetailView.as_view(),
        name="staff-detail",
    ),


    # ========================================================
    # STAFF REFEREES
    # ========================================================

    path(
        "referees/",
        StaffRefereeListCreateView.as_view(),
        name="referee-list-create",
    ),

    path(
        "referees/<int:pk>/",
        StaffRefereeDetailView.as_view(),
        name="referee-detail",
    ),


    # ========================================================
    # STAFF ROLES
    # ========================================================

    path(
        "roles/",
        StaffRoleListCreateView.as_view(),
        name="role-list-create",
    ),

    path(
        "roles/<int:pk>/",
        StaffRoleDetailView.as_view(),
        name="role-detail",
    ),


    # ========================================================
    # STAFF ROLE ASSIGNMENTS
    # ========================================================

    path(
        "role-assignments/",
        StaffRoleAssignmentListCreateView.as_view(),
        name="role-assignment-list-create",
    ),

    path(
        "role-assignments/<int:pk>/",
        StaffRoleAssignmentDetailView.as_view(),
        name="role-assignment-detail",
    ),
]

