from django.core.exceptions import ValidationError
from django.db import models


# ============================================================
# ACADEMIC YEAR
# ============================================================

class AcademicYear(models.Model):
    """
    Represents one complete academic year.

    An academic year consistently contains three terms:
        - Term 1
        - Term 2
        - Term 3

    The actual start and end dates of the academic year are
    derived from the dates of its terms.
    """

    name = models.CharField(
        max_length=20,
        unique=True,
        help_text="Example: 2026",
    )

    is_current = models.BooleanField(
        default=False,
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
        ordering = ["-name"]

    def __str__(self):
        return self.name

    @property
    def start_date(self):
        """
        Returns the academic year's start date based on
        the earliest term start date.
        """
        first_term = self.terms.order_by("start_date").first()

        return first_term.start_date if first_term else None

    @property
    def end_date(self):
        """
        Returns the academic year's end date based on
        the latest term end date.
        """
        last_term = self.terms.order_by("-end_date").first()

        return last_term.end_date if last_term else None

    def clean(self):
        """
        Ensure that only one academic year is marked as current.
        """

        if self.is_current:
            existing_current = (
                AcademicYear.objects
                .filter(is_current=True)
                .exclude(pk=self.pk)
                .exists()
            )

            if existing_current:
                raise ValidationError({
                    "is_current": (
                        "Only one academic year can be marked as current."
                    )
                })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


# ============================================================
# ACADEMIC TERM
# ============================================================

class AcademicTerm(models.Model):
    """
    Represents one of the three terms within an academic year.
    """

    TERM_CHOICES = [
        ("term_1", "Term 1"),
        ("term_2", "Term 2"),
        ("term_3", "Term 3"),
    ]

    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name="terms",
    )

    term = models.CharField(
        max_length=10,
        choices=TERM_CHOICES,
    )

    start_date = models.DateField()

    end_date = models.DateField()

    is_current = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "academic_year",
            "term",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=["academic_year", "term"],
                name="unique_term_per_academic_year",
            )
        ]

    def __str__(self):
        return (
            f"{self.academic_year.name} - "
            f"{self.get_term_display()}"
        )

    def clean(self):
        """
        Validate term dates and their relationship with
        the other terms in the same academic year.
        """

        if self.start_date and self.end_date:
            if self.start_date >= self.end_date:
                raise ValidationError({
                    "end_date": (
                        "The term end date must be after "
                        "the term start date."
                    )
                })

        # ----------------------------------------------------
        # Validate that only one term is current in a year
        # ----------------------------------------------------

        if self.is_current:
            existing_current = (
                AcademicTerm.objects
                .filter(
                    academic_year=self.academic_year,
                    is_current=True,
                )
                .exclude(pk=self.pk)
                .exists()
            )

            if existing_current:
                raise ValidationError({
                    "is_current": (
                        "Only one term can be marked as current "
                        "within an academic year."
                    )
                })

        # ----------------------------------------------------
        # Validate ordering and overlapping of terms
        # ----------------------------------------------------

        if (
            self.academic_year_id
            and self.start_date
            and self.end_date
        ):
            other_terms = (
                AcademicTerm.objects
                .filter(
                    academic_year=self.academic_year,
                )
                .exclude(pk=self.pk)
            )

            for other_term in other_terms:

                # Prevent overlapping terms
                if (
                    self.start_date <= other_term.end_date
                    and self.end_date >= other_term.start_date
                ):
                    raise ValidationError({
                        "start_date": (
                            f"This term overlaps with "
                            f"{other_term.get_term_display()}."
                        )
                    })

            # ------------------------------------------------
            # Enforce chronological term order
            # ------------------------------------------------

            if self.term == "term_2":
                term_1 = (
                    other_terms
                    .filter(term="term_1")
                    .first()
                )

                if term_1 and self.start_date <= term_1.end_date:
                    raise ValidationError({
                        "start_date": (
                            "Term 2 must start after Term 1 ends."
                        )
                    })

            elif self.term == "term_3":
                term_2 = (
                    other_terms
                    .filter(term="term_2")
                    .first()
                )

                if term_2 and self.start_date <= term_2.end_date:
                    raise ValidationError({
                        "start_date": (
                            "Term 3 must start after Term 2 ends."
                        )
                    })

        # ----------------------------------------------------
        # Ensure the term belongs to an active year
        # ----------------------------------------------------

        if self.academic_year and not self.academic_year.is_active:
            raise ValidationError({
                "academic_year": (
                    "A term cannot be added to an inactive "
                    "academic year."
                )
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


# ============================================================
# ACADEMIC CALENDAR EVENT
# ============================================================

class AcademicCalendarEvent(models.Model):
    """
    Represents important dates or periods in the school calendar.

    Examples:
        - Mid-term break
        - School holiday
        - Public holiday
        - Examination period
        - Staff development day
        - School opening day
        - School closing day
        - Other school events

    An event can optionally belong to a specific term.
    """

    EVENT_TYPE_CHOICES = [
        ("mid_term_break", "Mid-Term Break"),
        ("school_holiday", "School Holiday"),
        ("public_holiday", "Public Holiday"),
        ("examination", "Examination Period"),
        ("staff_day", "Staff Day"),
        ("opening_day", "School Opening Day"),
        ("closing_day", "School Closing Day"),
        ("other", "Other"),
    ]

    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name="calendar_events",
    )

    term = models.ForeignKey(
        AcademicTerm,
        on_delete=models.CASCADE,
        related_name="calendar_events",
        blank=True,
        null=True,
        help_text=(
            "Optional. Leave blank for events that apply "
            "to the academic year rather than a specific term."
        ),
    )

    title = models.CharField(
        max_length=200,
    )

    event_type = models.CharField(
        max_length=30,
        choices=EVENT_TYPE_CHOICES,
    )

    start_date = models.DateField()

    end_date = models.DateField()

    description = models.TextField(
        blank=True,
    )

    is_school_closed = models.BooleanField(
        default=True,
        help_text=(
            "Indicates whether normal school operations "
            "are closed during this event."
        ),
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
            "start_date",
            "title",
        ]

        indexes = [
            models.Index(
                fields=["academic_year", "start_date"],
            ),
            models.Index(
                fields=["event_type"],
            ),
            models.Index(
                fields=["is_active"],
            ),
        ]

    def __str__(self):
        return (
            f"{self.title} "
            f"({self.start_date} - {self.end_date})"
        )

    def clean(self):
        """
        Validate event dates and relationships.
        """

        # ----------------------------------------------------
        # Date validation
        # ----------------------------------------------------

        if self.start_date and self.end_date:
            if self.start_date > self.end_date:
                raise ValidationError({
                    "end_date": (
                        "The event end date cannot be before "
                        "the event start date."
                    )
                })

        # ----------------------------------------------------
        # Term must belong to the same academic year
        # ----------------------------------------------------

        if self.term and self.academic_year:
            if self.term.academic_year_id != self.academic_year_id:
                raise ValidationError({
                    "term": (
                        "The selected term must belong to "
                        "the selected academic year."
                    )
                })

        # ----------------------------------------------------
        # Event should fall within the academic year
        # when all three terms exist.
        #
        # We don't enforce this when terms are incomplete,
        # because calendar events may be entered before
        # the full academic calendar has been configured.
        # ----------------------------------------------------

        if self.academic_year_id:
            terms = self.academic_year.terms.all()

            if terms.count() == 3:
                year_start = terms.order_by("start_date").first().start_date
                year_end = terms.order_by("-end_date").first().end_date

                if self.start_date < year_start:
                    raise ValidationError({
                        "start_date": (
                            "The event starts before the "
                            "academic year begins."
                        )
                    })

                if self.end_date > year_end:
                    raise ValidationError({
                        "end_date": (
                            "The event ends after the "
                            "academic year ends."
                        )
                    })

        # ----------------------------------------------------
        # Prevent overlapping calendar events of the same
        # type within the same academic year.
        #
        # This prevents accidental duplicate breaks/holidays
        # while still allowing different event types to overlap
        # when necessary.
        # ----------------------------------------------------

        if (
            self.academic_year_id
            and self.start_date
            and self.end_date
        ):
            overlapping_events = (
                AcademicCalendarEvent.objects
                .filter(
                    academic_year=self.academic_year,
                    event_type=self.event_type,
                    start_date__lte=self.end_date,
                    end_date__gte=self.start_date,
                )
                .exclude(pk=self.pk)
            )

            if overlapping_events.exists():
                raise ValidationError({
                    "start_date": (
                        "This event overlaps with another "
                        "event of the same type."
                    )
                })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


# ============================================================
# CLASS LEVEL / GRADE
# ============================================================

class ClassLevel(models.Model):
    """
    Represents an academic grade/level.

    Examples:
        PP1
        PP2
        Grade 1
        Grade 2
        ...
        Grade 9

    Grades are managed dynamically by the school rather than
    being hard-coded into the application.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    code = models.SlugField(
        max_length=100,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    display_order = models.PositiveIntegerField(
        default=0,
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
            "display_order",
            "name",
        ]

        indexes = [
            models.Index(
                fields=["display_order"],
            ),
            models.Index(
                fields=["is_active"],
            ),
        ]

    def __str__(self):
        return self.name


# ============================================================
# STREAM
# ============================================================

class Stream(models.Model):
    """
    Represents a stream within a ClassLevel.

    Examples:

        Grade 7
            - A
            - B
            - C

        Grade 8
            - A
            - B

    A grade does not have to have any streams.
    """

    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.CASCADE,
        related_name="streams",
    )

    name = models.CharField(
        max_length=50,
    )

    code = models.SlugField(
        max_length=50,
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

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "class_level",
                    "name",
                ],
                name="unique_stream_per_class_level",
            ),
            models.UniqueConstraint(
                fields=[
                    "class_level",
                    "code",
                ],
                name="unique_stream_code_per_class_level",
            ),
        ]

        indexes = [
            models.Index(
                fields=["class_level"],
            ),
            models.Index(
                fields=["is_active"],
            ),
        ]

    def __str__(self):
        return (
            f"{self.class_level.name} - {self.name}"
        )

