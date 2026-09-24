from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


# ============================================================
# EXISTING APPLICATION MODEL IMPORTS
# ============================================================

# Receipts application
from SMS_apps.Receipts.models import (
    Receipt,
    Department,
    SubDepartment,
)

# Staff application
from SMS_apps.Staff.models import Staff

# Students application
from SMS_apps.students.models import (
    Student,
    StudentEnrollment,
)


# ============================================================
# USER MODEL
# ============================================================

User = settings.AUTH_USER_MODEL


# ============================================================
# DRIVER PROFILE
# ============================================================

class DriverProfile(models.Model):
    """
    Transport-specific profile for a staff member who works
    as a driver.

    Staff identity and employment information remains in the
    Staff application.

    DriverProfile stores only driver-specific information.
    """

    staff = models.OneToOneField(
        Staff,
        on_delete=models.CASCADE,
        related_name="driver_profile",
    )

    # --------------------------------------------------------
    # DRIVING LICENCE
    # --------------------------------------------------------

    license_number = models.CharField(
        max_length=100,
    )

    license_class = models.CharField(
        max_length=50,
        blank=True,
    )

    license_issue_date = models.DateField(
        null=True,
        blank=True,
    )

    license_expiry_date = models.DateField(
        null=True,
        blank=True,
    )

    # --------------------------------------------------------
    # PSV LICENCE
    # --------------------------------------------------------

    psv_license_number = models.CharField(
        max_length=100,
        blank=True,
    )

    psv_expiry_date = models.DateField(
        null=True,
        blank=True,
    )

    # --------------------------------------------------------
    # DRIVER BADGE
    # --------------------------------------------------------

    driver_badge_number = models.CharField(
        max_length=100,
        blank=True,
    )

    # --------------------------------------------------------
    # EXPERIENCE
    # --------------------------------------------------------

    years_of_experience = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    previous_driving_experience = models.TextField(
        blank=True,
    )

    # --------------------------------------------------------
    # MEDICAL
    # --------------------------------------------------------

    medical_certificate_expiry = models.DateField(
        null=True,
        blank=True,
    )

    # --------------------------------------------------------
    # VERIFICATION
    # --------------------------------------------------------

    is_verified = models.BooleanField(
        default=False,
    )

    verified_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    verified_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="verified_driver_profiles",
        null=True,
        blank=True,
    )

    # --------------------------------------------------------
    # NOTES
    # --------------------------------------------------------

    notes = models.TextField(
        blank=True,
    )

    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    def clean(self):
        errors = {}

        if (
            self.license_issue_date
            and self.license_expiry_date
            and self.license_expiry_date
            < self.license_issue_date
        ):
            errors["license_expiry_date"] = (
                "License expiry date cannot be earlier "
                "than the license issue date."
            )

        if (
            self.psv_expiry_date
            and self.license_issue_date
            and self.psv_expiry_date
            < self.license_issue_date
        ):
            errors["psv_expiry_date"] = (
                "PSV expiry date cannot be earlier "
                "than the license issue date."
            )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return (
            f"{self.staff.first_name} "
            f"{self.staff.last_name}"
        )

    class Meta:
        ordering = [
            "staff__first_name",
            "staff__last_name",
        ]


# ============================================================
# DRIVER WEEKLY REPORT
# ============================================================

