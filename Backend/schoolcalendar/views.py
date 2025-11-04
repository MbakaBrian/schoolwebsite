from django.shortcuts import render
from rest_framework import viewsets
from .models import TermDate
from .serializers import TermDateSerializer

# Create your views here.
class TermDateViewSet(viewsets.ModelViewSet):
    queryset = TermDate.objects.all()
    serializer_class = TermDateSerializer

