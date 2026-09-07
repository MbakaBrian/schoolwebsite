from django.db import models
from django.contrib.auth.models import User
from datetime import date
from core.constants import TERMS, GRADE_CHOICES  # ✅ import constants from core
class Parent(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    REFERRAL_SOURCE_CHOICES = [
        ('self', 'Self'),
        ('website', 'Website'),
        ('brochure', 'Brochure'),
        ('other', 'Other'),
    ]

    national_id = models.CharField(max_length=20, unique=True, null=False, blank=True)
    emergency_number = models.CharField(max_length=15, null=True, blank=True)
    email = models.EmailField(blank=True, null=True)
    residence = models.CharField(max_length=100, null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    referred_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='referrals'
    )
    referral_source = models.CharField(
        max_length=20,
        choices=REFERRAL_SOURCE_CHOICES,
        null=True,
        blank=True,
        help_text="Select if not referred by an existing parent"
    )

    def __str__(self):
        return f"{self.name} ({self.national_id}) ({self.status})"


class Student(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('transferred', 'Transferred'),
        ('completed', 'Completed'),
    ]  

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    admission_number = models.CharField(max_length=20, unique=True)
    birth_certificate_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    second_name = models.CharField(max_length=50, blank=True, null=True)
    surname = models.CharField(max_length=50, null=True, blank=True)

    # ✅ Use string reference to avoid circular import
    location = models.ForeignKey("fees.TransportStage", on_delete=models.SET_NULL, null=True, blank=True)

    grade = models.CharField(max_length=20, choices=GRADE_CHOICES, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female')], default='Male')
    is_boarder = models.BooleanField(default=False)
    parent = models.ForeignKey(Parent, on_delete=models.CASCADE, related_name="children", null=True, blank=True)
    fee_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    term_registered = models.CharField(max_length=1, choices=TERMS, default='1')
    year_registered = models.PositiveIntegerField(default=date.today().year)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')

    def save(self, *args, **kwargs):
        if self.date_of_birth:
            today = date.today()
            self.age = (
                today.year - self.date_of_birth.year -
                ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.surname} - {self.admission_number} ({self.status})"

class Stream(models.Model):
    grade = models.CharField(max_length=50 , choices=GRADE_CHOICES)  # e.g. "Grade 1"
    name = models.CharField(max_length=50 )   # e.g. "Alpha"

    class Meta:
        unique_together = ('grade', 'name')
        ordering = ['grade', 'name']

    def __str__(self):
        return f"{self.grade} {self.name}"