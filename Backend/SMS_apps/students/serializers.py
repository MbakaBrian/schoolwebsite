from rest_framework import serializers

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
# FAMILY SERIALIZER
# ============================================================

class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family

        fields = [
            "id",
            "family_id",
            "family_name",

            # Current residence
            "address",
            "town",
            "county",
            "sub_county",
            "postal_address",

            # Status
            "is_active",

            # Timestamps
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "family_id",
            "created_at",
            "updated_at",
        ]


# ============================================================
# PARENT / GUARDIAN SERIALIZER
# ============================================================

class ParentGuardianSerializer(
    serializers.ModelSerializer
):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = ParentGuardian

        fields = [
            "id",
            "parent_id",
            "family",

            # Personal information
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "national_id_number",
            "gender",

            # Contact information
            "mobile_number",
            "alternative_mobile",
            "email",

            # Employment
            "occupation",
            "employer",

            # Address
            "address",

            # Status
            "is_active",

            # Timestamps
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "parent_id",
            "full_name",
            "created_at",
            "updated_at",
        ]


# ============================================================
# STUDENT SERIALIZER
# ============================================================

class StudentSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for the student's permanent profile.

    This includes the information captured from the school's
    Pupil's Admission Form.

    Academic placement such as:
    - Grade/Class
    - Stream
    - Academic Year
    - Previous School

    is handled through StudentEnrollment.
    """

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Student

        fields = [
            # ------------------------------------------------
            # SYSTEM IDENTIFICATION
            # ------------------------------------------------
            "id",
            "student_id",
            "admission_number",

            # ------------------------------------------------
            # FAMILY
            # ------------------------------------------------
            "family",

            # ------------------------------------------------
            # STUDENT NAME
            # ------------------------------------------------
            "first_name",
            "middle_name",
            "last_name",
            "full_name",

            # ------------------------------------------------
            # PERSONAL INFORMATION
            # ------------------------------------------------
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
            # HOME / ORIGIN INFORMATION
            # ------------------------------------------------
            "home_county",
            "home_sub_county",

            # ------------------------------------------------
            # EDUCATION IDENTIFIERS
            # ------------------------------------------------
            "nemis_kemis_number",
            "child_assessment_number",

            # ------------------------------------------------
            # MEDICAL INFORMATION
            # ------------------------------------------------
            "has_allergies_or_illness",
            "medical_conditions",

            # ------------------------------------------------
            # SPECIAL ABILITIES
            # ------------------------------------------------
            "has_special_abilities",
            "special_abilities",

            # ------------------------------------------------
            # PROFILE
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
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        """
        Validate student admission-form information.

        Ensures that explanatory fields are provided when
        the corresponding Yes/No field is set to True.
        """

        has_allergies_or_illness = attrs.get(
            "has_allergies_or_illness",
            getattr(
                self.instance,
                "has_allergies_or_illness",
                False,
            ),
        )

        medical_conditions = attrs.get(
            "medical_conditions",
            getattr(
                self.instance,
                "medical_conditions",
                "",
            ),
        )

        has_special_abilities = attrs.get(
            "has_special_abilities",
            getattr(
                self.instance,
                "has_special_abilities",
                False,
            ),
        )

        special_abilities = attrs.get(
            "special_abilities",
            getattr(
                self.instance,
                "special_abilities",
                "",
            ),
        )

        # ----------------------------------------------------
        # MEDICAL INFORMATION
        # ----------------------------------------------------

        if (
            has_allergies_or_illness
            and not medical_conditions.strip()
        ):
            raise serializers.ValidationError({
                "medical_conditions": (
                    "Please provide details of the "
                    "allergy, illness, or medical condition."
                )
            })

        # ----------------------------------------------------
        # SPECIAL ABILITIES
        # ----------------------------------------------------

        if (
            has_special_abilities
            and not special_abilities.strip()
        ):
            raise serializers.ValidationError({
                "special_abilities": (
                    "Please provide details of the "
                    "student's special abilities or talents."
                )
            })

        return attrs


# ============================================================
# STUDENT ↔ PARENT/GUARDIAN RELATIONSHIP SERIALIZER
# ============================================================

class StudentParentSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = StudentParent

        fields = [
            "id",
            "student",
            "parent_guardian",
            "relationship",

            # Relationship responsibilities
            "is_primary",
            "has_parental_responsibility",
            "receives_communications",
            "receives_fee_notifications",
            "is_emergency_contact",

            # Timestamps
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


# ============================================================
# STUDENT ENROLLMENT SERIALIZER
# ============================================================

class StudentEnrollmentSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for a student's academic enrollment.

    This is where the admission-form field:

        "Grade Applying For"

    is represented through the selected class_level.

    Previous school is also stored here because it relates
    to a particular enrollment/admission event rather than
    being a permanent student identity field.
    """

    class Meta:
        model = StudentEnrollment

        fields = [
            "id",
            "student",

            # Academic placement
            "academic_year",
            "class_level",
            "stream",

            # Enrollment
            "enrollment_date",
            "status",

            # Exit information
            "exit_date",
            "exit_reason",

            # Previous school
            "previous_school",

            # Timestamps
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        """
        Validate enrollment information.

        Ensures:
        - Stream belongs to selected class level.
        - Exit date is not before enrollment date.
        """

        # ----------------------------------------------------
        # CLASS LEVEL
        # ----------------------------------------------------

        class_level = attrs.get(
            "class_level",
            getattr(
                self.instance,
                "class_level",
                None,
            ),
        )

        # ----------------------------------------------------
        # STREAM
        # ----------------------------------------------------

        stream = attrs.get(
            "stream",
            getattr(
                self.instance,
                "stream",
                None,
            ),
        )

        # ----------------------------------------------------
        # ENROLLMENT DATE
        # ----------------------------------------------------

        enrollment_date = attrs.get(
            "enrollment_date",
            getattr(
                self.instance,
                "enrollment_date",
                None,
            ),
        )

        # ----------------------------------------------------
        # EXIT DATE
        # ----------------------------------------------------

        exit_date = attrs.get(
            "exit_date",
            getattr(
                self.instance,
                "exit_date",
                None,
            ),
        )

        # ----------------------------------------------------
        # STREAM MUST BELONG TO CLASS LEVEL
        # ----------------------------------------------------

        if stream and class_level:

            if (
                stream.class_level_id
                != class_level.id
            ):
                raise serializers.ValidationError({
                    "stream": (
                        "The selected stream does not belong "
                        "to the selected class level."
                    )
                })

        # ----------------------------------------------------
        # EXIT DATE VALIDATION
        # ----------------------------------------------------

        if (
            exit_date
            and enrollment_date
            and exit_date < enrollment_date
        ):
            raise serializers.ValidationError({
                "exit_date": (
                    "Exit date cannot be earlier than "
                    "the enrollment date."
                )
            })

        return attrs


# ============================================================
# EMERGENCY CONTACT SERIALIZER
# ============================================================

class EmergencyContactSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = EmergencyContact

        fields = [
            "id",
            "student",

            # Contact information
            "full_name",
            "relationship",
            "mobile_number",
            "alternative_mobile",
            "email",
            "address",

            # Priority / status
            "priority",
            "is_active",

            # Timestamps
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


# ============================================================
# STUDENT DOCUMENT SERIALIZER
# ============================================================

class StudentDocumentSerializer(
    serializers.ModelSerializer
):
    """
    Serializer for documents attached to a student.

    Supported document types include:
    - Birth Certificate
    - Previous School Report
    - Transfer Certificate
    - Medical Form
    - Medical Document
    - Admission Form
    - Parent/Guardian Document
    - Other
    """

    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentDocument

        fields = [
            "id",
            "student",

            # Document
            "document_type",
            "title",
            "file",
            "description",

            # Uploader
            "uploaded_by",
            "uploaded_by_name",
            "uploaded_at",

            # Status
            "is_active",
        ]

        read_only_fields = [
            "id",
            "uploaded_by",
            "uploaded_by_name",
            "uploaded_at",
        ]

    def get_uploaded_by_name(
        self,
        obj
    ):
        """
        Return the name of the user who uploaded
        the document.
        """

        if not obj.uploaded_by:
            return None

        return (
            obj.uploaded_by.get_full_name()
            or obj.uploaded_by.username
        )

    def create(
        self,
        validated_data
    ):
        """
        Automatically assign the currently authenticated
        user as the document uploader.

        The service layer also receives the authenticated
        user, providing an additional layer of control.
        """

        request = self.context.get(
            "request"
        )

        if (
            request
            and request.user
            and request.user.is_authenticated
        ):
            validated_data[
                "uploaded_by"
            ] = request.user

        return super().create(
            validated_data
        )

