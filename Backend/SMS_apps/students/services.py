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
    StudentProgression,
)


# ============================================================
# FAMILY SERVICES
# ============================================================

@transaction.atomic
def create_family(**data):
    """
    Create a new family.

    Family ID is generated automatically by the model.
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

    Admission number is entered by the user and must follow
    the configured school admission-number format.

    Academic placement is handled separately through
    StudentEnrollment.
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
    student_parent,
    **data
):
    """
    Update an existing student-parent relationship.

    Maintains the rule that a student can have only one
    primary parent/guardian relationship.

    The same parent/guardian may be primary for multiple
    different students.
    """

    # --------------------------------------------------------
    # APPLY CHANGES
    # --------------------------------------------------------

    for field, value in data.items():
        setattr(
            student_parent,
            field,
            value
        )

    # --------------------------------------------------------
    # PRIMARY PARENT/GUARDIAN
    # --------------------------------------------------------

    if student_parent.is_primary:

        StudentParent.objects.filter(
            student=student_parent.student
        ).exclude(
            pk=student_parent.pk
        ).update(
            is_primary=False
        )

    # --------------------------------------------------------
    # VALIDATE AND SAVE
    # --------------------------------------------------------

    student_parent.full_clean()
    student_parent.save()

    return student_parent

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

    StudentEnrollment is responsible for:
    - Grade/Class
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
# STUDENT PROGRESSION SERVICES
# ============================================================

@transaction.atomic
def process_student_progression(
    student,
    from_enrollment,
    decision,
    to_academic_year,
    to_class_level=None,
    to_stream=None,
    remarks="",
):
    """
    Process a student's academic progression.

    Supported decisions:
    - promoted
    - repeating
    - transferred
    - graduated
    - withdrawn

    PROMOTED
    --------
    The student moves to the configured next class level.

    REPEATING
    ---------
    The student remains in the same class level unless
    another class level is explicitly supplied.

    TRANSFERRED
    -----------
    No new enrollment is created.
    The current enrollment is closed as transferred.
    The student status becomes transferred.

    GRADUATED
    ---------
    No new enrollment is created.
    The current enrollment is closed as completed.
    The student status becomes graduated.

    WITHDRAWN
    ---------
    No new enrollment is created.
    The current enrollment is closed as withdrawn.
    The student status becomes withdrawn.

    For promoted/repeating students:
    - The previous enrollment is marked completed.
    - A new enrollment is created.
    - The previous enrollment is never overwritten.
    - The progression record points to both enrollments.

    The entire operation is atomic. If any part fails,
    the database transaction is rolled back.
    """

    # ========================================================
    # BASIC VALIDATION
    # ========================================================

    if not student:
        raise ValidationError(
            "A student is required."
        )

    if not from_enrollment:
        raise ValidationError(
            "The student's current enrollment is required."
        )

    if not to_academic_year:
        raise ValidationError(
            "The target academic year is required."
        )

    valid_decisions = {
        choice[0]
        for choice in StudentProgression.DECISION_CHOICES
    }

    if decision not in valid_decisions:
        raise ValidationError(
            "Invalid progression decision."
        )

    # ========================================================
    # SOURCE ENROLLMENT VALIDATION
    # ========================================================

    if from_enrollment.student_id != student.id:
        raise ValidationError(
            "The source enrollment does not belong "
            "to this student."
        )

    if from_enrollment.status != "active":
        raise ValidationError(
            "Only an active enrollment can be processed "
            "for progression."
        )

    # ========================================================
    # PREVENT DUPLICATE PROGRESSION
    # ========================================================

    if StudentProgression.objects.filter(
        from_enrollment=from_enrollment
    ).exists():

        raise ValidationError(
            "This enrollment has already been processed "
            "through a progression decision."
        )

    # ========================================================
    # EXIT DECISIONS
    # ========================================================

    exit_decisions = {
        "transferred",
        "graduated",
        "withdrawn",
    }

    if decision in exit_decisions:

        # ----------------------------------------------------
        # EXIT DECISIONS MUST NOT HAVE TARGET PLACEMENT
        # ----------------------------------------------------

        if to_class_level:
            raise ValidationError(
                "Transferred, graduated, and withdrawn "
                "students cannot have a target class."
            )

        if to_stream:
            raise ValidationError(
                "Transferred, graduated, and withdrawn "
                "students cannot have a target stream."
            )

        # ----------------------------------------------------
        # CREATE PROGRESSION RECORD
        # ----------------------------------------------------

        progression = StudentProgression(
            student=student,
            from_enrollment=from_enrollment,
            to_academic_year=to_academic_year,
            decision=decision,
            remarks=remarks,
        )

        progression.full_clean()
        progression.save()

        # ----------------------------------------------------
        # DETERMINE FINAL ENROLLMENT STATUS
        # ----------------------------------------------------
        #
        # Student.status and StudentEnrollment.status have
        # different responsibilities.
        #
        # "graduated" exists on Student.status, but not on
        # StudentEnrollment.status.
        #
        # Therefore:
        #
        # graduated  -> completed enrollment
        # transferred -> transferred enrollment
        # withdrawn   -> withdrawn enrollment
        # ----------------------------------------------------

        if decision == "graduated":
            enrollment_status = "completed"

        elif decision == "transferred":
            enrollment_status = "transferred"

        else:
            enrollment_status = "withdrawn"

        # ----------------------------------------------------
        # CLOSE CURRENT ENROLLMENT
        # ----------------------------------------------------

        from_enrollment.status = enrollment_status
        from_enrollment.exit_date = progression.decision_date
        from_enrollment.exit_reason = decision

        from_enrollment.save(
            update_fields=[
                "status",
                "exit_date",
                "exit_reason",
                "updated_at",
            ]
        )

        # ----------------------------------------------------
        # UPDATE PERMANENT STUDENT STATUS
        # ----------------------------------------------------

        student.status = decision

        student.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return progression

    # ========================================================
    # PROMOTED / REPEATING
    # ========================================================

    if decision not in {
        "promoted",
        "repeating",
    }:
        raise ValidationError(
            "Unsupported progression decision."
        )

    # ========================================================
    # TARGET CLASS
    # ========================================================

    if decision == "promoted":

        # ----------------------------------------------------
        # USE CONFIGURED NEXT CLASS
        # ----------------------------------------------------

        if not to_class_level:

            to_class_level = (
                from_enrollment
                .class_level
                .next_class_level
            )

        # ----------------------------------------------------
        # FINAL CLASS VALIDATION
        # ----------------------------------------------------

        if not to_class_level:

            raise ValidationError(
                "This class level has no configured "
                "next class level. It may be the final "
                "class in the school."
            )

    elif decision == "repeating":

        # ----------------------------------------------------
        # DEFAULT TO SAME CLASS
        # ----------------------------------------------------

        if not to_class_level:
            to_class_level = from_enrollment.class_level

    # ========================================================
    # TARGET STREAM
    # ========================================================

    if to_stream:

        if (
            to_stream.class_level_id
            != to_class_level.id
        ):
            raise ValidationError(
                "The selected target stream does not "
                "belong to the selected target class level."
            )

    else:

        # ----------------------------------------------------
        # DEFAULT TO PREVIOUS STREAM WHEN POSSIBLE
        # ----------------------------------------------------

        if (
            from_enrollment.stream
            and
            from_enrollment.stream.class_level_id
            == to_class_level.id
        ):
            to_stream = from_enrollment.stream

    # ========================================================
    # PREVENT DUPLICATE TARGET ENROLLMENT
    # ========================================================

    if StudentEnrollment.objects.filter(
        student=student,
        academic_year=to_academic_year,
    ).exists():

        raise ValidationError(
            "This student already has an enrollment "
            "record for the target academic year."
        )

    # ========================================================
    # CREATE PROGRESSION AUDIT RECORD
    # ========================================================

    progression = StudentProgression(
        student=student,
        from_enrollment=from_enrollment,
        to_academic_year=to_academic_year,
        to_class_level=to_class_level,
        to_stream=to_stream,
        decision=decision,
        remarks=remarks,
    )

    progression.full_clean()
    progression.save()

    # ========================================================
    # COMPLETE PREVIOUS ENROLLMENT
    # ========================================================

    from_enrollment.status = "completed"
    from_enrollment.exit_date = progression.decision_date
    from_enrollment.exit_reason = decision

    from_enrollment.save(
        update_fields=[
            "status",
            "exit_date",
            "exit_reason",
            "updated_at",
        ]
    )

    # ========================================================
    # CREATE NEW ENROLLMENT
    # ========================================================

    new_enrollment = StudentEnrollment(
        student=student,
        academic_year=to_academic_year,
        class_level=to_class_level,
        stream=to_stream,
        enrollment_date=to_academic_year.start_date,
        status="active",
    )

    # --------------------------------------------------------
    # RUN MODEL VALIDATION
    # --------------------------------------------------------

    new_enrollment.full_clean()
    new_enrollment.save()

    # ========================================================
    # CONNECT PROGRESSION TO NEW ENROLLMENT
    # ========================================================

    progression.to_enrollment = new_enrollment

    progression.full_clean()
    progression.save(
        update_fields=[
            "to_enrollment",
            "updated_at",
        ]
    )

    # ========================================================
    # RETURN PROGRESSION RECORD
    # ========================================================

    return progression


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

    The physical document record remains available for
    historical/reference purposes.
    """

    document.is_active = False

    document.save(
        update_fields=[
            "is_active",
        ]
    )

    return document

