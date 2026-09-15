from django.db import transaction
from django.core.exceptions import ValidationError

from .models import (
    Family,
    ParentGuardian,
    Student,
    StudentParent,
    StudentEnrollment,
    EmergencyContact,
    StudentDocument,
)


# ============================================================
# FAMILY SERVICES
# ============================================================

@transaction.atomic
def create_family(**data):
    """
    Create a new family.

    Family ID is generated automatically by the model.

    Family information includes:
    - Family name
    - Current residence
    - Physical address
    - Town/locality
    - County
    - Sub-county
    - Postal address
    """

    family = Family(**data)

    family.full_clean()
    family.save()

    return family


@transaction.atomic
def update_family(family, **data):
    """
    Update an existing family.
    """

    for field, value in data.items():
        setattr(family, field, value)

    family.full_clean()
    family.save()

    return family


@transaction.atomic
def deactivate_family(family):
    """
    Soft-delete/deactivate a family.

    The family record is retained for historical records.
    """

    family.is_active = False

    family.save(
        update_fields=[
            "is_active",
            "updated_at",
        ]
    )

    return family


# ============================================================
# PARENT / GUARDIAN SERVICES
# ============================================================

@transaction.atomic
def create_parent_guardian(**data):
    """
    Create a parent/guardian.

    Parent/guardian information includes:
    - Personal details
    - National ID
    - Phone numbers
    - Email
    - Occupation
    - Employer/company
    - Address
    - Family association
    """

    parent_guardian = ParentGuardian(**data)

    parent_guardian.full_clean()
    parent_guardian.save()

    return parent_guardian


@transaction.atomic
def update_parent_guardian(
    parent_guardian,
    **data
):
    """
    Update an existing parent/guardian.
    """

    for field, value in data.items():
        setattr(parent_guardian, field, value)

    parent_guardian.full_clean()
    parent_guardian.save()

    return parent_guardian


@transaction.atomic
def deactivate_parent_guardian(
    parent_guardian
):
    """
    Soft-delete/deactivate a parent/guardian.

    The parent/guardian record remains available for
    historical student relationships.
    """

    parent_guardian.is_active = False

    parent_guardian.save(
        update_fields=[
            "is_active",
            "updated_at",
        ]
    )

    return parent_guardian


# ============================================================
# STUDENT SERVICES
# ============================================================

@transaction.atomic
def create_student(**data):
    """
    Create a new student.

    Student ID is generated automatically by the model.

    Student information includes:
    - Permanent admission information
    - Personal details
    - Birth certificate information
    - Residence/origin information
    - NEMIS/KEMIS information
    - Child Assessment Number
    - Religion
    - Medical/allergy information
    - Special abilities/talents
    - Student photograph
    - Student status

    Academic placement such as:
    - Grade/Class
    - Stream
    - Academic Year
    - Enrollment date

    is handled separately by StudentEnrollment.
    """

    student = Student(**data)

    student.full_clean()
    student.save()

    return student


@transaction.atomic
def update_student(
    student,
    **data
):
    """
    Update an existing student.

    This service supports all Student model fields,
    including the admission-form information:

    - Religion
    - Birth certificate submitted status
    - Allergies/illnesses
    - Medical conditions
    - Special abilities
    - Special ability description

    Academic placement remains managed through
    StudentEnrollment.
    """

    for field, value in data.items():
        setattr(student, field, value)

    student.full_clean()
    student.save()

    return student


@transaction.atomic
def deactivate_student(student):
    """
    Soft-delete/deactivate a student.

    The student record remains available for historical
    academic and administrative records.
    """

    student.status = "inactive"

    student.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return student


# ============================================================
# STUDENT ↔ PARENT/GUARDIAN SERVICES
# ============================================================

@transaction.atomic
def create_student_parent_relationship(**data):
    """
    Create a relationship between a student and
    a parent/guardian.

    Prevents duplicate student-parent relationships.

    If the relationship is marked as primary, all other
    parent/guardian relationships for the same student
    are automatically changed to non-primary.
    """

    student = data.get("student")

    parent_guardian = data.get(
        "parent_guardian"
    )

    # --------------------------------------------------------
    # REQUIRED RELATIONSHIPS
    # --------------------------------------------------------

    if not student:
        raise ValidationError(
            "A student is required."
        )

    if not parent_guardian:
        raise ValidationError(
            "A parent/guardian is required."
        )

    # --------------------------------------------------------
    # PREVENT DUPLICATE RELATIONSHIP
    # --------------------------------------------------------

    if StudentParent.objects.filter(
        student=student,
        parent_guardian=parent_guardian,
    ).exists():

        raise ValidationError(
            "This parent/guardian is already linked "
            "to this student."
        )

    relationship = StudentParent(
        **data
    )

    relationship.full_clean()
    relationship.save()

    # --------------------------------------------------------
    # PRIMARY PARENT/GUARDIAN
    # --------------------------------------------------------

    if relationship.is_primary:

        StudentParent.objects.filter(
            student=student
        ).exclude(
            pk=relationship.pk
        ).update(
            is_primary=False
        )

    return relationship


