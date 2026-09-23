from django.contrib import admin

from .models import (
    Staff,
    StaffReferee,
    StaffRole,
    StaffRoleAssignment,
)


# ============================================================
# STAFF ADMIN
# ============================================================


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    """
    Django Admin configuration for Staff.
    """

    # --------------------------------------------------------
    # LIST DISPLAY
    # --------------------------------------------------------

    list_display = (
        "staff_id",
        "employee_number",
        "full_name",
        "phone",
        "email",
        "employment_type",
        "status",
        "date_joined",
        "date_left",
    )

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    search_fields = (
        "staff_id",
        "employee_number",
        "first_name",
        "middle_name",
        "last_name",
        "national_id",
        "phone",
        "alternative_phone",
        "email",
    )

    # --------------------------------------------------------
    # FILTERS
    # --------------------------------------------------------

    list_filter = (
        "status",
        "employment_type",
        "gender",
        "nationality",
        "religion",
    )

    # --------------------------------------------------------
    # DATE FILTER
    # --------------------------------------------------------

    date_hierarchy = "date_joined"

    # --------------------------------------------------------
    # DEFAULT ORDER
    # --------------------------------------------------------

    ordering = (
        "last_name",
        "first_name",
    )

    # --------------------------------------------------------
    # READ-ONLY FIELDS
    # --------------------------------------------------------

    readonly_fields = (
        "staff_id",
        "created_at",
        "updated_at",
    )

    # --------------------------------------------------------
    # FORM SECTIONS
    # --------------------------------------------------------

    fieldsets = (
        (
            "Staff Identity",
            {
                "fields": (
                    "staff_id",
                    "employee_number",
                )
            },
        ),

        (
            "Personal Information",
            {
                "fields": (
                    "first_name",
                    "middle_name",
                    "last_name",
                    "date_of_birth",
                    "gender",
                    "nationality",
                    "national_id",
                    "religion",
                    "photo",
                )
            },
        ),

        (
            "Contact Information",
            {
                "fields": (
                    "phone",
                    "alternative_phone",
                    "email",
                    "address",
                    "county",
                    "subcounty",
                )
            },
        ),

        (
            "Employment",
            {
                "fields": (
                    "date_joined",
                    "date_left",
                    "employment_type",
                    "status",
                )
            },
        ),

        (
            "Previous Employment",
            {
                "fields": (
                    "previous_employment",
                )
            },
        ),

        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# STAFF REFEREE ADMIN
# ============================================================


@admin.register(StaffReferee)
class StaffRefereeAdmin(admin.ModelAdmin):
    """
    Django Admin configuration for StaffReferee.
    """

    list_display = (
        "name",
        "staff",
        "relationship",
        "phone",
        "email",
        "occupation",
        "company",
    )

    search_fields = (
        "name",
        "relationship",
        "phone",
        "alternative_phone",
        "email",
        "occupation",
        "company",
        "staff__staff_id",
        "staff__employee_number",
        "staff__first_name",
        "staff__middle_name",
        "staff__last_name",
    )

    list_filter = (
        "relationship",
    )

    ordering = (
        "name",
    )

    autocomplete_fields = (
        "staff",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Staff Member",
            {
                "fields": (
                    "staff",
                )
            },
        ),

        (
            "Referee Information",
            {
                "fields": (
                    "name",
                    "relationship",
                    "phone",
                    "alternative_phone",
                    "email",
                    "occupation",
                    "company",
                    "address",
                    "notes",
                )
            },
        ),

        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# STAFF ROLE ADMIN
# ============================================================


@admin.register(StaffRole)
class StaffRoleAdmin(admin.ModelAdmin):
    """
    Django Admin configuration for StaffRole.
    """

    list_display = (
        "name",
        "code",
        "is_active",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "name",
        "code",
        "description",
    )

    list_filter = (
        "is_active",
    )

    ordering = (
        "name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Role Information",
            {
                "fields": (
                    "name",
                    "code",
                    "description",
                    "is_active",
                )
            },
        ),

        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# STAFF ROLE ASSIGNMENT ADMIN
# ============================================================


@admin.register(StaffRoleAssignment)
class StaffRoleAssignmentAdmin(admin.ModelAdmin):
    """
    Django Admin configuration for StaffRoleAssignment.
    """

    list_display = (
        "staff",
        "role",
        "employment_type",
        "start_date",
        "end_date",
        "is_primary",
        "status",
    )

    search_fields = (
        "staff__staff_id",
        "staff__employee_number",
        "staff__first_name",
        "staff__middle_name",
        "staff__last_name",
        "role__name",
        "role__code",
    )

    list_filter = (
        "status",
        "is_primary",
        "employment_type",
        "role",
    )

    ordering = (
        "-start_date",
        "-id",
    )

    autocomplete_fields = (
        "staff",
        "role",
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
                    "staff",
                    "role",
                )
            },
        ),

        (
            "Assignment Details",
            {
                "fields": (
                    "employment_type",
                    "start_date",
                    "end_date",
                    "is_primary",
                    "status",
                    "notes",
                )
            },
        ),

        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

