from django.core.exceptions import ValidationError
from django.db import transaction

from .models import (
    Staff,
    StaffReferee,
    StaffRole,
    StaffRoleAssignment,
)


# ============================================================
# STAFF SERVICES
# ============================================================


@transaction.atomic
def create_staff(**data):
    """
    Create a new staff member.

    Staff ID is generated automatically by the Staff model.

    The employee number is supplied by the school and must
    remain unique.
    """

    staff = Staff(**data)

    staff.full_clean()
    staff.save()

    return staff


@transaction.atomic
def update_staff(
    staff,
    **data
):
    """
    Update an existing staff member.

    The system-generated staff_id cannot be changed through
    this service.
    """

    # --------------------------------------------------------
    # PROTECT SYSTEM-GENERATED STAFF ID
    # --------------------------------------------------------

    data.pop(
        "staff_id",
        None
    )

    # --------------------------------------------------------
    # APPLY CHANGES
    # --------------------------------------------------------

    for field, value in data.items():
        setattr(
            staff,
            field,
            value
        )

    staff.full_clean()
    staff.save()

    return staff


@transaction.atomic
def deactivate_staff(
    staff
):
    """
    Deactivate a staff member.

    The staff record is retained for historical records.

    Active role assignments are also closed so that the staff
    member does not remain actively assigned to roles after
    being deactivated.
    """

    staff.status = "inactive"

    staff.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    # --------------------------------------------------------
    # CLOSE ACTIVE ROLE ASSIGNMENTS
    # --------------------------------------------------------

    StaffRoleAssignment.objects.filter(
        staff=staff,
        status="active",
    ).update(
        status="inactive",
    )

    return staff


# ============================================================
# STAFF REFEREE SERVICES
# ============================================================


@transaction.atomic
def create_staff_referee(
    staff,
    **data
):
    """
    Create a referee for a staff member.

    A referee belongs to one staff member.

    Referees are separate records so a staff member can have
    multiple referees.
    """

    if not staff:
        raise ValidationError(
            "A staff member is required."
        )

    referee = StaffReferee(
        staff=staff,
        **data
    )

    referee.full_clean()
    referee.save()

    return referee


@transaction.atomic
def update_staff_referee(
    referee,
    **data
):
    """
    Update an existing staff referee.

    The staff member associated with the referee cannot be
    changed through this service.
    """

    # --------------------------------------------------------
    # PROTECT STAFF RELATIONSHIP
    # --------------------------------------------------------

    data.pop(
        "staff",
        None
    )

    # --------------------------------------------------------
    # APPLY CHANGES
    # --------------------------------------------------------

    for field, value in data.items():
        setattr(
            referee,
            field,
            value
        )

    referee.full_clean()
    referee.save()

    return referee


@transaction.atomic
def delete_staff_referee(
    referee
):
    """
    Permanently delete a staff referee.

    The staff member remains intact.
    """

    referee.delete()


# ============================================================
# STAFF ROLE SERVICES
# ============================================================


@transaction.atomic
def create_staff_role(
    **data
):
    """
    Create a staff role.

    Examples:

    Teacher
    Driver
    Cook
    Security Officer
    Accountant
    Nurse
    Administrator

    Roles are database records rather than hardcoded choices,
    allowing the school to add new roles without changing code.
    """

    role = StaffRole(
        **data
    )

    role.full_clean()
    role.save()

    return role


@transaction.atomic
def update_staff_role(
    role,
    **data
):
    """
    Update an existing staff role.

    Existing assignments are preserved because they reference
    the same role record.
    """

    for field, value in data.items():
        setattr(
            role,
            field,
            value
        )

    role.full_clean()
    role.save()

    return role


@transaction.atomic
def deactivate_staff_role(
    role
):
    """
    Deactivate a staff role.

    The role itself is retained because historical role
    assignments may still reference it.

    Active assignments using this role are also closed.
    """

    role.is_active = False

    role.save(
        update_fields=[
            "is_active",
            "updated_at",
        ]
    )

    StaffRoleAssignment.objects.filter(
        role=role,
        status="active",
    ).update(
        status="inactive",
    )

    return role


# ============================================================
# STAFF ROLE ASSIGNMENT SERVICES
# ============================================================


