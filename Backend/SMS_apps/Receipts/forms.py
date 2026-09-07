from django import forms
from .models import Receipt
from .models import ReceiptItem



class ReceiptForm(forms.ModelForm):
    class Meta:
        model = Receipt
        fields = [
            "store",
            "payment_method",
            "date",
            "payment_reference",
            "description",
            "attachment",
        ]

        widgets = {
            "store": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter store/supplier"
            }),

            "payment_method": forms.Select(attrs={
                "class": "form-control"
            }),

            "date": forms.DateInput(attrs={
                "class": "form-control",
                "type": "date"
            }),

            "payment_reference": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Optional payment reference"
            }),

            "description": forms.Textarea(attrs={
                "class": "form-control",
                "rows": 4,
                "placeholder": "Enter receipt description"
            }),

            "attachment": forms.ClearableFileInput(attrs={
                "class": "form-control",
                "accept": ".jpg,.jpeg,.png,.pdf"
            }),
        }


from django import forms
from .models import ReceiptItem


class ReceiptItemForm(forms.ModelForm):

    class Meta:
        model = ReceiptItem

        fields = [
            "item_name",
            "department",
            "quantity",
            "unit",
            "unit_price",
        ]

        widgets = {
            "item_name": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter item name",
            }),

            "department": forms.Select(attrs={
                "class": "form-control",
            }),

            "quantity": forms.NumberInput(attrs={
                "class": "form-control",
                "placeholder": "Enter quantity",
                "step": "0.01",
                "min": "0.01",
            }),

            "unit": forms.Select(attrs={
                "class": "form-control",
            }),

            "unit_price": forms.NumberInput(attrs={
                "class": "form-control",
                "placeholder": "Enter unit price",
                "step": "0.01",
                "min": "0",
            }),
        }