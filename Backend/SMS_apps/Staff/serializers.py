from rest_framework import serializers

from .models import (
    Staff,
    StaffReferee,
    StaffRole,
    StaffRoleAssignment,
)


# ============================================================
# STAFF SERIALIZER
# ============================================================


class StaffSerializer(serializers.ModelSerializer):
    """
    Serializer for Staff.

    Handles:
    - Staff identity
    - Personal information
    - Contact information
    - Employment information
    - Previous employment
    - System information

    staff_id is read-only because it is generated
    automatically by the Staff model.
    """

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Staff

        fields = [
            # ------------------------------------------------
            # SYSTEM / IDENTITY
            # ------------------------------------------------
            "id",
            "staff_id",
            "employee_number",

            # ------------------------------------------------
            # PERSONAL INFORMATION
            # ------------------------------------------------
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "date_of_birth",
            "gender",
            "nationality",
            "national_id",
            "religion",
            "photo",

            # ------------------------------------------------
            # CONTACT INFORMATION
            # ------------------------------------------------
            "phone",
            "alternative_phone",
            "email",
            "address",
            "county",
            "subcounty",

            # ------------------------------------------------
            # EMPLOYMENT
            # ------------------------------------------------
            "date_joined",
            "date_left",
            "employment_type",
            "status",

            # ------------------------------------------------
            # PREVIOUS EMPLOYMENT
            # ------------------------------------------------
            "previous_employment",

            # ------------------------------------------------
            # SYSTEM DATES
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "staff_id",
            "full_name",
            "created_at",
            "updated_at",
        ]

    def validate_employee_number(
        self,
        value
    ):
        """
        Normalize employee numbers before saving.
        """

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Employee number is required."
            )

        return value

    def validate_phone(
        self,
        value
    ):
        """
        Basic phone-number normalization.
        """

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Phone number is required."
            )

        return value

    def validate_email(
        self,
        value
    ):
        """
        Email is optional.

        Empty email values are converted to an empty string.
        """

        return value.strip()


# ============================================================
# STAFF LIST SERIALIZER
# ============================================================


class StaffListSerializer(
    serializers.ModelSerializer
):
    """
    Lightweight serializer for staff lists.

    Useful for:
    - Staff management tables
    - Dropdowns
    - Driver selection
    - Teacher selection
    - Search results
    """

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Staff

        fields = [
            "id",
            "staff_id",
            "employee_number",
            "full_name",
            "first_name",
            "middle_name",
            "last_name",
            "phone",
            "email",
            "employment_type",
            "status",
            "photo",
        ]

        read_only_fields = [
            "id",
            "staff_id",
            "full_name",
        ]


# ============================================================
# STAFF REFEREE SERIALIZER
# ============================================================


class StaffRefereeSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for staff referees.

    The staff relationship is normally supplied by the
    parent endpoint/service and is therefore read-only here
    when nested under a staff member.
    """

    staff_name = serializers.SerializerMethodField()

    class Meta:
        model = StaffReferee

        fields = [
            # ------------------------------------------------
            # SYSTEM
            # ------------------------------------------------
            "id",

            # ------------------------------------------------
            # STAFF
            # ------------------------------------------------
            "staff",
            "staff_name",

            # ------------------------------------------------
            # REFEREE INFORMATION
            # ------------------------------------------------
            "name",
            "relationship",
            "phone",
            "alternative_phone",
            "email",
            "occupation",
            "company",
            "address",
            "notes",

            # ------------------------------------------------
            # SYSTEM DATES
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "staff_name",
            "created_at",
            "updated_at",
        ]

    def get_staff_name(
        self,
        obj
    ):
        if not obj.staff:
            return None

        return obj.staff.full_name

    def validate_name(
        self,
        value
    ):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Referee name is required."
            )

        return value

    def validate_phone(
        self,
        value
    ):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Referee phone number is required."
            )

        return value


# ============================================================
# STAFF ROLE SERIALIZER
# ============================================================


class StaffRoleSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for staff roles.

    Roles are database records and can therefore be created
    and managed by the school.
    """

    class Meta:
        model = StaffRole

        fields = [
            "id",
            "name",
            "code",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_name(
        self,
        value
    ):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Role name is required."
            )

        return value

    def validate_code(
        self,
        value
    ):
        """
        Normalize role codes.

        Example:

        driver
        teacher
        cook
        """

        value = value.strip().lower()

        if not value:
            raise serializers.ValidationError(
                "Role code is required."
            )

        return value