class DriverWeeklyReport(models.Model):
    """
    Weekly operational report submitted by a driver.

    Records:
    - Vehicle used
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

    Actual fuel expenditure is NOT stored here.

    Financial fueling transactions are stored separately
    through VehicleFueling.
    """

    # --------------------------------------------------------
    # DRIVER & VEHICLE
    # --------------------------------------------------------

    driver = models.ForeignKey(
        DriverProfile,
        on_delete=models.PROTECT,
        related_name="weekly_reports",
    )

    vehicle = models.ForeignKey(
        "Vehicle",
        on_delete=models.PROTECT,
        related_name="driver_weekly_reports",
    )

    # --------------------------------------------------------
    # REPORT PERIOD
    # --------------------------------------------------------

    week_start = models.DateField()

    week_end = models.DateField()

    # --------------------------------------------------------
    # MILEAGE
    # --------------------------------------------------------

    starting_mileage = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    ending_mileage = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_mileage = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        editable=False,
        default=Decimal("0.00"),
    )

    # --------------------------------------------------------
    # FUEL USAGE
    # --------------------------------------------------------

    fuel_used_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    fueling_location = models.CharField(
        max_length=255,
        blank=True,
    )

    fuel_cost_per_liter = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    # --------------------------------------------------------
    # VEHICLE CONDITION
    # --------------------------------------------------------

    VEHICLE_CONDITION_CHOICES = [
        ("excellent", "Excellent"),
        ("good", "Good"),
        ("fair", "Fair"),
        ("poor", "Poor"),
        ("critical", "Critical"),
    ]

    vehicle_condition = models.CharField(
        max_length=20,
        choices=VEHICLE_CONDITION_CHOICES,
        default="good",
    )

    # --------------------------------------------------------
    # INCIDENTS
    # --------------------------------------------------------

    incidents = models.TextField(
        blank=True,
    )

    # --------------------------------------------------------
    # MAINTENANCE
    # --------------------------------------------------------

    maintenance_required = models.BooleanField(
        default=False,
    )

    maintenance_notes = models.TextField(
        blank=True,
    )

    # --------------------------------------------------------
    # COMMENTS
    # --------------------------------------------------------

    comments = models.TextField(
        blank=True,
    )

    # --------------------------------------------------------
    # SUBMISSION
    # --------------------------------------------------------

    submitted_at = models.DateTimeField(
        auto_now_add=True,
    )

    # --------------------------------------------------------
    # REVIEW
    # --------------------------------------------------------

    reviewed = models.BooleanField(
        default=False,
    )

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="reviewed_driver_reports",
        null=True,
        blank=True,
    )

    review_comments = models.TextField(
        blank=True,
    )

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    def clean(self):
        errors = {}

        # --------------------------------------------
        # REPORT PERIOD
        # --------------------------------------------

        if self.week_end < self.week_start:
            errors["week_end"] = (
                "Week end cannot be earlier than "
                "week start."
            )

        # --------------------------------------------
        # MILEAGE
        # --------------------------------------------

        if self.ending_mileage < self.starting_mileage:
            errors["ending_mileage"] = (
                "Ending mileage cannot be less than "
                "starting mileage."
            )

        # --------------------------------------------
        # FUEL QUANTITY
        # --------------------------------------------

        if (
            self.fuel_used_quantity is not None
            and self.fuel_used_quantity < Decimal("0.00")
        ):
            errors["fuel_used_quantity"] = (
                "Fuel used quantity cannot be negative."
            )

        # --------------------------------------------
        # FUEL COST PER LITRE
        # --------------------------------------------

        if (
            self.fuel_cost_per_liter is not None
            and self.fuel_cost_per_liter < Decimal("0.00")
        ):
            errors["fuel_cost_per_liter"] = (
                "Fuel cost per litre cannot be negative."
            )

        # --------------------------------------------
        # MAINTENANCE
        # --------------------------------------------

        if (
            not self.maintenance_required
            and self.maintenance_notes.strip()
        ):
            errors["maintenance_notes"] = (
                "Maintenance notes should only be provided "
                "when maintenance is required."
            )

        if errors:
            raise ValidationError(errors)

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    def save(self, *args, **kwargs):
        """
        Automatically calculate total mileage.
        """

        self.total_mileage = (
            Decimal(self.ending_mileage)
            - Decimal(self.starting_mileage)
        ).quantize(
            Decimal("0.01")
        )

        self.full_clean()

        super().save(*args, **kwargs)

    # --------------------------------------------------------
    # STRING REPRESENTATION
    # --------------------------------------------------------

    def __str__(self):
        return (
            f"{self.driver} - "
            f"{self.week_start} to "
            f"{self.week_end}"
        )

    # --------------------------------------------------------
    # META
    # --------------------------------------------------------

    class Meta:
        ordering = [
            "-week_start",
            "-id",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "driver",
                    "vehicle",
                    "week_start",
                ],
                name="unique_driver_vehicle_weekly_report",
            )
        ]


