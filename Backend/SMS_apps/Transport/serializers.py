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

class DriverProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for driver-specific information.

    General identity/contact information belongs to Staff.

    DriverProfile contains only information specific to
    operating a vehicle.
    """

    staff_name = serializers.CharField(
        source="staff.full_name",
        read_only=True,
    )

    staff_id = serializers.CharField(
        source="staff.staff_id",
        read_only=True,
    )

    verified_by_name = serializers.CharField(
        source="verified_by.get_full_name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = DriverProfile

        fields = [
            "id",

            # ------------------------------------------------
            # STAFF
            # ------------------------------------------------
            "staff",
            "staff_name",
            "staff_id",

            # ------------------------------------------------
            # LICENCE
            # ------------------------------------------------
            "license_number",
            "license_class",
            "license_issue_date",
            "license_expiry_date",

            # ------------------------------------------------
            # PSV
            # ------------------------------------------------
            "psv_license_number",
            "psv_expiry_date",

            # ------------------------------------------------
            # DRIVER IDENTIFICATION
            # ------------------------------------------------
            "driver_badge_number",

            # ------------------------------------------------
            # EXPERIENCE
            # ------------------------------------------------
            "years_of_experience",
            "previous_driving_experience",

            # ------------------------------------------------
            # MEDICAL
            # ------------------------------------------------
            "medical_certificate_expiry",

            # ------------------------------------------------
            # VERIFICATION
            # ------------------------------------------------
            "is_verified",
            "verified_at",
            "verified_by",
            "verified_by_name",

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
            "staff_name",
            "staff_id",
            "verified_at",
            "verified_by_name",
            "created_at",
            "updated_at",
        ]

    def validate_years_of_experience(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Years of experience cannot be negative."
            )

        return value


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
        start_date = attrs.get(
            "start_date"
        )

        end_date = attrs.get(
            "end_date"
        )

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

    The driver submits:
    - Vehicle
    - Week
    - Starting mileage
    - Ending mileage
    - Comments

    Total mileage is calculated by the model/service and
    therefore remains read-only.
    """

    driver_name = serializers.CharField(
        source="driver.staff.full_name",
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

    reviewed_by_name = serializers.CharField(
        source="reviewed_by.get_full_name",
        read_only=True,
        allow_null=True,
    )

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
            # WEEK
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

    def validate(self, attrs):
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

        starting_mileage = attrs.get(
            "starting_mileage"
        )

        ending_mileage = attrs.get(
            "ending_mileage"
        )

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
        department = attrs.get(
            "department"
        )

        subdepartment = attrs.get(
            "subdepartment"
        )

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
        start_date = attrs.get(
            "start_date"
        )

        expiry_date = attrs.get(
            "expiry_date"
        )

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

        premium = attrs.get(
            "premium"
        )

        if premium is not None and premium < 0:
            raise serializers.ValidationError({
                "premium": (
                    "Insurance premium cannot "
                    "be negative."
                )
            })

        department = attrs.get(
            "department"
        )

        subdepartment = attrs.get(
            "subdepartment"
        )

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
        quantity = attrs.get(
            "quantity"
        )

        unit_price = attrs.get(
            "unit_price"
        )

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

        department = attrs.get(
            "department"
        )

        subdepartment = attrs.get(
            "subdepartment"
        )

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
# TRANSPORT ROUTE SERIALIZER
# ============================================================

class TransportRouteSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for transport routes.
    """

    class Meta:
        model = TransportRoute

        fields = [
            "id",
            "route_id",
            "name",
            "code",
            "description",
            "direction",
            "distance_km",
            "estimated_duration_minutes",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "route_id",
            "created_at",
            "updated_at",
        ]

    def validate_distance_km(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Route distance cannot be negative."
            )

        return value

    def validate_estimated_duration_minutes(
        self,
        value
    ):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Estimated duration cannot be negative."
            )

        return value


# ============================================================
# TRANSPORT STAGE SERIALIZER
# ============================================================

class TransportStageSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for individual route stages.
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
        start_date = attrs.get(
            "start_date"
        )

        end_date = attrs.get(
            "end_date"
        )

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

        route = attrs.get(
            "route"
        )

        stage = attrs.get(
            "stage"
        )

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