@transaction.atomic
def update_student_parent_relationship(
    relationship,
    **data
):
    """
    Update an existing student-parent relationship.

    Maintains the rule that a student can have only one
    primary parent/guardian relationship.
    """

    # --------------------------------------------------------
    # APPLY CHANGES
    # --------------------------------------------------------

    for field, value in data.items():
        setattr(
            relationship,
            field,
            value
        )

    relationship.full_clean()
    relationship.save()

    # --------------------------------------------------------
    # PRIMARY PARENT/GUARDIAN
    # --------------------------------------------------------

    if relationship.is_primary:

        StudentParent.objects.filter(
            student=relationship.student
        ).exclude(
            pk=relationship.pk
        ).update(
            is_primary=False
        )

    return relationship


@transaction.atomic
def delete_student_parent_relationship(
    relationship
):
    """
    Permanently remove a student-parent relationship.

    The student and parent/guardian records themselves
    remain intact.
    """

    relationship.delete()


# ============================================================
# STUDENT ENROLLMENT SERVICES
# ============================================================

@transaction.atomic
def create_student_enrollment(**data):
    """
    Create a student enrollment.

    Validates:
    - Student
    - Academic year
    - Class level
    - Stream/class relationship
    - Duplicate academic-year enrollment
    - Multiple active enrollments

    StudentEnrollment is responsible for information such as:
    - Grade/Class applying for
    - Academic year
    - Stream
    - Enrollment date
    - Previous school
    - Enrollment status
    """

    student = data.get("student")

    academic_year = data.get(
        "academic_year"
    )

    class_level = data.get(
        "class_level"
    )

    stream = data.get(
        "stream"
    )

    # --------------------------------------------------------
    # REQUIRED RELATIONSHIPS
    # --------------------------------------------------------

    if not student:
        raise ValidationError(
            "A student is required."
        )

    if not academic_year:
        raise ValidationError(
            "An academic year is required."
        )

    if not class_level:
        raise ValidationError(
            "A class level is required."
        )

    # --------------------------------------------------------
    # STREAM MUST BELONG TO CLASS LEVEL
    # --------------------------------------------------------

    if (
        stream
        and stream.class_level_id != class_level.id
    ):
        raise ValidationError(
            "The selected stream does not belong "
            "to the selected class level."
        )

    # --------------------------------------------------------
    # PREVENT DUPLICATE YEAR ENROLLMENT
    # --------------------------------------------------------

    if StudentEnrollment.objects.filter(
        student=student,
        academic_year=academic_year,
    ).exists():

        raise ValidationError(
            "This student already has an enrollment "
            "record for the selected academic year."
        )

    # --------------------------------------------------------
    # PREVENT MULTIPLE ACTIVE ENROLLMENTS
    # --------------------------------------------------------

    enrollment_status = data.get(
        "status",
        "active"
    )

    if enrollment_status == "active":

        if StudentEnrollment.objects.filter(
            student=student,
            status="active",
        ).exists():

            raise ValidationError(
                "This student already has an active "
                "enrollment."
            )

    # --------------------------------------------------------
    # CREATE ENROLLMENT
    # --------------------------------------------------------

    enrollment = StudentEnrollment(
        **data
    )

    enrollment.full_clean()
    enrollment.save()

    return enrollment


@transaction.atomic
def update_student_enrollment(
    enrollment,
    **data
):
    """
    Update an existing student enrollment.

    Handles:
    - Student changes
    - Academic year changes
    - Class changes
    - Stream changes
    - Status changes
    - Previous school
    - Enrollment dates

    Prevents:
    - Invalid stream/class combinations
    - Duplicate academic-year enrollments
    - Multiple active enrollments
    """

    student = data.get(
        "student",
        enrollment.student
    )

    academic_year = data.get(
        "academic_year",
        enrollment.academic_year
    )

    class_level = data.get(
        "class_level",
        enrollment.class_level
    )

    stream = data.get(
        "stream",
        enrollment.stream
    )

    status = data.get(
        "status",
        enrollment.status
    )

    # --------------------------------------------------------
    # STREAM / CLASS VALIDATION
    # --------------------------------------------------------

    if (
        stream
        and stream.class_level_id != class_level.id
    ):
        raise ValidationError(
            "The selected stream does not belong "
            "to the selected class level."
        )

    # --------------------------------------------------------
    # PREVENT DUPLICATE ACADEMIC YEAR
    # --------------------------------------------------------

    duplicate = (
        StudentEnrollment.objects.filter(
            student=student,
            academic_year=academic_year,
        )
        .exclude(
            pk=enrollment.pk
        )
        .exists()
    )

    if duplicate:

        raise ValidationError(
            "This student already has an enrollment "
            "record for the selected academic year."
        )

    # --------------------------------------------------------
    # PREVENT MULTIPLE ACTIVE ENROLLMENTS
    # --------------------------------------------------------

    if status == "active":

        active_enrollment = (
            StudentEnrollment.objects.filter(
                student=student,
                status="active",
            )
            .exclude(
                pk=enrollment.pk
            )
            .exists()
        )

        if active_enrollment:

            raise ValidationError(
                "This student already has another "
                "active enrollment."
            )

    # --------------------------------------------------------
    # APPLY CHANGES
    # --------------------------------------------------------

    for field, value in data.items():
        setattr(
            enrollment,
            field,
            value
        )

    enrollment.full_clean()
    enrollment.save()

    return enrollment