# ============================================================
# VEHICLE
# ============================================================

class Vehicle(models.Model):
    """
    Represents a school vehicle.

    Stable vehicle information is stored here.

    Historical information such as:
    - Fueling
    - Maintenance
    - Insurance
    - Driver assignments

    is stored in separate models.
    """

    VEHICLE_TYPE_CHOICES = [
        ("bus", "Bus"),
        ("van", "Van"),
        ("minibus", "Minibus"),
        ("car", "Car"),
        ("pickup", "Pickup"),
        ("truck", "Truck"),
        ("motorcycle", "Motorcycle"),
        ("other", "Other"),
    ]

    FUEL_TYPE_CHOICES = [
        ("petrol", "Petrol"),
        ("diesel", "Diesel"),
        ("electric", "Electric"),
        ("hybrid", "Hybrid"),
        ("other", "Other"),
    ]

    OWNERSHIP_TYPE_CHOICES = [
        ("school_owned", "School Owned"),
        ("leased", "Leased"),
        ("hired", "Hired"),
        ("private", "Private"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("under_maintenance", "Under Maintenance"),
        ("retired", "Retired"),
        ("sold", "Sold"),
    ]

    # --------------------------------------------------------
    # IDENTITY
    # --------------------------------------------------------

    vehicle_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )

    registration_number = models.CharField(
        max_length=30,
        unique=True,
    )

    make = models.CharField(
        max_length=100,
    )

    model = models.CharField(
        max_length=100,
    )

    vehicle_type = models.CharField(
        max_length=30,
        choices=VEHICLE_TYPE_CHOICES,
    )

    # --------------------------------------------------------
    # VEHICLE INFORMATION
    # --------------------------------------------------------

    date_of_manufacture = models.DateField(
        null=True,
        blank=True,
    )

    date_of_registration = models.DateField(
        null=True,
        blank=True,
    )

    capacity = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Passenger capacity where applicable.",
    )

    fuel_type = models.CharField(
        max_length=30,
        choices=FUEL_TYPE_CHOICES,
    )

    color = models.CharField(
        max_length=50,
        blank=True,
    )

    # --------------------------------------------------------
    # OWNERSHIP
    # --------------------------------------------------------

    ownership_type = models.CharField(
        max_length=30,
        choices=OWNERSHIP_TYPE_CHOICES,
        default="school_owned",
    )

    owner_name = models.CharField(
        max_length=255,
        blank=True,
    )

    owner_phone = models.CharField(
        max_length=30,
        blank=True,
    )

    # ========================================================
    # CURRENT INSURANCE SNAPSHOT
    # ========================================================

    insurance_company = models.CharField(
        max_length=255,
        blank=True,
    )

    insurance_number = models.CharField(
        max_length=100,
        blank=True,
    )

    insurance_expiry_date = models.DateField(
        null=True,
        blank=True,
    )

    # --------------------------------------------------------
    # INSPECTION
    # --------------------------------------------------------

    inspection_certificate_number = models.CharField(
        max_length=100,
        blank=True,
    )

    inspection_expiry_date = models.DateField(
        null=True,
        blank=True,
    )

    # --------------------------------------------------------
    # SPEED GOVERNOR
    # --------------------------------------------------------

    speed_governor_present = models.BooleanField(
        default=False,
    )

    speed_governor_company = models.CharField(
        max_length=255,
        blank=True,
    )

    speed_governor_expiry_date = models.DateField(
        null=True,
        blank=True,
    )

    # --------------------------------------------------------
    # ROAD SERVICE LICENCE
    # --------------------------------------------------------

    road_service_licence_number = models.CharField(
        max_length=100,
        blank=True,
    )

    road_service_licence_expiry_date = models.DateField(
        null=True,
        blank=True,
    )

    # --------------------------------------------------------
    # LOGBOOK
    # --------------------------------------------------------

    logbook_number = models.CharField(
        max_length=100,
        blank=True,
    )

    logbook_expiry_date = models.DateField(
        null=True,
        blank=True,
    )

    # --------------------------------------------------------
    # SERVICE
    # --------------------------------------------------------

    date_of_service = models.DateField(
        null=True,
        blank=True,
    )

    date_of_next_service = models.DateField(
        null=True,
        blank=True,
    )

    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="active",
    )

    notes = models.TextField(
        blank=True,
    )

    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    def clean(self):
        errors = {}

        if (
            self.date_of_manufacture
            and self.date_of_registration
            and self.date_of_registration
            < self.date_of_manufacture
        ):
            errors["date_of_registration"] = (
                "Registration date cannot be earlier "
                "than the manufacture date."
            )

        if (
            self.date_of_service
            and self.date_of_next_service
            and self.date_of_next_service
            < self.date_of_service
        ):
            errors["date_of_next_service"] = (
                "Next service date cannot be earlier "
                "than the previous service date."
            )

        if (
            self.speed_governor_present
            and not self.speed_governor_company
        ):
            errors["speed_governor_company"] = (
                "Speed governor company is required "
                "when a speed governor is present."
            )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        """
        Automatically generate the permanent vehicle ID.
        """

        if not self.vehicle_id:

            last_vehicle = (
                Vehicle.objects
                .order_by("-id")
                .first()
            )

            if last_vehicle:
                last_number = int(
                    last_vehicle.vehicle_id.split("-")[-1]
                )
                next_number = last_number + 1
            else:
                next_number = 1

            self.vehicle_id = (
                f"VEH-{next_number:05d}"
            )

        self.full_clean()

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.registration_number} - "
            f"{self.make} {self.model}"
        )

    class Meta:
        ordering = [
            "registration_number",
        ]


