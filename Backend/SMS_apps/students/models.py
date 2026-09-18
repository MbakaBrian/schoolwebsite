from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from django.core.exceptions import ValidationError
from django.db import models

from school_backend.SMS_constants import STUDENT_ADMISSION_NUMBER_CONFIG
# ==========================================================
# FAMILY
# ==========================================================

class Family(models.Model):
    """
    Represents a household/family.

    A family can have multiple students and
    multiple parents/guardians.
    """

    family_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )

    family_name = models.CharField(
        max_length=150,
    )

    address = models.CharField(
        max_length=255,
        blank=True,
    )

    town = models.CharField(
        max_length=100,
        blank=True,
    )

    county = models.CharField(
        max_length=100,
        blank=True,
    )

    sub_county = models.CharField(
        max_length=100,
        blank=True,
    )

    postal_address = models.CharField(
        max_length=100,
        blank=True,
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
        ordering = ["family_name"]

    def __str__(self):
        return f"{self.family_id} - {self.family_name}"

    def save(self, *args, **kwargs):
        if not self.family_id:
            last_family = (
                Family.objects
                .filter(family_id__startswith="FAM-")
                .order_by("-id")
                .first()
            )

            if last_family and last_family.family_id:
                try:
                    last_number = int(
                        last_family.family_id.replace("FAM-", "")
                    )
                except ValueError:
                    last_number = 0
            else:
                last_number = 0

            self.family_id = f"FAM-{last_number + 1:05d}"

        super().save(*args, **kwargs)


# ==========================================================
# PARENT / GUARDIAN
# ==========================================================

class ParentGuardian(models.Model):
    """
    Represents an individual parent or guardian.

    One parent/guardian can be associated with multiple students.
    """

    parent_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )

    family = models.ForeignKey(
        Family,
        on_delete=models.PROTECT,
        related_name="parents_guardians",
        null=True,
        blank=True,
    )

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
        unique=True,
        null=True,
        blank=True,
    )

    gender = models.CharField(
        max_length=20,
        blank=True,
    )

    mobile_number = models.CharField(
        max_length=30,
        blank=True,
    )

    alternative_mobile_number = models.CharField(
        max_length=30,
        blank=True,
    )

    email = models.EmailField(
        blank=True,
    )

    occupation = models.CharField(
        max_length=150,
        blank=True,
    )

    employer = models.CharField(
        max_length=150,
        blank=True,
    )

    address = models.CharField(
        max_length=255,
        blank=True,
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
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.parent_id} - {self.full_name}"

    @property
    def full_name(self):
        return " ".join(
            part
            for part in [
                self.first_name,
                self.middle_name,
                self.last_name,
            ]
            if part
        )

    def save(self, *args, **kwargs):
        if not self.parent_id:
            last_parent = (
                ParentGuardian.objects
                .filter(parent_id__startswith="PAR-")
                .order_by("-id")
                .first()
            )

            if last_parent and last_parent.parent_id:
                try:
                    last_number = int(
                        last_parent.parent_id.replace("PAR-", "")
                    )
                except ValueError:
                    last_number = 0
            else:
                last_number = 0

            self.parent_id = f"PAR-{last_number + 1:05d}"

        super().save(*args, **kwargs)


# ==========================================================
# STUDENT
# ==========================================================


class Student(models.Model):
    """
    Permanent student identity/profile.

    IMPORTANT:
    Academic class, stream and academic-year placement do NOT
    belong here.

    Those are stored in StudentEnrollment so that historical
    academic records are preserved.
    """

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("graduated", "Graduated"),
        ("transferred", "Transferred"),
        ("withdrawn", "Withdrawn"),
        ("inactive", "Inactive"),
    ]

    # ------------------------------------------------------
    # INTERNAL STUDENT ID
    # ------------------------------------------------------

    student_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )

    # ------------------------------------------------------
    # ADMISSION NUMBER
    # ------------------------------------------------------
    #
    # IMPORTANT:
    # This is NOT automatically generated.
    #
    # The school/user enters the admission number.
    #
    # The backend then normalizes the entered value according
    # to STUDENT_ADMISSION_NUMBER_CONFIG.
    #
    # Example:
    #
    # 109        -> PPS-00109
    # 00109      -> PPS-00109
    # PPS-00109  -> PPS-00109
    #
    # This allows existing admission numbers to be migrated
    # while keeping one consistent format in the database.
    #

    admission_number = models.CharField(
        max_length=30,
        unique=True,
        help_text=(
            "Permanent school admission number. "
            "Enter the existing admission number. "
            "The system will normalize it according to "
            "the configured admission-number format."
        ),
    )

    # ------------------------------------------------------
    # FAMILY
    # ------------------------------------------------------

    family = models.ForeignKey(
        Family,
        on_delete=models.PROTECT,
        related_name="students",
        null=True,
        blank=True,
    )

    # ------------------------------------------------------
    # PERSONAL INFORMATION
    # ------------------------------------------------------

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

    date_of_birth = models.DateField(
        null=True,
        blank=True,
    )

    place_of_birth = models.CharField(
        max_length=150,
        blank=True,
    )

    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True,
    )

    nationality = models.CharField(
        max_length=100,
        default="Kenyan",
        blank=True,
    )

    religion = models.CharField(
        max_length=100,
        blank=True,
    )

    # ------------------------------------------------------
    # BIRTH CERTIFICATE
    # ------------------------------------------------------

    birth_certificate_entry_number = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
    )

    birth_certificate_number = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
    )

    birth_certificate_submitted = models.BooleanField(
        default=False,
    )

    # ------------------------------------------------------
    # HOME / RESIDENCE
    # ------------------------------------------------------

    home_county = models.CharField(
        max_length=100,
        blank=True,
    )

    home_subcounty = models.CharField(
        max_length=100,
        blank=True,
    )

    # ------------------------------------------------------
    # KEMIS / NEMIS / ASSESSMENT
    # ------------------------------------------------------

    nemis_kemis_number = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
    )

    child_assessment_number = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
    )

    # ------------------------------------------------------
    # MEDICAL / ALLERGIES
    # ------------------------------------------------------

    has_allergies_or_illness = models.BooleanField(
        default=False,
    )

    allergies_or_illness_details = models.TextField(
        blank=True,
    )

    # ------------------------------------------------------
    # SPECIAL ABILITIES
    # ------------------------------------------------------

    has_special_abilities = models.BooleanField(
        default=False,
    )

    special_abilities_details = models.TextField(
        blank=True,
    )

    # ------------------------------------------------------
    # PHOTO
    # ------------------------------------------------------

    photo = models.ImageField(
        upload_to="students/photos/",
        null=True,
        blank=True,
    )

    # ------------------------------------------------------
    # STATUS
    # ------------------------------------------------------

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )

    # ------------------------------------------------------
    # TIMESTAMPS
    # ------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # ------------------------------------------------------
    # META
    # ------------------------------------------------------

    class Meta:
        ordering = ["last_name", "first_name"]

    # ------------------------------------------------------
    # STRING REPRESENTATION
    # ------------------------------------------------------

    def __str__(self):
        return f"{self.admission_number} - {self.full_name}"

    # ------------------------------------------------------
    # FULL NAME
    # ------------------------------------------------------

    @property
    def full_name(self):
        return " ".join(
            part
            for part in [
                self.first_name,
                self.middle_name,
                self.last_name,
            ]
            if part
        )

    # ------------------------------------------------------
    # ADMISSION NUMBER NORMALIZATION
    # ------------------------------------------------------

    def normalize_admission_number(self):
        """
        Normalize the admission number according to the
        school's STUDENT_ADMISSION_NUMBER_CONFIG.

        The admission number is still manually entered by
        the user. This method only ensures that the value
        stored in the database follows the configured format.

        Example with:

            prefix = PPS
            separator = -
            digits = 5

        Results:

            109        -> PPS-00109
            00109      -> PPS-00109
            PPS-00109  -> PPS-00109
            52000      -> PPS-52000
            PPS-52000  -> PPS-52000
        """

        config = STUDENT_ADMISSION_NUMBER_CONFIG

        prefix = str(config["prefix"]).strip()
        separator = str(config["separator"])
        digits = int(config["digits"])

        # --------------------------------------------------
        # Admission number is required
        # --------------------------------------------------

        if self.admission_number is None:
            raise ValidationError({
                "admission_number": "Admission number is required."
            })

        value = str(self.admission_number).strip()

        if not value:
            raise ValidationError({
                "admission_number": "Admission number is required."
            })

        # --------------------------------------------------
        # Build the configured prefix
        # --------------------------------------------------

        configured_prefix = f"{prefix}{separator}"

        # --------------------------------------------------
        # Remove the configured prefix if the user already
        # entered it.
        #
        # Comparison is case-insensitive.
        # --------------------------------------------------

        if value.upper().startswith(
            configured_prefix.upper()
        ):
            value = value[
                len(configured_prefix):
            ]

        # --------------------------------------------------
        # After removing the prefix, only digits are allowed.
        # --------------------------------------------------

        if not value.isdigit():
            raise ValidationError({
                "admission_number": (
                    f"Admission number must contain only "
                    f"numbers, optionally preceded by "
                    f"'{configured_prefix}'."
                )
            })

        # --------------------------------------------------
        # Prevent numbers exceeding the configured digit
        # length.
        # --------------------------------------------------

        if len(value) > digits:
            raise ValidationError({
                "admission_number": (
                    f"Admission number cannot contain more "
                    f"than {digits} digits."
                )
            })

        # --------------------------------------------------
        # Add leading zeros according to the configuration.
        # --------------------------------------------------

        numeric_part = value.zfill(digits)

        # --------------------------------------------------
        # Build final stored admission number.
        # --------------------------------------------------

        self.admission_number = (
            f"{prefix}{separator}{numeric_part}"
        )

    # ------------------------------------------------------
    # MODEL VALIDATION
    # ------------------------------------------------------

    def clean(self):
        errors = {}

        # --------------------------------------------------
        # Allergy / illness validation
        # --------------------------------------------------

        if (
            self.has_allergies_or_illness
            and not self.allergies_or_illness_details.strip()
        ):
            errors["allergies_or_illness_details"] = (
                "Please provide details about the allergy "
                "or illness."
            )

        # --------------------------------------------------
        # Special ability validation
        # --------------------------------------------------

        if (
            self.has_special_abilities
            and not self.special_abilities_details.strip()
        ):
            errors["special_abilities_details"] = (
                "Please provide details about the special "
                "ability."
            )

        if errors:
            raise ValidationError(errors)

    # ------------------------------------------------------
    # SAVE
    # ------------------------------------------------------

    def save(self, *args, **kwargs):

        # --------------------------------------------------
        # GENERATE INTERNAL STUDENT ID
        # --------------------------------------------------
        #
        # This is different from the admission number.
        #
        # student_id:
        #     STU-00001
        #     STU-00002
        #
        # It is generated internally and cannot be edited
        # by the user.
        #

        if not self.student_id:

            last_student = (
                Student.objects
                .filter(
                    student_id__startswith="STU-"
                )
                .order_by("-id")
                .first()
            )

            if (
                last_student
                and last_student.student_id
            ):
                try:
                    last_number = int(
                        last_student.student_id.replace(
                            "STU-",
                            "",
                        )
                    )
                except ValueError:
                    last_number = 0
            else:
                last_number = 0

            self.student_id = (
                f"STU-{last_number + 1:05d}"
            )

        # --------------------------------------------------
        # NORMALIZE ADMISSION NUMBER
        # --------------------------------------------------
        #
        # The user still chooses the admission number.
        # We only make sure it follows the configured
        # PPS-00000 format.
        #

        self.normalize_admission_number()

        # --------------------------------------------------
        # VALIDATE MODEL
        # --------------------------------------------------

        self.full_clean()

        # --------------------------------------------------
        # SAVE TO DATABASE
        # --------------------------------------------------

        super().save(*args, **kwargs)



# ==========================================================
# STUDENT ↔ PARENT / GUARDIAN
# ==========================================================

class StudentParent(models.Model):
    """
    Connects students with parents/guardians.

    This allows:
    - one student to have multiple parents/guardians
    - one parent/guardian to have multiple students
    """

    RELATIONSHIP_CHOICES = [
        ("mother", "Mother"),
        ("father", "Father"),
        ("guardian", "Guardian"),
        ("step_mother", "Step Mother"),
        ("step_father", "Step Father"),
        ("grandparent", "Grandparent"),
        ("sibling", "Sibling"),
        ("other", "Other"),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="parent_relationships",
    )

    parent_guardian = models.ForeignKey(
        ParentGuardian,
        on_delete=models.PROTECT,
        related_name="student_relationships",
    )

    relationship = models.CharField(
        max_length=30,
        choices=RELATIONSHIP_CHOICES,
    )

    is_primary = models.BooleanField(
        default=False,
    )

    has_parental_responsibility = models.BooleanField(
        default=True,
    )

    receives_communication = models.BooleanField(
        default=True,
    )

    receives_fee_notifications = models.BooleanField(
        default=True,
    )

    is_emergency_contact = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "parent_guardian"],
                name="unique_student_parent_guardian",
            ),
        ]

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.parent_guardian.full_name}"
        )


# ==========================================================
# STUDENT ENROLLMENT
# ==========================================================

class StudentEnrollment(models.Model):
    """
    Represents a student's placement for a particular
    academic year.

    This is where class and stream history is stored.

    Example:

        2026
        Grade 5
        Stream A

        2027
        Grade 6
        Stream A

    The 2026 record is NEVER overwritten when the student
    progresses.
    """

    STATUS_CHOICES = [
        ("active", "Active"),
        ("completed", "Completed"),
        ("transferred", "Transferred"),
        ("withdrawn", "Withdrawn"),
        ("inactive", "Inactive"),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.PROTECT,
        related_name="enrollments",
    )

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
        null=True,
        blank=True,
    )

    enrollment_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )

    exit_date = models.DateField(
        null=True,
        blank=True,
    )

    exit_reason = models.TextField(
        blank=True,
    )

    previous_school = models.CharField(
        max_length=255,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "academic_year"],
                name="unique_student_academic_year_enrollment",
            ),
        ]
        ordering = [
            "-academic_year_id",
            "student__last_name",
            "student__first_name",
        ]

    def __str__(self):
        stream_name = self.stream.name if self.stream else "No Stream"

        return (
            f"{self.student.full_name} - "
            f"{self.class_level.name} - "
            f"{stream_name}"
        )

    def clean(self):
        if self.stream and self.stream.class_level_id != self.class_level_id:
            raise ValidationError({
                "stream": (
                    "The selected stream does not belong to "
                    "the selected class level."
                )
            })

        if self.exit_date and self.exit_date < self.enrollment_date:
            raise ValidationError({
                "exit_date": (
                    "Exit date cannot be earlier than "
                    "the enrollment date."
                )
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


# ==========================================================
# EMERGENCY CONTACT
# ==========================================================

class EmergencyContact(models.Model):
    """
    Emergency contact for a student.

    This does not have to be a parent/guardian.
    """

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="emergency_contacts",
    )

    name = models.CharField(
        max_length=150,
    )

    relationship = models.CharField(
        max_length=100,
    )

    mobile_number = models.CharField(
        max_length=30,
    )

    alternative_mobile_number = models.CharField(
        max_length=30,
        blank=True,
    )

    email = models.EmailField(
        blank=True,
    )

    address = models.CharField(
        max_length=255,
        blank=True,
    )

    priority = models.PositiveIntegerField(
        default=1,
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
        constraints = [
            models.UniqueConstraint(
                fields=["student", "priority"],
                name="unique_student_emergency_priority",
            ),
        ]
        ordering = ["student", "priority"]

    def __str__(self):
        return f"{self.student.full_name} - {self.name}"


# ==========================================================
# STUDENT DOCUMENT
# ==========================================================

class StudentDocument(models.Model):
    """
    Documents attached to a student.
    """

    DOCUMENT_TYPE_CHOICES = [
        ("birth_certificate", "Birth Certificate"),
        ("previous_school_report", "Previous School Report"),
        ("transfer_certificate", "Transfer Certificate"),
        ("medical_form", "Medical Form"),
        ("medical_document", "Medical Document"),
        ("admission_form", "Admission Form"),
        ("parent_guardian_document", "Parent/Guardian Document"),
        ("other", "Other"),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="documents",
    )

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

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="uploaded_student_documents",
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.student.full_name} - {self.title}"


# ==========================================================
# STUDENT PROGRESSION
# ==========================================================

class StudentProgression(models.Model):
    """
    Records a student's academic progression decision.

    This is an audit/history record.

    It connects:
        Previous enrollment
              ↓
        Progression decision
              ↓
        New enrollment (where applicable)

    IMPORTANT:
    StudentEnrollment remains the source of truth for
    academic history.

    StudentProgression records HOW and WHY the student moved
    from one enrollment to another.
    """

    DECISION_CHOICES = [
        ("promoted", "Promoted"),
        ("repeating", "Repeating"),
        ("transferred", "Transferred"),
        ("graduated", "Graduated"),
        ("withdrawn", "Withdrawn"),
    ]

    # ------------------------------------------------------
    # STUDENT
    # ------------------------------------------------------

    student = models.ForeignKey(
        Student,
        on_delete=models.PROTECT,
        related_name="progressions",
    )

    # ------------------------------------------------------
    # PREVIOUS ENROLLMENT
    # ------------------------------------------------------

    from_enrollment = models.OneToOneField(
        StudentEnrollment,
        on_delete=models.PROTECT,
        related_name="progression_from",
    )

    # ------------------------------------------------------
    # TARGET ACADEMIC YEAR
    # ------------------------------------------------------

    to_academic_year = models.ForeignKey(
        "academics.AcademicYear",
        on_delete=models.PROTECT,
        related_name="student_progressions",
    )

    # ------------------------------------------------------
    # TARGET CLASS
    # ------------------------------------------------------
    #
    # Nullable because transferred, graduated and withdrawn
    # students do not receive a new class.
    #

    to_class_level = models.ForeignKey(
        "academics.ClassLevel",
        on_delete=models.PROTECT,
        related_name="incoming_student_progressions",
        null=True,
        blank=True,
    )

    # ------------------------------------------------------
    # TARGET STREAM
    # ------------------------------------------------------
    #
    # For promotion/repeating:
    #
    #     default = previous stream
    #
    # The Head Teacher can change it.
    #

    to_stream = models.ForeignKey(
        "academics.Stream",
        on_delete=models.PROTECT,
        related_name="incoming_student_progressions",
        null=True,
        blank=True,
    )

    # ------------------------------------------------------
    # RESULTING ENROLLMENT
    # ------------------------------------------------------
    #
    # Promoted/repeating students receive a new enrollment.
    #
    # Graduated/transferred/withdrawn students do not.
    #

    to_enrollment = models.OneToOneField(
        StudentEnrollment,
        on_delete=models.PROTECT,
        related_name="progression_to",
        null=True,
        blank=True,
    )

    # ------------------------------------------------------
    # DECISION
    # ------------------------------------------------------

    decision = models.CharField(
        max_length=20,
        choices=DECISION_CHOICES,
    )

    decision_date = models.DateField(
        auto_now_add=True,
    )

    remarks = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-decision_date", "-id"]

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.get_decision_display()} - "
            f"{self.to_academic_year}"
        )

    def clean(self):
        errors = {}

        # --------------------------------------------------
        # SOURCE ENROLLMENT MUST BELONG TO STUDENT
        # --------------------------------------------------

        if (
            self.from_enrollment_id
            and self.student_id
            and self.from_enrollment.student_id != self.student_id
        ):
            errors["from_enrollment"] = (
                "The source enrollment does not belong "
                "to the selected student."
            )

        # --------------------------------------------------
        # TARGET STREAM MUST BELONG TO TARGET CLASS
        # --------------------------------------------------

        if self.to_stream and self.to_class_level:
            if self.to_stream.class_level_id != self.to_class_level_id:
                errors["to_stream"] = (
                    "The selected target stream does not belong "
                    "to the selected target class."
                )

        # --------------------------------------------------
        # PROMOTED / REPEATING REQUIRE TARGET CLASS
        # --------------------------------------------------

        if self.decision in ["promoted", "repeating"]:
            if not self.to_class_level_id:
                errors["to_class_level"] = (
                    "A target class is required for "
                    "promoted or repeating students."
                )

        # --------------------------------------------------
        # EXIT DECISIONS MUST NOT HAVE TARGET CLASS/STREAM
        # --------------------------------------------------

        if self.decision in [
            "transferred",
            "graduated",
            "withdrawn",
        ]:
            if self.to_class_level_id:
                errors["to_class_level"] = (
                    "Transferred, graduated and withdrawn "
                    "students should not have a target class."
                )

            if self.to_stream_id:
                errors["to_stream"] = (
                    "Transferred, graduated and withdrawn "
                    "students should not have a target stream."
                )

            if self.to_enrollment_id:
                errors["to_enrollment"] = (
                    "Transferred, graduated and withdrawn "
                    "students should not have a resulting enrollment."
                )

        # --------------------------------------------------
        # RESULTING ENROLLMENT VALIDATION
        # --------------------------------------------------

        if self.to_enrollment_id:
            target_enrollment = self.to_enrollment

            if target_enrollment.student_id != self.student_id:
                errors["to_enrollment"] = (
                    "The resulting enrollment does not belong "
                    "to the selected student."
                )

            if (
                self.to_academic_year_id
                and target_enrollment.academic_year_id
                != self.to_academic_year_id
            ):
                errors["to_enrollment"] = (
                    "The resulting enrollment does not belong "
                    "to the selected target academic year."
                )

            if (
                self.to_class_level_id
                and target_enrollment.class_level_id
                != self.to_class_level_id
            ):
                errors["to_enrollment"] = (
                    "The resulting enrollment does not belong "
                    "to the selected target class."
                )

            if (
                self.to_stream_id
                and target_enrollment.stream_id
                != self.to_stream_id
            ):
                errors["to_enrollment"] = (
                    "The resulting enrollment does not belong "
                    "to the selected target stream."
                )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

