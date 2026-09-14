# academics/services.py

from django.core.exceptions import ValidationError
from django.db import transaction

from .models import (
    AcademicYear,
    AcademicTerm,
    AcademicCalendarEvent,
    ClassLevel,
    Stream,
)


# ============================================================
# ACADEMIC YEAR SERVICES
# ============================================================

@transaction.atomic
def create_academic_year(
    *,
    name,
    is_current=False,
    is_active=True,
):
    """
    Create a new academic year.

    Business rules:
        - Academic year name must be unique.
        - Only one academic year can be current.
        - If this year is marked as current, any previous
          current year will automatically be unset.
    """

    if AcademicYear.objects.filter(name=name).exists():
        raise ValidationError({
            "name": (
                f"Academic year '{name}' already exists."
            )
        })

    if is_current:
        AcademicYear.objects.filter(
            is_current=True
        ).update(
            is_current=False
        )

    academic_year = AcademicYear(
        name=name,
        is_current=is_current,
        is_active=is_active,
    )

    academic_year.full_clean()
    academic_year.save()

    return academic_year


@transaction.atomic
def update_academic_year(
    academic_year,
    **validated_data,
):
    """
    Update an existing academic year.

    If the academic year is being made current,
    all other academic years are automatically
    marked as not current.
    """

    is_current = validated_data.get(
        "is_current",
        academic_year.is_current,
    )

    is_active = validated_data.get(
        "is_active",
        academic_year.is_active,
    )

    # --------------------------------------------------------
    # Prevent deactivating the current year accidentally
    # --------------------------------------------------------

    if academic_year.is_current and not is_active:

        raise ValidationError({
            "is_active": (
                "The current academic year cannot be "
                "deactivated. Set another academic year "
                "as current first."
            )
        })

    # --------------------------------------------------------
    # Make this year current
    # --------------------------------------------------------

    if is_current:

        AcademicYear.objects.filter(
            is_current=True
        ).exclude(
            pk=academic_year.pk
        ).update(
            is_current=False
        )

    # --------------------------------------------------------
    # Update fields
    # --------------------------------------------------------

    for field, value in validated_data.items():
        setattr(
            academic_year,
            field,
            value,
        )

    academic_year.full_clean()
    academic_year.save()

    return academic_year


# ============================================================
# ACADEMIC TERM SERVICES
# ============================================================

@transaction.atomic
def create_academic_term(
    *,
    academic_year,
    term,
    start_date,
    end_date,
    is_current=False,
):
    """
    Create an academic term.

    Business rules:
        - A year can have only one instance of each term.
        - Terms cannot overlap.
        - Only one term can be current within an academic year.
        - A current term must belong to the current academic year.
        - The academic year must be active.
    """

    # --------------------------------------------------------
    # Validate academic year
    # --------------------------------------------------------

    if not academic_year.is_active:

        raise ValidationError({
            "academic_year": (
                "Cannot create a term under an inactive "
                "academic year."
            )
        })

    # --------------------------------------------------------
    # Prevent duplicate term
    # --------------------------------------------------------

    if AcademicTerm.objects.filter(
        academic_year=academic_year,
        term=term,
    ).exists():

        raise ValidationError({
            "term": (
                f"{academic_year.name} already has "
                f"{dict(AcademicTerm.TERM_CHOICES).get(term, term)}."
            )
        })

    # --------------------------------------------------------
    # Current term must belong to current academic year
    # --------------------------------------------------------

    if is_current:

        if not academic_year.is_current:

            raise ValidationError({
                "is_current": (
                    "A term can only be marked as current "
                    "if its academic year is current."
                )
            })

        # Unset previous current term
        AcademicTerm.objects.filter(
            academic_year=academic_year,
            is_current=True,
        ).update(
            is_current=False
        )

    # --------------------------------------------------------
    # Create term
    # --------------------------------------------------------

    academic_term = AcademicTerm(
        academic_year=academic_year,
        term=term,
        start_date=start_date,
        end_date=end_date,
        is_current=is_current,
    )

    academic_term.full_clean()
    academic_term.save()

    return academic_term


