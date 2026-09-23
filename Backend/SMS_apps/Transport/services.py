from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import (
    DriverProfile,
    DriverWeeklyReport,
    Vehicle,
    VehicleAssignment,
    VehicleFueling,
    VehicleMaintenance,
    VehicleInsurance,
    TransportRoute,
    TransportStage,
    TransportAssignment,
)

from SMS_apps.Receipts.models import (
    Receipt,
    ReceiptItem,
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================


def _validate_department_relationship(
    department,
    subdepartment=None,
):
    """
    Validate that the selected subdepartment belongs to
    the selected department.
    """

    if not department:
        raise ValidationError(
            "A department is required."
        )

    if (
        subdepartment
        and subdepartment.department_id
        != department.id
    ):
        raise ValidationError({
            "subdepartment": (
                "The selected subdepartment must belong "
                "to the selected department."
            )
        })


def _get_payment_method_choices():
    """
    Retrieve payment methods directly from the existing
    Receipt model.

    This prevents Transport from maintaining a second,
    potentially inconsistent list of payment methods.
    """

    return {
        choice[0]
        for choice in Receipt._meta.get_field(
            "payment_method"
        ).choices
    }


def _validate_payment_method(payment_method):
    """
    Validate payment method against the Receipt model.
    """

    valid_methods = _get_payment_method_choices()

    if payment_method not in valid_methods:
        raise ValidationError({
            "payment_method": (
                "Invalid payment method."
            )
        })


def _validate_payment_reference(
    payment_reference,
    receipt=None,
):
    """
    Validate payment reference against existing receipts.

    Blank payment references are allowed.
    """

    if not payment_reference:
        return

    queryset = Receipt.objects.filter(
        payment_reference=payment_reference
    )

    if receipt:
        queryset = queryset.exclude(
            pk=receipt.pk
        )

    if queryset.exists():
        raise ValidationError({
            "payment_reference": (
                "This payment reference has already "
                "been used by another receipt."
            )
        })


def _get_receipt_item_unit_choices():
    """
    Retrieve units directly from the existing ReceiptItem
    model.
    """

    return {
        choice[0]
        for choice in ReceiptItem._meta.get_field(
            "unit"
        ).choices
    }


def _validate_receipt_item_unit(unit):
    """
    Validate a ReceiptItem unit.
    """

    valid_units = _get_receipt_item_unit_choices()

    if unit not in valid_units:
        raise ValidationError({
            "unit": (
                "Invalid receipt item unit."
            )
        })


# ============================================================
# RECEIPT CREATION HELPERS
# ============================================================


@transaction.atomic
def _create_transport_receipt(
    *,
    store,
    payment_method,
    payment_reference,
    date,
    description,
    recorded_by,
    department,
    subdepartment,
    item_name,
    quantity,
    unit,
    unit_price,
    attachment=None,
):
    """
    Create a Receipt and its ReceiptItem for a Transport
    financial transaction.

    This function is intentionally private.

    It is called by:
    - VehicleFueling service
    - VehicleMaintenance service

    The caller should already be inside an atomic transaction,
    but this function is also atomic for safety.
    """

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    _validate_payment_method(
        payment_method
    )

    _validate_payment_reference(
        payment_reference
    )

    _validate_department_relationship(
        department,
        subdepartment,
    )

    _validate_receipt_item_unit(
        unit
    )

    if not recorded_by:
        raise ValidationError(
            "An authenticated user is required "
            "to record the receipt."
        )

    if quantity <= Decimal("0.00"):
        raise ValidationError({
            "quantity": (
                "Receipt item quantity must be "
                "greater than zero."
            )
        })

    if unit_price < Decimal("0.00"):
        raise ValidationError({
            "unit_price": (
                "Receipt item unit price cannot "
                "be negative."
            )
        })

    # --------------------------------------------------------
    # CREATE RECEIPT
    # --------------------------------------------------------

    receipt = Receipt(
        store=store,
        payment_method=payment_method,
        date=date,
        payment_reference=(
            payment_reference or None
        ),
        description=description,
        recorded_by=recorded_by,
        attachment=attachment,
    )

    receipt.full_clean()
    receipt.save()

    # --------------------------------------------------------
    # CREATE RECEIPT ITEM
    # --------------------------------------------------------

    receipt_item = ReceiptItem(
        receipt=receipt,
        item_name=item_name,
        department=department,
        subdepartment=subdepartment,
        quantity=quantity,
        unit=unit,
        unit_price=unit_price,
    )

    receipt_item.full_clean()
    receipt_item.save()

    # ReceiptItem.save() automatically recalculates
    # Receipt.total.

    return receipt


@transaction.atomic
def _update_transport_receipt(
    *,
    receipt,
    store,
    payment_method,
    payment_reference,
    date,
    description,
    recorded_by,
    department,
    subdepartment,
    item_name,
    quantity,
    unit,
    unit_price,
    attachment=None,
):
    """
    Update an existing Transport-generated receipt and
    its corresponding ReceiptItem.
    """

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    _validate_payment_method(
        payment_method
    )

    _validate_payment_reference(
        payment_reference,
        receipt=receipt,
    )

    _validate_department_relationship(
        department,
        subdepartment,
    )

    _validate_receipt_item_unit(
        unit
    )

    if quantity <= Decimal("0.00"):
        raise ValidationError({
            "quantity": (
                "Receipt item quantity must be "
                "greater than zero."
            )
        })

    if unit_price < Decimal("0.00"):
        raise ValidationError({
            "unit_price": (
                "Receipt item unit price cannot "
                "be negative."
            )
        })

    # --------------------------------------------------------
    # UPDATE RECEIPT
    # --------------------------------------------------------

    receipt.store = store
    receipt.payment_method = payment_method
    receipt.date = date
    receipt.payment_reference = (
        payment_reference or None
    )
    receipt.description = description
    receipt.recorded_by = recorded_by

    if attachment is not None:
        receipt.attachment = attachment

    receipt.full_clean()
    receipt.save()

    # --------------------------------------------------------
    # GET TRANSPORT RECEIPT ITEM
    # --------------------------------------------------------

    receipt_item = (
        receipt.items
        .order_by("id")
        .first()
    )

    if not receipt_item:
        raise ValidationError(
            "The Transport receipt does not have "
            "a receipt item."
        )

    # --------------------------------------------------------
    # UPDATE RECEIPT ITEM
    # --------------------------------------------------------

    receipt_item.item_name = item_name
    receipt_item.department = department
    receipt_item.subdepartment = subdepartment
    receipt_item.quantity = quantity
    receipt_item.unit = unit
    receipt_item.unit_price = unit_price

    receipt_item.full_clean()
    receipt_item.save()

    return receipt


# ============================================================
# DRIVER PROFILE SERVICES
# ============================================================


@transaction.atomic
def create_driver_profile(
    *,
    staff,
    **data,
):
    """
    Create a DriverProfile for a staff member.

    One staff member can only have one DriverProfile.
    """

    if not staff:
        raise ValidationError(
            "A staff member is required."
        )

    if DriverProfile.objects.filter(
        staff=staff
    ).exists():
        raise ValidationError(
            "This staff member already has "
            "a driver profile."
        )

    profile = DriverProfile(
        staff=staff,
        **data,
    )

    profile.full_clean()
    profile.save()

    return profile


@transaction.atomic
def update_driver_profile(
    driver_profile,
    **data,
):
    """
    Update driver-specific information.

    The associated staff member cannot be changed through
    this service.
    """

    data.pop(
        "staff",
        None,
    )

    for field, value in data.items():
        setattr(
            driver_profile,
            field,
            value,
        )

    driver_profile.full_clean()
    driver_profile.save()

    return driver_profile


@transaction.atomic
def verify_driver_profile(
    driver_profile,
    verified_by,
):
    """
    Mark a driver profile as verified.
    """

    if not verified_by:
        raise ValidationError(
            "An authenticated user is required "
            "to verify a driver."
        )

    driver_profile.is_verified = True
    driver_profile.verified_at = timezone.now()
    driver_profile.verified_by = verified_by

    driver_profile.full_clean()
    driver_profile.save()

    return driver_profile


@transaction.atomic
def unverify_driver_profile(
    driver_profile,
):
    """
    Remove driver verification.
    """

    driver_profile.is_verified = False
    driver_profile.verified_at = None
    driver_profile.verified_by = None

    driver_profile.save(
        update_fields=[
            "is_verified",
            "verified_at",
            "verified_by",
            "updated_at",
        ]
    )

    return driver_profile


# ============================================================
# DRIVER WEEKLY REPORT SERVICES
# ============================================================


@transaction.atomic
def create_driver_weekly_report(
    *,
    driver,
    vehicle,
    **data,
):
    """
    Create a driver's weekly report.

    Total mileage is calculated automatically by the model.
    """

    if not driver:
        raise ValidationError(
            "A driver is required."
        )

    if not vehicle:
        raise ValidationError(
            "A vehicle is required."
        )

    week_start = data.get(
        "week_start"
    )

    week_end = data.get(
        "week_end"
    )

    if not week_start:
        raise ValidationError(
            "Week start is required."
        )

    if not week_end:
        raise ValidationError(
            "Week end is required."
        )

    if DriverWeeklyReport.objects.filter(
        driver=driver,
        vehicle=vehicle,
        week_start=week_start,
    ).exists():
        raise ValidationError(
            "A weekly report already exists for "
            "this driver, vehicle, and week."
        )

    report = DriverWeeklyReport(
        driver=driver,
        vehicle=vehicle,
        **data,
    )

    report.full_clean()
    report.save()

    return report


@transaction.atomic
def update_driver_weekly_report(
    report,
    **data,
):
    """
    Update a driver's weekly report.

    The driver and vehicle are preserved through this
    service to maintain report history.
    """

    data.pop(
        "driver",
        None,
    )

    data.pop(
        "vehicle",
        None,
    )

    for field, value in data.items():
        setattr(
            report,
            field,
            value,
        )

    duplicate = (
        DriverWeeklyReport.objects.filter(
            driver=report.driver,
            vehicle=report.vehicle,
            week_start=report.week_start,
        )
        .exclude(
            pk=report.pk
        )
        .exists()
    )

    if duplicate:
        raise ValidationError(
            "A weekly report already exists for "
            "this driver, vehicle, and week."
        )

    report.full_clean()
    report.save()

    return report


@transaction.atomic
def review_driver_weekly_report(
    report,
    reviewed_by,
    review_comments="",
):
    """
    Mark a driver's weekly report as reviewed.
    """

    if not reviewed_by:
        raise ValidationError(
            "An authenticated user is required "
            "to review the report."
        )

    report.reviewed = True
    report.reviewed_at = timezone.now()
    report.reviewed_by = reviewed_by
    report.review_comments = review_comments

    report.full_clean()
    report.save()

    return report


@transaction.atomic
def unreview_driver_weekly_report(
    report,
):
    """
    Remove the reviewed status from a weekly report.
    """

    report.reviewed = False
    report.reviewed_at = None
    report.reviewed_by = None

    report.save(
        update_fields=[
            "reviewed",
            "reviewed_at",
            "reviewed_by",
            "updated_at",
        ]
    )

    return report


# ============================================================
# VEHICLE SERVICES
# ============================================================


@transaction.atomic
def create_vehicle(**data):
    """
    Create a new vehicle.

    vehicle_id is generated automatically by the model.
    """

    vehicle = Vehicle(
        **data
    )

    vehicle.full_clean()
    vehicle.save()

    return vehicle


@transaction.atomic
def update_vehicle(
    vehicle,
    **data,
):
    """
    Update vehicle information.

    vehicle_id cannot be changed.
    """

    data.pop(
        "vehicle_id",
        None,
    )

    for field, value in data.items():
        setattr(
            vehicle,
            field,
            value,
        )

    vehicle.full_clean()
    vehicle.save()

    return vehicle


@transaction.atomic
def deactivate_vehicle(
    vehicle,
):
    """
    Deactivate a vehicle.

    Historical records remain intact.
    """

    vehicle.status = "inactive"

    vehicle.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    # --------------------------------------------------------
    # CLOSE ACTIVE DRIVER ASSIGNMENTS
    # --------------------------------------------------------

    today = timezone.now().date()

    VehicleAssignment.objects.filter(
        vehicle=vehicle,
        status="active",
    ).update(
        status="inactive",
        end_date=today,
        is_primary=False,
        updated_at=timezone.now(),
    )

    return vehicle


# ============================================================
# VEHICLE ASSIGNMENT SERVICES
# ============================================================


@transaction.atomic
def create_vehicle_assignment(
    *,
    vehicle,
    driver,
    **data,
):
    """
    Assign a driver to a vehicle.

    Multiple historical assignments are allowed.

    A new primary assignment removes the primary flag
    from other active assignments for the same vehicle.
    """

    if not vehicle:
        raise ValidationError(
            "A vehicle is required."
        )

    if not driver:
        raise ValidationError(
            "A driver is required."
        )

    if vehicle.status != "active":
        raise ValidationError(
            "Only an active vehicle can receive "
            "a driver assignment."
        )

    if not driver.staff:
        raise ValidationError(
            "The selected driver is not associated "
            "with a staff member."
        )

    if driver.staff.status != "active":
        raise ValidationError(
            "Only an active staff member can be "
            "assigned as a driver."
        )

    assignment = VehicleAssignment(
        vehicle=vehicle,
        driver=driver,
        **data,
    )

    assignment.full_clean()
    assignment.save()

    if assignment.is_primary:

        VehicleAssignment.objects.filter(
            vehicle=vehicle,
            status="active",
        ).exclude(
            pk=assignment.pk
        ).update(
            is_primary=False
        )

    return assignment


@transaction.atomic
def update_vehicle_assignment(
    assignment,
    **data,
):
    """
    Update an existing vehicle assignment.

    Vehicle and driver are preserved to keep assignment
    history stable.
    """

    data.pop(
        "vehicle",
        None,
    )

    data.pop(
        "driver",
        None,
    )

    for field, value in data.items():
        setattr(
            assignment,
            field,
            value,
        )

    assignment.full_clean()
    assignment.save()

    if assignment.is_primary:

        VehicleAssignment.objects.filter(
            vehicle=assignment.vehicle,
            status="active",
        ).exclude(
            pk=assignment.pk
        ).update(
            is_primary=False
        )

    return assignment


@transaction.atomic
def deactivate_vehicle_assignment(
    assignment,
):
    """
    Close a driver-to-vehicle assignment.
    """

    assignment.status = "inactive"
    assignment.end_date = timezone.now().date()
    assignment.is_primary = False

    assignment.full_clean()

    assignment.save()

    return assignment


# ============================================================
# VEHICLE FUELING SERVICES
# ============================================================


@transaction.atomic
def create_vehicle_fueling(
    *,
    vehicle,
    driver=None,
    recorded_by,
    department,
    subdepartment=None,
    payment_method,
    payment_reference="",
    **data,
):
    """
    Create a vehicle fueling record and automatically create
    its Receipt + ReceiptItem.

    Financial flow:

        VehicleFueling
              ↓
           Receipt
              ↓
         ReceiptItem

    The entire operation is atomic.
    """

    # --------------------------------------------------------
    # REQUIRED INFORMATION
    # --------------------------------------------------------

    if not vehicle:
        raise ValidationError(
            "A vehicle is required."
        )

    if not recorded_by:
        raise ValidationError(
            "An authenticated user is required."
        )

    if not department:
        raise ValidationError(
            "A department is required."
        )

    # --------------------------------------------------------
    # VEHICLE STATUS
    # --------------------------------------------------------

    if vehicle.status in {
        "retired",
        "sold",
    }:
        raise ValidationError(
            "Fueling cannot be recorded for a "
            "retired or sold vehicle."
        )

    # --------------------------------------------------------
    # DRIVER VALIDATION
    # --------------------------------------------------------

    if driver:

        if not driver.staff:
            raise ValidationError(
                "The selected driver is not associated "
                "with a staff member."
            )

        if driver.staff.status != "active":
            raise ValidationError(
                "Fueling cannot be recorded against "
                "an inactive driver."
            )

    # --------------------------------------------------------
    # DEPARTMENT
    # --------------------------------------------------------

    _validate_department_relationship(
        department,
        subdepartment,
    )

    # --------------------------------------------------------
    # PAYMENT
    # --------------------------------------------------------

    _validate_payment_method(
        payment_method
    )

    _validate_payment_reference(
        payment_reference
    )

    # --------------------------------------------------------
    # CREATE FUELING
    # --------------------------------------------------------

    fueling = VehicleFueling(
        vehicle=vehicle,
        driver=driver,
        recorded_by=recorded_by,
        department=department,
        subdepartment=subdepartment,
        payment_method=payment_method,
        payment_reference=payment_reference,
        **data,
    )

    fueling.full_clean()
    fueling.save()

    # --------------------------------------------------------
    # CREATE RECEIPT
    # --------------------------------------------------------

    vehicle_name = (
        f"{vehicle.registration_number}"
    )

    fuel_type = (
        fueling.get_fuel_type_display()
    )

    receipt = _create_transport_receipt(
        store=fueling.fuel_station,
        payment_method=fueling.payment_method,
        payment_reference=fueling.payment_reference,
        date=fueling.date,
        description=(
            f"Vehicle fueling - "
            f"{vehicle_name}"
        ),
        recorded_by=recorded_by,
        department=fueling.department,
        subdepartment=fueling.subdepartment,
        item_name=(
            f"{fuel_type} - "
            f"{vehicle_name}"
        ),
        quantity=fueling.quantity,
        unit="liters",
        unit_price=fueling.unit_price,
    )

    # --------------------------------------------------------
    # CONNECT FUELING TO RECEIPT
    # --------------------------------------------------------

    fueling.receipt = receipt

    fueling.save(
        update_fields=[
            "receipt",
            "updated_at",
        ]
    )

    return fueling


@transaction.atomic
def update_vehicle_fueling(
    fueling,
    **data,
):
    """
    Update a vehicle fueling record and synchronize its
    associated Receipt and ReceiptItem.

    The financial record and operational record remain
    synchronized.
    """

    # --------------------------------------------------------
    # PRESERVE IMMUTABLE / CONTROLLED FIELDS
    # --------------------------------------------------------

    data.pop(
        "receipt",
        None,
    )

    # --------------------------------------------------------
    # DETERMINE FINAL VALUES
    # --------------------------------------------------------

    vehicle = data.get(
        "vehicle",
        fueling.vehicle,
    )

    driver = data.get(
        "driver",
        fueling.driver,
    )

    department = data.get(
        "department",
        fueling.department,
    )

    subdepartment = data.get(
        "subdepartment",
        fueling.subdepartment,
    )

    payment_method = data.get(
        "payment_method",
        fueling.payment_method,
    )

    payment_reference = data.get(
        "payment_reference",
        fueling.payment_reference,
    )

    # --------------------------------------------------------
    # VALIDATE
    # --------------------------------------------------------

    if not vehicle:
        raise ValidationError(
            "A vehicle is required."
        )

    if vehicle.status in {
        "retired",
        "sold",
    }:
        raise ValidationError(
            "Fueling cannot be recorded for a "
            "retired or sold vehicle."
        )

    _validate_department_relationship(
        department,
        subdepartment,
    )

    _validate_payment_method(
        payment_method
    )

    _validate_payment_reference(
        payment_reference,
        receipt=fueling.receipt,
    )

    # --------------------------------------------------------
    # APPLY FUELING CHANGES
    # --------------------------------------------------------

    for field, value in data.items():
        setattr(
            fueling,
            field,
            value,
        )

    fueling.full_clean()
    fueling.save()

    # --------------------------------------------------------
    # RECEIPT MUST EXIST
    # --------------------------------------------------------

    if not fueling.receipt:
        raise ValidationError(
            "This fueling record does not have "
            "an associated receipt."
        )

    # --------------------------------------------------------
    # SYNCHRONIZE RECEIPT
    # --------------------------------------------------------

    receipt = _update_transport_receipt(
        receipt=fueling.receipt,
        store=fueling.fuel_station,
        payment_method=fueling.payment_method,
        payment_reference=fueling.payment_reference,
        date=fueling.date,
        description=(
            f"Vehicle fueling - "
            f"{fueling.vehicle.registration_number}"
        ),
        recorded_by=fueling.recorded_by,
        department=fueling.department,
        subdepartment=fueling.subdepartment,
        item_name=(
            f"{fueling.get_fuel_type_display()} - "
            f"{fueling.vehicle.registration_number}"
        ),
        quantity=fueling.quantity,
        unit="liters",
        unit_price=fueling.unit_price,
    )

    return fueling


# ============================================================
# VEHICLE MAINTENANCE SERVICES
# ============================================================


@transaction.atomic
def create_vehicle_maintenance(
    *,
    vehicle,
    recorded_by,
    department,
    subdepartment=None,
    payment_method,
    payment_reference="",
    **data,
):
    """
    Create a vehicle maintenance record and automatically
    create its Receipt + ReceiptItem.

    Financial flow:

        VehicleMaintenance
                ↓
             Receipt
                ↓
           ReceiptItem
    """

    # --------------------------------------------------------
    # REQUIRED INFORMATION
    # --------------------------------------------------------

    if not vehicle:
        raise ValidationError(
            "A vehicle is required."
        )

    if not recorded_by:
        raise ValidationError(
            "An authenticated user is required."
        )

    if not department:
        raise ValidationError(
            "A department is required."
        )

    # --------------------------------------------------------
    # VEHICLE STATUS
    # --------------------------------------------------------

    if vehicle.status in {
        "retired",
        "sold",
    }:
        raise ValidationError(
            "Maintenance cannot be recorded for a "
            "retired or sold vehicle."
        )

    # --------------------------------------------------------
    # DEPARTMENT
    # --------------------------------------------------------

    _validate_department_relationship(
        department,
        subdepartment,
    )

    # --------------------------------------------------------
    # PAYMENT
    # --------------------------------------------------------

    _validate_payment_method(
        payment_method
    )

    _validate_payment_reference(
        payment_reference
    )

    # --------------------------------------------------------
    # CREATE MAINTENANCE
    # --------------------------------------------------------

    maintenance = VehicleMaintenance(
        vehicle=vehicle,
        recorded_by=recorded_by,
        department=department,
        subdepartment=subdepartment,
        payment_method=payment_method,
        payment_reference=payment_reference,
        **data,
    )

    maintenance.full_clean()
    maintenance.save()

    # --------------------------------------------------------
    # CREATE RECEIPT
    # --------------------------------------------------------

    vehicle_name = (
        vehicle.registration_number
    )

    receipt = _create_transport_receipt(
        store=maintenance.service_provider,
        payment_method=maintenance.payment_method,
        payment_reference=maintenance.payment_reference,
        date=maintenance.maintenance_date,
        description=(
            f"Vehicle maintenance - "
            f"{vehicle_name}"
        ),
        recorded_by=recorded_by,
        department=maintenance.department,
        subdepartment=maintenance.subdepartment,
        item_name=(
            f"{maintenance.get_maintenance_type_display()} - "
            f"{vehicle_name}"
        ),
        quantity=Decimal("1.00"),
        unit="pieces",
        unit_price=maintenance.cost,
        attachment=maintenance.document,
    )

    # --------------------------------------------------------
    # CONNECT MAINTENANCE TO RECEIPT
    # --------------------------------------------------------

    maintenance.receipt = receipt

    maintenance.save(
        update_fields=[
            "receipt",
            "updated_at",
        ]
    )

    # --------------------------------------------------------
    # UPDATE VEHICLE SERVICE SNAPSHOT
    # --------------------------------------------------------
    #
    # The Vehicle model contains the current service dates
    # for quick access.
    #
    # Historical maintenance remains in VehicleMaintenance.
    # --------------------------------------------------------

    vehicle.date_of_service = (
        maintenance.maintenance_date
    )

    vehicle.date_of_next_service = (
        maintenance.next_service_date
    )

    vehicle.save(
        update_fields=[
            "date_of_service",
            "date_of_next_service",
            "updated_at",
        ]
    )

    return maintenance


@transaction.atomic
def update_vehicle_maintenance(
    maintenance,
    **data,
):
    """
    Update vehicle maintenance information and synchronize
    its linked Receipt and ReceiptItem.
    """

    # --------------------------------------------------------
    # PROTECT RECEIPT RELATIONSHIP
    # --------------------------------------------------------

    data.pop(
        "receipt",
        None,
    )

    # --------------------------------------------------------
    # FINAL VALUES
    # --------------------------------------------------------

    vehicle = data.get(
        "vehicle",
        maintenance.vehicle,
    )

    department = data.get(
        "department",
        maintenance.department,
    )

    subdepartment = data.get(
        "subdepartment",
        maintenance.subdepartment,
    )

    payment_method = data.get(
        "payment_method",
        maintenance.payment_method,
    )

    payment_reference = data.get(
        "payment_reference",
        maintenance.payment_reference,
    )

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    if not vehicle:
        raise ValidationError(
            "A vehicle is required."
        )

    if vehicle.status in {
        "retired",
        "sold",
    }:
        raise ValidationError(
            "Maintenance cannot be recorded for a "
            "retired or sold vehicle."
        )

    _validate_department_relationship(
        department,
        subdepartment,
    )

    _validate_payment_method(
        payment_method
    )

    _validate_payment_reference(
        payment_reference,
        receipt=maintenance.receipt,
    )

    # --------------------------------------------------------
    # APPLY CHANGES
    # --------------------------------------------------------

    for field, value in data.items():
        setattr(
            maintenance,
            field,
            value,
        )

    maintenance.full_clean()
    maintenance.save()

    # --------------------------------------------------------
    # RECEIPT MUST EXIST
    # --------------------------------------------------------

    if not maintenance.receipt:
        raise ValidationError(
            "This maintenance record does not have "
            "an associated receipt."
        )

    # --------------------------------------------------------
    # SYNCHRONIZE RECEIPT
    # --------------------------------------------------------

    _update_transport_receipt(
        receipt=maintenance.receipt,
        store=maintenance.service_provider,
        payment_method=maintenance.payment_method,
        payment_reference=maintenance.payment_reference,
        date=maintenance.maintenance_date,
        description=(
            f"Vehicle maintenance - "
            f"{maintenance.vehicle.registration_number}"
        ),
        recorded_by=maintenance.recorded_by,
        department=maintenance.department,
        subdepartment=maintenance.subdepartment,
        item_name=(
            f"{maintenance.get_maintenance_type_display()} - "
            f"{maintenance.vehicle.registration_number}"
        ),
        quantity=Decimal("1.00"),
        unit="pieces",
        unit_price=maintenance.cost,
        attachment=maintenance.document,
    )

    # --------------------------------------------------------
    # UPDATE VEHICLE SERVICE SNAPSHOT
    # --------------------------------------------------------

    vehicle = maintenance.vehicle

    vehicle.date_of_service = (
        maintenance.maintenance_date
    )

    vehicle.date_of_next_service = (
        maintenance.next_service_date
    )

    vehicle.save(
        update_fields=[
            "date_of_service",
            "date_of_next_service",
            "updated_at",
        ]
    )

    return maintenance


# ============================================================
# VEHICLE INSURANCE SERVICES
# ============================================================



# ============================================================
# VEHICLE INSURANCE SERVICES
# ============================================================


@transaction.atomic
def create_vehicle_insurance(
    *,
    vehicle,
    recorded_by,
    department,
    subdepartment=None,
    payment_method,
    payment_reference="",
    **data,
):
    """
    Create a vehicle insurance record and automatically
    create its Receipt + ReceiptItem.

    Financial flow:

        VehicleInsurance
                ↓
             Receipt
                ↓
           ReceiptItem

    The entire operation is atomic.

    If the insurance record, receipt, or receipt item fails,
    the entire transaction is rolled back.
    """

    # --------------------------------------------------------
    # REQUIRED INFORMATION
    # --------------------------------------------------------

    if not vehicle:
        raise ValidationError(
            "A vehicle is required."
        )

    if not recorded_by:
        raise ValidationError(
            "An authenticated user is required."
        )

    if not department:
        raise ValidationError(
            "A department is required."
        )

    # --------------------------------------------------------
    # VEHICLE STATUS
    # --------------------------------------------------------

    if vehicle.status in {
        "retired",
        "sold",
    }:
        raise ValidationError(
            "Insurance cannot be recorded for a "
            "retired or sold vehicle."
        )

    # --------------------------------------------------------
    # DEPARTMENT
    # --------------------------------------------------------

    _validate_department_relationship(
        department,
        subdepartment,
    )

    # --------------------------------------------------------
    # PAYMENT
    # --------------------------------------------------------

    _validate_payment_method(
        payment_method
    )

    _validate_payment_reference(
        payment_reference
    )

    # --------------------------------------------------------
    # CREATE INSURANCE RECORD
    # --------------------------------------------------------

    insurance = VehicleInsurance(
        vehicle=vehicle,
        recorded_by=recorded_by,
        department=department,
        subdepartment=subdepartment,
        payment_method=payment_method,
        payment_reference=payment_reference,
        **data,
    )

    insurance.full_clean()
    insurance.save()

    # --------------------------------------------------------
    # CREATE RECEIPT
    # --------------------------------------------------------

    receipt = _create_transport_receipt(
        store=insurance.insurance_company,
        payment_method=insurance.payment_method,
        payment_reference=insurance.payment_reference,
        date=insurance.start_date,
        description=(
            f"Vehicle insurance - "
            f"{vehicle.registration_number}"
        ),
        recorded_by=recorded_by,
        department=insurance.department,
        subdepartment=insurance.subdepartment,
        item_name=(
            f"Vehicle Insurance - "
            f"{vehicle.registration_number}"
        ),
        quantity=Decimal("1.00"),
        unit="pieces",
        unit_price=insurance.premium,
        attachment=insurance.document,
    )

    # --------------------------------------------------------
    # CONNECT INSURANCE TO RECEIPT
    # --------------------------------------------------------

    insurance.receipt = receipt

    insurance.save(
        update_fields=[
            "receipt",
            "updated_at",
        ]
    )

    # --------------------------------------------------------
    # UPDATE CURRENT VEHICLE INSURANCE SNAPSHOT
    # --------------------------------------------------------
    #
    # Vehicle keeps the current policy information for
    # quick access.
    #
    # VehicleInsurance keeps the complete history.
    # --------------------------------------------------------

    vehicle.insurance_company = (
        insurance.insurance_company
    )

    vehicle.insurance_number = (
        insurance.policy_number
    )

    vehicle.insurance_expiry_date = (
        insurance.expiry_date
    )

    vehicle.save(
        update_fields=[
            "insurance_company",
            "insurance_number",
            "insurance_expiry_date",
            "updated_at",
        ]
    )

    return insurance


@transaction.atomic
def update_vehicle_insurance(
    insurance,
    **data,
):
    """
    Update a vehicle insurance record and synchronize its
    associated Receipt and ReceiptItem.

    The vehicle relationship cannot be changed through
    this service.

    The financial Receipt remains synchronized with the
    insurance record.
    """

    # --------------------------------------------------------
    # PROTECT CONTROLLED FIELDS
    # --------------------------------------------------------

    data.pop(
        "vehicle",
        None,
    )

    data.pop(
        "receipt",
        None,
    )

    # --------------------------------------------------------
    # FINAL VALUES
    # --------------------------------------------------------

    department = data.get(
        "department",
        insurance.department,
    )

    subdepartment = data.get(
        "subdepartment",
        insurance.subdepartment,
    )

    payment_method = data.get(
        "payment_method",
        insurance.payment_method,
    )

    payment_reference = data.get(
        "payment_reference",
        insurance.payment_reference,
    )

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    _validate_department_relationship(
        department,
        subdepartment,
    )

    _validate_payment_method(
        payment_method
    )

    _validate_payment_reference(
        payment_reference,
        receipt=insurance.receipt,
    )

    # --------------------------------------------------------
    # APPLY CHANGES
    # --------------------------------------------------------

    for field, value in data.items():
        setattr(
            insurance,
            field,
            value,
        )

    insurance.full_clean()
    insurance.save()

    # --------------------------------------------------------
    # RECEIPT MUST EXIST
    # --------------------------------------------------------

    if not insurance.receipt:
        raise ValidationError(
            "This insurance record does not have "
            "an associated receipt."
        )

    # --------------------------------------------------------
    # SYNCHRONIZE RECEIPT
    # --------------------------------------------------------

    _update_transport_receipt(
        receipt=insurance.receipt,
        store=insurance.insurance_company,
        payment_method=insurance.payment_method,
        payment_reference=insurance.payment_reference,
        date=insurance.start_date,
        description=(
            f"Vehicle insurance - "
            f"{insurance.vehicle.registration_number}"
        ),
        recorded_by=insurance.recorded_by,
        department=insurance.department,
        subdepartment=insurance.subdepartment,
        item_name=(
            f"Vehicle Insurance - "
            f"{insurance.vehicle.registration_number}"
        ),
        quantity=Decimal("1.00"),
        unit="pieces",
        unit_price=insurance.premium,
        attachment=insurance.document,
    )

    # --------------------------------------------------------
    # DETERMINE CURRENT INSURANCE RECORD
    # --------------------------------------------------------
    #
    # We only update Vehicle's snapshot if this insurance
    # record is the latest insurance policy for the vehicle.
    # --------------------------------------------------------

    latest = (
        VehicleInsurance.objects.filter(
            vehicle=insurance.vehicle
        )
        .order_by(
            "-start_date",
            "-id",
        )
        .first()
    )

    if latest and latest.pk == insurance.pk:

        vehicle = insurance.vehicle

        vehicle.insurance_company = (
            insurance.insurance_company
        )

        vehicle.insurance_number = (
            insurance.policy_number
        )

        vehicle.insurance_expiry_date = (
            insurance.expiry_date
        )

        vehicle.save(
            update_fields=[
                "insurance_company",
                "insurance_number",
                "insurance_expiry_date",
                "updated_at",
            ]
        )

    return insurance



# ============================================================
# TRANSPORT ROUTE SERVICES
# ============================================================


@transaction.atomic
def create_transport_route(**data):
    """
    Create a transport route.

    route_id is generated automatically by the model.
    """

    route = TransportRoute(
        **data,
    )

    route.full_clean()
    route.save()

    return route


@transaction.atomic
def update_transport_route(
    route,
    **data,
):
    """
    Update a transport route.

    route_id cannot be changed.
    """

    data.pop(
        "route_id",
        None,
    )

    for field, value in data.items():
        setattr(
            route,
            field,
            value,
        )

    route.full_clean()
    route.save()

    return route


@transaction.atomic
def deactivate_transport_route(
    route,
):
    """
    Deactivate a transport route.

    Existing historical assignments remain intact.
    """

    route.status = "inactive"

    route.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return route


# ============================================================
# TRANSPORT STAGE SERVICES
# ============================================================


@transaction.atomic
def create_transport_stage(
    *,
    route,
    **data,
):
    """
    Create a stage for a route.
    """

    if not route:
        raise ValidationError(
            "A route is required."
        )

    sequence = data.get(
        "sequence"
    )

    code = data.get(
        "code"
    )

    if TransportStage.objects.filter(
        route=route,
        sequence=sequence,
    ).exists():
        raise ValidationError(
            "This stage sequence is already used "
            "on the selected route."
        )

    if TransportStage.objects.filter(
        route=route,
        code=code,
    ).exists():
        raise ValidationError(
            "This stage code is already used "
            "on the selected route."
        )

    stage = TransportStage(
        route=route,
        **data,
    )

    stage.full_clean()
    stage.save()

    return stage


@transaction.atomic
def update_transport_stage(
    stage,
    **data,
):
    """
    Update a route stage.

    Route cannot be changed through this service.
    """

    data.pop(
        "route",
        None,
    )

    for field, value in data.items():
        setattr(
            stage,
            field,
            value,
        )

    duplicate_sequence = (
        TransportStage.objects.filter(
            route=stage.route,
            sequence=stage.sequence,
        )
        .exclude(
            pk=stage.pk
        )
        .exists()
    )

    if duplicate_sequence:
        raise ValidationError(
            "This stage sequence is already used "
            "on the selected route."
        )

    duplicate_code = (
        TransportStage.objects.filter(
            route=stage.route,
            code=stage.code,
        )
        .exclude(
            pk=stage.pk
        )
        .exists()
    )

    if duplicate_code:
        raise ValidationError(
            "This stage code is already used "
            "on the selected route."
        )

    stage.full_clean()
    stage.save()

    return stage


@transaction.atomic
def deactivate_transport_stage(
    stage,
):
    """
    Deactivate a transport stage.
    """

    stage.status = "inactive"

    stage.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return stage


# ============================================================
# STUDENT TRANSPORT ASSIGNMENT SERVICES
# ============================================================


@transaction.atomic
def create_transport_assignment(
    *,
    student,
    enrollment,
    route,
    stage,
    vehicle,
    **data,
):
    """
    Assign a student to school transport.

    Validates:

    - Student/enrollment relationship
    - Stage/route relationship
    - Active route
    - Active stage
    - Active vehicle
    - Duplicate active student assignment
    """

    if not student:
        raise ValidationError(
            "A student is required."
        )

    if not enrollment:
        raise ValidationError(
            "A student enrollment is required."
        )

    if not route:
        raise ValidationError(
            "A transport route is required."
        )

    if not stage:
        raise ValidationError(
            "A transport stage is required."
        )

    if not vehicle:
        raise ValidationError(
            "A vehicle is required."
        )

    # --------------------------------------------------------
    # STUDENT / ENROLLMENT
    # --------------------------------------------------------

    if enrollment.student_id != student.id:
        raise ValidationError({
            "enrollment": (
                "The selected enrollment does not "
                "belong to the selected student."
            )
        })

    # --------------------------------------------------------
    # ENROLLMENT STATUS
    # --------------------------------------------------------

    if enrollment.status != "active":
        raise ValidationError(
            "Transport can only be assigned to a student "
            "with an active enrollment."
        )

    # --------------------------------------------------------
    # ROUTE / STAGE
    # --------------------------------------------------------

    if stage.route_id != route.id:
        raise ValidationError({
            "stage": (
                "The selected stage does not belong "
                "to the selected route."
            )
        })

    if route.status != "active":
        raise ValidationError(
            "Only an active route can receive "
            "student transport assignments."
        )

    if stage.status != "active":
        raise ValidationError(
            "Only an active stage can receive "
            "student transport assignments."
        )

    # --------------------------------------------------------
    # VEHICLE
    # --------------------------------------------------------

    if vehicle.status != "active":
        raise ValidationError(
            "Only an active vehicle can be assigned "
            "to a student transport service."
        )

    # --------------------------------------------------------
    # PREVENT DUPLICATE ACTIVE ASSIGNMENT
    # --------------------------------------------------------

    if TransportAssignment.objects.filter(
        student=student,
        status="active",
    ).exists():

        raise ValidationError(
            "This student already has an active "
            "transport assignment."
        )

    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    assignment = TransportAssignment(
        student=student,
        enrollment=enrollment,
        route=route,
        stage=stage,
        vehicle=vehicle,
        **data,
    )

    assignment.full_clean()
    assignment.save()

    return assignment


@transaction.atomic
def update_transport_assignment(
    assignment,
    **data,
):
    """
    Update an existing student transport assignment.
    """

    student = data.get(
        "student",
        assignment.student,
    )

    enrollment = data.get(
        "enrollment",
        assignment.enrollment,
    )

    route = data.get(
        "route",
        assignment.route,
    )

    stage = data.get(
        "stage",
        assignment.stage,
    )

    vehicle = data.get(
        "vehicle",
        assignment.vehicle,
    )

    status = data.get(
        "status",
        assignment.status,
    )

    # --------------------------------------------------------
    # STUDENT / ENROLLMENT
    # --------------------------------------------------------

    if enrollment.student_id != student.id:
        raise ValidationError({
            "enrollment": (
                "The selected enrollment does not "
                "belong to the selected student."
            )
        })

    # --------------------------------------------------------
    # ROUTE / STAGE
    # --------------------------------------------------------

    if stage.route_id != route.id:
        raise ValidationError({
            "stage": (
                "The selected stage does not belong "
                "to the selected route."
            )
        })

    # --------------------------------------------------------
    # ACTIVE DUPLICATE
    # --------------------------------------------------------

    if status == "active":

        duplicate = (
            TransportAssignment.objects.filter(
                student=student,
                status="active",
            )
            .exclude(
                pk=assignment.pk
            )
            .exists()
        )

        if duplicate:
            raise ValidationError(
                "This student already has another "
                "active transport assignment."
            )

    # --------------------------------------------------------
    # APPLY
    # --------------------------------------------------------

    for field, value in data.items():
        setattr(
            assignment,
            field,
            value,
        )

    assignment.full_clean()
    assignment.save()

    return assignment


@transaction.atomic
def deactivate_transport_assignment(
    assignment,
):
    """
    Close a student's transport assignment.
    """

    assignment.status = "inactive"
    assignment.end_date = timezone.now().date()

    assignment.full_clean()

    assignment.save()

    return assignment

