from django.db import models
from django.contrib.auth.models import User
from datetime import date
from SMS_apps.students.models import GRADE_CHOICES

class Teacher(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('retired', 'Retired'),
        ('resigned', 'Resigned'),
    ]

    EDUCATIONAL_LEVEL_CHOICES = [
        ('Certificate', 'Certificate'),
        ('Diploma', 'Diploma'),
        ('Degree', 'Degree'),  
        ('Masters', 'Masters'),  
        ('PHD', 'PhD'),  
        ('Untrained teacher', 'Untrained teacher'),  
    ]

    national_id = models.CharField(max_length=20, unique=True, default="00000000")
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    surname = models.CharField(max_length=50, null=True, blank=True)
    tsc_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    date_of_employment = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female')], null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    nhif_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    nssf_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    bank_account_number = models.CharField(max_length=30, unique=True, null=True, blank=True)
    highest_education_level = models.CharField(
        max_length=50,
        choices=EDUCATIONAL_LEVEL_CHOICES,
        null=True,
        blank=True,
        default='Degree'
    )
    grade = models.CharField(max_length=10, choices=GRADE_CHOICES, default="Grade")
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    def save(self, *args, **kwargs):
        if self.date_of_birth:
            today = date.today()
            self.age = (
                today.year - self.date_of_birth.year -
                ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
            )
        super().save(*args, **kwargs)  

    def __str__(self):
        return f"{self.first_name} {self.surname} - {self.tsc_number} ({self.status})"