# ============================================================
# VEHICLE ASSIGNMENT
# ============================================================

class VehicleAssignment(models.Model):
    """
    Historical assignment of a driver to a vehicle.
    """

    STATUS_CHOICES = [
        ("active", "Active"),
        ("completed", "Completed"),
        ("inactive", "Inactive"),
    ]

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.PROTECT,
        related_name="driver_assignments",
    )

    driver = models.ForeignKey(
        DriverProfile,
        on_delete=models.PROTECT,
        related_name="vehicle_assignments",
    )

    start_date = models.DateField()

    end_date = models.DateField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )

    is_primary = models.BooleanField(
        default=False,
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

    def clean(self):
        errors = {}

        if (
            self.end_date
            and self.end_date < self.start_date
        ):
            errors["end_date"] = (
                "End date cannot be earlier "
                "than start date."
            )

        if (
            self.status == "active"
            and self.end_date
        ):
            errors["end_date"] = (
                "An active assignment cannot "
                "have an end date."
            )

        if (
            self.status in {
                "completed",
                "inactive",
            }
            and not self.end_date
        ):
            errors["end_date"] = (
                "Completed or inactive assignments "
                "must have an end date."
            )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.vehicle.registration_number} - "
            f"{self.driver}"
        )

    class Meta:
        ordering = [
            "-start_date",
            "-id",
        ]


# ============================================================
# VEHICLE FUELING
# ============================================================

