from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from django.core.exceptions import ValidationError as DjangoValidationError

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

from .serializers import (
    FamilySerializer,
    ParentGuardianSerializer,
    StudentSerializer,
    StudentParentSerializer,
    StudentEnrollmentSerializer,
    EmergencyContactSerializer,
    StudentDocumentSerializer,
    StudentProgressionSerializer,
    BatchStudentProgressionSerializer,
    AdmissionNumberConfigSerializer,
)

from .services import (
    # --------------------------------------------------------
    # Family
    # --------------------------------------------------------
    create_family,
    update_family,
    deactivate_family,

    # --------------------------------------------------------
    # Parent / Guardian
    # --------------------------------------------------------
    create_parent_guardian,
    update_parent_guardian,
    deactivate_parent_guardian,

    # --------------------------------------------------------
    # Student
    # --------------------------------------------------------
    create_student,
    update_student,
    deactivate_student,

    # --------------------------------------------------------
    # Student ↔ Parent / Guardian
    # --------------------------------------------------------
    create_student_parent_relationship,
    update_student_parent_relationship,
    delete_student_parent_relationship,

    # --------------------------------------------------------
    # Enrollment
    # --------------------------------------------------------
    create_student_enrollment,
    update_student_enrollment,
    deactivate_student_enrollment,

    # --------------------------------------------------------
    # Emergency Contact
    # --------------------------------------------------------
    create_emergency_contact,
    update_emergency_contact,
    deactivate_emergency_contact,

    # --------------------------------------------------------
    # Student Document
    # --------------------------------------------------------
    create_student_document,
    update_student_document,
    deactivate_student_document,

    # --------------------------------------------------------
    # Student Progression
    # --------------------------------------------------------
    process_student_progression,
    process_batch_student_progression,
)

from school_backend.SMS_constants import (
    STUDENT_ADMISSION_NUMBER_CONFIG,
    KENYA_COUNTIES,
    RELIGION_CHOICES,
)


# ============================================================
# FAMILY VIEWS
# ============================================================

class FamilyListCreateView(generics.ListCreateAPIView):
    """
    GET:
        Return all active families.

    POST:
        Create a new family through the service layer.
    """

    serializer_class = FamilySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Family.objects
            .filter(is_active=True)
            .order_by("family_name")
        )

    def perform_create(self, serializer):
        family = create_family(
            **serializer.validated_data
        )

        serializer.instance = family


class FamilyDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    GET:
        Retrieve a single family.

    PUT/PATCH:
        Update a family through the service layer.

    DELETE:
        Soft-delete the family.
    """

    serializer_class = FamilySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Family.objects.all()

    def perform_update(self, serializer):
        update_family(
            serializer.instance,
            **serializer.validated_data
        )

    def perform_destroy(self, instance):
        deactivate_family(instance)


# ============================================================
# PARENT / GUARDIAN VIEWS
# ============================================================

class ParentGuardianListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        Return all active parents/guardians.

    POST:
        Create a parent/guardian through the service layer.
    """

    serializer_class = ParentGuardianSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            ParentGuardian.objects
            .filter(is_active=True)
            .select_related("family")
            .order_by(
                "last_name",
                "first_name",
            )
        )

        family_id = self.request.query_params.get("family")

        if family_id and family_id not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                family_id = int(family_id)

                queryset = queryset.filter(
                    family_id=family_id
                )

            except (ValueError, TypeError):
                pass

        return queryset

    def perform_create(self, serializer):
        parent = create_parent_guardian(
            **serializer.validated_data
        )

        serializer.instance = parent


class ParentGuardianDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    GET:
        Retrieve one parent/guardian.

    PUT/PATCH:
        Update a parent/guardian.

    DELETE:
        Soft-delete the parent/guardian.
    """

    serializer_class = ParentGuardianSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            ParentGuardian.objects
            .select_related("family")
        )

    def perform_update(self, serializer):
        update_parent_guardian(
            serializer.instance,
            **serializer.validated_data
        )

    def perform_destroy(self, instance):
        deactivate_parent_guardian(instance)


# ============================================================
# STUDENT VIEWS
# ============================================================

class StudentListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        Return all active students.

    POST:
        Create a new student through the service layer.

    Student information includes:

    - Permanent student identity
    - Admission number
    - Personal details
    - Religion
    - Birth certificate information
    - NEMIS/KEMIS number
    - Child Assessment Number
    - Medical/allergy information
    - Special abilities
    - Family association
    - Student photo
    - Student status

    Academic placement is handled separately through
    StudentEnrollment.
    """

    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Student.objects
            .filter(status="active")
            .select_related("family")
            .order_by(
                "last_name",
                "first_name",
            )
        )

        family_id = self.request.query_params.get("family")

        if family_id and family_id not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                family_id = int(family_id)

                queryset = queryset.filter(
                    family_id=family_id
                )

            except (ValueError, TypeError):
                pass

        admission_number = (
            self.request.query_params.get(
                "admission_number"
            )
        )

        if admission_number:
            queryset = queryset.filter(
                admission_number__iexact=admission_number
            )

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                middle_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            )

        return queryset

    def perform_create(self, serializer):
        student = create_student(
            **serializer.validated_data
        )

        serializer.instance = student


class StudentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    GET:
        Retrieve a student.

    PUT/PATCH:
        Update a student.

    DELETE:
        Mark the student as inactive.

    Academic placement is retrieved through the
    StudentEnrollment endpoints.
    """

    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Student.objects
            .select_related("family")
        )

    def perform_update(self, serializer):
        update_student(
            serializer.instance,
            **serializer.validated_data
        )

    def perform_destroy(self, instance):
        deactivate_student(instance)


# ============================================================
# STUDENT ↔ PARENT/GUARDIAN RELATIONSHIP VIEWS
# ============================================================

class StudentParentListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        Return student-parent/guardian relationships.

    POST:
        Create a relationship between a student
        and a parent/guardian.
    """

    serializer_class = StudentParentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            StudentParent.objects
            .select_related(
                "student",
                "student__family",
                "parent_guardian",
                "parent_guardian__family",
            )
            .order_by(
                "student__last_name",
                "student__first_name",
                "-is_primary",
            )
        )

        student_id = self.request.query_params.get(
            "student"
        )

        if student_id and student_id not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                student_id = int(student_id)

                queryset = queryset.filter(
                    student_id=student_id
                )

            except (ValueError, TypeError):
                pass

        parent_id = self.request.query_params.get(
            "parent_guardian"
        )

        if parent_id and parent_id not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                parent_id = int(parent_id)

                queryset = queryset.filter(
                    parent_guardian_id=parent_id
                )

            except (ValueError, TypeError):
                pass

        return queryset

    def perform_create(self, serializer):
        relationship = create_student_parent_relationship(
            **serializer.validated_data
        )

        serializer.instance = relationship


class StudentParentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    GET:
        Retrieve a student-parent relationship.

    PUT/PATCH:
        Update the relationship.

    DELETE:
        Permanently remove the relationship.
    """

    serializer_class = StudentParentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudentParent.objects.select_related(
            "student",
            "student__family",
            "parent_guardian",
            "parent_guardian__family",
        )

    def perform_update(self, serializer):
        update_student_parent_relationship(
            serializer.instance,
            **serializer.validated_data
        )

    def perform_destroy(self, instance):
        delete_student_parent_relationship(
            instance
        )


# ============================================================
# STUDENT ENROLLMENT VIEWS
# ============================================================

class StudentEnrollmentListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        Return student enrollment records.

    POST:
        Create a new enrollment through the service layer.
    """

    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            StudentEnrollment.objects
            .select_related(
                "student",
                "student__family",
                "academic_year",
                "class_level",
                "stream",
            )
            .order_by(
                "-academic_year__id",
                "student__last_name",
            )
        )

        student_id = self.request.query_params.get(
            "student"
        )

        if student_id and student_id not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                student_id = int(student_id)

                queryset = queryset.filter(
                    student_id=student_id
                )

            except (ValueError, TypeError):
                pass

        academic_year = (
            self.request.query_params.get(
                "academic_year"
            )
        )

        if academic_year and academic_year not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                academic_year = int(academic_year)

                queryset = queryset.filter(
                    academic_year_id=academic_year
                )

            except (ValueError, TypeError):
                pass

        class_level = (
            self.request.query_params.get(
                "class_level"
            )
        )

        if class_level and class_level not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                class_level = int(class_level)

                queryset = queryset.filter(
                    class_level_id=class_level
                )

            except (ValueError, TypeError):
                pass

        stream = self.request.query_params.get(
            "stream"
        )

        if stream and stream not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                stream = int(stream)

                queryset = queryset.filter(
                    stream_id=stream
                )

            except (ValueError, TypeError):
                pass

        enrollment_status = self.request.query_params.get(
            "status"
        )

        if enrollment_status:
            queryset = queryset.filter(
                status=enrollment_status
            )

        return queryset

    def perform_create(self, serializer):
        enrollment = create_student_enrollment(
            **serializer.validated_data
        )

        serializer.instance = enrollment


class StudentEnrollmentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    GET:
        Retrieve an enrollment.

    PUT/PATCH:
        Update an enrollment.

    DELETE:
        Mark the enrollment as inactive.
    """

    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            StudentEnrollment.objects
            .select_related(
                "student",
                "student__family",
                "academic_year",
                "class_level",
                "stream",
            )
        )

    def perform_update(self, serializer):
        update_student_enrollment(
            serializer.instance,
            **serializer.validated_data
        )

    def perform_destroy(self, instance):
        deactivate_student_enrollment(
            instance
        )


# ============================================================
# STUDENT PROGRESSION VIEWS
# ============================================================

class StudentProgressionListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        Return student progression history.

    POST:
        Process a student's academic progression.
    """

    serializer_class = StudentProgressionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            StudentProgression.objects
            .select_related(
                "student",
                "from_enrollment",
                "from_enrollment__academic_year",
                "from_enrollment__class_level",
                "from_enrollment__stream",
                "to_academic_year",
                "to_class_level",
                "to_stream",
                "to_enrollment",
            )
            .order_by(
                "-decision_date",
                "-created_at",
            )
        )

        student_id = self.request.query_params.get(
            "student"
        )

        if student_id and student_id not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                student_id = int(student_id)

                queryset = queryset.filter(
                    student_id=student_id
                )

            except (ValueError, TypeError):
                pass

        from_enrollment = (
            self.request.query_params.get(
                "from_enrollment"
            )
        )

        if from_enrollment and from_enrollment not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                from_enrollment = int(
                    from_enrollment
                )

                queryset = queryset.filter(
                    from_enrollment_id=from_enrollment
                )

            except (ValueError, TypeError):
                pass

        to_academic_year = (
            self.request.query_params.get(
                "to_academic_year"
            )
        )

        if to_academic_year and to_academic_year not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                to_academic_year = int(
                    to_academic_year
                )

                queryset = queryset.filter(
                    to_academic_year_id=to_academic_year
                )

            except (ValueError, TypeError):
                pass

        decision = self.request.query_params.get(
            "decision"
        )

        if decision:
            queryset = queryset.filter(
                decision=decision
            )

        return queryset

    def perform_create(self, serializer):
        progression = process_student_progression(
            student=serializer.validated_data[
                "student"
            ],
            from_enrollment=serializer.validated_data[
                "from_enrollment"
            ],
            decision=serializer.validated_data[
                "decision"
            ],
            to_academic_year=serializer.validated_data.get(
                "to_academic_year"
            ),
            to_class_level=serializer.validated_data.get(
                "to_class_level"
            ),
            to_stream=serializer.validated_data.get(
                "to_stream"
            ),
            remarks=serializer.validated_data.get(
                "remarks",
                ""
            ),
        )

        serializer.instance = progression


