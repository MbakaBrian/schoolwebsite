from django.contrib import admin
from .models import FeePayment, Fee,GradeFeeStructure ,TransportStage,TransportRoute
admin.site.register(TransportStage)
admin.site.register(TransportRoute)
admin.site.register(FeePayment)
admin.site.register(Fee)
admin.site.register(GradeFeeStructure)