class VehicleFueling(models.Model):
    """
    Records an actual vehicle fueling transaction.

    This is both:
    - An operational transport record
    - A financial transaction

    Financial portion feeds the Receipts application.
    """

    FUEL_TYPE_CHOICES = [
        ("petrol", "Petrol"),
        ("diesel", "Diesel"),
        ("other", "Other"),
    ]

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.PROTECT,
        related_name="fueling_records",
    )

    driver = models.ForeignKey(
        DriverProfile,
        on_delete=models.PROTECT,
        related_name="fueling_records",
        null=True,
        blank=True,
    )

    date = models.DateField(
        default=timezone.now,
    )

    mileage = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    fuel_type = models.CharField(
        max_length=20,
        choices=FUEL_TYPE_CHOICES,
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_cost = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        editable=False,
        default=Decimal("0.00"),
    )

    fuel_station = models.CharField(
        max_length=255,
    )

    receipt_number = models.CharField(
        max_length=100,
        blank=True,
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="vehicle_fueling_records",
    )

    subdepartment = models.ForeignKey(
        SubDepartment,
        on_delete=models.PROTECT,
        related_name="vehicle_fueling_records",
        null=True,
        blank=True,
    )

    payment_method = models.CharField(
        max_length=30,
        choices=Receipt._meta.get_field(
            "payment_method"
        ).choices,
    )

    payment_reference = models.CharField(
        max_length=100,
        blank=True,
    )

    recorded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="recorded_vehicle_fueling",
    )

    notes = models.TextField(
        blank=True,
    )

    receipt = models.OneToOneField(
        Receipt,
        on_delete=models.PROTECT,
        related_name="vehicle_fueling",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def clean(self):
        errors = {}

        if self.quantity <= Decimal("0.00"):
            errors["quantity"] = (
                "Fuel quantity must be greater than zero."
            )

        if self.unit_price < Decimal("0.00"):
            errors["unit_price"] = (
                "Fuel unit price cannot be negative."
            )

        if self.mileage < Decimal("0.00"):
            errors["mileage"] = (
                "Mileage cannot be negative."
            )

        if self.subdepartment:

            if (
                self.subdepartment.department_id
                != self.department_id
            ):
                errors["subdepartment"] = (
                    "The selected subdepartment must "
                    "belong to the selected department."
                )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.total_cost = (
            Decimal(self.quantity)
            * Decimal(self.unit_price)
        ).quantize(
            Decimal("0.01")
        )

        self.full_clean()

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.vehicle.registration_number} - "
            f"{self.fuel_type} - "
            f"{self.date}"
        )

    class Meta:
        ordering = [
            "-date",
            "-id",
        ]


# ============================================================
# VEHICLE MAINTENANCE
# ============================================================

class VehicleMaintenance(models.Model):
    """
    Records vehicle maintenance and repair history.

    Maintenance costs feed into the Receipts application.
    """

    MAINTENANCE_TYPE_CHOICES = [
        ("service", "Service"),
        ("repair", "Repair"),
        ("inspection", "Inspection"),
        ("tyre", "Tyre"),
        ("oil_change", "Oil Change"),
        ("electrical", "Electrical"),
        ("bodywork", "Bodywork"),
        ("other", "Other"),
    ]

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.PROTECT,
        related_name="maintenance_records",
    )

    maintenance_date = models.DateField(
        default=timezone.now,
    )

    maintenance_type = models.CharField(
        max_length=30,
        choices=MAINTENANCE_TYPE_CHOICES,
    )

    description = models.TextField()

    mileage = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    service_provider = models.CharField(
        max_length=255,
    )

    technician = models.CharField(
        max_length=255,
        blank=True,
    )

    cost = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    next_service_date = models.DateField(
        null=True,
        blank=True,
    )

    next_service_mileage = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    invoice_number = models.CharField(
        max_length=100,
        blank=True,
    )

    document = models.FileField(
        upload_to="transport/maintenance/%Y/%m/",
        blank=True,
        null=True,
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="vehicle_maintenance_records",
    )

    subdepartment = models.ForeignKey(
        SubDepartment,
        on_delete=models.PROTECT,
        related_name="vehicle_maintenance_records",
        null=True,
        blank=True,
    )

    payment_method = models.CharField(
        max_length=30,
        choices=Receipt._meta.get_field(
            "payment_method"
        ).choices,
    )

    payment_reference = models.CharField(
        max_length=100,
        blank=True,
    )

    recorded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="recorded_vehicle_maintenance",
    )

    notes = models.TextField(
        blank=True,
    )

    receipt = models.OneToOneField(
        Receipt,
        on_delete=models.PROTECT,
        related_name="vehicle_maintenance",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def clean(self):
        errors = {}

        if self.cost < Decimal("0.00"):
            errors["cost"] = (
                "Maintenance cost cannot be negative."
            )

        if (
            self.mileage is not None
            and self.mileage < Decimal("0.00")
        ):
            errors["mileage"] = (
                "Mileage cannot be negative."
            )

        if (
            self.next_service_mileage is not None
            and self.next_service_mileage < Decimal("0.00")
        ):
            errors["next_service_mileage"] = (
                "Next service mileage cannot be negative."
            )

        if (
            self.next_service_date
            and self.maintenance_date
            and self.next_service_date
            < self.maintenance_date
        ):
            errors["next_service_date"] = (
                "Next service date cannot be earlier "
                "than the maintenance date."
            )

        if self.subdepartment:

            if (
                self.subdepartment.department_id
                != self.department_id
            ):
                errors["subdepartment"] = (
                    "The selected subdepartment must "
                    "belong to the selected department."
                )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.vehicle.registration_number} - "
            f"{self.maintenance_type} - "
            f"{self.maintenance_date}"
        )

    class Meta:
        ordering = [
            "-maintenance_date",
            "-id",
        ]