# ============================================================
# STAFF ROLE ASSIGNMENT SERIALIZER
# ============================================================


class StaffRoleAssignmentSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for assigning roles to staff members.

    Example:

        Staff
          ↓
        Driver Role
          ↓
        StaffRoleAssignment

    Multiple roles can be assigned to the same staff member.

    Only one active primary role is allowed. That rule is
    enforced by the service layer.
    """

    staff_name = serializers.SerializerMethodField()
    role_name = serializers.SerializerMethodField()

    class Meta:
        model = StaffRoleAssignment

        fields = [
            # ------------------------------------------------
            # SYSTEM
            # ------------------------------------------------
            "id",

            # ------------------------------------------------
            # RELATIONSHIPS
            # ------------------------------------------------
            "staff",
            "staff_name",
            "role",
            "role_name",

            # ------------------------------------------------
            # ASSIGNMENT
            # ------------------------------------------------
            "employment_type",
            "start_date",
            "end_date",
            "is_primary",
            "status",
            "notes",

            # ------------------------------------------------
            # SYSTEM DATES
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "staff_name",
            "role_name",
            "created_at",
            "updated_at",
        ]

    def get_staff_name(
        self,
        obj
    ):
        if not obj.staff:
            return None

        return obj.staff.full_name

    def get_role_name(
        self,
        obj
    ):
        if not obj.role:
            return None

        return obj.role.name

    def validate(
        self,
        attrs
    ):
        """
        Serializer-level validation.

        The deeper business rules remain in services.py.
        """

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
            raise serializers.ValidationError(
                {
                    "end_date": (
                        "The role end date cannot be "
                        "earlier than the role start date."
                    )
                }
            )

        return attrs


# ============================================================
# STAFF DETAIL SERIALIZER
# ============================================================


class StaffDetailSerializer(
    serializers.ModelSerializer
):
    """
    Detailed Staff serializer.

    Includes:
    - Staff information
    - Referees
    - Role assignments

    This serializer is useful for the Staff Details page.
    """

    full_name = serializers.ReadOnlyField()

    referees = StaffRefereeSerializer(
        many=True,
        read_only=True
    )

    role_assignments = (
        StaffRoleAssignmentSerializer(
            many=True,
            read_only=True
        )
    )

    class Meta:
        model = Staff

        fields = [
            # ------------------------------------------------
            # SYSTEM / IDENTITY
            # ------------------------------------------------
            "id",
            "staff_id",
            "employee_number",

            # ------------------------------------------------
            # PERSONAL INFORMATION
            # ------------------------------------------------
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "date_of_birth",
            "gender",
            "nationality",
            "national_id",
            "religion",
            "photo",

            # ------------------------------------------------
            # CONTACT INFORMATION
            # ------------------------------------------------
            "phone",
            "alternative_phone",
            "email",
            "address",
            "county",
            "subcounty",

            # ------------------------------------------------
            # EMPLOYMENT
            # ------------------------------------------------
            "date_joined",
            "date_left",
            "employment_type",
            "status",

            # ------------------------------------------------
            # PREVIOUS EMPLOYMENT
            # ------------------------------------------------
            "previous_employment",

            # ------------------------------------------------
            # RELATED DATA
            # ------------------------------------------------
            "referees",
            "role_assignments",

            # ------------------------------------------------
            # SYSTEM DATES
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "staff_id",
            "full_name",
            "referees",
            "role_assignments",
            "created_at",
            "updated_at",
        ]

