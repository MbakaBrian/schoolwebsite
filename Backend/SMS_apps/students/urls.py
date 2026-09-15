from django.urls import path

from .views import (
    FamilyListCreateView,
    FamilyDetailView,

    ParentGuardianListCreateView,
    ParentGuardianDetailView,

    StudentListCreateView,
    StudentDetailView,

    StudentParentListCreateView,
    StudentParentDetailView,

    StudentEnrollmentListCreateView,
    StudentEnrollmentDetailView,

    EmergencyContactListCreateView,
    EmergencyContactDetailView,

    StudentDocumentListCreateView,
    StudentDocumentDetailView,
)


urlpatterns = [

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