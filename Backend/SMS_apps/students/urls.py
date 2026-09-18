from django.urls import path

from .views import (
    # ------------------------------------------------------
    # Reference / Configuration
    # ------------------------------------------------------
    AdmissionNumberConfigView,
    StudentReferenceDataView,

    # ------------------------------------------------------
    # Families
    # ------------------------------------------------------
    FamilyListCreateView,
    FamilyDetailView,

    # ------------------------------------------------------
    # Parents / Guardians
    # ------------------------------------------------------
    ParentGuardianListCreateView,
    ParentGuardianDetailView,

    # ------------------------------------------------------
    # Students
    # ------------------------------------------------------
    StudentListCreateView,
    StudentDetailView,

    # ------------------------------------------------------
    # Student ↔ Parent / Guardian
    # ------------------------------------------------------
    StudentParentListCreateView,
    StudentParentDetailView,

    # ------------------------------------------------------
    # Student Enrollments
    # ------------------------------------------------------
    StudentEnrollmentListCreateView,
    StudentEnrollmentDetailView,

    # ------------------------------------------------------
    # Student Progression
    # ------------------------------------------------------
    StudentProgressionListCreateView,
    StudentProgressionDetailView,

    # ------------------------------------------------------
    # Emergency Contacts
    # ------------------------------------------------------
    EmergencyContactListCreateView,
    EmergencyContactDetailView,

    # ------------------------------------------------------
    # Student Documents
    # ------------------------------------------------------
    StudentDocumentListCreateView,
    StudentDocumentDetailView,

    # ------------------------------------------------------
    # Batch Student Progression
    # ------------------------------------------------------
    BatchStudentProgressionView,
)


urlpatterns = [

    # ======================================================
    # REFERENCE / CONFIGURATION
    # ======================================================

    path(
        "admission-number-config/",
        AdmissionNumberConfigView.as_view(),
        name="admission-number-config",
    ),

    path(
        "reference-data/",
        StudentReferenceDataView.as_view(),
        name="student-reference-data",
    ),


    # ======================================================
    # FAMILIES
    # ======================================================

    path(
        "families/",
        FamilyListCreateView.as_view(),
        name="family-list-create",
    ),

    path(
        "families/<int:pk>/",
        FamilyDetailView.as_view(),
        name="family-detail",
    ),


    # ======================================================
    # PARENTS / GUARDIANS
    # ======================================================

    path(
        "parents/",
        ParentGuardianListCreateView.as_view(),
        name="parent-list-create",
    ),

    path(
        "parents/<int:pk>/",
        ParentGuardianDetailView.as_view(),
        name="parent-detail",
    ),


    # ======================================================
    # STUDENTS
    # ======================================================

    path(
        "students/",
        StudentListCreateView.as_view(),
        name="student-list-create",
    ),

    path(
        "students/<int:pk>/",
        StudentDetailView.as_view(),
        name="student-detail",
    ),


    # ======================================================
    # STUDENT ↔ PARENT / GUARDIAN
    # ======================================================

    path(
        "student-parents/",
        StudentParentListCreateView.as_view(),
        name="student-parent-list-create",
    ),

    path(
        "student-parents/<int:pk>/",
        StudentParentDetailView.as_view(),
        name="student-parent-detail",
    ),


    # ======================================================
    # STUDENT ENROLLMENTS
    # ======================================================

    path(
        "enrollments/",
        StudentEnrollmentListCreateView.as_view(),
        name="enrollment-list-create",
    ),

    path(
        "enrollments/<int:pk>/",
        StudentEnrollmentDetailView.as_view(),
        name="enrollment-detail",
    ),


    # ======================================================
    # STUDENT PROGRESSION
    # ======================================================

    path(
        "progressions/",
        StudentProgressionListCreateView.as_view(),
        name="student-progression-list-create",
    ),

    path(
        "progressions/<int:pk>/",
        StudentProgressionDetailView.as_view(),
        name="student-progression-detail",
    ),

    path(
        "progressions/batch/",
        BatchStudentProgressionView.as_view(),
        name="batch-student-progression",
    ),


    # ======================================================
    # EMERGENCY CONTACTS
    # ======================================================

    path(
        "emergency-contacts/",
        EmergencyContactListCreateView.as_view(),
        name="emergency-contact-list-create",
    ),

    path(
        "emergency-contacts/<int:pk>/",
        EmergencyContactDetailView.as_view(),
        name="emergency-contact-detail",
    ),


    # ======================================================
    # STUDENT DOCUMENTS
    # ======================================================

    path(
        "documents/",
        StudentDocumentListCreateView.as_view(),
        name="student-document-list-create",
    ),

    path(
        "documents/<int:pk>/",
        StudentDocumentDetailView.as_view(),
        name="student-document-detail",
    ),
]