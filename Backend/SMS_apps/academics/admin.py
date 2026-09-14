from django.contrib import admin
from .models import (AcademicYear , AcademicTerm , AcademicCalendarEvent , ClassLevel, 
                     Stream )
# Register your models here.
admin.site.register(AcademicYear)
admin.site.register(AcademicTerm)
admin.site.register(AcademicCalendarEvent)
admin.site.register(ClassLevel)
admin.site.register(Stream)