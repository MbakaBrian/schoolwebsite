from django.contrib import admin

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
# FAMILY ADMIN
# ============================================================

@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = (
        "family_id",
        "family_name",
        "town",
        "county",
        "sub_county",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
        "county",
        "sub_county",
    )

    search_fields = (
        "family_id",
        "family_name",
        "town",
        "county",
        "sub_county",
        "postal_address",
    )

    readonly_fields = (
        "family_id",
        "created_at",
        "updated_at",
    )

    ordering = (
        "family_name",
    )

    fieldsets = (
        (
            "Family Information",
            {
                "fields": (
                    "family_id",
                    "family_name",
                )
            },
        ),
        (
            "Current Residence",
            {
                "fields": (
                    "address",
                    "town",
                    "county",
                    "sub_county",
                    "postal_address",
                )
            },
        ),
        (
            "Status",
            {
                "fields": (
                    "is_active",
                )
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# PARENT / GUARDIAN ADMIN
# ============================================================

@admin.register(ParentGuardian)
class ParentGuardianAdmin(admin.ModelAdmin):
    list_display = (
        "parent_id",
        "full_name",
        "family",
        "gender",
        "mobile_number",
        "email",
        "occupation",
        "is_active",
    )

    list_filter = (
        "is_active",
        "gender",
        "occupation",
    )

    search_fields = (
        "parent_id",
        "first_name",
        "middle_name",
        "last_name",
        "national_id_number",
        "mobile_number",
        "alternative_mobile",
        "email",
        "occupation",
        "employer",
        "family__family_name",
    )

    readonly_fields = (
        "parent_id",
        "created_at",
        "updated_at",
    )

    autocomplete_fields = (
        "family",
    )

    ordering = (
        "last_name",
        "first_name",
    )

    fieldsets = (
        (
            "Parent / Guardian Identification",
            {
                "fields": (
                    "parent_id",
                    "first_name",
                    "middle_name",
                    "last_name",
                    "national_id_number",
                    "gender",
                )
            },
        ),
        (
            "Family & Contact Information",
            {
                "fields": (
                    "family",
                    "mobile_number",
                    "alternative_mobile",
                    "email",
                    "address",
                )
            },
        ),
        (
            "Employment Information",
            {
                "fields": (
                    "occupation",
                    "employer",
                )
            },
        ),
        (
            "Status",
            {
                "fields": (
                    "is_active",
                )
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# STUDENT ADMIN
# ============================================================

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        "student_id",
        "admission_number",
        "full_name",
        "gender",
        "date_of_birth",
        "family",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "gender",
        "nationality",
        "home_county",
        "home_sub_county",
    )

    search_fields = (
        "student_id",
        "admission_number",
        "first_name",
        "middle_name",
        "last_name",
        "birth_certificate_entry_number",
        "birth_certificate_number",
        "nemis_kemis_number",
        "child_assessment_number",
        "home_county",
        "home_sub_county",
        "family__family_name",
    )

    readonly_fields = (
        "student_id",
        "created_at",
        "updated_at",
    )

    autocomplete_fields = (
        "family",
    )

    date_hierarchy = "date_of_birth"

    ordering = (
        "last_name",
        "first_name",
    )

    fieldsets = (
        (
            "Student Identification",
            {
                "fields": (
                    "student_id",
                    "admission_number",
                    "first_name",
                    "middle_name",
                    "last_name",
                    "photo",
                    "status",
                )
            },
        ),
        (
            "Personal Information",
            {
                "fields": (
                    "date_of_birth",
                    "place_of_birth",
                    "gender",
                    "nationality",
                )
            },
        ),
        (
            "Birth Certificate Information",
            {
                "fields": (
                    "birth_certificate_entry_number",
                    "birth_certificate_number",
                )
            },
        ),
        (
            "National Education Identification",
            {
                "fields": (
                    "nemis_kemis_number",
                    "child_assessment_number",
                )
            },
        ),
        (
            "Family & Home Origin",
            {
                "fields": (
                    "family",
                    "home_county",
                    "home_sub_county",
                )
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# STUDENT ↔ PARENT / GUARDIAN ADMIN
# ============================================================

@admin.register(StudentParent)
class StudentParentAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "parent_guardian",
        "relationship",
        "is_primary",
        "has_parental_responsibility",
        "receives_communications",
        "receives_fee_notifications",
        "is_emergency_contact",
    )

    list_filter = (
        "relationship",
        "is_primary",
        "has_parental_responsibility",
        "receives_communications",
        "receives_fee_notifications",
        "is_emergency_contact",
    )

    search_fields = (
        "student__student_id",
        "student__admission_number",
        "student__first_name",
        "student__middle_name",
        "student__last_name",
        "parent_guardian__parent_id",
        "parent_guardian__first_name",
        "parent_guardian__middle_name",
        "parent_guardian__last_name",
        "parent_guardian__mobile_number",
    )

    autocomplete_fields = (
        "student",
        "parent_guardian",
    )

    ordering = (
        "student__last_name",
        "student__first_name",
        "-is_primary",
    )


# ============================================================
# STUDENT ENROLLMENT ADMIN
# ============================================================

@admin.register(StudentEnrollment)
class StudentEnrollmentAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "academic_year",
        "class_level",
        "stream",
        "enrollment_date",
        "status",
        "exit_date",
    )

    list_filter = (
        "status",
        "academic_year",
        "class_level",
        "stream",
        "enrollment_date",
    )

    search_fields = (
        "student__student_id",
        "student__admission_number",
        "student__first_name",
        "student__middle_name",
        "student__last_name",
        "previous_school",
        "exit_reason",
    )

    autocomplete_fields = (
        "student",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    date_hierarchy = "enrollment_date"

    ordering = (
        "-academic_year__start_date",
        "student__last_name",
        "student__first_name",
    )

    fieldsets = (
        (
            "Student",
            {
                "fields": (
                    "student",
                )
            },
        ),
        (
            "Academic Placement",
            {
                "fields": (
                    "academic_year",
                    "class_level",
                    "stream",
                )
            },
        ),
        (
            "Enrollment Information",
            {
                "fields": (
                    "enrollment_date",
                    "status",
                    "previous_school",
                )
            },
        ),
        (
            "Exit Information",
            {
                "fields": (
                    "exit_date",
                    "exit_reason",
                )
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# EMERGENCY CONTACT ADMIN
# ============================================================

@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "full_name",
        "relationship",
        "mobile_number",
        "priority",
        "is_active",
    )

    list_filter = (
        "is_active",
        "relationship",
        "priority",
    )

    search_fields = (
        "student__student_id",
        "student__admission_number",
        "student__first_name",
        "student__last_name",
        "full_name",
        "relationship",
        "mobile_number",
        "alternative_mobile",
        "email",
    )

    autocomplete_fields = (
        "student",
    )

    ordering = (
        "student__last_name",
        "student__first_name",
        "priority",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


# ============================================================
# STUDENT DOCUMENT ADMIN
# ============================================================

@admin.register(StudentDocument)
class StudentDocumentAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "document_type",
        "title",
        "uploaded_by",
        "uploaded_at",
        "is_active",
    )

    list_filter = (
        "document_type",
        "is_active",
        "uploaded_at",
    )

    search_fields = (
        "student__student_id",
        "student__admission_number",
        "student__first_name",
        "student__middle_name",
        "student__last_name",
        "title",
        "description",
        "uploaded_by__username",
        "uploaded_by__first_name",
        "uploaded_by__last_name",
    )

    autocomplete_fields = (
        "student",
        "uploaded_by",
    )

    readonly_fields = (
        "uploaded_by",
        "uploaded_at",
    )

    ordering = (
        "-uploaded_at",
    )

    fieldsets = (
        (
            "Document Information",
            {
                "fields": (
                    "student",
                    "document_type",
                    "title",
                    "file",
                    "description",
                )
            },
        ),
        (
            "Upload Information",
            {
                "fields": (
                    "uploaded_by",
                    "uploaded_at",
                )
            },
        ),
        (
            "Status",
            {
                "fields": (
                    "is_active",
                )
            },
        ),
    )



