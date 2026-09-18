
from rest_framework import serializers

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

from SMS_apps.academics.models import (
    AcademicYear,
    ClassLevel,
)


# ==========================================================
# FAMILY SERIALIZER
# ==========================================================

class FamilySerializer(serializers.ModelSerializer):
    """
    Serializer for family/household records.
    """

    class Meta:
        model = Family

        fields = [
            "id",
            "family_id",
            "family_name",
            "address",
            "town",
            "county",
            "sub_county",
            "postal_address",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "family_id",
            "created_at",
            "updated_at",
        ]


# ==========================================================
# PARENT / GUARDIAN SERIALIZER
# ==========================================================

class ParentGuardianSerializer(serializers.ModelSerializer):
    """
    Serializer for parent/guardian records.
    """

    full_name = serializers.CharField(
        read_only=True
    )

    family_details = serializers.SerializerMethodField()

    class Meta:
        model = ParentGuardian

        fields = [
            "id",
            "parent_id",
            "family",
            "family_details",
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "national_id_number",
            "gender",
            "mobile_number",
            "alternative_mobile_number",
            "email",
            "occupation",
            "employer",
            "address",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "parent_id",
            "full_name",
            "family_details",
            "created_at",
            "updated_at",
        ]

    def get_family_details(self, obj):
        if not obj.family:
            return None

        return {
            "id": obj.family.id,
            "family_id": obj.family.family_id,
            "family_name": obj.family.family_name,
            "address": obj.family.address,
            "town": obj.family.town,
            "county": obj.family.county,
            "sub_county": obj.family.sub_county,
            "postal_address": obj.family.postal_address,
            "is_active": obj.family.is_active,
        }


# ==========================================================
# STUDENT SERIALIZER
# ==========================================================

class StudentSerializer(serializers.ModelSerializer):
    """
    Serializer for the permanent Student identity/profile.

    IMPORTANT:
    Academic year, class level and stream are NOT included here.

    Those belong to StudentEnrollment.
    """

    full_name = serializers.CharField(
        read_only=True
    )

    family_details = serializers.SerializerMethodField()

    class Meta:
        model = Student

        fields = [
            # ------------------------------------------------
            # SYSTEM
            # ------------------------------------------------
            "id",
            "student_id",

            # ------------------------------------------------
            # ADMISSION
            # ------------------------------------------------
            "admission_number",

            # ------------------------------------------------
            # FAMILY
            # ------------------------------------------------
            "family",
            "family_details",

            # ------------------------------------------------
            # PERSONAL INFORMATION
            # ------------------------------------------------
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "date_of_birth",
            "place_of_birth",
            "gender",
            "nationality",
            "religion",

            # ------------------------------------------------
            # BIRTH CERTIFICATE
            # ------------------------------------------------
            "birth_certificate_entry_number",
            "birth_certificate_number",
            "birth_certificate_submitted",

            # ------------------------------------------------
            # RESIDENCE
            # ------------------------------------------------
            "home_county",
            "home_subcounty",

            # ------------------------------------------------
            # KEMIS / NEMIS
            # ------------------------------------------------
            "nemis_kemis_number",
            "child_assessment_number",

            # ------------------------------------------------
            # MEDICAL / ALLERGIES
            # ------------------------------------------------
            "has_allergies_or_illness",
            "allergies_or_illness_details",

            # ------------------------------------------------
            # SPECIAL ABILITIES
            # ------------------------------------------------
            "has_special_abilities",
            "special_abilities_details",

            # ------------------------------------------------
            # PHOTO
            # ------------------------------------------------
            "photo",

            # ------------------------------------------------
            # STATUS
            # ------------------------------------------------
            "status",

            # ------------------------------------------------
            # TIMESTAMPS
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "student_id",
            "full_name",
            "family_details",
            "created_at",
            "updated_at",
        ]

    def get_family_details(self, obj):
        if not obj.family:
            return None

        return {
            "id": obj.family.id,
            "family_id": obj.family.family_id,
            "family_name": obj.family.family_name,
            "address": obj.family.address,
            "town": obj.family.town,
            "county": obj.family.county,
            "sub_county": obj.family.sub_county,
            "postal_address": obj.family.postal_address,
            "is_active": obj.family.is_active,
        }

    def validate(self, attrs):
        """
        Validate the conditional medical and special-ability fields.
        """

        # --------------------------------------------------
        # MEDICAL / ALLERGIES
        # --------------------------------------------------

        has_allergies_or_illness = attrs.get(
            "has_allergies_or_illness",
            getattr(
                self.instance,
                "has_allergies_or_illness",
                False,
            ),
        )

        allergies_or_illness_details = attrs.get(
            "allergies_or_illness_details",
            getattr(
                self.instance,
                "allergies_or_illness_details",
                "",
            ),
        )

        if has_allergies_or_illness:
            if not allergies_or_illness_details or not allergies_or_illness_details.strip():
                raise serializers.ValidationError({
                    "allergies_or_illness_details": (
                        "Please provide details about the allergy or illness."
                    )
                })

        # --------------------------------------------------
        # SPECIAL ABILITIES
        # --------------------------------------------------

        has_special_abilities = attrs.get(
            "has_special_abilities",
            getattr(
                self.instance,
                "has_special_abilities",
                False,
            ),
        )

        special_abilities_details = attrs.get(
            "special_abilities_details",
            getattr(
                self.instance,
                "special_abilities_details",
                "",
            ),
        )

        if has_special_abilities:
            if not special_abilities_details or not special_abilities_details.strip():
                raise serializers.ValidationError({
                    "special_abilities_details": (
                        "Please provide details about the special ability."
                    )
                })

        return attrs