@transaction.atomic
def update_academic_term(
    academic_term,
    **validated_data,
):
    """
    Update an existing academic term.

    Handles:
        - Term date changes
        - Current term changes
        - Academic year changes
        - Current term validation
    """

    academic_year = validated_data.get(
        "academic_year",
        academic_term.academic_year,
    )

    is_current = validated_data.get(
        "is_current",
        academic_term.is_current,
    )

    # --------------------------------------------------------
    # Validate academic year
    # --------------------------------------------------------

    if not academic_year.is_active:

        raise ValidationError({
            "academic_year": (
                "A term cannot belong to an inactive "
                "academic year."
            )
        })

    # --------------------------------------------------------
    # Check duplicate term if term/year is changed
    # --------------------------------------------------------

    term = validated_data.get(
        "term",
        academic_term.term,
    )

    duplicate_term = (
        AcademicTerm.objects
        .filter(
            academic_year=academic_year,
            term=term,
        )
        .exclude(
            pk=academic_term.pk
        )
        .exists()
    )

    if duplicate_term:

        raise ValidationError({
            "term": (
                "This academic year already contains "
                "this term."
            )
        })

    # --------------------------------------------------------
    # Current term validation
    # --------------------------------------------------------

    if is_current:

        if not academic_year.is_current:

            raise ValidationError({
                "is_current": (
                    "A term can only be marked as current "
                    "if its academic year is current."
                )
            })

        # Unset other current terms in this year
        AcademicTerm.objects.filter(
            academic_year=academic_year,
            is_current=True,
        ).exclude(
            pk=academic_term.pk
        ).update(
            is_current=False
        )

    # --------------------------------------------------------
    # Apply changes
    # --------------------------------------------------------

    for field, value in validated_data.items():
        setattr(
            academic_term,
            field,
            value,
        )

    academic_term.full_clean()
    academic_term.save()

    return academic_term


# ============================================================
# CALENDAR EVENT SERVICES
# ============================================================

@transaction.atomic
def create_calendar_event(
    *,
    academic_year,
    term=None,
    title,
    event_type,
    start_date,
    end_date,
    description="",
    is_school_closed=True,
    is_active=True,
):
    """
    Create an academic calendar event.

    Examples:
        - Mid-term break
        - School holiday
        - Public holiday
        - Examination period
        - Staff day
        - Opening day
        - Closing day

    The model performs the final date and relationship
    validation.
    """

    # --------------------------------------------------------
    # Validate term/year relationship
    # --------------------------------------------------------

    if term:

        if term.academic_year_id != academic_year.id:

            raise ValidationError({
                "term": (
                    "The selected term does not belong "
                    "to the selected academic year."
                )
            })

    # --------------------------------------------------------
    # Validate dates
    # --------------------------------------------------------

    if start_date > end_date:

        raise ValidationError({
            "end_date": (
                "The event end date cannot be before "
                "the event start date."
            )
        })

    # --------------------------------------------------------
    # Prevent duplicate identical events
    # --------------------------------------------------------

    duplicate = AcademicCalendarEvent.objects.filter(
        academic_year=academic_year,
        title=title,
        start_date=start_date,
        end_date=end_date,
    ).exists()

    if duplicate:

        raise ValidationError({
            "title": (
                "An event with the same title and dates "
                "already exists."
            )
        })

    # --------------------------------------------------------
    # Create event
    # --------------------------------------------------------

    event = AcademicCalendarEvent(
        academic_year=academic_year,
        term=term,
        title=title,
        event_type=event_type,
        start_date=start_date,
        end_date=end_date,
        description=description,
        is_school_closed=is_school_closed,
        is_active=is_active,
    )

    event.full_clean()
    event.save()

    return event


@transaction.atomic
def update_calendar_event(
    event,
    **validated_data,
):
    """
    Update an existing academic calendar event.
    """

    academic_year = validated_data.get(
        "academic_year",
        event.academic_year,
    )

    term = validated_data.get(
        "term",
        event.term,
    )

    start_date = validated_data.get(
        "start_date",
        event.start_date,
    )

    end_date = validated_data.get(
        "end_date",
        event.end_date,
    )

    # --------------------------------------------------------
    # Validate term/year relationship
    # --------------------------------------------------------

    if term:

        if term.academic_year_id != academic_year.id:

            raise ValidationError({
                "term": (
                    "The selected term does not belong "
                    "to the selected academic year."
                )
            })

    # --------------------------------------------------------
    # Validate dates
    # --------------------------------------------------------

    if start_date > end_date:

        raise ValidationError({
            "end_date": (
                "The event end date cannot be before "
                "the event start date."
            )
        })

    # --------------------------------------------------------
    # Apply changes
    # --------------------------------------------------------

    for field, value in validated_data.items():
        setattr(
            event,
            field,
            value,
        )

    event.full_clean()
    event.save()

    return event


# ============================================================
# CLASS LEVEL / GRADE SERVICES
# ============================================================

