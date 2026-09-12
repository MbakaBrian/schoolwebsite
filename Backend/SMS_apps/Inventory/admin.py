from django.contrib import admin
from .models import InventoryItem, InventoryStock, InventoryTransaction, Store , InventoryLocation
admin.site.register(InventoryItem)
admin.site.register(InventoryStock)
admin.site.register(InventoryTransaction)
admin.site.register(Store)
admin.site.register(InventoryLocation)
# Register your models here.
