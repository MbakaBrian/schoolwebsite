from decimal import Decimal

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from django.utils import timezone

from school_backend.SMS_constants import (
    UNIT_CHOICES,
    PAYMENT_METHODS,
)


class Receipt(models.Model):
    receipt_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )

    store = models.CharField(
        max_length=255,
    )

    payment_method = models.CharField(
        max_length=30,
        choices=PAYMENT_METHODS,
    )

    date = models.DateField(
        default=timezone.now,
    )

    payment_reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    recorded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="recorded_receipts",
    )

    attachment = models.FileField(
        upload_to="receipts/%Y/%m/",
        validators=[
            FileExtensionValidator(
                allowed_extensions=[
                    "jpg",
                    "jpeg",
                    "png",
                    "pdf",
                ]
            )
        ],
        blank=True,
        null=True,
    )

    # Automatically calculated from all ReceiptItems
    total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        editable=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def save(self, *args, **kwargs):
        """
        Save the receipt.

        A receipt ID is automatically generated when the receipt
        is first created.
        """

        if not self.receipt_id:
            year = timezone.now().year

            last_receipt = (
                Receipt.objects
                .filter(
                    receipt_id__startswith=f"RP-{year}-"
                )
                .order_by("-id")
                .first()
            )

            if last_receipt:
                last_number = int(
                    last_receipt.receipt_id.split("-")[-1]
                )
                next_number = last_number + 1
            else:
                next_number = 1

            self.receipt_id = (
                f"RP-{year}-{next_number:05d}"
            )

        super().save(*args, **kwargs)

    def update_total(self):
        """
        Recalculate the receipt total from ALL ReceiptItems.

        Example:

            Item 1 = 9,783.00
            Item 2 = 14,131.00

            Receipt total = 23,914.00
        """

        total = sum(
            (
                item.total
                for item in self.items.all()
            ),
            Decimal("0.00"),
        )

        # Round to 2 decimal places to match the model field.
        total = total.quantize(Decimal("0.01"))

        self.total = total

        # Update only the total column in the database.
        Receipt.objects.filter(
            pk=self.pk
        ).update(
            total=total,
            updated_at=timezone.now(),
        )

    def __str__(self):
        return self.receipt_id

    class Meta:
        ordering = ["-date", "-id"]
        verbose_name = "Receipt"
        verbose_name_plural = "Receipts"

class Department(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
    )

    code = models.SlugField(
        max_length=100,
        unique=True,
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

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class SubDepartment(models.Model):

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="subdepartments",
    )

    name = models.CharField(
        max_length=100,
    )

    code = models.SlugField(
        max_length=100,
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

    def __str__(self):
        return f"{self.department.name} - {self.name}"

    class Meta:
        ordering = ["name"]

        constraints = [
            models.UniqueConstraint(
                fields=["department", "name"],
                name="unique_subdepartment_per_department",
            )
        ]

class ReceiptItem(models.Model):

    receipt = models.ForeignKey(
        Receipt,
        on_delete=models.CASCADE,
        related_name="items",
    )

    item_name = models.CharField(
        max_length=255,
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="receipt_items",
    )

    subdepartment = models.ForeignKey(
        SubDepartment,
        on_delete=models.PROTECT,
        related_name="receipt_items",
        blank=True,
        null=True,
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES,
    )

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        editable=False,
    )

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.subdepartment:
            if self.subdepartment.department_id != self.department_id:
                raise ValidationError({
                    "subdepartment": (
                        "The selected subdepartment must "
                        "belong to the selected department."
                    )
                })

    def save(self, *args, **kwargs):

        self.full_clean()

        self.total = (
            Decimal(self.quantity)
            * Decimal(self.unit_price)
        ).quantize(Decimal("0.01"))

        super().save(*args, **kwargs)

        self.receipt.update_total()

    def delete(self, *args, **kwargs):

        receipt = self.receipt

        super().delete(*args, **kwargs)

        receipt.update_total()

    def __str__(self):
        return (
            f"{self.item_name} - "
            f"{self.receipt.receipt_id}"
        )

    class Meta:
        ordering = ["id"]