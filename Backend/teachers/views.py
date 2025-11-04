from django.shortcuts import render
from rest_framework import viewsets
from .models import Teacher
from .serializers import  TeacherSerializer
from rest_framework.permissions import AllowAny
# Create your views here.
class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [AllowAny]