# ============================================================
# VEHICLE INSURANCE
# ============================================================

class VehicleInsurance(models.Model):
    """
    Historical vehicle insurance records.

    Every insurance renewal creates a new record instead
    of overwriting previous insurance history.

    Financial flow:

        VehicleInsurance
                ↓
             Receipt
                ↓
           ReceiptItem
    """

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.PROTECT,
        related_name="insurance_records",
    )

    insurance_company = models.CharField(
        max_length=255,
    )

    policy_number = models.CharField(
        max_length=100,
    )

    start_date = models.DateField()

    expiry_date = models.DateField()

    premium = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    policy_type = models.CharField(
        max_length=100,
        blank=True,
    )

    document = models.FileField(
        upload_to="transport/insurance/%Y/%m/",
        blank=True,
        null=True,
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="vehicle_insurance_records",
    )

    subdepartment = models.ForeignKey(
        SubDepartment,
        on_delete=models.PROTECT,
        related_name="vehicle_insurance_records",
        null=True,
        blank=True,
    )

    payment_method = models.CharField(
        max_length=30,
        choices=Receipt._meta.get_field(
            "payment_method"
        ).choices,
    )

    payment_reference = models.CharField(
        max_length=100,
        blank=True,
    )

    recorded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="recorded_vehicle_insurance",
    )

    notes = models.TextField(
        blank=True,
    )

    receipt = models.OneToOneField(
        Receipt,
        on_delete=models.PROTECT,
        related_name="vehicle_insurance",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def clean(self):
        errors = {}

        if self.expiry_date < self.start_date:
            errors["expiry_date"] = (
                "Insurance expiry date cannot be earlier "
                "than the start date."
            )

        if self.premium < Decimal("0.00"):
            errors["premium"] = (
                "Insurance premium cannot be negative."
            )

        if self.subdepartment:

            if (
                self.subdepartment.department_id
                != self.department_id
            ):
                errors["subdepartment"] = (
                    "The selected subdepartment must "
                    "belong to the selected department."
                )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.vehicle.registration_number} - "
            f"{self.insurance_company} - "
            f"{self.policy_number}"
        )

    class Meta:
        ordering = [
            "-start_date",
            "-id",
        ]


# ============================================================
# TRANSPORT ROUTE
# ============================================================

