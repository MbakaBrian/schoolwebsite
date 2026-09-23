from django.urls import path

from .views import (
    # ========================================================
    # DRIVER PROFILES
    # ========================================================
    DriverProfileListCreateView,
    DriverProfileDetailView,

    # ========================================================
    # DRIVER WEEKLY REPORTS
    # ========================================================
    DriverWeeklyReportListCreateView,
    DriverWeeklyReportDetailView,
    DriverWeeklyReportReviewView,

    # ========================================================
    # VEHICLES
    # ========================================================
    VehicleListCreateView,
    VehicleDetailView,

    # ========================================================
    # VEHICLE ASSIGNMENTS
    # ========================================================
    VehicleAssignmentListCreateView,
    VehicleAssignmentDetailView,

    # ========================================================
    # VEHICLE FUELING
    # ========================================================
    VehicleFuelingListCreateView,
    VehicleFuelingDetailView,

    # ========================================================
    # VEHICLE MAINTENANCE
    # ========================================================
    VehicleMaintenanceListCreateView,
    VehicleMaintenanceDetailView,

    # ========================================================
    # VEHICLE INSURANCE
    # ========================================================
    VehicleInsuranceListCreateView,
    VehicleInsuranceDetailView,

    # ========================================================
    # TRANSPORT ROUTES
    # ========================================================
    TransportRouteListCreateView,
    TransportRouteDetailView,

    # ========================================================
    # TRANSPORT STAGES
    # ========================================================
    TransportStageListCreateView,
    TransportStageDetailView,

    # ========================================================
    # STUDENT TRANSPORT ASSIGNMENTS
    # ========================================================
    TransportAssignmentListCreateView,
    TransportAssignmentDetailView,
)


app_name = "transport"


urlpatterns = [

    # ========================================================
    # DRIVER PROFILES
    # ========================================================

    path(
        "driver-profiles/",
        DriverProfileListCreateView.as_view(),
        name="driver-profile-list-create",
    ),

    path(
        "driver-profiles/<int:pk>/",
        DriverProfileDetailView.as_view(),
        name="driver-profile-detail",
    ),


    # ========================================================
    # DRIVER WEEKLY REPORTS
    # ========================================================

    path(
        "driver-reports/",
        DriverWeeklyReportListCreateView.as_view(),
        name="driver-report-list-create",
    ),

    path(
        "driver-reports/<int:pk>/",
        DriverWeeklyReportDetailView.as_view(),
        name="driver-report-detail",
    ),

    path(
        "driver-reports/<int:pk>/review/",
        DriverWeeklyReportReviewView.as_view(),
        name="driver-report-review",
    ),


    # ========================================================
    # VEHICLES
    # ========================================================

    path(
        "vehicles/",
        VehicleListCreateView.as_view(),
        name="vehicle-list-create",
    ),

    path(
        "vehicles/<int:pk>/",
        VehicleDetailView.as_view(),
        name="vehicle-detail",
    ),


    # ========================================================
    # VEHICLE ASSIGNMENTS
    # ========================================================

    path(
        "vehicle-assignments/",
        VehicleAssignmentListCreateView.as_view(),
        name="vehicle-assignment-list-create",
    ),

    path(
        "vehicle-assignments/<int:pk>/",
        VehicleAssignmentDetailView.as_view(),
        name="vehicle-assignment-detail",
    ),


    # ========================================================
    # VEHICLE FUELING
    # ========================================================

    path(
        "fueling/",
        VehicleFuelingListCreateView.as_view(),
        name="fueling-list-create",
    ),

    path(
        "fueling/<int:pk>/",
        VehicleFuelingDetailView.as_view(),
        name="fueling-detail",
    ),


    # ========================================================
    # VEHICLE MAINTENANCE
    # ========================================================

    path(
        "maintenance/",
        VehicleMaintenanceListCreateView.as_view(),
        name="maintenance-list-create",
    ),

    path(
        "maintenance/<int:pk>/",
        VehicleMaintenanceDetailView.as_view(),
        name="maintenance-detail",
    ),


    # ========================================================
    # VEHICLE INSURANCE
    # ========================================================

    path(
        "insurance/",
        VehicleInsuranceListCreateView.as_view(),
        name="insurance-list-create",
    ),

    path(
        "insurance/<int:pk>/",
        VehicleInsuranceDetailView.as_view(),
        name="insurance-detail",
    ),


    # ========================================================
    # TRANSPORT ROUTES
    # ========================================================

    path(
        "routes/",
        TransportRouteListCreateView.as_view(),
        name="route-list-create",
    ),

    path(
        "routes/<int:pk>/",
        TransportRouteDetailView.as_view(),
        name="route-detail",
    ),


    # ========================================================
    # TRANSPORT STAGES
    # ========================================================

    path(
        "stages/",
        TransportStageListCreateView.as_view(),
        name="stage-list-create",
    ),

    path(
        "stages/<int:pk>/",
        TransportStageDetailView.as_view(),
        name="stage-detail",
    ),


    # ========================================================
    # STUDENT TRANSPORT ASSIGNMENTS
    # ========================================================

    path(
        "assignments/",
        TransportAssignmentListCreateView.as_view(),
        name="assignment-list-create",
    ),

    path(
        "assignments/<int:pk>/",
        TransportAssignmentDetailView.as_view(),
        name="assignment-detail",
    ),
]

