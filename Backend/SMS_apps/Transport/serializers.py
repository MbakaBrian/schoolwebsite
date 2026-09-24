from rest_framework import serializers

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


# ============================================================
# DRIVER PROFILE SERIALIZER
# ============================================================

from django.utils import timezone
from rest_framework import serializers

from .models import DriverProfile


class DriverProfileSerializer(serializers.ModelSerializer):
    # --------------------------------------------------
    # STAFF INFORMATION
    # --------------------------------------------------

    staff_name = serializers.CharField(
        source="staff.full_name",
        read_only=True,
    )

    staff_id = serializers.CharField(
        source="staff.staff_id",
        read_only=True,
    )

    # --------------------------------------------------
    # DRIVER STATUS
    # --------------------------------------------------
    # Status belongs to Staff and is therefore derived
    # from the linked Staff record.
    #
    # This prevents having two separate statuses that
    # could become inconsistent.
    status = serializers.CharField(
        source="staff.status",
        read_only=True,
    )

    # --------------------------------------------------
    # VERIFICATION INFORMATION
    # --------------------------------------------------

    verified_by_name = serializers.CharField(
        source="verified_by.get_full_name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = DriverProfile

        fields = [
            "id",

            # Staff
            "staff",
            "staff_name",
            "staff_id",
            "status",

            # Driving licence
            "license_number",
            "license_class",
            "license_issue_date",
            "license_expiry_date",

            # PSV
            "psv_license_number",
            "psv_expiry_date",

            # Driver badge
            "driver_badge_number",

            # Experience
            "years_of_experience",
            "previous_driving_experience",

            # Medical
            "medical_certificate_expiry",

            # Verification
            "is_verified",
            "verified_at",
            "verified_by",
            "verified_by_name",

            # Notes
            "notes",

            # Timestamps
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",

            # Staff display information
            "staff_name",
            "staff_id",
            "status",

            # Verification information is controlled
            # automatically by the backend.
            "verified_at",
            "verified_by",
            "verified_by_name",

            # Timestamps
            "created_at",
            "updated_at",
        ]

    # --------------------------------------------------
    # VALIDATION
    # --------------------------------------------------

    def validate_years_of_experience(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Years of experience cannot be negative."
            )

        return value

    # --------------------------------------------------
    # CREATE
    # --------------------------------------------------

    def create(self, validated_data):
        request = self.context.get("request")

        is_verified = validated_data.get(
            "is_verified",
            False,
        )

        if is_verified:
            user = getattr(request, "user", None)

            if not user or not user.is_authenticated:
                raise serializers.ValidationError({
                    "is_verified": (
                        "An authenticated user is required "
                        "to verify a driver."
                    )
                })

            # Automatically record the logged-in user.
            validated_data["verified_by"] = user

            # Automatically record verification time.
            validated_data["verified_at"] = timezone.now()

        else:
            validated_data["verified_by"] = None
            validated_data["verified_at"] = None

        return super().create(validated_data)

    # --------------------------------------------------
    # UPDATE
    # --------------------------------------------------

    def update(self, instance, validated_data):
        request = self.context.get("request")

        is_verified = validated_data.get(
            "is_verified",
            instance.is_verified,
        )

        # ----------------------------------------------
        # DRIVER IS BEING VERIFIED
        # ----------------------------------------------

        if is_verified:

            # If the driver was previously unverified,
            # the current logged-in user becomes the verifier.
            if not instance.is_verified:

                user = getattr(request, "user", None)

                if not user or not user.is_authenticated:
                    raise serializers.ValidationError({
                        "is_verified": (
                            "An authenticated user is required "
                            "to verify a driver."
                        )
                    })

                validated_data["verified_by"] = user
                validated_data["verified_at"] = timezone.now()

            else:
                # Already verified.
                # Preserve the original verification details.
                validated_data["verified_by"] = (
                    instance.verified_by
                )

                validated_data["verified_at"] = (
                    instance.verified_at
                )

        # ----------------------------------------------
        # DRIVER IS BEING UNVERIFIED
        # ----------------------------------------------

        else:
            validated_data["verified_by"] = None
            validated_data["verified_at"] = None

        return super().update(instance, validated_data)

# ============================================================
# VEHICLE SERIALIZER
# ============================================================

class VehicleSerializer(serializers.ModelSerializer):
    """
    Full vehicle serializer.

    Vehicle contains the current/latest operational snapshot.

    Historical information such as:
    - Insurance
    - Maintenance
    - Fueling

    is stored in their respective models.
    """

    class Meta:
        model = Vehicle

        fields = [
            "id",

            # ------------------------------------------------
            # VEHICLE IDENTITY
            # ------------------------------------------------
            "vehicle_id",
            "registration_number",
            "make",
            "model",
            "vehicle_type",

            # ------------------------------------------------
            # VEHICLE DETAILS
            # ------------------------------------------------
            "date_of_manufacture",
            "date_of_registration",
            "capacity",
            "fuel_type",
            "color",

            # ------------------------------------------------
            # OWNERSHIP
            # ------------------------------------------------
            "ownership_type",
            "owner_name",
            "owner_phone",

            # ------------------------------------------------
            # INSURANCE SNAPSHOT
            # ------------------------------------------------
            "insurance_company",
            "insurance_number",
            "insurance_expiry_date",

            # ------------------------------------------------
            # INSPECTION
            # ------------------------------------------------
            "inspection_certificate_number",
            "inspection_expiry_date",

            # ------------------------------------------------
            # SPEED GOVERNOR
            # ------------------------------------------------
            "speed_governor_present",
            "speed_governor_company",
            "speed_governor_expiry_date",

            # ------------------------------------------------
            # ROAD SERVICE LICENCE
            # ------------------------------------------------
            "road_service_licence_number",
            "road_service_licence_expiry_date",

            # ------------------------------------------------
            # LOGBOOK
            # ------------------------------------------------
            "logbook_number",
            "logbook_expiry_date",

            # ------------------------------------------------
            # SERVICE
            # ------------------------------------------------
            "date_of_service",
            "date_of_next_service",

            # ------------------------------------------------
            # STATUS
            # ------------------------------------------------
            "status",

            # ------------------------------------------------
            # NOTES
            # ------------------------------------------------
            "notes",

            # ------------------------------------------------
            # SYSTEM
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "vehicle_id",
            "created_at",
            "updated_at",
        ]


# ============================================================
# VEHICLE ASSIGNMENT SERIALIZER
# ============================================================

class VehicleAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for assigning drivers to vehicles.

    Driver assignment history is preserved through this model.
    """

    driver_name = serializers.CharField(
        source="driver.staff.full_name",
        read_only=True,
    )

    driver_staff_id = serializers.CharField(
        source="driver.staff.staff_id",
        read_only=True,
    )

    vehicle_registration = serializers.CharField(
        source="vehicle.registration_number",
        read_only=True,
    )

    vehicle_id = serializers.CharField(
        source="vehicle.vehicle_id",
        read_only=True,
    )

    class Meta:
        model = VehicleAssignment

        fields = [
            "id",

            # ------------------------------------------------
            # VEHICLE
            # ------------------------------------------------
            "vehicle",
            "vehicle_id",
            "vehicle_registration",

            # ------------------------------------------------
            # DRIVER
            # ------------------------------------------------
            "driver",
            "driver_name",
            "driver_staff_id",

            # ------------------------------------------------
            # ASSIGNMENT
            # ------------------------------------------------
            "start_date",
            "end_date",
            "status",
            "is_primary",
            "notes",

            # ------------------------------------------------
            # SYSTEM
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "vehicle_id",
            "vehicle_registration",
            "driver_name",
            "driver_staff_id",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")

        if (
            start_date
            and end_date
            and end_date < start_date
        ):
            raise serializers.ValidationError({
                "end_date": (
                    "End date cannot be earlier "
                    "than the start date."
                )
            })

        return attrs


# ============================================================
# DRIVER WEEKLY REPORT SERIALIZER
# ============================================================


class DriverWeeklyReportSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for weekly driver reports.

    The report records:
    - Driver
    - Vehicle
    - Reporting period
    - Mileage
    - Fuel usage
    - Fueling location
    - Fuel cost per litre
    - Vehicle condition
    - Incidents
    - Maintenance requirements
    - Driver comments
    - Review information

    Total mileage is calculated automatically by the model
    and therefore remains read-only.
    """

    # --------------------------------------------------------
    # DRIVER
    # --------------------------------------------------------

    driver_name = serializers.CharField(
        source="driver.staff.full_name",
        read_only=True,
    )

    # --------------------------------------------------------
    # VEHICLE
    # --------------------------------------------------------

    vehicle_registration = serializers.CharField(
        source="vehicle.registration_number",
        read_only=True,
    )

    vehicle_id = serializers.CharField(
        source="vehicle.vehicle_id",
        read_only=True,
    )

    # --------------------------------------------------------
    # REVIEW
    # --------------------------------------------------------

    reviewed_by_name = serializers.CharField(
        source="reviewed_by.get_full_name",
        read_only=True,
        allow_null=True,
    )

    # --------------------------------------------------------
    # META
    # --------------------------------------------------------

    class Meta:
        model = DriverWeeklyReport

        fields = [
            "id",

            # ------------------------------------------------
            # DRIVER
            # ------------------------------------------------

            "driver",
            "driver_name",

            # ------------------------------------------------
            # VEHICLE
            # ------------------------------------------------

            "vehicle",
            "vehicle_id",
            "vehicle_registration",

            # ------------------------------------------------
            # REPORT PERIOD
            # ------------------------------------------------

            "week_start",
            "week_end",

            # ------------------------------------------------
            # MILEAGE
            # ------------------------------------------------

            "starting_mileage",
            "ending_mileage",
            "total_mileage",

            # ------------------------------------------------
            # FUEL
            # ------------------------------------------------

            "fuel_used_quantity",
            "fueling_location",
            "fuel_cost_per_liter",

            # ------------------------------------------------
            # VEHICLE CONDITION
            # ------------------------------------------------

            "vehicle_condition",

            # ------------------------------------------------
            # INCIDENTS
            # ------------------------------------------------

            "incidents",

            # ------------------------------------------------
            # MAINTENANCE
            # ------------------------------------------------

            "maintenance_required",
            "maintenance_notes",

            # ------------------------------------------------
            # COMMENTS
            # ------------------------------------------------

            "comments",

            # ------------------------------------------------
            # SUBMISSION
            # ------------------------------------------------

            "submitted_at",

            # ------------------------------------------------
            # REVIEW
            # ------------------------------------------------

            "reviewed",
            "reviewed_at",
            "reviewed_by",
            "reviewed_by_name",
            "review_comments",
        ]

        read_only_fields = [
            "id",

            "driver_name",

            "vehicle_id",
            "vehicle_registration",

            "total_mileage",

            "submitted_at",

            "reviewed_at",
            "reviewed_by_name",
        ]

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    def validate(self, attrs):
        """
        Perform serializer-level validation.

        Model.clean() performs the final validation as well.
        """

        # ----------------------------------------------------
        # REPORT PERIOD
        # ----------------------------------------------------

        week_start = attrs.get(
            "week_start"
        )

        week_end = attrs.get(
            "week_end"
        )

        if (
            week_start
            and week_end
            and week_end < week_start
        ):
            raise serializers.ValidationError({
                "week_end": (
                    "Week end cannot be earlier "
                    "than week start."
                )
            })

        # ----------------------------------------------------
        # MILEAGE
        # ----------------------------------------------------

        starting_mileage = attrs.get(
            "starting_mileage"
        )

        ending_mileage = attrs.get(
            "ending_mileage"
        )

        if (
            starting_mileage is not None
            and starting_mileage < 0
        ):
            raise serializers.ValidationError({
                "starting_mileage": (
                    "Starting mileage cannot be negative."
                )
            })

        if (
            ending_mileage is not None
            and ending_mileage < 0
        ):
            raise serializers.ValidationError({
                "ending_mileage": (
                    "Ending mileage cannot be negative."
                )
            })

        if (
            starting_mileage is not None
            and ending_mileage is not None
            and ending_mileage < starting_mileage
        ):
            raise serializers.ValidationError({
                "ending_mileage": (
                    "Ending mileage cannot be "
                    "less than starting mileage."
                )
            })

        # ----------------------------------------------------
        # FUEL QUANTITY
        # ----------------------------------------------------

        fuel_quantity = attrs.get(
            "fuel_used_quantity"
        )

        if (
            fuel_quantity is not None
            and fuel_quantity < 0
        ):
            raise serializers.ValidationError({
                "fuel_used_quantity": (
                    "Fuel used quantity cannot "
                    "be negative."
                )
            })

        # ----------------------------------------------------
        # FUEL COST PER LITRE
        # ----------------------------------------------------

        fuel_cost_per_liter = attrs.get(
            "fuel_cost_per_liter"
        )

        if (
            fuel_cost_per_liter is not None
            and fuel_cost_per_liter < 0
        ):
            raise serializers.ValidationError({
                "fuel_cost_per_liter": (
                    "Fuel cost per litre cannot "
                    "be negative."
                )
            })

        # ----------------------------------------------------
        # MAINTENANCE
        # ----------------------------------------------------

        maintenance_required = attrs.get(
            "maintenance_required"
        )

        maintenance_notes = attrs.get(
            "maintenance_notes"
        )

        if (
            maintenance_required is False
            and maintenance_notes
            and maintenance_notes.strip()
        ):
            raise serializers.ValidationError({
                "maintenance_notes": (
                    "Maintenance notes should only "
                    "be provided when maintenance "
                    "is required."
                )
            })

        return attrs


# ============================================================
# VEHICLE MAINTENANCE SERIALIZER
# ============================================================

class VehicleMaintenanceSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for vehicle maintenance records.

    Every maintenance record can generate a Receipt through
    the service layer.

    The receipt itself is therefore read-only here.
    """

    vehicle_registration = serializers.CharField(
        source="vehicle.registration_number",
        read_only=True,
    )

    vehicle_id = serializers.CharField(
        source="vehicle.vehicle_id",
        read_only=True,
    )

    recorded_by_name = serializers.CharField(
        source="recorded_by.get_full_name",
        read_only=True,
    )

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    subdepartment_name = serializers.CharField(
        source="subdepartment.name",
        read_only=True,
        allow_null=True,
    )

    receipt_id = serializers.CharField(
        source="receipt.receipt_id",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = VehicleMaintenance

        fields = [
            "id",

            # ------------------------------------------------
            # VEHICLE
            # ------------------------------------------------
            "vehicle",
            "vehicle_id",
            "vehicle_registration",

            # ------------------------------------------------
            # MAINTENANCE
            # ------------------------------------------------
            "maintenance_date",
            "maintenance_type",
            "description",
            "mileage",
            "service_provider",
            "technician",
            "cost",
            "next_service_date",
            "next_service_mileage",
            "invoice_number",
            "document",

            # ------------------------------------------------
            # FINANCIAL
            # ------------------------------------------------
            "department",
            "department_name",
            "subdepartment",
            "subdepartment_name",
            "payment_method",
            "payment_reference",

            # ------------------------------------------------
            # RECORDING
            # ------------------------------------------------
            "recorded_by",
            "recorded_by_name",

            # ------------------------------------------------
            # RECEIPT
            # ------------------------------------------------
            "receipt",
            "receipt_id",

            # ------------------------------------------------
            # NOTES
            # ------------------------------------------------
            "notes",

            # ------------------------------------------------
            # SYSTEM
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "vehicle_id",
            "vehicle_registration",
            "recorded_by",
            "recorded_by_name",
            "receipt",
            "receipt_id",
            "created_at",
            "updated_at",
        ]

    def validate_cost(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Maintenance cost cannot be negative."
            )

        return value

    def validate(self, attrs):
        department = attrs.get("department")
        subdepartment = attrs.get("subdepartment")

        if (
            subdepartment
            and department
            and subdepartment.department_id
            != department.id
        ):
            raise serializers.ValidationError({
                "subdepartment": (
                    "The selected subdepartment must "
                    "belong to the selected department."
                )
            })

        return attrs


# ============================================================
# VEHICLE INSURANCE SERIALIZER
# ============================================================

class VehicleInsuranceSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for historical vehicle insurance records.

    Each insurance record represents a policy period.

    Creating an insurance record through the service layer
    automatically creates the corresponding Receipt.
    """

    vehicle_registration = serializers.CharField(
        source="vehicle.registration_number",
        read_only=True,
    )

    vehicle_id = serializers.CharField(
        source="vehicle.vehicle_id",
        read_only=True,
    )

    recorded_by_name = serializers.CharField(
        source="recorded_by.get_full_name",
        read_only=True,
    )

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    subdepartment_name = serializers.CharField(
        source="subdepartment.name",
        read_only=True,
        allow_null=True,
    )

    receipt_id = serializers.CharField(
        source="receipt.receipt_id",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = VehicleInsurance

        fields = [
            "id",

            # ------------------------------------------------
            # VEHICLE
            # ------------------------------------------------
            "vehicle",
            "vehicle_id",
            "vehicle_registration",

            # ------------------------------------------------
            # INSURANCE
            # ------------------------------------------------
            "insurance_company",
            "policy_number",
            "start_date",
            "expiry_date",
            "premium",
            "policy_type",
            "document",

            # ------------------------------------------------
            # FINANCIAL
            # ------------------------------------------------
            "department",
            "department_name",
            "subdepartment",
            "subdepartment_name",
            "payment_method",
            "payment_reference",

            # ------------------------------------------------
            # RECORDING
            # ------------------------------------------------
            "recorded_by",
            "recorded_by_name",

            # ------------------------------------------------
            # RECEIPT
            # ------------------------------------------------
            "receipt",
            "receipt_id",

            # ------------------------------------------------
            # NOTES
            # ------------------------------------------------
            "notes",

            # ------------------------------------------------
            # SYSTEM
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "vehicle_id",
            "vehicle_registration",
            "recorded_by",
            "recorded_by_name",
            "receipt",
            "receipt_id",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        expiry_date = attrs.get("expiry_date")

        if (
            start_date
            and expiry_date
            and expiry_date < start_date
        ):
            raise serializers.ValidationError({
                "expiry_date": (
                    "Insurance expiry date cannot "
                    "be earlier than the start date."
                )
            })

        premium = attrs.get("premium")

        if premium is not None and premium < 0:
            raise serializers.ValidationError({
                "premium": (
                    "Insurance premium cannot "
                    "be negative."
                )
            })

        department = attrs.get("department")
        subdepartment = attrs.get("subdepartment")

        if (
            subdepartment
            and department
            and subdepartment.department_id
            != department.id
        ):
            raise serializers.ValidationError({
                "subdepartment": (
                    "The selected subdepartment must "
                    "belong to the selected department."
                )
            })

        return attrs


# ============================================================
# VEHICLE FUELING SERIALIZER
# ============================================================

class VehicleFuelingSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for vehicle fueling records.

    Fueling creates a Receipt through the service layer.

    total_cost is calculated from:
        quantity × unit_price

    and is therefore read-only.
    """

    vehicle_registration = serializers.CharField(
        source="vehicle.registration_number",
        read_only=True,
    )

    vehicle_id = serializers.CharField(
        source="vehicle.vehicle_id",
        read_only=True,
    )

    driver_name = serializers.CharField(
        source="driver.staff.full_name",
        read_only=True,
        allow_null=True,
    )

    recorded_by_name = serializers.CharField(
        source="recorded_by.get_full_name",
        read_only=True,
    )

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    subdepartment_name = serializers.CharField(
        source="subdepartment.name",
        read_only=True,
        allow_null=True,
    )

    receipt_id = serializers.CharField(
        source="receipt.receipt_id",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = VehicleFueling

        fields = [
            "id",

            # ------------------------------------------------
            # VEHICLE
            # ------------------------------------------------
            "vehicle",
            "vehicle_id",
            "vehicle_registration",

            # ------------------------------------------------
            # DRIVER
            # ------------------------------------------------
            "driver",
            "driver_name",

            # ------------------------------------------------
            # FUELING
            # ------------------------------------------------
            "date",
            "mileage",
            "fuel_type",
            "quantity",
            "unit_price",
            "total_cost",
            "fuel_station",
            "receipt_number",

            # ------------------------------------------------
            # FINANCIAL
            # ------------------------------------------------
            "department",
            "department_name",
            "subdepartment",
            "subdepartment_name",
            "payment_method",
            "payment_reference",

            # ------------------------------------------------
            # RECORDING
            # ------------------------------------------------
            "recorded_by",
            "recorded_by_name",

            # ------------------------------------------------
            # RECEIPT
            # ------------------------------------------------
            "receipt",
            "receipt_id",

            # ------------------------------------------------
            # NOTES
            # ------------------------------------------------
            "notes",

            # ------------------------------------------------
            # SYSTEM
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "vehicle_id",
            "vehicle_registration",
            "driver_name",
            "total_cost",
            "recorded_by",
            "recorded_by_name",
            "receipt",
            "receipt_id",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        quantity = attrs.get("quantity")
        unit_price = attrs.get("unit_price")

        if quantity is not None and quantity <= 0:
            raise serializers.ValidationError({
                "quantity": (
                    "Fuel quantity must be greater than zero."
                )
            })

        if unit_price is not None and unit_price < 0:
            raise serializers.ValidationError({
                "unit_price": (
                    "Fuel unit price cannot be negative."
                )
            })

        department = attrs.get("department")
        subdepartment = attrs.get("subdepartment")

        if (
            subdepartment
            and department
            and subdepartment.department_id
            != department.id
        ):
            raise serializers.ValidationError({
                "subdepartment": (
                    "The selected subdepartment must "
                    "belong to the selected department."
                )
            })

        return attrs


# ============================================================
# TRANSPORT STAGE SERIALIZER
# ============================================================

class TransportStageSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for individual route stages.

    A stage belongs to exactly one TransportRoute.
    """

    route_name = serializers.CharField(
        source="route.name",
        read_only=True,
    )

    class Meta:
        model = TransportStage

        fields = [
            "id",

            # ------------------------------------------------
            # ROUTE
            # ------------------------------------------------
            "route",
            "route_name",

            # ------------------------------------------------
            # STAGE
            # ------------------------------------------------
            "name",
            "code",
            "sequence",
            "location_description",
            "landmark",

            # ------------------------------------------------
            # TIMES
            # ------------------------------------------------
            "pickup_time",
            "dropoff_time",

            # ------------------------------------------------
            # STATUS
            # ------------------------------------------------
            "status",

            # ------------------------------------------------
            # NOTES
            # ------------------------------------------------
            "notes",

            # ------------------------------------------------
            # SYSTEM
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "route_name",
            "created_at",
            "updated_at",
        ]

    def validate_sequence(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Stage sequence must start at 1 or higher."
            )

        return value

    def validate(self, attrs):
        pickup_time = attrs.get("pickup_time")
        dropoff_time = attrs.get("dropoff_time")

        if (
            pickup_time
            and dropoff_time
            and dropoff_time < pickup_time
        ):
            raise serializers.ValidationError({
                "dropoff_time": (
                    "Drop-off time cannot be earlier "
                    "than pickup time."
                )
            })

        return attrs


# ============================================================
# TRANSPORT ROUTE SERIALIZER
# ============================================================

class TransportRouteSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for transport routes.

    The route serializer exposes:
    - Route information
    - Number of stages
    - Existing stages

    Stages are read-only here.

    Stage creation and modification should continue to happen
    through the TransportStage endpoint.
    """

    # --------------------------------------------------------
    # STAGE COUNT
    # --------------------------------------------------------

    stage_count = serializers.SerializerMethodField()

    # --------------------------------------------------------
    # NESTED STAGES
    # --------------------------------------------------------

    stages = TransportStageSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = TransportRoute

        fields = [
            "id",

            # ------------------------------------------------
            # ROUTE IDENTITY
            # ------------------------------------------------
            "route_id",
            "name",
            "code",

            # ------------------------------------------------
            # ROUTE INFORMATION
            # ------------------------------------------------
            "description",
            "direction",
            "distance_km",
            "estimated_duration_minutes",

            # ------------------------------------------------
            # STATUS
            # ------------------------------------------------
            "status",

            # ------------------------------------------------
            # NOTES
            # ------------------------------------------------
            "notes",

            # ------------------------------------------------
            # STAGES
            # ------------------------------------------------
            "stage_count",
            "stages",

            # ------------------------------------------------
            # SYSTEM
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "route_id",
            "stage_count",
            "stages",
            "created_at",
            "updated_at",
        ]

    def get_stage_count(self, obj):
        """
        Return the number of stages belonging to this route.

        TransportStage.route uses related_name="stages",
        therefore:

            obj.stages.count()

        counts all stages belonging to this route.
        """

        return obj.stages.count()

    def validate_distance_km(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Route distance cannot be negative."
            )

        return value

    def validate_estimated_duration_minutes(
        self,
        value,
    ):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Estimated duration cannot be negative."
            )

        return value


# ============================================================
# TRANSPORT ASSIGNMENT SERIALIZER
# ============================================================

class TransportAssignmentSerializer(
    serializers.ModelSerializer
):
    """
    Serializer connecting a student to transport services.

    Fees are deliberately NOT stored here.

    The Fees application can later determine charges from
    this assignment.
    """

    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
    )

    admission_number = serializers.CharField(
        source="student.admission_number",
        read_only=True,
    )

    route_name = serializers.CharField(
        source="route.name",
        read_only=True,
    )

    stage_name = serializers.CharField(
        source="stage.name",
        read_only=True,
        allow_null=True,
    )

    vehicle_registration = serializers.CharField(
        source="vehicle.registration_number",
        read_only=True,
        allow_null=True,
    )

    vehicle_id = serializers.CharField(
        source="vehicle.vehicle_id",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = TransportAssignment

        fields = [
            "id",

            # ------------------------------------------------
            # STUDENT
            # ------------------------------------------------
            "student",
            "student_name",
            "admission_number",

            # ------------------------------------------------
            # ENROLLMENT
            # ------------------------------------------------
            "enrollment",

            # ------------------------------------------------
            # ROUTE
            # ------------------------------------------------
            "route",
            "route_name",

            # ------------------------------------------------
            # STAGE
            # ------------------------------------------------
            "stage",
            "stage_name",

            # ------------------------------------------------
            # VEHICLE
            # ------------------------------------------------
            "vehicle",
            "vehicle_id",
            "vehicle_registration",

            # ------------------------------------------------
            # DATES
            # ------------------------------------------------
            "start_date",
            "end_date",

            # ------------------------------------------------
            # STATUS
            # ------------------------------------------------
            "status",

            # ------------------------------------------------
            # SERVICE
            # ------------------------------------------------
            "morning_service",
            "evening_service",

            # ------------------------------------------------
            # NOTES
            # ------------------------------------------------
            "notes",

            # ------------------------------------------------
            # SYSTEM
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "student_name",
            "admission_number",
            "route_name",
            "stage_name",
            "vehicle_id",
            "vehicle_registration",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")

        if (
            start_date
            and end_date
            and end_date < start_date
        ):
            raise serializers.ValidationError({
                "end_date": (
                    "End date cannot be earlier "
                    "than the start date."
                )
            })

        route = attrs.get("route")
        stage = attrs.get("stage")

        if (
            route
            and stage
            and stage.route_id != route.id
        ):
            raise serializers.ValidationError({
                "stage": (
                    "The selected stage must belong "
                    "to the selected route."
                )
            })

        return attrs

