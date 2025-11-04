from django.db import models
from django.utils import timezone
from decimal import Decimal
from core.constants import TERMS, GRADE_CHOICES  # ✅ use shared constants

PAYMENT_TYPES = [
    ('M-Pesa', 'M-Pesa'),
    ('Bank Transfer', 'Bank Transfer'),
    ('Cash', 'Cash'),
    ('Agent', 'Agent'),
]

class Fee(models.Model):
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE)  # ✅ string ref
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    term = models.CharField(max_length=50)
    due_date = models.DateField()

    @property
    def is_paid_in_full(self):
        return self.paid_amount >= self.amount

    @property
    def is_partially_paid(self):
        return 0 < self.paid_amount < self.amount

    @property
    def is_unpaid(self):
        return self.paid_amount == 0



class TransportRoute(models.Model):
    name = models.CharField(max_length=100, unique=True)  # e.g., "Nairobi Route", "Mombasa Route"
    description = models.TextField(blank=True, null=True)  # optional notes about route

    def __str__(self):
        return self.name


class TransportStage(models.Model):
    route = models.ForeignKey(TransportRoute, on_delete=models.CASCADE, related_name="stages")
    stage_name = models.CharField(max_length=100)  # e.g., "Kasarani", "Westlands"
    fee_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.stage_name} ({self.route.name}) - {self.fee_amount} KES"


class GradeFeeStructure(models.Model):
    grade = models.CharField(max_length=20, choices=GRADE_CHOICES)
    term = models.CharField(max_length=10, choices=TERMS)
    interview_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tuition_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    pocket_money = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    meals_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    boarding_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    swimming_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    textbook_fund_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    educational_trips_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    insurance_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    activity_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    rubric_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    others = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    year = models.PositiveIntegerField(default=timezone.now().year)
    total_fees = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=0.00)

    def save(self, *args, **kwargs):
        self.total_fees = (
            self.interview_fee + self.registration_fee + self.tuition_fee +
            self.pocket_money + self.meals_fee + self.boarding_fee +
            self.swimming_fee + self.textbook_fund_fee + self.educational_trips_fee +
            self.insurance_fee + self.activity_fee + self.rubric_fee + self.others
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Grade {self.grade} - {self.term} - {self.total_fees} KES"


class FeePayment(models.Model):
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE, related_name="fee_payments")
    term = models.CharField(max_length=10, choices=TERMS)
    interview_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tuition_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    pocket_money = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    meals_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    boarding_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    swimming_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    textbook_fund_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    educational_trips_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    insurance_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    activity_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    rubric_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    others = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    transport_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    referral_discount_applied = models.BooleanField(default=False)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=0.00)
    date = models.DateTimeField(auto_now_add=True)
    year = models.PositiveIntegerField(default=timezone.now().year)
    payment_type = models.CharField(max_length=50, choices=PAYMENT_TYPES)
    mpesa_ref_number = models.CharField(max_length=100, blank=True, null=True)
    bank_receipt_number = models.CharField(max_length=100, blank=True, null=True)
    agent_reference_number = models.CharField(max_length=100, blank=True, null=True)

    def save(self, *args, **kwargs):
        """Apply sibling discounts + referral logic"""
        from students.models import Student, Parent  # ✅ import here to avoid circular import at module level

        # --- Boarding fee sibling discount ---
        siblings = Student.objects.filter(parent=self.student.parent).order_by('admission_number')
        sibling_index = list(siblings).index(self.student) + 1

        if self.student.is_boarder:
            if sibling_index == 1:
                boarding_fee = self.boarding_fee
            elif sibling_index == 2:
                boarding_fee = self.boarding_fee * Decimal('0.75')
            elif sibling_index == 3:
                boarding_fee = self.boarding_fee * Decimal('0.5')
            else:
                boarding_fee = Decimal('0.00')
        else:
            boarding_fee = Decimal('0.00')
        self.boarding_fee = boarding_fee

        # --- Referral discount check ---
        referral_discount = Decimal('0.00')
        parent = self.student.parent
        if parent and Parent.objects.filter(referred_by=parent).exists():
            referral_discount = Decimal('1000.00')  # Example flat discount
            self.referral_discount_applied = True

        # --- Calculate total fees ---
        self.total_amount = (
            self.interview_fee + self.registration_fee + self.tuition_fee +
            self.pocket_money + self.meals_fee + self.boarding_fee +
            self.swimming_fee + self.textbook_fund_fee + self.educational_trips_fee +
            self.insurance_fee + self.activity_fee + self.rubric_fee +
            self.others + self.transport_fee - referral_discount
        )

        super().save(*args, **kwargs)
