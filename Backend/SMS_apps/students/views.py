from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import (
    Family,
    ParentGuardian,
    Student,
    StudentParent,
    StudentEnrollment,
    EmergencyContact,
    StudentDocument,
)

from .serializers import (
    FamilySerializer,
    ParentGuardianSerializer,
    StudentSerializer,
    StudentParentSerializer,
    StudentEnrollmentSerializer,
    EmergencyContactSerializer,
    StudentDocumentSerializer,
)

from .services import (
    # Family
    create_family,
    update_family,
    deactivate_family,

    # Parent / Guardian
    create_parent_guardian,
    update_parent_guardian,
    deactivate_parent_guardian,

    # Student
    create_student,
    update_student,
    deactivate_student,

    # Student ↔ Parent / Guardian
    create_student_parent_relationship,
    update_student_parent_relationship,
    delete_student_parent_relationship,

    # Enrollment
    create_student_enrollment,
    update_student_enrollment,
    deactivate_student_enrollment,

    # Emergency Contact
    create_emergency_contact,
    update_emergency_contact,
    deactivate_emergency_contact,

    # Student Document
    create_student_document,
    update_student_document,
    deactivate_student_document,
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
        create_family(
            **serializer.validated_data
        )


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
        return (
            ParentGuardian.objects
            .filter(is_active=True)
            .select_related("family")
            .order_by(
                "last_name",
                "first_name",
            )
        )

    def perform_create(self, serializer):
        create_parent_guardian(
            **serializer.validated_data
        )


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
        return ParentGuardian.objects.all()

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

        # ----------------------------------------------------
        # OPTIONAL FAMILY FILTER
        # ----------------------------------------------------
        #
        # Example:
        # /api/students/?family=1
        #

        family_id = self.request.query_params.get("family")

        if family_id and family_id not in ["undefined", "null", ""]:
            try:
                family_id = int(family_id)
                queryset = queryset.filter(family_id=family_id)
            except (ValueError, TypeError):
                pass

        # ----------------------------------------------------
        # OPTIONAL ADMISSION NUMBER SEARCH
        # ----------------------------------------------------
        #
        # Example:
        # /api/students/?admission_number=ADM-00001
        #

        admission_number = (
            self.request.query_params.get(
                "admission_number"
            )
        )

        if admission_number:
            queryset = queryset.filter(
                admission_number__iexact=admission_number
            )

        # ----------------------------------------------------
        # OPTIONAL NAME SEARCH
        # ----------------------------------------------------
        #
        # Example:
        # /api/students/?search=John
        #

        search = self.request.query_params.get(
            "search"
        )

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
        create_student(
            **serializer.validated_data
        )


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

    The student detail endpoint exposes the complete
    permanent student profile, including admission-form
    information such as:

    - Religion
    - Birth certificate submission
    - Allergies/illnesses
    - Medical conditions
    - Special abilities
    - Special ability description
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
                "parent_guardian",
                "parent_guardian__family",
            )
            .order_by(
                "student__last_name",
                "student__first_name",
                "-is_primary",
            )
        )

        # ----------------------------------------------------
        # OPTIONAL STUDENT FILTER
        # ----------------------------------------------------
        #
        # Example:
        # /api/students/parents/?student=1
        #

        student_id = self.request.query_params.get(
            "student"
        )

        if student_id:
            queryset = queryset.filter(
                student_id=student_id
            )

        # ----------------------------------------------------
        # OPTIONAL PARENT/GUARDIAN FILTER
        # ----------------------------------------------------

        parent_id = self.request.query_params.get(
            "parent_guardian"
        )

        if parent_id:
            queryset = queryset.filter(
                parent_guardian_id=parent_id
            )

        return queryset

    def perform_create(self, serializer):
        create_student_parent_relationship(
            **serializer.validated_data
        )


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
            "parent_guardian",
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

    Enrollment handles:
    - Academic year
    - Grade/Class
    - Stream
    - Enrollment date
    - Previous school
    - Enrollment status

    This is where "Grade Applying For" from the paper
    admission form is represented.
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
        .order_by("-academic_year__id", "student__last_name")
        )

        # ----------------------------------------------------
        # OPTIONAL STUDENT FILTER
        # ----------------------------------------------------

        student_id = self.request.query_params.get(
            "student"
        )

        if student_id:
            queryset = queryset.filter(
                student_id=student_id
            )

        # ----------------------------------------------------
        # OPTIONAL ACADEMIC YEAR FILTER
        # ----------------------------------------------------

        academic_year = (
            self.request.query_params.get(
                "academic_year"
            )
        )

        if academic_year:
            queryset = queryset.filter(
                academic_year_id=academic_year
            )

        # ----------------------------------------------------
        # OPTIONAL CLASS LEVEL FILTER
        # ----------------------------------------------------

        class_level = (
            self.request.query_params.get(
                "class_level"
            )
        )

        if class_level:
            queryset = queryset.filter(
                class_level_id=class_level
            )

        # ----------------------------------------------------
        # OPTIONAL STREAM FILTER
        # ----------------------------------------------------

        stream = self.request.query_params.get(
            "stream"
        )

        if stream:
            queryset = queryset.filter(
                stream_id=stream
            )

        # ----------------------------------------------------
        # OPTIONAL STATUS FILTER
        # ----------------------------------------------------

        status = self.request.query_params.get(
            "status"
        )

        if status:
            queryset = queryset.filter(
                status=status
            )

        return queryset

    def perform_create(self, serializer):
        create_student_enrollment(
            **serializer.validated_data
        )


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

        # ----------------------------------------------------
        # OPTIONAL STUDENT FILTER
        # ----------------------------------------------------

        student_id = self.request.query_params.get(
            "student"
        )

        if student_id:
            queryset = queryset.filter(
                student_id=student_id
            )

        # ----------------------------------------------------
        # OPTIONAL PRIORITY FILTER
        # ----------------------------------------------------

        priority = self.request.query_params.get(
            "priority"
        )

        if priority:
            queryset = queryset.filter(
                priority=priority
            )

        return queryset

    def perform_create(self, serializer):
        create_emergency_contact(
            **serializer.validated_data
        )


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

        # ----------------------------------------------------
        # OPTIONAL STUDENT FILTER
        # ----------------------------------------------------

        student_id = self.request.query_params.get(
            "student"
        )

        if student_id:
            queryset = queryset.filter(
                student_id=student_id
            )

        # ----------------------------------------------------
        # OPTIONAL DOCUMENT TYPE FILTER
        # ----------------------------------------------------

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
        create_student_document(
            uploaded_by=self.request.user,
            **serializer.validated_data
        )


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