# ==========================================================
# STUDENT ↔ PARENT / GUARDIAN SERIALIZER
# ==========================================================

class StudentParentSerializer(serializers.ModelSerializer):
    """
    Serializer connecting students to parents/guardians.
    """

    student_details = serializers.SerializerMethodField()

    parent_guardian_details = serializers.SerializerMethodField()

    class Meta:
        model = StudentParent

        fields = [
            "id",
            "student",
            "student_details",
            "parent_guardian",
            "parent_guardian_details",
            "relationship",
            "is_primary",
            "has_parental_responsibility",
            "receives_communication",
            "receives_fee_notifications",
            "is_emergency_contact",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "student_details",
            "parent_guardian_details",
            "created_at",
            "updated_at",
        ]

    def get_student_details(self, obj):
        return {
            "id": obj.student.id,
            "student_id": obj.student.student_id,
            "admission_number": obj.student.admission_number,
            "full_name": obj.student.full_name,
        }

    def get_parent_guardian_details(self, obj):
        return {
            "id": obj.parent_guardian.id,
            "parent_id": obj.parent_guardian.parent_id,
            "full_name": obj.parent_guardian.full_name,
            "mobile_number": obj.parent_guardian.mobile_number,
            "email": obj.parent_guardian.email,
            "relationship": obj.relationship,
        }


# ==========================================================
# STUDENT ENROLLMENT SERIALIZER
# ==========================================================

class StudentEnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for academic placement.

    Academic placement belongs here rather than Student.
    """

    student_details = serializers.SerializerMethodField()

    academic_year_name = serializers.CharField(
        source="academic_year.name",
        read_only=True,
    )

    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    stream_name = serializers.CharField(
        source="stream.name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = StudentEnrollment

        fields = [
            "id",

            # ------------------------------------------------
            # STUDENT
            # ------------------------------------------------
            "student",
            "student_details",

            # ------------------------------------------------
            # ACADEMIC PLACEMENT
            # ------------------------------------------------
            "academic_year",
            "academic_year_name",
            "class_level",
            "class_level_name",
            "stream",
            "stream_name",

            # ------------------------------------------------
            # ENROLLMENT
            # ------------------------------------------------
            "enrollment_date",
            "status",
            "exit_date",
            "exit_reason",

            # ------------------------------------------------
            # PREVIOUS SCHOOL
            # ------------------------------------------------
            "previous_school",

            # ------------------------------------------------
            # TIMESTAMPS
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "student_details",
            "academic_year_name",
            "class_level_name",
            "stream_name",
            "created_at",
            "updated_at",
        ]

    def get_student_details(self, obj):
        return {
            "id": obj.student.id,
            "student_id": obj.student.student_id,
            "admission_number": obj.student.admission_number,
            "full_name": obj.student.full_name,
        }

    def validate(self, attrs):
        """
        Validate that the selected stream belongs to
        the selected class level.
        """

        class_level = attrs.get(
            "class_level",
            getattr(self.instance, "class_level", None),
        )

        stream = attrs.get(
            "stream",
            getattr(self.instance, "stream", None),
        )

        if stream and class_level:
            if stream.class_level_id != class_level.id:
                raise serializers.ValidationError({
                    "stream": (
                        "The selected stream does not belong to "
                        "the selected class level."
                    )
                })

        enrollment_date = attrs.get(
            "enrollment_date",
            getattr(self.instance, "enrollment_date", None),
        )

        exit_date = attrs.get(
            "exit_date",
            getattr(self.instance, "exit_date", None),
        )

        if enrollment_date and exit_date:
            if exit_date < enrollment_date:
                raise serializers.ValidationError({
                    "exit_date": (
                        "Exit date cannot be earlier than "
                        "the enrollment date."
                    )
                })

        return attrs


# ==========================================================
# EMERGENCY CONTACT SERIALIZER
# ==========================================================

class EmergencyContactSerializer(serializers.ModelSerializer):
    """
    Serializer for student emergency contacts.
    """

    student_details = serializers.SerializerMethodField()

    class Meta:
        model = EmergencyContact

        fields = [
            "id",
            "student",
            "student_details",
            "name",
            "relationship",
            "mobile_number",
            "alternative_mobile_number",
            "email",
            "address",
            "priority",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "student_details",
            "created_at",
            "updated_at",
        ]

    def get_student_details(self, obj):
        return {
            "id": obj.student.id,
            "student_id": obj.student.student_id,
            "admission_number": obj.student.admission_number,
            "full_name": obj.student.full_name,
        }


# ==========================================================
# STUDENT DOCUMENT SERIALIZER
# ==========================================================

class StudentDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for documents attached to students.
    """

    student_details = serializers.SerializerMethodField()

    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentDocument

        fields = [
            "id",
            "student",
            "student_details",
            "document_type",
            "title",
            "file",
            "description",
            "uploaded_by",
            "uploaded_by_name",
            "uploaded_at",
            "is_active",
        ]

        read_only_fields = [
            "id",
            "student_details",
            "uploaded_by",
            "uploaded_by_name",
            "uploaded_at",
        ]

    def get_student_details(self, obj):
        return {
            "id": obj.student.id,
            "student_id": obj.student.student_id,
            "admission_number": obj.student.admission_number,
            "full_name": obj.student.full_name,
        }

    def get_uploaded_by_name(self, obj):
        if not obj.uploaded_by:
            return None

        return getattr(
            obj.uploaded_by,
            "username",
            str(obj.uploaded_by),
        )

    def create(self, validated_data):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            validated_data["uploaded_by"] = request.user

        return super().create(validated_data)


# ==========================================================
# STUDENT PROGRESSION SERIALIZER
# ==========================================================

