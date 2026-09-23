from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    DriverProfile,
    DriverWeeklyReport,
    Vehicle,
    VehicleAssignment,
    VehicleMaintenance,
    VehicleInsurance,
    VehicleFueling,
    TransportRoute,
    TransportStage,
    TransportAssignment,
)

from .serializers import (
    DriverProfileSerializer,
    DriverWeeklyReportSerializer,
    VehicleSerializer,
    VehicleAssignmentSerializer,
    VehicleMaintenanceSerializer,
    VehicleInsuranceSerializer,
    VehicleFuelingSerializer,
    TransportRouteSerializer,
    TransportStageSerializer,
    TransportAssignmentSerializer,
)

from .services import (
    # --------------------------------------------------------
    # DRIVER PROFILE
    # --------------------------------------------------------
    create_driver_profile,
    update_driver_profile,

    # --------------------------------------------------------
    # DRIVER WEEKLY REPORT
    # --------------------------------------------------------
    create_driver_weekly_report,
    update_driver_weekly_report,
    review_driver_weekly_report,

    # --------------------------------------------------------
    # VEHICLE
    # --------------------------------------------------------
    create_vehicle,
    update_vehicle,
    deactivate_vehicle,

    # --------------------------------------------------------
    # VEHICLE ASSIGNMENT
    # --------------------------------------------------------
    create_vehicle_assignment,
    update_vehicle_assignment,
    deactivate_vehicle_assignment,

    # --------------------------------------------------------
    # VEHICLE FUELING
    # --------------------------------------------------------
    create_vehicle_fueling,
    update_vehicle_fueling,

    # --------------------------------------------------------
    # VEHICLE MAINTENANCE
    # --------------------------------------------------------
    create_vehicle_maintenance,
    update_vehicle_maintenance,

    # --------------------------------------------------------
    # VEHICLE INSURANCE
    # --------------------------------------------------------
    create_vehicle_insurance,
    update_vehicle_insurance,

    # --------------------------------------------------------
    # ROUTES
    # --------------------------------------------------------
    create_transport_route,
    update_transport_route,
    deactivate_transport_route,

    # --------------------------------------------------------
    # STAGES
    # --------------------------------------------------------
    create_transport_stage,
    update_transport_stage,
    deactivate_transport_stage,

    # --------------------------------------------------------
    # STUDENT TRANSPORT ASSIGNMENTS
    # --------------------------------------------------------
    create_transport_assignment,
    update_transport_assignment,
    deactivate_transport_assignment,
)


# ============================================================
# SHARED HELPERS
# ============================================================

def validation_error_response(exc):
    """
    Convert Django ValidationError into a consistent DRF
    response.
    """

    if hasattr(exc, "message_dict"):
        detail = exc.message_dict
    else:
        detail = exc.messages

    return Response(
        {
            "success": False,
            "detail": detail,
        },
        status=status.HTTP_400_BAD_REQUEST,
    )


def success_response(
    data,
    message=None,
    response_status=status.HTTP_200_OK,
):
    """
    Standard successful API response.
    """

    payload = {
        "success": True,
        "data": data,
    }

    if message:
        payload["message"] = message

    return Response(
        payload,
        status=response_status,
    )


# ============================================================
# DRIVER PROFILE
# ============================================================

class DriverProfileListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        List driver profiles.

    POST:
        Create a driver profile.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        DriverProfile.objects
        .select_related(
            "staff",
            "verified_by",
        )
        .all()
    )

    serializer_class = DriverProfileSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        staff_id = self.request.query_params.get(
            "staff"
        )

        is_verified = self.request.query_params.get(
            "is_verified"
        )

        if staff_id:
            queryset = queryset.filter(
                staff_id=staff_id
            )

        if is_verified is not None:
            queryset = queryset.filter(
                is_verified=is_verified.lower()
                in ["true", "1", "yes"]
            )

        return queryset

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            driver_profile = (
                create_driver_profile(
                    **serializer.validated_data
                )
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            driver_profile
        )

        return success_response(
            output_serializer.data,
            message="Driver profile created successfully.",
            response_status=status.HTTP_201_CREATED,
        )


class DriverProfileDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    GET:
        Retrieve driver profile.

    PUT/PATCH:
        Update driver profile.

    DELETE:
        Driver profiles are not physically deleted.
        The profile can be deactivated through the
        appropriate service/workflow.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        DriverProfile.objects
        .select_related(
            "staff",
            "verified_by",
        )
        .all()
    )

    serializer_class = DriverProfileSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            updated = update_driver_profile(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            updated
        )

        return success_response(
            output_serializer.data,
            message="Driver profile updated successfully.",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):
        return Response(
            {
                "success": False,
                "detail": (
                    "Driver profiles cannot be deleted "
                    "through this endpoint."
                ),
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


# ============================================================
# DRIVER WEEKLY REPORTS
# ============================================================

class DriverWeeklyReportListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        List weekly driver reports.

    POST:
        Create a weekly driver report.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        DriverWeeklyReport.objects
        .select_related(
            "driver__staff",
            "vehicle",
            "reviewed_by",
        )
        .all()
    )

    serializer_class = DriverWeeklyReportSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        driver_id = self.request.query_params.get(
            "driver"
        )

        vehicle_id = self.request.query_params.get(
            "vehicle"
        )

        reviewed = self.request.query_params.get(
            "reviewed"
        )

        if driver_id:
            queryset = queryset.filter(
                driver_id=driver_id
            )

        if vehicle_id:
            queryset = queryset.filter(
                vehicle_id=vehicle_id
            )

        if reviewed is not None:
            queryset = queryset.filter(
                reviewed=reviewed.lower()
                in ["true", "1", "yes"]
            )

        return queryset

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            report = (
                create_driver_weekly_report(
                    **serializer.validated_data
                )
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            report
        )

        return success_response(
            output_serializer.data,
            message="Weekly driver report created successfully.",
            response_status=status.HTTP_201_CREATED,
        )


class DriverWeeklyReportDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    GET:
        Retrieve weekly report.

    PUT/PATCH:
        Update weekly report.

    DELETE:
        Reports are retained as operational history.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        DriverWeeklyReport.objects
        .select_related(
            "driver__staff",
            "vehicle",
            "reviewed_by",
        )
        .all()
    )

    serializer_class = DriverWeeklyReportSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            updated = update_driver_weekly_report(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            updated
        )

        return success_response(
            output_serializer.data,
            message="Weekly driver report updated successfully.",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):
        return Response(
            {
                "success": False,
                "detail": (
                    "Weekly driver reports cannot "
                    "be deleted through this endpoint."
                ),
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


class DriverWeeklyReportReviewView(
    generics.GenericAPIView
):
    """
    Review a driver's weekly report.

    POST:
        /api/transport/driver-reports/<id>/review/
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        DriverWeeklyReport.objects
        .select_related(
            "driver__staff",
            "vehicle",
            "reviewed_by",
        )
        .all()
    )

    serializer_class = DriverWeeklyReportSerializer

    def post(
        self,
        request,
        *args,
        **kwargs
    ):

        report = self.get_object()

        reviewed = request.data.get(
            "reviewed",
            True
        )

        review_comments = request.data.get(
            "review_comments",
            ""
        )

        try:

            updated = review_driver_weekly_report(
                report=report,
                reviewed=reviewed,
                review_comments=review_comments,
                reviewed_by=request.user,
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            updated
        )

        return success_response(
            output_serializer.data,
            message="Weekly driver report reviewed successfully.",
        )


# ============================================================
# VEHICLES
# ============================================================

class VehicleListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        List vehicles.

    POST:
        Create vehicle.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = Vehicle.objects.all()

    serializer_class = VehicleSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        status_filter = self.request.query_params.get(
            "status"
        )

        vehicle_type = self.request.query_params.get(
            "vehicle_type"
        )

        fuel_type = self.request.query_params.get(
            "fuel_type"
        )

        ownership_type = self.request.query_params.get(
            "ownership_type"
        )

        search = self.request.query_params.get(
            "search"
        )

        if status_filter:
            queryset = queryset.filter(
                status=status_filter
            )

        if vehicle_type:
            queryset = queryset.filter(
                vehicle_type=vehicle_type
            )

        if fuel_type:
            queryset = queryset.filter(
                fuel_type=fuel_type
            )

        if ownership_type:
            queryset = queryset.filter(
                ownership_type=ownership_type
            )

        if search:
            from django.db.models import Q

            queryset = queryset.filter(
                Q(vehicle_id__icontains=search)
                |
                Q(
                    registration_number__icontains=search
                )
                |
                Q(make__icontains=search)
                |
                Q(model__icontains=search)
            )

        return queryset

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            vehicle = create_vehicle(
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            vehicle
        )

        return success_response(
            output_serializer.data,
            message="Vehicle created successfully.",
            response_status=status.HTTP_201_CREATED,
        )


class VehicleDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Vehicle detail endpoint.

    DELETE performs a soft deactivation through the
    service layer.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = Vehicle.objects.all()

    serializer_class = VehicleSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            updated = update_vehicle(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            updated
        )

        return success_response(
            output_serializer.data,
            message="Vehicle updated successfully.",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        vehicle = self.get_object()

        try:

            deactivate_vehicle(
                vehicle
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Vehicle deactivated successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# VEHICLE ASSIGNMENTS
# ============================================================

class VehicleAssignmentListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        List vehicle/driver assignments.

    POST:
        Create vehicle/driver assignment.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        VehicleAssignment.objects
        .select_related(
            "vehicle",
            "driver__staff",
        )
        .all()
    )

    serializer_class = VehicleAssignmentSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        vehicle_id = self.request.query_params.get(
            "vehicle"
        )

        driver_id = self.request.query_params.get(
            "driver"
        )

        assignment_status = (
            self.request.query_params.get(
                "status"
            )
        )

        is_primary = self.request.query_params.get(
            "is_primary"
        )

        if vehicle_id:
            queryset = queryset.filter(
                vehicle_id=vehicle_id
            )

        if driver_id:
            queryset = queryset.filter(
                driver_id=driver_id
            )

        if assignment_status:
            queryset = queryset.filter(
                status=assignment_status
            )

        if is_primary is not None:
            queryset = queryset.filter(
                is_primary=is_primary.lower()
                in ["true", "1", "yes"]
            )

        return queryset

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        try:

            assignment = create_vehicle_assignment(
                **data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            assignment
        )

        return success_response(
            output_serializer.data,
            message="Vehicle assignment created successfully.",
            response_status=status.HTTP_201_CREATED,
        )


class VehicleAssignmentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Vehicle assignment detail.

    DELETE deactivates the assignment.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        VehicleAssignment.objects
        .select_related(
            "vehicle",
            "driver__staff",
        )
        .all()
    )

    serializer_class = VehicleAssignmentSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            updated = update_vehicle_assignment(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            updated
        )

        return success_response(
            output_serializer.data,
            message="Vehicle assignment updated successfully.",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        assignment = self.get_object()

        try:

            deactivate_vehicle_assignment(
                assignment
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Vehicle assignment deactivated successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# VEHICLE FUELING
# ============================================================

class VehicleFuelingListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        List vehicle fueling records.

    POST:
        Create a fueling record.

    Creating a fueling record also creates the linked
    Receipt/ReceiptItem through the service layer.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        VehicleFueling.objects
        .select_related(
            "vehicle",
            "driver__staff",
            "department",
            "subdepartment",
            "recorded_by",
            "receipt",
        )
        .all()
    )

    serializer_class = VehicleFuelingSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        vehicle_id = self.request.query_params.get(
            "vehicle"
        )

        driver_id = self.request.query_params.get(
            "driver"
        )

        department_id = self.request.query_params.get(
            "department"
        )

        subdepartment_id = (
            self.request.query_params.get(
                "subdepartment"
            )
        )

        date_from = self.request.query_params.get(
            "date_from"
        )

        date_to = self.request.query_params.get(
            "date_to"
        )

        if vehicle_id:
            queryset = queryset.filter(
                vehicle_id=vehicle_id
            )

        if driver_id:
            queryset = queryset.filter(
                driver_id=driver_id
            )

        if department_id:
            queryset = queryset.filter(
                department_id=department_id
            )

        if subdepartment_id:
            queryset = queryset.filter(
                subdepartment_id=subdepartment_id
            )

        if date_from:
            queryset = queryset.filter(
                date__gte=date_from
            )

        if date_to:
            queryset = queryset.filter(
                date__lte=date_to
            )

        return queryset

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        try:

            fueling = create_vehicle_fueling(
                vehicle=data["vehicle"],
                recorded_by=request.user,
                department=data["department"],
                subdepartment=data.get(
                    "subdepartment"
                ),
                payment_method=data[
                    "payment_method"
                ],
                payment_reference=data.get(
                    "payment_reference",
                    ""
                ),
                **{
                    key: value
                    for key, value in data.items()
                    if key not in {
                        "vehicle",
                        "department",
                        "subdepartment",
                        "payment_method",
                        "payment_reference",
                        "recorded_by",
                        "receipt",
                    }
                },
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            fueling
        )

        return success_response(
            output_serializer.data,
            message="Vehicle fueling record created successfully.",
            response_status=status.HTTP_201_CREATED,
        )


class VehicleFuelingDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Vehicle fueling detail.

    Updating the fueling record also synchronizes its
    Receipt/ReceiptItem.

    DELETE is disabled because the fueling record and
    financial receipt form part of the financial history.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        VehicleFueling.objects
        .select_related(
            "vehicle",
            "driver__staff",
            "department",
            "subdepartment",
            "recorded_by",
            "receipt",
        )
        .all()
    )

    serializer_class = VehicleFuelingSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            updated = update_vehicle_fueling(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            updated
        )

        return success_response(
            output_serializer.data,
            message="Vehicle fueling record updated successfully.",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):
        return Response(
            {
                "success": False,
                "detail": (
                    "Vehicle fueling records cannot "
                    "be deleted through this endpoint."
                ),
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


# ============================================================
# VEHICLE MAINTENANCE
# ============================================================

class VehicleMaintenanceListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        List vehicle maintenance records.

    POST:
        Create a maintenance record.

    A Receipt/ReceiptItem is created automatically.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        VehicleMaintenance.objects
        .select_related(
            "vehicle",
            "department",
            "subdepartment",
            "recorded_by",
            "receipt",
        )
        .all()
    )

    serializer_class = VehicleMaintenanceSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        vehicle_id = self.request.query_params.get(
            "vehicle"
        )

        department_id = self.request.query_params.get(
            "department"
        )

        subdepartment_id = (
            self.request.query_params.get(
                "subdepartment"
            )
        )

        maintenance_type = (
            self.request.query_params.get(
                "maintenance_type"
            )
        )

        date_from = self.request.query_params.get(
            "date_from"
        )

        date_to = self.request.query_params.get(
            "date_to"
        )

        if vehicle_id:
            queryset = queryset.filter(
                vehicle_id=vehicle_id
            )

        if department_id:
            queryset = queryset.filter(
                department_id=department_id
            )

        if subdepartment_id:
            queryset = queryset.filter(
                subdepartment_id=subdepartment_id
            )

        if maintenance_type:
            queryset = queryset.filter(
                maintenance_type=maintenance_type
            )

        if date_from:
            queryset = queryset.filter(
                maintenance_date__gte=date_from
            )

        if date_to:
            queryset = queryset.filter(
                maintenance_date__lte=date_to
            )

        return queryset

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        try:

            maintenance = create_vehicle_maintenance(
                vehicle=data["vehicle"],
                recorded_by=request.user,
                department=data["department"],
                subdepartment=data.get(
                    "subdepartment"
                ),
                payment_method=data[
                    "payment_method"
                ],
                payment_reference=data.get(
                    "payment_reference",
                    ""
                ),
                **{
                    key: value
                    for key, value in data.items()
                    if key not in {
                        "vehicle",
                        "department",
                        "subdepartment",
                        "payment_method",
                        "payment_reference",
                        "recorded_by",
                        "receipt",
                    }
                },
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            maintenance
        )

        return success_response(
            output_serializer.data,
            message="Vehicle maintenance record created successfully.",
            response_status=status.HTTP_201_CREATED,
        )


class VehicleMaintenanceDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Vehicle maintenance detail.

    Updates synchronize the linked receipt.

    DELETE is disabled because maintenance records are
    financial/operational history.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        VehicleMaintenance.objects
        .select_related(
            "vehicle",
            "department",
            "subdepartment",
            "recorded_by",
            "receipt",
        )
        .all()
    )

    serializer_class = VehicleMaintenanceSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            updated = update_vehicle_maintenance(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            updated
        )

        return success_response(
            output_serializer.data,
            message="Vehicle maintenance record updated successfully.",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):
        return Response(
            {
                "success": False,
                "detail": (
                    "Vehicle maintenance records cannot "
                    "be deleted through this endpoint."
                ),
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


# ============================================================
# VEHICLE INSURANCE
# ============================================================

class VehicleInsuranceListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        List historical vehicle insurance records.

    POST:
        Create an insurance record.

    Creating insurance automatically creates its linked
    Receipt/ReceiptItem.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        VehicleInsurance.objects
        .select_related(
            "vehicle",
            "department",
            "subdepartment",
            "recorded_by",
            "receipt",
        )
        .all()
    )

    serializer_class = VehicleInsuranceSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        vehicle_id = self.request.query_params.get(
            "vehicle"
        )

        department_id = self.request.query_params.get(
            "department"
        )

        subdepartment_id = (
            self.request.query_params.get(
                "subdepartment"
            )
        )

        active_only = self.request.query_params.get(
            "active"
        )

        if vehicle_id:
            queryset = queryset.filter(
                vehicle_id=vehicle_id
            )

        if department_id:
            queryset = queryset.filter(
                department_id=department_id
            )

        if subdepartment_id:
            queryset = queryset.filter(
                subdepartment_id=subdepartment_id
            )

        if active_only is not None:

            from django.utils import timezone

            is_active = (
                active_only.lower()
                in ["true", "1", "yes"]
            )

            if is_active:

                queryset = queryset.filter(
                    expiry_date__gte=timezone.now().date()
                )

            else:

                queryset = queryset.filter(
                    expiry_date__lt=timezone.now().date()
                )

        return queryset

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        try:

            insurance = create_vehicle_insurance(
                vehicle=data["vehicle"],
                recorded_by=request.user,
                department=data["department"],
                subdepartment=data.get(
                    "subdepartment"
                ),
                payment_method=data[
                    "payment_method"
                ],
                payment_reference=data.get(
                    "payment_reference",
                    ""
                ),
                **{
                    key: value
                    for key, value in data.items()
                    if key not in {
                        "vehicle",
                        "department",
                        "subdepartment",
                        "payment_method",
                        "payment_reference",
                        "recorded_by",
                        "receipt",
                    }
                },
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            insurance
        )

        return success_response(
            output_serializer.data,
            message="Vehicle insurance record created successfully.",
            response_status=status.HTTP_201_CREATED,
        )


class VehicleInsuranceDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Vehicle insurance detail.

    Updating the insurance record synchronizes the linked
    receipt and the vehicle's current insurance snapshot.

    DELETE is disabled because insurance records are
    historical financial records.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        VehicleInsurance.objects
        .select_related(
            "vehicle",
            "department",
            "subdepartment",
            "recorded_by",
            "receipt",
        )
        .all()
    )

    serializer_class = VehicleInsuranceSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            updated = update_vehicle_insurance(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            updated
        )

        return success_response(
            output_serializer.data,
            message="Vehicle insurance record updated successfully.",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):
        return Response(
            {
                "success": False,
                "detail": (
                    "Vehicle insurance records cannot "
                    "be deleted through this endpoint."
                ),
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


# ============================================================
# TRANSPORT ROUTES
# ============================================================

class TransportRouteListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        List transport routes.

    POST:
        Create transport route.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = TransportRoute.objects.all()

    serializer_class = TransportRouteSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        route_status = self.request.query_params.get(
            "status"
        )

        direction = self.request.query_params.get(
            "direction"
        )

        search = self.request.query_params.get(
            "search"
        )

        if route_status:
            queryset = queryset.filter(
                status=route_status
            )

        if direction:
            queryset = queryset.filter(
                direction=direction
            )

        if search:

            from django.db.models import Q

            queryset = queryset.filter(
                Q(name__icontains=search)
                |
                Q(code__icontains=search)
                |
                Q(route_id__icontains=search)
            )

        return queryset

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            route = create_transport_route(
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            route
        )

        return success_response(
            output_serializer.data,
            message="Transport route created successfully.",
            response_status=status.HTTP_201_CREATED,
        )


class TransportRouteDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Transport route detail.

    DELETE deactivates the route.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = TransportRoute.objects.all()

    serializer_class = TransportRouteSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            updated = update_transport_route(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            updated
        )

        return success_response(
            output_serializer.data,
            message="Transport route updated successfully.",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        route = self.get_object()

        try:

            deactivate_transport_route(
                route
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Transport route deactivated successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# TRANSPORT STAGES
# ============================================================

class TransportStageListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        List route stages.

    POST:
        Create route stage.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        TransportStage.objects
        .select_related("route")
        .all()
    )

    serializer_class = TransportStageSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        route_id = self.request.query_params.get(
            "route"
        )

        stage_status = self.request.query_params.get(
            "status"
        )

        if route_id:
            queryset = queryset.filter(
                route_id=route_id
            )

        if stage_status:
            queryset = queryset.filter(
                status=stage_status
            )

        return queryset

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            stage = create_transport_stage(
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            stage
        )

        return success_response(
            output_serializer.data,
            message="Transport stage created successfully.",
            response_status=status.HTTP_201_CREATED,
        )


class TransportStageDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Transport stage detail.

    DELETE deactivates the stage.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        TransportStage.objects
        .select_related("route")
        .all()
    )

    serializer_class = TransportStageSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            updated = update_transport_stage(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            updated
        )

        return success_response(
            output_serializer.data,
            message="Transport stage updated successfully.",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        stage = self.get_object()

        try:

            deactivate_transport_stage(
                stage
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Transport stage deactivated successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# STUDENT TRANSPORT ASSIGNMENTS
# ============================================================

class TransportAssignmentListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        List student transport assignments.

    POST:
        Assign a student to transport.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        TransportAssignment.objects
        .select_related(
            "student",
            "enrollment",
            "route",
            "stage",
            "vehicle",
        )
        .all()
    )

    serializer_class = TransportAssignmentSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        student_id = self.request.query_params.get(
            "student"
        )

        enrollment_id = self.request.query_params.get(
            "enrollment"
        )

        route_id = self.request.query_params.get(
            "route"
        )

        vehicle_id = self.request.query_params.get(
            "vehicle"
        )

        assignment_status = (
            self.request.query_params.get(
                "status"
            )
        )

        if student_id:
            queryset = queryset.filter(
                student_id=student_id
            )

        if enrollment_id:
            queryset = queryset.filter(
                enrollment_id=enrollment_id
            )

        if route_id:
            queryset = queryset.filter(
                route_id=route_id
            )

        if vehicle_id:
            queryset = queryset.filter(
                vehicle_id=vehicle_id
            )

        if assignment_status:
            queryset = queryset.filter(
                status=assignment_status
            )

        return queryset

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            assignment = create_transport_assignment(
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            assignment
        )

        return success_response(
            output_serializer.data,
            message="Student transport assignment created successfully.",
            response_status=status.HTTP_201_CREATED,
        )


class TransportAssignmentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Student transport assignment detail.

    DELETE deactivates the assignment.
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        TransportAssignment.objects
        .select_related(
            "student",
            "enrollment",
            "route",
            "stage",
            "vehicle",
        )
        .all()
    )

    serializer_class = TransportAssignmentSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            updated = update_transport_assignment(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        output_serializer = self.get_serializer(
            updated
        )

        return success_response(
            output_serializer.data,
            message="Student transport assignment updated successfully.",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        assignment = self.get_object()

        try:

            deactivate_transport_assignment(
                assignment
            )

        except DjangoValidationError as exc:

            return validation_error_response(
                exc
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Student transport assignment "
                    "deactivated successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )
