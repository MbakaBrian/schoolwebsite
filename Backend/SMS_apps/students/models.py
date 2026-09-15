from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


# ============================================================
# FAMILY
# ============================================================

class Family(models.Model):
    """
    Represents a family/household within the school system.

    A family can have:
    - Multiple students/siblings
    - Multiple parents/guardians

    Current residence information belongs to the family.
    Student origin information belongs to Student.
    """

    # --------------------------------------------------------
    # FAMILY IDENTIFICATION
    # --------------------------------------------------------

    family_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text="Unique family identifier, e.g. FAM-00001.",
    )

    family_name = models.CharField(
        max_length=150,
        help_text="Family/household name, e.g. Mbaka Family.",
    )

    # --------------------------------------------------------
    # CURRENT RESIDENCE
    # --------------------------------------------------------

    address = models.TextField(
        blank=True,
        help_text="Current physical/home address.",
    )

    town = models.CharField(
        max_length=100,
        blank=True,
        help_text="Town or locality where the family currently resides.",
    )

    county = models.CharField(
        max_length=100,
        blank=True,
        help_text="County where the family currently resides.",
    )

    sub_county = models.CharField(
        max_length=100,
        blank=True,
        help_text="Sub-county where the family currently resides.",
    )

    postal_address = models.CharField(
        max_length=100,
        blank=True,
        help_text="Postal address, if applicable.",
    )

    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    is_active = models.BooleanField(
        default=True,
    )

    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # --------------------------------------------------------
    # METHODS
    # --------------------------------------------------------

    def save(self, *args, **kwargs):
        """
        Automatically generate a family ID when creating
        a new family.
        """

        if not self.family_id:

            last_family = (
                Family.objects
                .filter(
                    family_id__startswith="FAM-"
                )
                .order_by("-id")
                .first()
            )

            if last_family:
                try:
                    last_number = int(
                        last_family.family_id.split("-")[-1]
                    )
                except (IndexError, ValueError):
                    last_number = 0
            else:
                last_number = 0

            self.family_id = (
                f"FAM-{last_number + 1:05d}"
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.family_name} ({self.family_id})"

    class Meta:
        ordering = ["family_name"]
        verbose_name = "Family"
        verbose_name_plural = "Families"


# ============================================================
# PARENT / GUARDIAN
# ============================================================

class ParentGuardian(models.Model):
    """
    Represents a parent or guardian.

    A parent/guardian can be connected to multiple students
    through StudentParent.

    A parent/guardian can also be associated with a family.
    """

    # --------------------------------------------------------
    # IDENTIFICATION
    # --------------------------------------------------------

    parent_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text="Unique parent/guardian identifier, e.g. PAR-00001.",
    )

    # --------------------------------------------------------
    # FAMILY
    # --------------------------------------------------------

    family = models.ForeignKey(
        Family,
        on_delete=models.PROTECT,
        related_name="parents_guardians",
        blank=True,
        null=True,
        help_text="Family/household this parent or guardian belongs to.",
    )

    # --------------------------------------------------------
    # PERSONAL INFORMATION
    # --------------------------------------------------------

    first_name = models.CharField(
        max_length=100,
    )

    middle_name = models.CharField(
        max_length=100,
        blank=True,
    )

    last_name = models.CharField(
        max_length=100,
    )

    national_id_number = models.CharField(
        max_length=50,
        blank=True,
        help_text="National identification number.",
    )

    gender = models.CharField(
        max_length=20,
        choices=[
            ("male", "Male"),
            ("female", "Female"),
            ("other", "Other"),
            ("not_specified", "Not Specified"),
        ],
        default="not_specified",
    )

    # --------------------------------------------------------
    # CONTACT INFORMATION
    # --------------------------------------------------------

    mobile_number = models.CharField(
        max_length=30,
    )

    alternative_mobile = models.CharField(
        max_length=30,
        blank=True,
    )

    email = models.EmailField(
        blank=True,
    )

    # --------------------------------------------------------
    # EMPLOYMENT INFORMATION
    # --------------------------------------------------------

    occupation = models.CharField(
        max_length=150,
        blank=True,
    )

    employer = models.CharField(
        max_length=150,
        blank=True,
    )

    # --------------------------------------------------------
    # PERSONAL ADDRESS
    # --------------------------------------------------------

    address = models.TextField(
        blank=True,
        help_text=(
            "Use when the parent/guardian has a different "
            "residence from the family."
        ),
    )

    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    is_active = models.BooleanField(
        default=True,
    )

    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # --------------------------------------------------------
    # PROPERTIES
    # --------------------------------------------------------

    @property
    def full_name(self):
        """
        Returns the parent's complete name.
        """

        names = [
            self.first_name,
            self.middle_name,
            self.last_name,
        ]

        return " ".join(
            name.strip()
            for name in names
            if name and name.strip()
        )

    # --------------------------------------------------------
    # METHODS
    # --------------------------------------------------------

    def save(self, *args, **kwargs):
        """
        Automatically generate a parent ID when creating
        a new parent/guardian.
        """

        if not self.parent_id:

            last_parent = (
                ParentGuardian.objects
                .filter(
                    parent_id__startswith="PAR-"
                )
                .order_by("-id")
                .first()
            )

            if last_parent:
                try:
                    last_number = int(
                        last_parent.parent_id.split("-")[-1]
                    )
                except (IndexError, ValueError):
                    last_number = 0
            else:
                last_number = 0

            self.parent_id = (
                f"PAR-{last_number + 1:05d}"
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.parent_id})"

    class Meta:
        ordering = [
            "last_name",
            "first_name",
        ]

        verbose_name = "Parent / Guardian"
        verbose_name_plural = "Parents / Guardians"


# ============================================================
# STUDENT
# ============================================================

class Student(models.Model):
    """
    Represents the student's permanent identity/profile.

    Academic placement is NOT stored directly here.

    Current and historical academic placement is handled
    through StudentEnrollment.
    """

    # --------------------------------------------------------
    # IDENTIFICATION
    # --------------------------------------------------------

    student_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text="Unique student identifier, e.g. STU-00001.",
    )

    admission_number = models.CharField(
        max_length=30,
        unique=True,
        help_text="Permanent school admission number.",
    )

    # --------------------------------------------------------
    # FAMILY
    # --------------------------------------------------------

    family = models.ForeignKey(
        Family,
        on_delete=models.PROTECT,
        related_name="students",
        blank=True,
        null=True,
        help_text="Family/household the student belongs to.",
    )

    # --------------------------------------------------------
    # PERSONAL INFORMATION
    # --------------------------------------------------------

    first_name = models.CharField(
        max_length=100,
    )

    middle_name = models.CharField(
        max_length=100,
        blank=True,
    )

    last_name = models.CharField(
        max_length=100,
    )

    date_of_birth = models.DateField()

    place_of_birth = models.CharField(
        max_length=150,
        blank=True,
    )

    gender = models.CharField(
        max_length=20,
        choices=[
            ("male", "Male"),
            ("female", "Female"),
            ("other", "Other"),
            ("not_specified", "Not Specified"),
        ],
        default="not_specified",
    )

    nationality = models.CharField(
        max_length=100,
        blank=True,
        default="Kenyan",
    )

    religion = models.CharField(
        max_length=100,
        blank=True,
        help_text="Student's religion or faith, if provided.",
    )

    # --------------------------------------------------------
    # BIRTH CERTIFICATE INFORMATION
    # --------------------------------------------------------

    birth_certificate_entry_number = models.CharField(
        max_length=100,
        blank=True,
        help_text="Birth certificate entry number.",
    )

    birth_certificate_number = models.CharField(
        max_length=100,
        blank=True,
        help_text="Birth certificate number.",
    )

    birth_certificate_submitted = models.BooleanField(
        default=False,
        help_text=(
            "Whether the student's birth certificate "
            "has been submitted to the school."
        ),
    )

    # --------------------------------------------------------
    # ORIGIN INFORMATION
    # --------------------------------------------------------

    home_county = models.CharField(
        max_length=100,
        blank=True,
        help_text="Student's home/origin county.",
    )

    home_sub_county = models.CharField(
        max_length=100,
        blank=True,
        help_text="Student's home/origin sub-county.",
    )

    # --------------------------------------------------------
    # EDUCATION IDENTIFIERS
    # --------------------------------------------------------

    nemis_kemis_number = models.CharField(
        max_length=100,
        blank=True,
        help_text="NEMIS/KEMIS number, where available.",
    )

    child_assessment_number = models.CharField(
        max_length=100,
        blank=True,
        help_text="Child Assessment Number, where available.",
    )

    # --------------------------------------------------------
    # MEDICAL INFORMATION
    # --------------------------------------------------------

    has_allergies_or_illness = models.BooleanField(
        default=False,
        help_text=(
            "Whether the student has any known allergies "
            "or illnesses."
        ),
    )

    medical_conditions = models.TextField(
        blank=True,
        help_text=(
            "Details of known allergies, illnesses, or "
            "special medical conditions."
        ),
    )

    # --------------------------------------------------------
    # SPECIAL ABILITIES
    # --------------------------------------------------------

    has_special_abilities = models.BooleanField(
        default=False,
        help_text=(
            "Whether the student has any special abilities "
            "or talents that the school should know about."
        ),
    )

    special_abilities = models.TextField(
        blank=True,
        help_text=(
            "Description of the student's special abilities "
            "or talents."
        ),
    )

    # --------------------------------------------------------
    # PROFILE
    # --------------------------------------------------------

    photo = models.ImageField(
        upload_to="students/photos/",
        blank=True,
        null=True,
    )

    # --------------------------------------------------------
    # STUDENT STATUS
    # --------------------------------------------------------

    status = models.CharField(
        max_length=30,
        choices=[
            ("active", "Active"),
            ("graduated", "Graduated"),
            ("transferred", "Transferred"),
            ("withdrawn", "Withdrawn"),
            ("inactive", "Inactive"),
        ],
        default="active",
    )

    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # --------------------------------------------------------
    # PROPERTIES
    # --------------------------------------------------------

    @property
    def full_name(self):
        """
        Returns the student's complete name.
        """

        names = [
            self.first_name,
            self.middle_name,
            self.last_name,
        ]

        return " ".join(
            name.strip()
            for name in names
            if name and name.strip()
        )

    # --------------------------------------------------------
    # METHODS
    # --------------------------------------------------------

    def save(self, *args, **kwargs):
        """
        Automatically generate a student ID when creating
        a new student.
        """

        if not self.student_id:

            last_student = (
                Student.objects
                .filter(
                    student_id__startswith="STU-"
                )
                .order_by("-id")
                .first()
            )

            if last_student:
                try:
                    last_number = int(
                        last_student.student_id.split("-")[-1]
                    )
                except (IndexError, ValueError):
                    last_number = 0
            else:
                last_number = 0

            self.student_id = (
                f"STU-{last_number + 1:05d}"
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.full_name} "
            f"({self.admission_number})"
        )

    class Meta:
        ordering = [
            "last_name",
            "first_name",
        ]

        verbose_name = "Student"
        verbose_name_plural = "Students"


# ============================================================
# STUDENT ↔ PARENT / GUARDIAN
# ============================================================

class StudentParent(models.Model):
    """
    Represents the relationship between a student and a
    parent/guardian.

    The relationship itself contains important information,
    therefore it is represented by its own model.
    """

    RELATIONSHIP_CHOICES = [
        ("mother", "Mother"),
        ("father", "Father"),
        ("step_mother", "Step Mother"),
        ("step_father", "Step Father"),
        ("guardian", "Guardian"),
        ("grandparent", "Grandparent"),
        ("aunt", "Aunt"),
        ("uncle", "Uncle"),
        ("sibling", "Sibling"),
        ("other", "Other"),
    ]

    # --------------------------------------------------------
    # RELATION
    # --------------------------------------------------------

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="parent_relationships",
    )

    parent_guardian = models.ForeignKey(
        ParentGuardian,
        on_delete=models.CASCADE,
        related_name="student_relationships",
    )

    relationship = models.CharField(
        max_length=30,
        choices=RELATIONSHIP_CHOICES,
    )

    # --------------------------------------------------------
    # RESPONSIBILITY / COMMUNICATION
    # --------------------------------------------------------

    is_primary = models.BooleanField(
        default=False,
        help_text=(
            "Whether this is the student's primary "
            "parent/guardian."
        ),
    )

    has_parental_responsibility = models.BooleanField(
        default=True,
    )

    receives_communications = models.BooleanField(
        default=True,
    )

    receives_fee_notifications = models.BooleanField(
        default=True,
    )

    is_emergency_contact = models.BooleanField(
        default=False,
    )

    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"{self.parent_guardian.full_name} - "
            f"{self.relationship} of "
            f"{self.student.full_name}"
        )

    class Meta:
        ordering = [
            "student",
            "-is_primary",
            "parent_guardian__last_name",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student",
                    "parent_guardian",
                ],
                name="unique_student_parent_relationship",
            ),
        ]

        verbose_name = "Student Parent Relationship"
        verbose_name_plural = "Student Parent Relationships"


# ============================================================
# STUDENT ENROLLMENT
# ============================================================

class StudentEnrollment(models.Model):
    """
    Represents a student's academic placement for a specific
    academic year.

    This connects the Student Foundation to the Academics
    Foundation.
    """

    STATUS_CHOICES = [
        ("active", "Active"),
        ("completed", "Completed"),
        ("transferred", "Transferred"),
        ("withdrawn", "Withdrawn"),
        ("inactive", "Inactive"),
    ]

    # --------------------------------------------------------
    # STUDENT
    # --------------------------------------------------------

    student = models.ForeignKey(
        Student,
        on_delete=models.PROTECT,
        related_name="enrollments",
    )

    # --------------------------------------------------------
    # ACADEMIC PLACEMENT
    # --------------------------------------------------------

    academic_year = models.ForeignKey(
        "academics.AcademicYear",
        on_delete=models.PROTECT,
        related_name="student_enrollments",
    )

    class_level = models.ForeignKey(
        "academics.ClassLevel",
        on_delete=models.PROTECT,
        related_name="student_enrollments",
    )

    stream = models.ForeignKey(
        "academics.Stream",
        on_delete=models.PROTECT,
        related_name="student_enrollments",
        blank=True,
        null=True,
    )

    # --------------------------------------------------------
    # ENROLLMENT INFORMATION
    # --------------------------------------------------------

    enrollment_date = models.DateField()

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="active",
    )

    exit_date = models.DateField(
        blank=True,
        null=True,
    )

    exit_reason = models.TextField(
        blank=True,
    )

    previous_school = models.CharField(
        max_length=200,
        blank=True,
    )

    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    def clean(self):
        """
        Validate the student's academic placement.
        """

        if self.stream and self.class_level:

            if self.stream.class_level_id != self.class_level_id:
                raise ValidationError({
                    "stream": (
                        "The selected stream must belong to "
                        "the selected class level."
                    )
                })

        if self.exit_date and self.enrollment_date:

            if self.exit_date < self.enrollment_date:
                raise ValidationError({
                    "exit_date": (
                        "Exit date cannot be earlier than "
                        "the enrollment date."
                    )
                })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):

        stream_name = (
            self.stream.name
            if self.stream
            else "No Stream"
        )

        return (
            f"{self.student.full_name} - "
            f"{self.class_level.name} - "
            f"{stream_name} - "
            f"{self.academic_year.name}"
        )

    class Meta:
        ordering = [
            "-academic_year__name",
            "student__last_name",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student",
                    "academic_year",
                ],
                name="unique_student_academic_year_enrollment",
            ),
        ]

        verbose_name = "Student Enrollment"
        verbose_name_plural = "Student Enrollments"


# ============================================================
# EMERGENCY CONTACT
# ============================================================

class EmergencyContact(models.Model):
    """
    Represents an emergency contact for a student.

    The contact does not have to be a parent/guardian.
    """

    # --------------------------------------------------------
    # STUDENT
    # --------------------------------------------------------

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="emergency_contacts",
    )

    # --------------------------------------------------------
    # CONTACT INFORMATION
    # --------------------------------------------------------

    full_name = models.CharField(
        max_length=200,
    )

    relationship = models.CharField(
        max_length=100,
    )

    mobile_number = models.CharField(
        max_length=30,
    )

    alternative_mobile = models.CharField(
        max_length=30,
        blank=True,
    )

    email = models.EmailField(
        blank=True,
    )

    address = models.TextField(
        blank=True,
    )

    # --------------------------------------------------------
    # PRIORITY / STATUS
    # --------------------------------------------------------

    priority = models.PositiveIntegerField(
        default=1,
        help_text=(
            "Priority of this emergency contact. "
            "1 represents the first contact."
        ),
    )

    is_active = models.BooleanField(
        default=True,
    )

    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"{self.full_name} - "
            f"{self.relationship} - "
            f"{self.student.full_name}"
        )

    class Meta:
        ordering = [
            "student",
            "priority",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student",
                    "priority",
                ],
                name="unique_student_emergency_contact_priority",
            ),
        ]

        verbose_name = "Emergency Contact"
        verbose_name_plural = "Emergency Contacts"


# ============================================================
# STUDENT DOCUMENT
# ============================================================

class StudentDocument(models.Model):
    """
    Stores documents belonging to a student.

    Documents can include admission records, birth
    certificates, medical documents, previous school
    reports, and transfer certificates.
    """

    DOCUMENT_TYPE_CHOICES = [
        (
            "birth_certificate",
            "Birth Certificate",
        ),
        (
            "previous_school_report",
            "Previous School Report",
        ),
        (
            "transfer_certificate",
            "Transfer Certificate",
        ),
        (
            "medical_form",
            "Medical Form",
        ),
        (
            "medical_document",
            "Medical Document",
        ),
        (
            "admission_form",
            "Admission Form",
        ),
        (
            "parent_guardian_document",
            "Parent/Guardian Document",
        ),
        (
            "other",
            "Other",
        ),
    ]

    # --------------------------------------------------------
    # STUDENT
    # --------------------------------------------------------

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="documents",
    )

    # --------------------------------------------------------
    # DOCUMENT INFORMATION
    # --------------------------------------------------------

    document_type = models.CharField(
        max_length=50,
        choices=DOCUMENT_TYPE_CHOICES,
    )

    title = models.CharField(
        max_length=200,
    )

    file = models.FileField(
        upload_to="students/documents/",
    )

    description = models.TextField(
        blank=True,
    )

    # --------------------------------------------------------
    # UPLOADING USER
    # --------------------------------------------------------

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="uploaded_student_documents",
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    # --------------------------------------------------------
    # METHODS
    # --------------------------------------------------------

    def __str__(self):
        return (
            f"{self.title} - "
            f"{self.student.full_name}"
        )

    class Meta:
        ordering = ["-uploaded_at"]

        verbose_name = "Student Document"
        verbose_name_plural = "Student Documents"
