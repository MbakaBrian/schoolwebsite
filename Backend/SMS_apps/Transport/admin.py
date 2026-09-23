from django.contrib import admin

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
# DRIVER PROFILE
# ============================================================

@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    """
    Driver-specific information.

    General staff information remains managed by the Staff app.
    """

    list_display = (
        "staff",
        "license_number",
        "license_class",
        "license_expiry_date",
        "psv_license_number",
        "psv_expiry_date",
        "is_verified",
    )

    search_fields = (
        "staff__staff_id",
        "staff__employee_number",
        "staff__first_name",
        "staff__middle_name",
        "staff__last_name",
        "license_number",
        "psv_license_number",
        "driver_badge_number",
    )

    list_filter = (
        "is_verified",
        "license_class",
    )

    autocomplete_fields = (
        "staff",
        "verified_by",
    )

    readonly_fields = (
        "verified_at",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Staff",
            {
                "fields": (
                    "staff",
                )
            },
        ),

        (
            "Driving Licence",
            {
                "fields": (
                    "license_number",
                    "license_class",
                    "license_issue_date",
                    "license_expiry_date",
                )
            },
        ),

        (
            "PSV Licence",
            {
                "fields": (
                    "psv_license_number",
                    "psv_expiry_date",
                )
            },
        ),

        (
            "Driver Information",
            {
                "fields": (
                    "driver_badge_number",
                    "years_of_experience",
                    "previous_driving_experience",
                )
            },
        ),

        (
            "Medical",
            {
                "fields": (
                    "medical_certificate_expiry",
                )
            },
        ),

        (
            "Verification",
            {
                "fields": (
                    "is_verified",
                    "verified_at",
                    "verified_by",
                )
            },
        ),

        (
            "Notes",
            {
                "fields": (
                    "notes",
                )
            },
        ),

        (
            "System",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# DRIVER WEEKLY REPORT
# ============================================================

@admin.register(DriverWeeklyReport)
class DriverWeeklyReportAdmin(admin.ModelAdmin):

    list_display = (
        "driver",
        "vehicle",
        "week_start",
        "week_end",
        "starting_mileage",
        "ending_mileage",
        "total_mileage",
        "reviewed",
        "submitted_at",
    )

    search_fields = (
        "driver__staff__staff_id",
        "driver__staff__employee_number",
        "driver__staff__first_name",
        "driver__staff__last_name",
        "vehicle__vehicle_id",
        "vehicle__registration_number",
    )

    list_filter = (
        "reviewed",
        "week_start",
        "week_end",
    )

    date_hierarchy = "week_start"

    autocomplete_fields = (
        "driver",
        "vehicle",
        "reviewed_by",
    )

    readonly_fields = (
        "total_mileage",
        "submitted_at",
        "reviewed_at",
    )

    fieldsets = (
        (
            "Driver & Vehicle",
            {
                "fields": (
                    "driver",
                    "vehicle",
                )
            },
        ),

        (
            "Reporting Period",
            {
                "fields": (
                    "week_start",
                    "week_end",
                )
            },
        ),

        (
            "Mileage",
            {
                "fields": (
                    "starting_mileage",
                    "ending_mileage",
                    "total_mileage",
                )
            },
        ),

        (
            "Driver Comments",
            {
                "fields": (
                    "comments",
                )
            },
        ),

        (
            "Submission",
            {
                "fields": (
                    "submitted_at",
                )
            },
        ),

        (
            "Review",
            {
                "fields": (
                    "reviewed",
                    "reviewed_at",
                    "reviewed_by",
                    "review_comments",
                )
            },
        ),
    )


# ============================================================
# VEHICLE
# ============================================================

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):

    list_display = (
        "vehicle_id",
        "registration_number",
        "make",
        "model",
        "vehicle_type",
        "fuel_type",
        "status",
        "insurance_expiry_date",
        "date_of_next_service",
    )

    search_fields = (
        "vehicle_id",
        "registration_number",
        "make",
        "model",
        "owner_name",
    )

    list_filter = (
        "status",
        "vehicle_type",
        "fuel_type",
        "ownership_type",
        "speed_governor_present",
    )

    date_hierarchy = "date_of_registration"

    readonly_fields = (
        "vehicle_id",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Vehicle Identity",
            {
                "fields": (
                    "vehicle_id",
                    "registration_number",
                    "make",
                    "model",
                    "vehicle_type",
                )
            },
        ),

        (
            "Vehicle Details",
            {
                "fields": (
                    "date_of_manufacture",
                    "date_of_registration",
                    "capacity",
                    "fuel_type",
                    "color",
                )
            },
        ),

        (
            "Ownership",
            {
                "fields": (
                    "ownership_type",
                    "owner_name",
                    "owner_phone",
                )
            },
        ),

        (
            "Insurance",
            {
                "fields": (
                    "insurance_company",
                    "insurance_number",
                    "insurance_expiry_date",
                )
            },
        ),

        (
            "Inspection",
            {
                "fields": (
                    "inspection_certificate_number",
                    "inspection_expiry_date",
                )
            },
        ),

        (
            "Speed Governor",
            {
                "fields": (
                    "speed_governor_present",
                    "speed_governor_company",
                    "speed_governor_expiry_date",
                )
            },
        ),

        (
            "Road Service Licence",
            {
                "fields": (
                    "road_service_licence_number",
                    "road_service_licence_expiry_date",
                )
            },
        ),

        (
            "Logbook",
            {
                "fields": (
                    "logbook_number",
                    "logbook_expiry_date",
                )
            },
        ),

        (
            "Service",
            {
                "fields": (
                    "date_of_service",
                    "date_of_next_service",
                )
            },
        ),

        (
            "Status",
            {
                "fields": (
                    "status",
                )
            },
        ),

        (
            "Notes",
            {
                "fields": (
                    "notes",
                )
            },
        ),

        (
            "System",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# VEHICLE ASSIGNMENT
# ============================================================

@admin.register(VehicleAssignment)
class VehicleAssignmentAdmin(admin.ModelAdmin):

    list_display = (
        "vehicle",
        "driver",
        "start_date",
        "end_date",
        "status",
        "is_primary",
    )

    search_fields = (
        "vehicle__vehicle_id",
        "vehicle__registration_number",
        "driver__staff__staff_id",
        "driver__staff__employee_number",
        "driver__staff__first_name",
        "driver__staff__last_name",
    )

    list_filter = (
        "status",
        "is_primary",
        "start_date",
        "end_date",
    )

    autocomplete_fields = (
        "vehicle",
        "driver",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Assignment",
            {
                "fields": (
                    "vehicle",
                    "driver",
                )
            },
        ),

        (
            "Assignment Period",
            {
                "fields": (
                    "start_date",
                    "end_date",
                )
            },
        ),

        (
            "Status",
            {
                "fields": (
                    "status",
                    "is_primary",
                )
            },
        ),

        (
            "Notes",
            {
                "fields": (
                    "notes",
                )
            },
        ),

        (
            "System",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# VEHICLE MAINTENANCE
# ============================================================

@admin.register(VehicleMaintenance)
class VehicleMaintenanceAdmin(admin.ModelAdmin):

    list_display = (
        "vehicle",
        "maintenance_date",
        "maintenance_type",
        "service_provider",
        "mileage",
        "cost",
        "department",
        "receipt_display",
    )

    search_fields = (
        "vehicle__vehicle_id",
        "vehicle__registration_number",
        "maintenance_type",
        "description",
        "service_provider",
        "technician",
        "invoice_number",
    )

    list_filter = (
        "maintenance_type",
        "department",
        "maintenance_date",
    )

    date_hierarchy = "maintenance_date"

    autocomplete_fields = (
        "vehicle",
        "department",
        "subdepartment",
        "recorded_by",
        "receipt",
    )

    readonly_fields = (
        "recorded_by",
        "receipt",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Vehicle",
            {
                "fields": (
                    "vehicle",
                )
            },
        ),

        (
            "Maintenance",
            {
                "fields": (
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
                )
            },
        ),

        (
            "Financial Classification",
            {
                "fields": (
                    "department",
                    "subdepartment",
                    "payment_method",
                    "payment_reference",
                )
            },
        ),

        (
            "Recording & Receipt",
            {
                "fields": (
                    "recorded_by",
                    "receipt",
                )
            },
        ),

        (
            "Notes",
            {
                "fields": (
                    "notes",
                )
            },
        ),

        (
            "System",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    @admin.display(
        description="Receipt"
    )
    def receipt_display(self, obj):
        if obj.receipt:
            return obj.receipt.receipt_id

        return "—"


# ============================================================
# VEHICLE INSURANCE
# ============================================================

@admin.register(VehicleInsurance)
class VehicleInsuranceAdmin(admin.ModelAdmin):

    list_display = (
        "vehicle",
        "insurance_company",
        "policy_number",
        "start_date",
        "expiry_date",
        "premium",
        "department",
        "receipt_display",
    )

    search_fields = (
        "vehicle__vehicle_id",
        "vehicle__registration_number",
        "insurance_company",
        "policy_number",
    )

    list_filter = (
        "insurance_company",
        "department",
        "start_date",
        "expiry_date",
    )

    date_hierarchy = "start_date"

    autocomplete_fields = (
        "vehicle",
        "department",
        "subdepartment",
        "recorded_by",
        "receipt",
    )

    readonly_fields = (
        "recorded_by",
        "receipt",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Vehicle",
            {
                "fields": (
                    "vehicle",
                )
            },
        ),

        (
            "Insurance Policy",
            {
                "fields": (
                    "insurance_company",
                    "policy_number",
                    "start_date",
                    "expiry_date",
                    "premium",
                    "policy_type",
                    "document",
                )
            },
        ),

        (
            "Financial Classification",
            {
                "fields": (
                    "department",
                    "subdepartment",
                    "payment_method",
                    "payment_reference",
                )
            },
        ),

        (
            "Recording & Receipt",
            {
                "fields": (
                    "recorded_by",
                    "receipt",
                )
            },
        ),

        (
            "Notes",
            {
                "fields": (
                    "notes",
                )
            },
        ),

        (
            "System",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    @admin.display(
        description="Receipt"
    )
    def receipt_display(self, obj):
        if obj.receipt:
            return obj.receipt.receipt_id

        return "—"


# ============================================================
# VEHICLE FUELING
# ============================================================

@admin.register(VehicleFueling)
class VehicleFuelingAdmin(admin.ModelAdmin):

    list_display = (
        "vehicle",
        "date",
        "mileage",
        "fuel_type",
        "quantity",
        "unit_price",
        "total_cost",
        "fuel_station",
        "department",
        "receipt_display",
    )

    search_fields = (
        "vehicle__vehicle_id",
        "vehicle__registration_number",
        "driver__staff__staff_id",
        "driver__staff__employee_number",
        "fuel_station",
        "receipt_number",
        "payment_reference",
    )

    list_filter = (
        "fuel_type",
        "department",
        "date",
    )

    date_hierarchy = "date"

    autocomplete_fields = (
        "vehicle",
        "driver",
        "department",
        "subdepartment",
        "recorded_by",
        "receipt",
    )

    readonly_fields = (
        "total_cost",
        "recorded_by",
        "receipt",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Vehicle & Driver",
            {
                "fields": (
                    "vehicle",
                    "driver",
                )
            },
        ),

        (
            "Fueling",
            {
                "fields": (
                    "date",
                    "mileage",
                    "fuel_type",
                    "quantity",
                    "unit_price",
                    "total_cost",
                    "fuel_station",
                    "receipt_number",
                )
            },
        ),

        (
            "Financial Classification",
            {
                "fields": (
                    "department",
                    "subdepartment",
                    "payment_method",
                    "payment_reference",
                )
            },
        ),

        (
            "Recording & Receipt",
            {
                "fields": (
                    "recorded_by",
                    "receipt",
                )
            },
        ),

        (
            "Notes",
            {
                "fields": (
                    "notes",
                )
            },
        ),

        (
            "System",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    @admin.display(
        description="Receipt"
    )
    def receipt_display(self, obj):
        if obj.receipt:
            return obj.receipt.receipt_id

        return "—"


# ============================================================
# TRANSPORT ROUTE
# ============================================================

@admin.register(TransportRoute)
class TransportRouteAdmin(admin.ModelAdmin):

    list_display = (
        "route_id",
        "name",
        "code",
        "direction",
        "distance_km",
        "estimated_duration_minutes",
        "status",
    )

    search_fields = (
        "route_id",
        "name",
        "code",
        "description",
    )

    list_filter = (
        "direction",
        "status",
    )

    readonly_fields = (
        "route_id",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Route Identity",
            {
                "fields": (
                    "route_id",
                    "name",
                    "code",
                )
            },
        ),

        (
            "Route Details",
            {
                "fields": (
                    "description",
                    "direction",
                    "distance_km",
                    "estimated_duration_minutes",
                )
            },
        ),

        (
            "Status",
            {
                "fields": (
                    "status",
                )
            },
        ),

        (
            "Notes",
            {
                "fields": (
                    "notes",
                )
            },
        ),

        (
            "System",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# TRANSPORT STAGE
# ============================================================

@admin.register(TransportStage)
class TransportStageAdmin(admin.ModelAdmin):

    list_display = (
        "route",
        "sequence",
        "name",
        "code",
        "pickup_time",
        "dropoff_time",
        "status",
    )

    search_fields = (
        "route__route_id",
        "route__name",
        "name",
        "code",
        "location_description",
        "landmark",
    )

    list_filter = (
        "status",
        "route",
    )

    ordering = (
        "route",
        "sequence",
    )

    autocomplete_fields = (
        "route",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Route",
            {
                "fields": (
                    "route",
                )
            },
        ),

        (
            "Stage",
            {
                "fields": (
                    "name",
                    "code",
                    "sequence",
                    "location_description",
                    "landmark",
                )
            },
        ),

        (
            "Schedule",
            {
                "fields": (
                    "pickup_time",
                    "dropoff_time",
                )
            },
        ),

        (
            "Status",
            {
                "fields": (
                    "status",
                )
            },
        ),

        (
            "Notes",
            {
                "fields": (
                    "notes",
                )
            },
        ),

        (
            "System",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# STUDENT TRANSPORT ASSIGNMENT
# ============================================================

@admin.register(TransportAssignment)
class TransportAssignmentAdmin(admin.ModelAdmin):

    list_display = (
        "student",
        "route",
        "stage",
        "vehicle",
        "start_date",
        "end_date",
        "status",
        "morning_service",
        "evening_service",
    )

    search_fields = (
        "student__student_id",
        "student__admission_number",
        "student__first_name",
        "student__middle_name",
        "student__last_name",
        "route__route_id",
        "route__name",
        "stage__name",
        "vehicle__vehicle_id",
        "vehicle__registration_number",
    )

    list_filter = (
        "status",
        "morning_service",
        "evening_service",
        "route",
        "start_date",
        "end_date",
    )

    date_hierarchy = "start_date"

    autocomplete_fields = (
        "student",
        "enrollment",
        "route",
        "stage",
        "vehicle",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Student",
            {
                "fields": (
                    "student",
                    "enrollment",
                )
            },
        ),

        (
            "Transport",
            {
                "fields": (
                    "route",
                    "stage",
                    "vehicle",
                )
            },
        ),

        (
            "Assignment Period",
            {
                "fields": (
                    "start_date",
                    "end_date",
                )
            },
        ),

        (
            "Status",
            {
                "fields": (
                    "status",
                )
            },
        ),

        (
            "Transport Service",
            {
                "fields": (
                    "morning_service",
                    "evening_service",
                )
            },
        ),

        (
            "Notes",
            {
                "fields": (
                    "notes",
                )
            },
        ),

        (
            "System",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