# ============================================================
# STUDENT PROGRESSION DETAIL VIEW
# ============================================================

class StudentProgressionDetailView(
    generics.RetrieveAPIView
):
    """
    GET:
        Retrieve a single progression record.

    Progression records are audit records and should not
    normally be edited or deleted.
    """

    serializer_class = StudentProgressionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            StudentProgression.objects
            .select_related(
                "student",
                "from_enrollment",
                "from_enrollment__academic_year",
                "from_enrollment__class_level",
                "from_enrollment__stream",
                "to_academic_year",
                "to_class_level",
                "to_stream",
                "to_enrollment",
            )
        )


# ============================================================
# EMERGENCY CONTACT VIEWS
# ============================================================

class EmergencyContactListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        Return active emergency contacts.

    POST:
        Create an emergency contact through the service layer.
    """

    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            EmergencyContact.objects
            .filter(is_active=True)
            .select_related(
                "student",
                "student__family",
            )
            .order_by(
                "student__last_name",
                "student__first_name",
                "priority",
            )
        )

        student_id = self.request.query_params.get(
            "student"
        )

        if student_id and student_id not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                student_id = int(student_id)

                queryset = queryset.filter(
                    student_id=student_id
                )

            except (ValueError, TypeError):
                pass

        priority = self.request.query_params.get(
            "priority"
        )

        if priority:
            queryset = queryset.filter(
                priority=priority
            )

        return queryset

    def perform_create(self, serializer):
        contact = create_emergency_contact(
            **serializer.validated_data
        )

        serializer.instance = contact


class EmergencyContactDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    GET:
        Retrieve an emergency contact.

    PUT/PATCH:
        Update an emergency contact.

    DELETE:
        Soft-delete the emergency contact.
    """

    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            EmergencyContact.objects
            .select_related(
                "student",
                "student__family",
            )
        )

    def perform_update(self, serializer):
        update_emergency_contact(
            serializer.instance,
            **serializer.validated_data
        )

    def perform_destroy(self, instance):
        deactivate_emergency_contact(
            instance
        )


# ============================================================
# STUDENT DOCUMENT VIEWS
# ============================================================

class StudentDocumentListCreateView(
    generics.ListCreateAPIView
):
    """
    GET:
        Return active student documents.

    POST:
        Upload a student document.

    The authenticated user is automatically recorded
    as the uploader.
    """

    serializer_class = StudentDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            StudentDocument.objects
            .filter(is_active=True)
            .select_related(
                "student",
                "student__family",
                "uploaded_by",
            )
            .order_by("-uploaded_at")
        )

        student_id = self.request.query_params.get(
            "student"
        )

        if student_id and student_id not in [
            "undefined",
            "null",
            "",
        ]:
            try:
                student_id = int(student_id)

                queryset = queryset.filter(
                    student_id=student_id
                )

            except (ValueError, TypeError):
                pass

        document_type = (
            self.request.query_params.get(
                "document_type"
            )
        )

        if document_type:
            queryset = queryset.filter(
                document_type=document_type
            )

        return queryset

    def perform_create(self, serializer):
        document = create_student_document(
            uploaded_by=self.request.user,
            **serializer.validated_data
        )

        serializer.instance = document


class StudentDocumentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    GET:
        Retrieve a student document.

    PUT/PATCH:
        Update document information.

    DELETE:
        Soft-delete the document.
    """

    serializer_class = StudentDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            StudentDocument.objects
            .select_related(
                "student",
                "student__family",
                "uploaded_by",
            )
        )

    def perform_update(self, serializer):
        update_student_document(
            serializer.instance,
            **serializer.validated_data
        )

    def perform_destroy(self, instance):
        deactivate_student_document(
            instance
        )


# ============================================================
# BATCH STUDENT PROGRESSION
# ============================================================

class BatchStudentProgressionView(APIView):
    """
    Process progression for multiple students at once.

    POST:
        /api/students/progressions/batch/
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):

        serializer = BatchStudentProgressionSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        try:

            results = process_batch_student_progression(
                student_ids=data["student_ids"],
                from_academic_year=data[
                    "from_academic_year"
                ],
                from_class_level=data[
                    "from_class_level"
                ],
                to_academic_year=data[
                    "to_academic_year"
                ],
                decision=data["decision"],
                student_overrides=data.get(
                    "student_overrides",
                    {},
                ),
                remarks=data.get(
                    "remarks",
                    "",
                ),
                processed_by=request.user,
            )

        except DjangoValidationError as exc:

            if hasattr(exc, "message_dict"):
                detail = exc.message_dict
            else:
                detail = exc.messages

            return Response(
                {
                    "detail": detail,
                    "success": False,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "success": True,
                "message": (
                    f"Successfully processed "
                    f"{len(results)} student(s)."
                ),
                "count": len(results),
                "results": results,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# ADMISSION NUMBER CONFIGURATION
# ============================================================

class AdmissionNumberConfigView(APIView):
    """
    Returns the school's admission-number configuration.

    The configuration is defined centrally in:

        school_backend/SMS_constants.py

    Example response:

        {
            "prefix": "PPS",
            "separator": "-",
            "digits": 5,
            "formatted_prefix": "PPS-",
            "example": "PPS-00000"
        }

    This endpoint is read-only.
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        config = STUDENT_ADMISSION_NUMBER_CONFIG

        prefix = config.get(
            "prefix",
            "",
        )

        separator = config.get(
            "separator",
            "",
        )

        digits = config.get(
            "digits",
            5,
        )

        formatted_prefix = (
            f"{prefix}{separator}"
        )

        example = (
            f"{formatted_prefix}"
            f"{'0' * digits}"
        )

        data = {
            "prefix": prefix,
            "separator": separator,
            "digits": digits,
            "formatted_prefix": formatted_prefix,
            "example": example,
        }

        serializer = AdmissionNumberConfigSerializer(
            data=data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        return Response(
            serializer.validated_data
        )


# ============================================================
# STUDENT REFERENCE DATA
# ============================================================

class KenyaCountiesReferenceView(APIView):
    """
    Returns the configured Kenyan counties and
    their sub-counties.

    This data comes directly from:

        school_backend/SMS_constants.py

    Example:

        {
            "Mombasa": [
                "Changamwe",
                "Jomvu",
                "Kisauni"
            ],
            "Bomet": [
                "Bomet Central",
                "Bomet East",
                "Chepalungu",
                "Konoin",
                "Sotik"
            ]
        }

    This endpoint is read-only.
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        return Response(
            KENYA_COUNTIES
        )
# ======================================================
# REFERENCE DATA
# ======================================================

class StudentReferenceDataView(APIView):
    """
    Returns reference data required by the Student Form.

    Includes:
    - Kenyan counties
    - Sub-counties for each county
    - Religion choices

    Endpoint:
        GET /api/students/reference-data/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        counties = [
            {
                "name": county,
                "sub_counties": sub_counties,
            }
            for county, sub_counties in KENYA_COUNTIES.items()
        ]

        religions = [
            {
                "value": value,
                "label": label,
            }
            for value, label in RELIGION_CHOICES
        ]

        return Response(
            {
                "counties": counties,
                "religions": religions,
            }
        )

class ReligionReferenceView(APIView):
    """
    Returns the configured religion choices.

    This data comes directly from:

        school_backend/SMS_constants.py

    Response format:

        [
            {
                "value": "christianity",
                "label": "Christianity"
            },
            {
                "value": "islam",
                "label": "Islam"
            }
        ]

    This endpoint is read-only.
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        data = [
            {
                "value": value,
                "label": label,
            }
            for value, label in RELIGION_CHOICES
        ]

        return Response(
            data
        )