@transaction.atomic
def create_staff_role_assignment(
    staff,
    role,
    **data
):
    """
    Assign a role to a staff member.

    Business rules:

    - Staff member is required.
    - Role is required.
    - An inactive role cannot be assigned actively.
    - A staff member cannot have multiple active primary
      roles.
    - A staff member may have multiple active roles.
    """

    if not staff:
        raise ValidationError(
            "A staff member is required."
        )

    if not role:
        raise ValidationError(
            "A staff role is required."
        )

    # --------------------------------------------------------
    # ROLE MUST BE ACTIVE
    # --------------------------------------------------------

    if (
        not role.is_active
        and data.get(
            "status",
            "active"
        ) == "active"
    ):
        raise ValidationError(
            "An inactive staff role cannot be assigned "
            "as an active role."
        )

    # --------------------------------------------------------
    # PREVENT DUPLICATE ACTIVE ROLE
    # --------------------------------------------------------

    assignment_status = data.get(
        "status",
        "active"
    )

    if assignment_status == "active":

        duplicate_role = (
            StaffRoleAssignment.objects.filter(
                staff=staff,
                role=role,
                status="active",
            )
            .exists()
        )

        if duplicate_role:
            raise ValidationError(
                "This staff member already has "
                "this role assigned as active."
            )

    # --------------------------------------------------------
    # CREATE ASSIGNMENT
    # --------------------------------------------------------

    assignment = StaffRoleAssignment(
        staff=staff,
        role=role,
        **data
    )

    assignment.full_clean()
    assignment.save()

    # --------------------------------------------------------
    # PRIMARY ROLE
    # --------------------------------------------------------

    if assignment.is_primary:

        StaffRoleAssignment.objects.filter(
            staff=staff,
            status="active",
        ).exclude(
            pk=assignment.pk
        ).update(
            is_primary=False
        )

    return assignment


@transaction.atomic
def update_staff_role_assignment(
    assignment,
    **data
):
    """
    Update an existing staff role assignment.

    Business rules:

    - Staff relationship cannot be changed.
    - An inactive role cannot become an active assignment.
    - Duplicate active role assignments are prevented.
    - Only one active primary role is allowed per staff member.
    """

    # --------------------------------------------------------
    # DETERMINE FINAL VALUES
    # --------------------------------------------------------

    staff = assignment.staff

    role = data.get(
        "role",
        assignment.role
    )

    assignment_status = data.get(
        "status",
        assignment.status
    )

    # --------------------------------------------------------
    # PROTECT STAFF RELATIONSHIP
    # --------------------------------------------------------

    data.pop(
        "staff",
        None
    )

    # --------------------------------------------------------
    # ROLE MUST BE ACTIVE
    # --------------------------------------------------------

    if (
        assignment_status == "active"
        and not role.is_active
    ):
        raise ValidationError(
            "An inactive staff role cannot be assigned "
            "as an active role."
        )

    # --------------------------------------------------------
    # PREVENT DUPLICATE ACTIVE ROLE
    # --------------------------------------------------------

    if assignment_status == "active":

        duplicate_role = (
            StaffRoleAssignment.objects.filter(
                staff=staff,
                role=role,
                status="active",
            )
            .exclude(
                pk=assignment.pk
            )
            .exists()
        )

        if duplicate_role:
            raise ValidationError(
                "This staff member already has "
                "this role assigned as active."
            )

    # --------------------------------------------------------
    # APPLY CHANGES
    # --------------------------------------------------------

    for field, value in data.items():
        setattr(
            assignment,
            field,
            value
        )

    assignment.full_clean()
    assignment.save()

    # --------------------------------------------------------
    # PRIMARY ROLE
    # --------------------------------------------------------

    if assignment.is_primary:

        StaffRoleAssignment.objects.filter(
            staff=staff,
            status="active",
        ).exclude(
            pk=assignment.pk
        ).update(
            is_primary=False
        )

    return assignment


@transaction.atomic
def deactivate_staff_role_assignment(
    assignment
):
    """
    Deactivate a staff role assignment.

    The historical assignment remains in the database.
    """

    assignment.status = "inactive"
    assignment.is_primary = False

    assignment.save(
        update_fields=[
            "status",
            "is_primary",
            "updated_at",
        ]
    )

    return assignment