@transaction.atomic
def deactivate_student_enrollment(
    enrollment
):
    """
    Mark an enrollment as inactive.

    The historical enrollment record is retained.
    """

    enrollment.status = "inactive"

    enrollment.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return enrollment


# ============================================================
# EMERGENCY CONTACT SERVICES
# ============================================================

@transaction.atomic
def create_emergency_contact(**data):
    """
    Create an emergency contact.

    An emergency contact does not necessarily have to be
    a parent/guardian.

    Each student can only have one contact per priority.
    """

    student = data.get(
        "student"
    )

    priority = data.get(
        "priority",
        1
    )

    # --------------------------------------------------------
    # REQUIRED STUDENT
    # --------------------------------------------------------

    if not student:

        raise ValidationError(
            "A student is required."
        )

    # --------------------------------------------------------
    # PREVENT DUPLICATE PRIORITY
    # --------------------------------------------------------

    if EmergencyContact.objects.filter(
        student=student,
        priority=priority,
    ).exists():

        raise ValidationError(
            f"Priority {priority} is already assigned "
            "to another emergency contact for this student."
        )

    # --------------------------------------------------------
    # CREATE CONTACT
    # --------------------------------------------------------

    contact = EmergencyContact(
        **data
    )

    contact.full_clean()
    contact.save()

    return contact


@transaction.atomic
def update_emergency_contact(
    contact,
    **data
):
    """
    Update an emergency contact.

    Prevents duplicate emergency-contact priorities
    for the same student.
    """

    student = data.get(
        "student",
        contact.student
    )

    priority = data.get(
        "priority",
        contact.priority
    )

    # --------------------------------------------------------
    # PREVENT DUPLICATE PRIORITY
    # --------------------------------------------------------

    duplicate = (
        EmergencyContact.objects.filter(
            student=student,
            priority=priority,
        )
        .exclude(
            pk=contact.pk
        )
        .exists()
    )

    if duplicate:

        raise ValidationError(
            f"Priority {priority} is already assigned "
            "to another emergency contact for this student."
        )

    # --------------------------------------------------------
    # APPLY CHANGES
    # --------------------------------------------------------

    for field, value in data.items():
        setattr(
            contact,
            field,
            value
        )

    contact.full_clean()
    contact.save()

    return contact


@transaction.atomic
def deactivate_emergency_contact(
    contact
):
    """
    Soft-delete/deactivate an emergency contact.
    """

    contact.is_active = False

    contact.save(
        update_fields=[
            "is_active",
            "updated_at",
        ]
    )

    return contact


# ============================================================
# STUDENT DOCUMENT SERVICES
# ============================================================

@transaction.atomic
def create_student_document(
    uploaded_by,
    **data
):
    """
    Create a student document.

    The authenticated user is automatically recorded
    as the uploader.

    Supported documents include:
    - Birth certificate
    - Previous school report
    - Transfer certificate
    - Medical form
    - Medical document
    - Admission form
    - Parent/guardian document
    - Other documents
    """

    # --------------------------------------------------------
    # AUTHENTICATED UPLOADER
    # --------------------------------------------------------

    if not uploaded_by:

        raise ValidationError(
            "An authenticated user is required "
            "to upload a student document."
        )

    # --------------------------------------------------------
    # REQUIRED STUDENT
    # --------------------------------------------------------

    student = data.get(
        "student"
    )

    if not student:

        raise ValidationError(
            "A student is required."
        )

    # --------------------------------------------------------
    # CREATE DOCUMENT
    # --------------------------------------------------------

    document = StudentDocument(
        uploaded_by=uploaded_by,
        **data
    )

    document.full_clean()
    document.save()

    return document


@transaction.atomic
def update_student_document(
    document,
    **data
):
    """
    Update student document information.

    The original uploader is preserved.

    uploaded_by cannot be changed through this service.
    """

    # --------------------------------------------------------
    # PRESERVE ORIGINAL UPLOADER
    # --------------------------------------------------------

    data.pop(
        "uploaded_by",
        None
    )

    # --------------------------------------------------------
    # APPLY CHANGES
    # --------------------------------------------------------

    for field, value in data.items():
        setattr(
            document,
            field,
            value
        )

    document.full_clean()
    document.save()

    return document


@transaction.atomic
def deactivate_student_document(
    document
):
    """
    Soft-delete/deactivate a student document.

    The physical document record remains available
    for historical/reference purposes.
    """

    document.is_active = False

    document.save(
        update_fields=[
            "is_active",
        ]
    )

    return document