class TransportRoute(models.Model):
    """
    Represents a school transport route.
    """

    DIRECTION_CHOICES = [
        ("inbound", "Inbound"),
        ("outbound", "Outbound"),
        ("both", "Both"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
    ]

    route_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )

    name = models.CharField(
        max_length=255,
    )

    code = models.CharField(
        max_length=50,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    direction = models.CharField(
        max_length=20,
        choices=DIRECTION_CHOICES,
        default="both",
    )

    distance_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    estimated_duration_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
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

    def save(self, *args, **kwargs):

        if not self.route_id:

            last_route = (
                TransportRoute.objects
                .order_by("-id")
                .first()
            )

            if last_route:
                last_number = int(
                    last_route.route_id.split("-")[-1]
                )
                next_number = last_number + 1
            else:
                next_number = 1

            self.route_id = (
                f"ROUTE-{next_number:05d}"
            )

        if (
            self.distance_km is not None
            and self.distance_km < Decimal("0.00")
        ):
            raise ValidationError(
                "Route distance cannot be negative."
            )

        if (
            self.estimated_duration_minutes is not None
            and self.estimated_duration_minutes < 0
        ):
            raise ValidationError(
                "Estimated route duration cannot be negative."
            )

        self.full_clean()

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        ordering = [
            "name",
        ]


# ============================================================
# TRANSPORT STAGE
# ============================================================

from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models


class TransportStage(models.Model):
    """
    Represents a pickup/drop-off stage on a transport route.

    A stage belongs to one route and represents a specific location
    where students may be picked up and/or dropped off.
    """

    STAGE_TYPE_CHOICES = [
        ("pickup", "Pickup"),
        ("dropoff", "Drop-off"),
        ("both", "Pickup & Drop-off"),
        ("school", "School"),
        ("stop", "General Stop"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
    ]

    # ==========================================================
    # IDENTIFICATION
    # ==========================================================

    stage_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )

    route = models.ForeignKey(
        "TransportRoute",
        on_delete=models.CASCADE,
        related_name="stages",
    )

    name = models.CharField(
        max_length=255,
    )

    code = models.CharField(
        max_length=50,
    )

    # ==========================================================
    # STAGE TYPE & ORDER
    # ==========================================================

    stage_type = models.CharField(
        max_length=20,
        choices=STAGE_TYPE_CHOICES,
        default="both",
    )

    sequence = models.PositiveIntegerField(
        default=1,
    )

    # ==========================================================
    # LOCATION
    # ==========================================================

    location_description = models.TextField(
        blank=True,
        help_text="Description of the stage location.",
    )

    landmark = models.CharField(
        max_length=255,
        blank=True,
        help_text="Nearby landmark or recognizable location.",
    )

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
    )

    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
    )

    distance_from_previous = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Distance from the previous stage in kilometres.",
    )

    # ==========================================================
    # TIMING
    # ==========================================================

    pickup_time = models.TimeField(
        null=True,
        blank=True,
    )

    dropoff_time = models.TimeField(
        null=True,
        blank=True,
    )

    # ==========================================================
    # PRICING
    # ==========================================================

    monthly_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Current configured monthly transport fee for this stage.",
    )

    # ==========================================================
    # STATUS
    # ==========================================================

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )

    # ==========================================================
    # ADDITIONAL INFORMATION
    # ==========================================================

    notes = models.TextField(
        blank=True,
    )

    # ==========================================================
    # AUDIT
    # ==========================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # ==========================================================
    # VALIDATION
    # ==========================================================

    def clean(self):
        errors = {}

        # ------------------------------------------------------
        # Distance
        # ------------------------------------------------------

        if (
            self.distance_from_previous is not None
            and self.distance_from_previous < Decimal("0.00")
        ):
            errors["distance_from_previous"] = (
                "Distance cannot be negative."
            )

        # ------------------------------------------------------
        # Monthly fee
        # ------------------------------------------------------

        if self.monthly_fee < Decimal("0.00"):
            errors["monthly_fee"] = (
                "Monthly transport fee cannot be negative."
            )

        # ------------------------------------------------------
        # Latitude
        # ------------------------------------------------------

        if self.latitude is not None:
            if (
                self.latitude < Decimal("-90.0000000")
                or self.latitude > Decimal("90.0000000")
            ):
                errors["latitude"] = (
                    "Latitude must be between -90 and 90."
                )

        # ------------------------------------------------------
        # Longitude
        # ------------------------------------------------------

        if self.longitude is not None:
            if (
                self.longitude < Decimal("-180.0000000")
                or self.longitude > Decimal("180.0000000")
            ):
                errors["longitude"] = (
                    "Longitude must be between -180 and 180."
                )

        # ------------------------------------------------------
        # Time validation
        # ------------------------------------------------------

        if (
            self.pickup_time
            and self.dropoff_time
            and self.dropoff_time < self.pickup_time
        ):
            errors["dropoff_time"] = (
                "Drop-off time cannot be earlier than pickup time."
            )

        # ------------------------------------------------------
        # Sequence
        # ------------------------------------------------------

        if self.sequence < 1:
            errors["sequence"] = (
                "Stage sequence must be at least 1."
            )

        if errors:
            raise ValidationError(errors)

    # ==========================================================
    # SAVE
    # ==========================================================

    def save(self, *args, **kwargs):

        if not self.stage_id:

            last_stage = (
                TransportStage.objects
                .order_by("-id")
                .first()
            )

            if last_stage:

                last_number = int(
                    last_stage.stage_id.split("-")[-1]
                )

                next_number = last_number + 1

            else:

                next_number = 1

            self.stage_id = (
                f"STAGE-{next_number:05d}"
            )

        self.full_clean()

        super().save(*args, **kwargs)

    # ==========================================================
    # STRING REPRESENTATION
    # ==========================================================

    def __str__(self):

        return (
            f"{self.route.name} - "
            f"{self.name}"
        )

    # ==========================================================
    # META
    # ==========================================================

    class Meta:

        ordering = [
            "route",
            "sequence",
        ]

        constraints = [

            models.UniqueConstraint(
                fields=[
                    "route",
                    "sequence",
                ],
                name="unique_stage_sequence_per_route",
            ),

            models.UniqueConstraint(
                fields=[
                    "route",
                    "code",
                ],
                name="unique_stage_code_per_route",
            ),

        ]