class StudentProgressionSerializer(serializers.ModelSerializer):
    """
    Serializer for individual student progression records.

    This is an audit/history record connecting:
        previous enrollment
                ↓
        progression decision
                ↓
        resulting enrollment
    """

    student_details = serializers.SerializerMethodField()

    from_enrollment_details = serializers.SerializerMethodField()

    to_academic_year_name = serializers.CharField(
        source="to_academic_year.name",
        read_only=True,
    )

    to_class_level_name = serializers.CharField(
        source="to_class_level.name",
        read_only=True,
        allow_null=True,
    )

    to_stream_name = serializers.CharField(
        source="to_stream.name",
        read_only=True,
        allow_null=True,
    )

    to_enrollment_details = serializers.SerializerMethodField()

    decision_display = serializers.CharField(
        source="get_decision_display",
        read_only=True,
    )

    class Meta:
        model = StudentProgression

        fields = [
            "id",

            # ------------------------------------------------
            # STUDENT
            # ------------------------------------------------
            "student",
            "student_details",

            # ------------------------------------------------
            # SOURCE
            # ------------------------------------------------
            "from_enrollment",
            "from_enrollment_details",

            # ------------------------------------------------
            # TARGET
            # ------------------------------------------------
            "to_academic_year",
            "to_academic_year_name",
            "to_class_level",
            "to_class_level_name",
            "to_stream",
            "to_stream_name",
            "to_enrollment",
            "to_enrollment_details",

            # ------------------------------------------------
            # DECISION
            # ------------------------------------------------
            "decision",
            "decision_display",
            "decision_date",
            "remarks",

            # ------------------------------------------------
            # SYSTEM
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "student_details",
            "from_enrollment_details",
            "to_academic_year_name",
            "to_class_level_name",
            "to_stream_name",
            "to_enrollment_details",
            "decision_display",
            "decision_date",
            "created_at",
            "updated_at",
        ]

    def get_student_details(self, obj):
        return {
            "id": obj.student.id,
            "student_id": obj.student.student_id,
            "admission_number": obj.student.admission_number,
            "full_name": obj.student.full_name,
        }

    def get_from_enrollment_details(self, obj):
        enrollment = obj.from_enrollment

        if not enrollment:
            return None

        return {
            "id": enrollment.id,
            "academic_year_id": enrollment.academic_year_id,
            "academic_year_name": enrollment.academic_year.name,
            "class_level_id": enrollment.class_level_id,
            "class_level_name": enrollment.class_level.name,
            "stream_id": enrollment.stream_id,
            "stream_name": (
                enrollment.stream.name
                if enrollment.stream
                else None
            ),
            "status": enrollment.status,
            "enrollment_date": enrollment.enrollment_date,
            "exit_date": enrollment.exit_date,
        }

    def get_to_enrollment_details(self, obj):
        enrollment = obj.to_enrollment

        if not enrollment:
            return None

        return {
            "id": enrollment.id,
            "academic_year_id": enrollment.academic_year_id,
            "academic_year_name": enrollment.academic_year.name,
            "class_level_id": enrollment.class_level_id,
            "class_level_name": enrollment.class_level.name,
            "stream_id": enrollment.stream_id,
            "stream_name": (
                enrollment.stream.name
                if enrollment.stream
                else None
            ),
            "status": enrollment.status,
            "enrollment_date": enrollment.enrollment_date,
            "exit_date": enrollment.exit_date,
        }

    def validate(self, attrs):
        """
        Validate progression relationships.
        """

        student = attrs.get(
            "student",
            getattr(self.instance, "student", None),
        )

        from_enrollment = attrs.get(
            "from_enrollment",
            getattr(self.instance, "from_enrollment", None),
        )

        to_academic_year = attrs.get(
            "to_academic_year",
            getattr(self.instance, "to_academic_year", None),
        )

        to_class_level = attrs.get(
            "to_class_level",
            getattr(self.instance, "to_class_level", None),
        )

        to_stream = attrs.get(
            "to_stream",
            getattr(self.instance, "to_stream", None),
        )

        to_enrollment = attrs.get(
            "to_enrollment",
            getattr(self.instance, "to_enrollment", None),
        )

        decision = attrs.get(
            "decision",
            getattr(self.instance, "decision", None),
        )

        errors = {}

        # --------------------------------------------------
        # SOURCE ENROLLMENT
        # --------------------------------------------------

        if student and from_enrollment:
            if from_enrollment.student_id != student.id:
                errors["from_enrollment"] = (
                    "The source enrollment does not belong "
                    "to the selected student."
                )

        # --------------------------------------------------
        # TARGET STREAM → TARGET CLASS
        # --------------------------------------------------

        if to_stream and to_class_level:
            if to_stream.class_level_id != to_class_level.id:
                errors["to_stream"] = (
                    "The selected target stream does not belong "
                    "to the selected target class."
                )

        # --------------------------------------------------
        # PROMOTED / REPEATING
        # --------------------------------------------------

        if decision in ["promoted", "repeating"]:
            if not to_class_level:
                errors["to_class_level"] = (
                    "A target class is required for "
                    "promoted or repeating students."
                )

        # --------------------------------------------------
        # EXIT DECISIONS
        # --------------------------------------------------

        if decision in [
            "transferred",
            "graduated",
            "withdrawn",
        ]:
            if to_class_level:
                errors["to_class_level"] = (
                    "Transferred, graduated and withdrawn "
                    "students should not have a target class."
                )

            if to_stream:
                errors["to_stream"] = (
                    "Transferred, graduated and withdrawn "
                    "students should not have a target stream."
                )

            if to_enrollment:
                errors["to_enrollment"] = (
                    "Transferred, graduated and withdrawn "
                    "students should not have a resulting enrollment."
                )

        # --------------------------------------------------
        # TARGET ACADEMIC YEAR
        # --------------------------------------------------

        if (
            from_enrollment
            and to_academic_year
            and from_enrollment.academic_year_id
            == to_academic_year.id
        ):
            errors["to_academic_year"] = (
                "The target academic year must be different "
                "from the source academic year."
            )

        # --------------------------------------------------
        # RESULTING ENROLLMENT
        # --------------------------------------------------

        if to_enrollment:
            if student and to_enrollment.student_id != student.id:
                errors["to_enrollment"] = (
                    "The resulting enrollment does not belong "
                    "to the selected student."
                )

            if (
                to_academic_year
                and to_enrollment.academic_year_id
                != to_academic_year.id
            ):
                errors["to_enrollment"] = (
                    "The resulting enrollment does not belong "
                    "to the selected target academic year."
                )

            if (
                to_class_level
                and to_enrollment.class_level_id
                != to_class_level.id
            ):
                errors["to_enrollment"] = (
                    "The resulting enrollment does not belong "
                    "to the selected target class."
                )

            if (
                to_stream
                and to_enrollment.stream_id
                != to_stream.id
            ):
                errors["to_enrollment"] = (
                    "The resulting enrollment does not belong "
                    "to the selected target stream."
                )

        if errors:
            raise serializers.ValidationError(errors)

        return attrs


