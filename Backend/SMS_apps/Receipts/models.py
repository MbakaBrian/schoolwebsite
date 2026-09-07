from decimal import Decimal

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from django.utils import timezone


class Receipt(models.Model):

    PAYMENT_METHODS = [
        ("cash", "Cash"),
        ("mpesa", "M-Pesa"),
        ("bank_transfer", "Bank Transfer"),
        ("cheque", "Cheque"),
        ("card", "Card"),
        ("EFT", "EFT"),
        ("other", "Other"),
    ]

    receipt_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )

    store = models.CharField(
        max_length=255
    )

    payment_method = models.CharField(
        max_length=30,
        choices=PAYMENT_METHODS
    )

    date = models.DateField(
        default=timezone.now
    )

    payment_reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True
    )
    description = models.TextField(
        blank=True,
        null=True
    )

    recorded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="recorded_receipts"
    )

    attachment = models.FileField(
        upload_to="receipts/%Y/%m/",
        validators=[
            FileExtensionValidator(
                allowed_extensions=[
                    "jpg",
                    "jpeg",
                    "png",
                    "pdf"
                ]
            )
        ],
        blank=True,
        null=True
    )

    # Automatically calculated from ReceiptItems
    total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        editable=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):

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
        Recalculate the total of this receipt
        from all its receipt items.
        """

        total = sum(
            (item.total for item in self.items.all()),
            Decimal("0.00")
        )

        self.total = total

        # Update only the total field
        Receipt.objects.filter(
            pk=self.pk
        ).update(
            total=total
        )

    def __str__(self):
        return self.receipt_id

    class Meta:
        ordering = ["-date", "-id"]
        verbose_name = "Receipt"
        verbose_name_plural = "Receipts"


class ReceiptItem(models.Model):

    DEPARTMENT_CHOICES = [
        ("transport", "Transport"),
        ("classes", "Classes"),
        ("library", "Library"),
        ("office", "Office"),
        ("boarding", "Boarding"),
        ("sports", "Sports"),
        ("security", "Security"),
        ("school_maintenance", "School Maintenance"),
        ("catering_dining", "Catering / Dining"),
        ("ict", "ICT"),
        ("administration", "Administration"),
        ("medical", "Medical"),
        ("laboratory_science", "Laboratory / Science"),
        ("human_resource", "Human Resource"),
        ("agriculture", "Agriculture"),
        ("utilities", "Utilities"),
    ]

    UNIT_CHOICES = [
        ("liters", "Liters"),
        ("kg", "Kg"),
        ("pieces", "Pieces"),
        ("other", "Other"),
    ]

    receipt = models.ForeignKey(
        Receipt,
        on_delete=models.CASCADE,
        related_name="items"
    )

    item_name = models.CharField(
        max_length=255
    )

    department = models.CharField(
        max_length=50,
        choices=DEPARTMENT_CHOICES
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES
    )

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        editable=False
    )

    def save(self, *args, **kwargs):

        # Automatically calculate item total
        self.total = (
            Decimal(self.quantity)
            * Decimal(self.unit_price)
        )

        super().save(*args, **kwargs)

        # Update the parent receipt total
        self.receipt.update_total()

    def delete(self, *args, **kwargs):

        # Keep a reference to the receipt before deletion
        receipt = self.receipt

        super().delete(*args, **kwargs)

        # Recalculate receipt total after deleting the item
        receipt.update_total()

    def __str__(self):
        return f"{self.item_name} - {self.receipt.receipt_id}"

    class Meta:
        ordering = ["id"]
        verbose_name = "Receipt Item"
        verbose_name_plural = "Receipt Items"