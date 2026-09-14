# academics/serializers.py

from rest_framework import serializers

from .models import (
    AcademicYear,
    AcademicTerm,
    AcademicCalendarEvent,
    ClassLevel,
    Stream,
)


# ============================================================
# ACADEMIC TERM - SUMMARY SERIALIZER
# ============================================================

class AcademicTermSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer used when displaying terms inside
    an AcademicYear response.
    """

    term_display = serializers.CharField(
        source="get_term_display",
        read_only=True,
    )

    class Meta:
        model = AcademicTerm

        fields = [
            "id",
            "term",
            "term_display",
            "start_date",
            "end_date",
            "is_current",
        ]


# ============================================================
# ACADEMIC YEAR
# ============================================================

class AcademicYearSerializer(serializers.ModelSerializer):
    """
    Serializer for AcademicYear.

    Includes:
        - Academic year information
        - Automatically calculated start/end dates
        - Related terms
    """

    start_date = serializers.ReadOnlyField()

    end_date = serializers.ReadOnlyField()

    terms = AcademicTermSummarySerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = AcademicYear

        fields = [
            "id",
            "name",
            "start_date",
            "end_date",
            "is_current",
            "is_active",
            "terms",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "start_date",
            "end_date",
            "terms",
            "created_at",
            "updated_at",
        ]


# ============================================================
# ACADEMIC TERM
# ============================================================

class AcademicTermSerializer(serializers.ModelSerializer):
    """
    Serializer for AcademicTerm.

    The academic_year is accepted as an ID when creating/updating
    a term.

    Additional readable academic year information is returned
    through academic_year_name.
    """

    term_display = serializers.CharField(
        source="get_term_display",
        read_only=True,
    )

    academic_year_name = serializers.CharField(
        source="academic_year.name",
        read_only=True,
    )

    class Meta:
        model = AcademicTerm

        fields = [
            "id",
            "academic_year",
            "academic_year_name",
            "term",
            "term_display",
            "start_date",
            "end_date",
            "is_current",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "academic_year_name",
            "term_display",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        """
        Validate term dates at serializer level.

        Model-level validation in models.py remains the final
        authority.
        """

        start_date = attrs.get(
            "start_date",
            getattr(
                self.instance,
                "start_date",
                None,
            ),
        )

        end_date = attrs.get(
            "end_date",
            getattr(
                self.instance,
                "end_date",
                None,
            ),
        )

        if start_date and end_date:
            if start_date >= end_date:
                raise serializers.ValidationError({
                    "end_date": (
                        "The term end date must be after "
                        "the term start date."
                    )
                })

        return attrs


# ============================================================
# ACADEMIC CALENDAR EVENT
# ============================================================

class AcademicCalendarEventSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for school calendar events.

    Examples:
        - Mid-term break
        - School holiday
        - Public holiday
        - Examination period
        - Staff day
        - Opening day
        - Closing day
    """

    event_type_display = serializers.CharField(
        source="get_event_type_display",
        read_only=True,
    )

    academic_year_name = serializers.CharField(
        source="academic_year.name",
        read_only=True,
    )

    term_name = serializers.SerializerMethodField()

    class Meta:
        model = AcademicCalendarEvent

        fields = [
            "id",
            "academic_year",
            "academic_year_name",
            "term",
            "term_name",
            "title",
            "event_type",
            "event_type_display",
            "start_date",
            "end_date",
            "description",
            "is_school_closed",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "academic_year_name",
            "term_name",
            "event_type_display",
            "created_at",
            "updated_at",
        ]

    def get_term_name(self, obj):
        if not obj.term:
            return None

        return str(obj.term)

    def validate(self, attrs):
        """
        Validate that the selected term belongs to the selected
        academic year.
        """

        academic_year = attrs.get(
            "academic_year",
            getattr(
                self.instance,
                "academic_year",
                None,
            ),
        )

        term = attrs.get(
            "term",
            getattr(
                self.instance,
                "term",
                None,
            ),
        )

        if academic_year and term:

            if term.academic_year_id != academic_year.id:

                raise serializers.ValidationError({
                    "term": (
                        "The selected term must belong to "
                        "the selected academic year."
                    )
                })

        start_date = attrs.get(
            "start_date",
            getattr(
                self.instance,
                "start_date",
                None,
            ),
        )

        end_date = attrs.get(
            "end_date",
            getattr(
                self.instance,
                "end_date",
                None,
            ),
        )

        if start_date and end_date:

            if start_date > end_date:

                raise serializers.ValidationError({
                    "end_date": (
                        "The event end date cannot be "
                        "before the event start date."
                    )
                })

        return attrs


# ============================================================
# CLASS LEVEL / GRADE
# ============================================================

class ClassLevelSerializer(serializers.ModelSerializer):
    """
    Serializer for school grades/class levels.

    Examples:
        PP1
        PP2
        Grade 1
        Grade 2
        Grade 7
        Grade 8
        Grade 9
    """

    streams_count = serializers.SerializerMethodField()

    class Meta:
        model = ClassLevel

        fields = [
            "id",
            "name",
            "code",
            "description",
            "display_order",
            "is_active",
            "streams_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "streams_count",
            "created_at",
            "updated_at",
        ]

    def get_streams_count(self, obj):
        return obj.streams.filter(
            is_active=True
        ).count()


# ============================================================
# STREAM SUMMARY SERIALIZER
# ============================================================

class StreamSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for displaying streams nested
    inside a ClassLevel response.
    """

    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    class Meta:
        model = Stream

        fields = [
            "id",
            "name",
            "code",
            "class_level",
            "class_level_name",
            "is_active",
        ]


# ============================================================
# STREAM
# ============================================================

class StreamSerializer(serializers.ModelSerializer):
    """
    Full serializer for Stream.
    """

    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    class_level_code = serializers.CharField(
        source="class_level.code",
        read_only=True,
    )

    class Meta:
        model = Stream

        fields = [
            "id",
            "class_level",
            "class_level_name",
            "class_level_code",
            "name",
            "code",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "class_level_name",
            "class_level_code",
            "created_at",
            "updated_at",
        ]