# ==========================================================
# BATCH STUDENT PROGRESSION SERIALIZER
# ==========================================================

class BatchStudentProgressionSerializer(serializers.Serializer):
    """
    Serializer used when processing multiple students
    through the progression workflow.
    """

    student_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )

    from_academic_year = serializers.PrimaryKeyRelatedField(
        queryset=AcademicYear.objects.all(),
    )

    from_class_level = serializers.PrimaryKeyRelatedField(
        queryset=ClassLevel.objects.all(),
    )

    to_academic_year = serializers.PrimaryKeyRelatedField(
        queryset=AcademicYear.objects.all(),
    )

    decision = serializers.ChoiceField(
        choices=StudentProgression.DECISION_CHOICES,
    )

    student_overrides = serializers.DictField(
        required=False,
        default=dict,
    )

    remarks = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    def validate(self, attrs):
        from_academic_year = attrs["from_academic_year"]

        to_academic_year = attrs["to_academic_year"]

        if from_academic_year.id == to_academic_year.id:
            raise serializers.ValidationError({
                "to_academic_year": (
                    "The target academic year must be different "
                    "from the source academic year."
                )
            })

        student_ids = attrs["student_ids"]

        existing_students = Student.objects.filter(
            id__in=student_ids
        )

        existing_student_ids = set(
            existing_students.values_list(
                "id",
                flat=True,
            )
        )

        missing_student_ids = [
            student_id
            for student_id in student_ids
            if student_id not in existing_student_ids
        ]

        if missing_student_ids:
            raise serializers.ValidationError({
                "student_ids": (
                    "The following student IDs do not exist: "
                    f"{missing_student_ids}"
                )
            })

        return attrs

# ==========================================================
# ADMISSION NUMBER CONFIGURATION SERIALIZER
# ==========================================================

class AdmissionNumberConfigSerializer(serializers.Serializer):
    """
    Serializer for the school's admission-number configuration.

    The actual configuration comes from:

        school_backend/constants.py

    This serializer only exposes that configuration to the
    frontend. It does not store or modify anything in the database.
    """

    prefix = serializers.CharField(
        read_only=True,
    )

    separator = serializers.CharField(
        read_only=True,
    )

    digits = serializers.IntegerField(
        read_only=True,
    )

    formatted_prefix = serializers.CharField(
        read_only=True,
    )

    example = serializers.CharField(
        read_only=True,
    )