# ============================================================
# TRANSPORT ASSIGNMENT
# ============================================================

class TransportAssignment(models.Model):
    """
    Assigns a student to school transport.

    Connects:

        Student
            ↓
        Enrollment
            ↓
        Transport Route
            ↓
        Stage
            ↓
        Vehicle
    """

    STATUS_CHOICES = [
        ("active", "Active"),
        ("completed", "Completed"),
        ("inactive", "Inactive"),
    ]

    # --------------------------------------------------------
    # STUDENT
    # --------------------------------------------------------

    student = models.ForeignKey(
        Student,
        on_delete=models.PROTECT,
        related_name="transport_assignments",
    )

    # --------------------------------------------------------
    # ENROLLMENT
    # --------------------------------------------------------

    enrollment = models.ForeignKey(
        StudentEnrollment,
        on_delete=models.PROTECT,
        related_name="transport_assignments",
    )

    # --------------------------------------------------------
    # ROUTE
    # --------------------------------------------------------

    route = models.ForeignKey(
        TransportRoute,
        on_delete=models.PROTECT,
        related_name="student_assignments",
    )

    # --------------------------------------------------------
    # STAGE
    # --------------------------------------------------------

    stage = models.ForeignKey(
        TransportStage,
        on_delete=models.PROTECT,
        related_name="student_assignments",
    )

    # --------------------------------------------------------
    # VEHICLE
    # --------------------------------------------------------

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.PROTECT,
        related_name="transport_assignments",
    )

    # --------------------------------------------------------
    # DATES
    # --------------------------------------------------------

    start_date = models.DateField()

    end_date = models.DateField(
        null=True,
        blank=True,
    )

    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )

    # --------------------------------------------------------
    # SERVICE TIMES
    # --------------------------------------------------------

    morning_service = models.BooleanField(
        default=True,
    )

    evening_service = models.BooleanField(
        default=True,
    )

    # --------------------------------------------------------
    # NOTES
    # --------------------------------------------------------

    notes = models.TextField(
        blank=True,
    )

    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    def clean(self):
        errors = {}

        if (
            self.stage
            and self.route
            and self.stage.route_id != self.route_id
        ):
            errors["stage"] = (
                "The selected stage does not belong "
                "to the selected route."
            )

        if (
            self.enrollment
            and self.student
            and self.enrollment.student_id
            != self.student_id
        ):
            errors["enrollment"] = (
                "The selected enrollment does not "
                "belong to the selected student."
            )

        if (
            self.end_date
            and self.end_date < self.start_date
        ):
            errors["end_date"] = (
                "End date cannot be earlier "
                "than start date."
            )

        if (
            self.status == "active"
            and self.end_date
        ):
            errors["end_date"] = (
                "An active transport assignment "
                "cannot have an end date."
            )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.student} - "
            f"{self.route.name}"
        )

    class Meta:
        ordering = [
            "-start_date",
            "-id",
        ]