# ==================================================
# BATCH STUDENT PROGRESSION
# ==================================================

@transaction.atomic
def process_batch_student_progression(
    *,
    student_ids,
    from_academic_year,
    from_class_level,
    to_academic_year,
    decision,
    processed_by=None,
    student_overrides=None,
    remarks="",
):
    """
    Process progression for multiple students.

    student_overrides example:

    {
        "12": {
            "to_class_level": 5,
            "to_stream": 3,
        },
        "15": {
            "to_class_level": 6,
            "to_stream": 4,
        },
    }

    Important:
    - Each student is processed using their own current enrollment.
    - Promoted students default to ClassLevel.next_class_level.
    - Repeating students default to their current class.
    - Both promoted and repeating students default to their
      current stream where valid.
    - Transferred, graduated and withdrawn students do not receive
      a new enrollment.
    """

    if not student_ids:
        raise ValidationError(
            "At least one student must be selected."
        )

    student_overrides = student_overrides or {}

    valid_decisions = {
        "promoted",
        "repeating",
        "transferred",
        "graduated",
        "withdrawn",
    }

    if decision not in valid_decisions:
        raise ValidationError(
            f"Invalid progression decision: {decision}"
        )

    results = []

    # --------------------------------------------------
    # Process each student independently
    # --------------------------------------------------

    for student_id in student_ids:

        student = Student.objects.get(
            pk=student_id
        )

        # ----------------------------------------------
        # Find source enrollment
        # ----------------------------------------------

        source_enrollment = (
            StudentEnrollment.objects
            .select_related(
                "student",
                "academic_year",
                "class_level",
                "stream",
            )
            .filter(
                student=student,
                academic_year=from_academic_year,
                class_level=from_class_level,
            )
            .first()
        )

        if not source_enrollment:
            raise ValidationError(
                f"{student} does not have an enrollment "
                f"in the selected source class and academic year."
            )

        # ----------------------------------------------
        # Prevent duplicate progression
        # ----------------------------------------------

        if hasattr(source_enrollment, "progression_from"):
            raise ValidationError(
                f"{student} has already been processed "
                f"from this enrollment."
            )

        # ----------------------------------------------
        # Determine override
        # ----------------------------------------------

        override = student_overrides.get(
            str(student.id),
            {}
        )

        override_class_id = override.get(
            "to_class_level"
        )

        override_stream_id = override.get(
            "to_stream"
        )

        to_class_level = None
        to_stream = None

        # ----------------------------------------------
        # PROMOTED
        # ----------------------------------------------

        if decision == "promoted":

            if override_class_id:
                from .models import ClassLevel, Stream

                to_class_level = ClassLevel.objects.get(
                    pk=override_class_id
                )
            else:
                to_class_level = (
                    source_enrollment
                    .class_level
                    .next_class_level
                )

                if not to_class_level:
                    raise ValidationError(
                        f"{student} is already in the final "
                        f"class because no next class is configured "
                        f"for {source_enrollment.class_level.name}."
                    )

            # Default to same stream
            if override_stream_id:
                from .models import Stream

                to_stream = Stream.objects.get(
                    pk=override_stream_id
                )
            else:
                current_stream = source_enrollment.stream

                if (
                    current_stream
                    and current_stream.class_level_id
                    == to_class_level.id
                ):
                    to_stream = current_stream

        # ----------------------------------------------
        # REPEATING
        # ----------------------------------------------

        elif decision == "repeating":

            if override_class_id:
                from .models import ClassLevel

                to_class_level = ClassLevel.objects.get(
                    pk=override_class_id
                )
            else:
                to_class_level = (
                    source_enrollment.class_level
                )

            if override_stream_id:
                from .models import Stream

                to_stream = Stream.objects.get(
                    pk=override_stream_id
                )
            else:
                to_stream = source_enrollment.stream

        # ----------------------------------------------
        # EXIT DECISIONS
        # ----------------------------------------------

        elif decision in {
            "transferred",
            "graduated",
            "withdrawn",
        }:

            to_class_level = None
            to_stream = None

        # ----------------------------------------------
        # Validate stream belongs to class
        # ----------------------------------------------

        if to_stream and (
            to_stream.class_level_id
            != to_class_level.id
        ):
            raise ValidationError(
                f"Selected stream for {student} does not "
                f"belong to the selected target class."
            )

        # ----------------------------------------------
        # Prevent duplicate target enrollment
        # ----------------------------------------------

        if decision in {"promoted", "repeating"}:

            existing_target = (
                StudentEnrollment.objects
                .filter(
                    student=student,
                    academic_year=to_academic_year,
                )
                .first()
            )

            if existing_target:
                raise ValidationError(
                    f"{student} already has an enrollment "
                    f"for academic year "
                    f"{to_academic_year.name}."
                )

        # ----------------------------------------------
        # Complete old enrollment
        # ----------------------------------------------

        source_enrollment.status = "completed"
        source_enrollment.exit_date = (
            to_academic_year.start_date
            if hasattr(
                to_academic_year,
                "start_date",
            )
            else None
        )
        source_enrollment.save()

        # ----------------------------------------------
        # Create progression record
        # ----------------------------------------------

        progression = StudentProgression.objects.create(
            student=student,
            from_enrollment=source_enrollment,
            to_academic_year=to_academic_year,
            to_class_level=to_class_level,
            to_stream=to_stream,
            decision=decision,
            remarks=remarks,
        )

        # ----------------------------------------------
        # Create new enrollment
        # ----------------------------------------------

        new_enrollment = None

        if decision in {
            "promoted",
            "repeating",
        }:

            new_enrollment = StudentEnrollment.objects.create(
                student=student,
                academic_year=to_academic_year,
                class_level=to_class_level,
                stream=to_stream,
                enrollment_date=to_academic_year.start_date,
                status="active",
                previous_school=source_enrollment.previous_school,
            )

            progression.to_enrollment = new_enrollment
            progression.save(
                update_fields=[
                    "to_enrollment",
                    "updated_at",
                ]
            )

        # ----------------------------------------------
        # Student-level exit statuses
        # ----------------------------------------------

        if decision == "graduated":
            student.status = "graduated"

        elif decision == "transferred":
            student.status = "transferred"

        elif decision == "withdrawn":
            student.status = "withdrawn"

        elif decision in {
            "promoted",
            "repeating",
        }:
            student.status = "active"

        student.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        # ----------------------------------------------
        # Result
        # ----------------------------------------------

        results.append({
            "student_id": student.id,
            "student_name": student.full_name,
            "progression_id": progression.id,
            "to_enrollment_id": (
                new_enrollment.id
                if new_enrollment
                else None
            ),
            "decision": decision,
        })

    return results

