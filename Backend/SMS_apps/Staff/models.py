from django.db import models
from django.core.exceptions import ValidationError

from school_backend.SMS_constants import RELIGION_CHOICES


# ============================================================
# STAFF
# ============================================================

class Staff(models.Model):
    """
    Master staff/employee record.

    This model contains information that belongs to the person
    regardless of their role at the school.

    Role-specific information is handled through:
    - StaffRole
    - StaffRoleAssignment
    - Role-specific profile models
    """

    # ========================================================
    # CHOICES
    # ========================================================

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    EMPLOYMENT_TYPE_CHOICES = [
        ("permanent", "Permanent"),
        ("contract", "Contract"),
        ("part_time", "Part-time"),
        ("casual", "Casual"),
        ("intern", "Intern"),
        ("volunteer", "Volunteer"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("suspended", "Suspended"),
        ("resigned", "Resigned"),
        ("terminated", "Terminated"),
        ("retired", "Retired"),
    ]

    # ========================================================
    # STAFF IDENTITY
    # ========================================================

    staff_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text=(
            "System-generated permanent Staff ID."
        ),
    )

    employee_number = models.CharField(
        max_length=50,
        unique=True,
        help_text=(
            "Employee number assigned by the school."
        ),
    )

    # ========================================================
    # PERSONAL INFORMATION
    # ========================================================

    first_name = models.CharField(
        max_length=100,
    )

    middle_name = models.CharField(
        max_length=100,
        blank=True,
    )

    last_name = models.CharField(
        max_length=100,
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True,
    )

    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True,
    )

    nationality = models.CharField(
        max_length=100,
        default="Kenyan",
        blank=True,
    )

    national_id = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        help_text=(
            "National ID or other official "
            "identification number."
        ),
    )

    religion = models.CharField(
        max_length=100,
        choices=RELIGION_CHOICES,
        blank=True,
    )

    photo = models.ImageField(
        upload_to="staff/photos/",
        null=True,
        blank=True,
    )

    # ========================================================
    # CONTACT INFORMATION
    # ========================================================

    phone = models.CharField(
        max_length=30,
    )

    alternative_phone = models.CharField(
        max_length=30,
        blank=True,
    )

    email = models.EmailField(
        blank=True,
    )

    address = models.TextField(
        blank=True,
    )

    county = models.CharField(
        max_length=100,
        blank=True,
    )

    subcounty = models.CharField(
        max_length=100,
        blank=True,
    )

    # ========================================================
    # EMPLOYMENT INFORMATION
    # ========================================================

    date_joined = models.DateField()

    date_left = models.DateField(
        null=True,
        blank=True,
    )

    employment_type = models.CharField(
        max_length=30,
        choices=EMPLOYMENT_TYPE_CHOICES,
        default="permanent",
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="active",
    )

    # ========================================================
    # PREVIOUS EMPLOYMENT
    # ========================================================

    previous_employment = models.TextField(
        blank=True,
        help_text=(
            "Optional information about previous "
            "employment, employers, positions, "
            "and experience."
        ),
    )

    # ========================================================
    # SYSTEM INFORMATION
    # ========================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # ========================================================
    # META
    # ========================================================

    class Meta:
        ordering = [
            "last_name",
            "first_name",
        ]

    # ========================================================
    # STRING REPRESENTATION
    # ========================================================

    def __str__(self):
        return f"{self.staff_id} - {self.full_name}"

    # ========================================================
    # FULL NAME
    # ========================================================

    @property
    def full_name(self):
        return " ".join(
            part
            for part in [
                self.first_name,
                self.middle_name,
                self.last_name,
            ]
            if part
        )

    # ========================================================
    # MODEL VALIDATION
    # ========================================================

    def clean(self):
        errors = {}

        # ----------------------------------------------------
        # DATE VALIDATION
        # ----------------------------------------------------

        if (
            self.date_left
            and self.date_left < self.date_joined
        ):
            errors["date_left"] = (
                "The date left cannot be earlier "
                "than the date joined."
            )

        # ----------------------------------------------------
        # ACTIVE STAFF
        # ----------------------------------------------------

        if (
            self.status == "active"
            and self.date_left
        ):
            errors["date_left"] = (
                "Active staff should not have "
                "a date left."
            )

        # ----------------------------------------------------
        # STAFF WHO HAVE LEFT
        # ----------------------------------------------------

        if (
            self.status in {
                "resigned",
                "terminated",
                "retired",
            }
            and not self.date_left
        ):
            errors["date_left"] = (
                "A date left is required for staff "
                "whose employment has ended."
            )

        if errors:
            raise ValidationError(errors)

    # ========================================================
    # SAVE
    # ========================================================

    def save(self, *args, **kwargs):

        if not self.staff_id:

            last_staff = (
                Staff.objects
                .filter(
                    staff_id__startswith="STF-"
                )
                .order_by("-id")
                .first()
            )

            if (
                last_staff
                and last_staff.staff_id
            ):

                try:
                    last_number = int(
                        last_staff.staff_id.replace(
                            "STF-",
                            ""
                        )
                    )

                except ValueError:
                    last_number = 0

            else:
                last_number = 0

            self.staff_id = (
                f"STF-{last_number + 1:05d}"
            )

        self.full_clean()

        super().save(
            *args,
            **kwargs
        )


