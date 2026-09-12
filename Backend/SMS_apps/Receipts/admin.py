from django.contrib import admin
from .models import Receipt, ReceiptItem
# Register your models here.
admin.site.register(Receipt)
admin.site.register(ReceiptItem)