@transaction.atomic
def create_class_level(
    *,
    name,
    code,
    description="",
    display_order=0,
    is_active=True,
):
    """
    Create a new class level/grade.

    Examples:
        PP1
        PP2
        Grade 1
        Grade 2
        Grade 7
        Grade 8
        Grade 9
    """

    # --------------------------------------------------------
    # Check duplicate name
    # --------------------------------------------------------

    if ClassLevel.objects.filter(
        name=name
    ).exists():

        raise ValidationError({
            "name": (
                f"A class level named '{name}' already exists."
            )
        })

    # --------------------------------------------------------
    # Check duplicate code
    # --------------------------------------------------------

    if ClassLevel.objects.filter(
        code=code
    ).exists():

        raise ValidationError({
            "code": (
                f"A class level with code '{code}' "
                "already exists."
            )
        })

    # --------------------------------------------------------
    # Create class level
    # --------------------------------------------------------

    class_level = ClassLevel(
        name=name,
        code=code,
        description=description,
        display_order=display_order,
        is_active=is_active,
    )

    class_level.full_clean()
    class_level.save()

    return class_level


@transaction.atomic
def update_class_level(
    class_level,
    **validated_data,
):
    """
    Update an existing class level.
    """

    name = validated_data.get(
        "name",
        class_level.name,
    )

    code = validated_data.get(
        "code",
        class_level.code,
    )

    # --------------------------------------------------------
    # Duplicate name
    # --------------------------------------------------------

    if (
        ClassLevel.objects
        .filter(name=name)
        .exclude(pk=class_level.pk)
        .exists()
    ):

        raise ValidationError({
            "name": (
                f"A class level named '{name}' "
                "already exists."
            )
        })

    # --------------------------------------------------------
    # Duplicate code
    # --------------------------------------------------------

    if (
        ClassLevel.objects
        .filter(code=code)
        .exclude(pk=class_level.pk)
        .exists()
    ):

        raise ValidationError({
            "code": (
                f"A class level with code '{code}' "
                "already exists."
            )
        })

    # --------------------------------------------------------
    # Apply changes
    # --------------------------------------------------------

    for field, value in validated_data.items():
        setattr(
            class_level,
            field,
            value,
        )

    class_level.full_clean()
    class_level.save()

    return class_level


# ============================================================
# STREAM SERVICES
# ============================================================

@transaction.atomic
def create_stream(
    *,
    class_level,
    name,
    code,
    is_active=True,
):
    """
    Create a stream within a class level.

    Examples:

        Grade 7
            - A
            - B
            - C

        Grade 8
            - A
            - B
    """

    # --------------------------------------------------------
    # Validate class level
    # --------------------------------------------------------

    if not class_level.is_active:

        raise ValidationError({
            "class_level": (
                "Cannot create a stream under "
                "an inactive class level."
            )
        })

    # --------------------------------------------------------
    # Duplicate stream name
    # --------------------------------------------------------

    if Stream.objects.filter(
        class_level=class_level,
        name=name,
    ).exists():

        raise ValidationError({
            "name": (
                f"Stream '{name}' already exists "
                f"under {class_level.name}."
            )
        })

    # --------------------------------------------------------
    # Duplicate stream code
    # --------------------------------------------------------

    if Stream.objects.filter(
        class_level=class_level,
        code=code,
    ).exists():

        raise ValidationError({
            "code": (
                f"Stream code '{code}' already exists "
                f"under {class_level.name}."
            )
        })

    # --------------------------------------------------------
    # Create stream
    # --------------------------------------------------------

    stream = Stream(
        class_level=class_level,
        name=name,
        code=code,
        is_active=is_active,
    )

    stream.full_clean()
    stream.save()

    return stream


@transaction.atomic
def update_stream(
    stream,
    **validated_data,
):
    """
    Update an existing stream.
    """

    class_level = validated_data.get(
        "class_level",
        stream.class_level,
    )

    name = validated_data.get(
        "name",
        stream.name,
    )

    code = validated_data.get(
        "code",
        stream.code,
    )

    # --------------------------------------------------------
    # Validate class level
    # --------------------------------------------------------

    if not class_level.is_active:

        raise ValidationError({
            "class_level": (
                "A stream cannot belong to "
                "an inactive class level."
            )
        })

    # --------------------------------------------------------
    # Duplicate name
    # --------------------------------------------------------

    if (
        Stream.objects
        .filter(
            class_level=class_level,
            name=name,
        )
        .exclude(pk=stream.pk)
        .exists()
    ):

        raise ValidationError({
            "name": (
                f"Stream '{name}' already exists "
                f"under {class_level.name}."
            )
        })

    # --------------------------------------------------------
    # Duplicate code
    # --------------------------------------------------------

    if (
        Stream.objects
        .filter(
            class_level=class_level,
            code=code,
        )
        .exclude(pk=stream.pk)
        .exists()
    ):

        raise ValidationError({
            "code": (
                f"Stream code '{code}' already exists "
                f"under {class_level.name}."
            )
        })

    # --------------------------------------------------------
    # Apply changes
    # --------------------------------------------------------

    for field, value in validated_data.items():
        setattr(
            stream,
            field,
            value,
        )

    stream.full_clean()
    stream.save()

    return stream