# ============================================================
# STAFF REFEREE
# ============================================================

class StaffReferee(models.Model):
    """
    Professional/personal reference for a staff member.

    A staff member can have multiple referees.
    Referees are separate records so the system is not
    limited to two references.
    """

    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name="referees",
    )

    name = models.CharField(
        max_length=200,
    )

    relationship = models.CharField(
        max_length=100,
        blank=True,
        help_text=(
            "Relationship or professional connection "
            "to the staff member."
        ),
    )

    phone = models.CharField(
        max_length=30,
    )

    alternative_phone = models.CharField(
        max_length=30,
        blank=True,
    )

    email = models.EmailField(
        blank=True,
    )

    occupation = models.CharField(
        max_length=150,
        blank=True,
    )

    company = models.CharField(
        max_length=200,
        blank=True,
    )

    address = models.TextField(
        blank=True,
    )

    notes = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "name",
        ]

    def __str__(self):
        return f"{self.name} - {self.staff.full_name}"


# ============================================================
# STAFF ROLE
# ============================================================

class StaffRole(models.Model):
    """
    Defines a role that can be assigned to staff.

    Examples:
    - Teacher
    - Driver
    - Cook
    - Security Officer
    - Cleaner
    - Accountant
    - Nurse
    - Administrator
    """

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    code = models.CharField(
        max_length=50,
        unique=True,
        help_text=(
            "Unique internal code for this staff role."
        ),
    )

    description = models.TextField(
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "name",
        ]

    def __str__(self):
        return self.name


# ============================================================
# STAFF ROLE ASSIGNMENT
# ============================================================

class StaffRoleAssignment(models.Model):
    """
    Assigns a staff member to a role.

    A staff member can have multiple roles over time
    and can have multiple simultaneous responsibilities.

    Role history is preserved instead of overwriting
    previous assignments.
    """

    ASSIGNMENT_STATUS_CHOICES = [
        ("active", "Active"),
        ("completed", "Completed"),
        ("inactive", "Inactive"),
    ]

    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name="role_assignments",
    )

    role = models.ForeignKey(
        StaffRole,
        on_delete=models.PROTECT,
        related_name="staff_assignments",
    )

    employment_type = models.CharField(
        max_length=30,
        choices=Staff.EMPLOYMENT_TYPE_CHOICES,
        default="permanent",
    )

    start_date = models.DateField()

    end_date = models.DateField(
        null=True,
        blank=True,
    )

    is_primary = models.BooleanField(
        default=False,
    )

    status = models.CharField(
        max_length=20,
        choices=ASSIGNMENT_STATUS_CHOICES,
        default="active",
    )

    notes = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "-start_date",
            "-id",
        ]

    def __str__(self):
        return (
            f"{self.staff.full_name} - "
            f"{self.role.name}"
        )

    def clean(self):
        errors = {}

        # ----------------------------------------------------
        # DATE VALIDATION
        # ----------------------------------------------------

        if (
            self.end_date
            and self.end_date < self.start_date
        ):
            errors["end_date"] = (
                "The role end date cannot be earlier "
                "than the role start date."
            )

        # ----------------------------------------------------
        # ACTIVE ASSIGNMENT
        # ----------------------------------------------------

        if (
            self.status == "active"
            and self.end_date
        ):
            errors["end_date"] = (
                "An active role assignment should not "
                "have an end date."
            )

        # ----------------------------------------------------
        # COMPLETED / INACTIVE ASSIGNMENT
        # ----------------------------------------------------

        if (
            self.status in {
                "completed",
                "inactive",
            }
            and not self.end_date
        ):
            errors["end_date"] = (
                "An end date is required when a role "
                "assignment is completed or inactive."
            )

        # ----------------------------------------------------
        # ROLE MUST BE ACTIVE
        # ----------------------------------------------------

        if (
            self.role_id
            and not self.role.is_active
            and self.status == "active"
        ):
            errors["role"] = (
                "An inactive staff role cannot be assigned "
                "as an active role."
            )

        if errors:
            raise ValidationError(errors)