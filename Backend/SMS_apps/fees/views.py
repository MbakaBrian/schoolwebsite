from django.shortcuts import render
from .models import Fee, GradeFeeStructure, FeePayment
from rest_framework import viewsets
from .serializers import (
    FeeSerializer,
    GradeFeeStructureSerializer,
    FeePaymentSerializer,
)
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsRole

# Create your views here.


class GradeFeeStructureViewSet(viewsets.ModelViewSet):
    queryset = GradeFeeStructure.objects.all()
    serializer_class = GradeFeeStructureSerializer
    permission_classes = [AllowAny]
    # permission_classes = [IsRole.for_roles("Head Teacher", "Master Admin")]


class FeePaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] 
    queryset = FeePayment.objects.all()
    serializer_class = FeePaymentSerializer
    permission_classes = [IsRole.for_roles("Head Teacher", "Master Admin")]

from .models import TransportRoute, TransportStage
from .serializers import TransportRouteSerializer, TransportStageSerializer

class TransportRouteViewSet(viewsets.ModelViewSet):
    queryset = TransportRoute.objects.all()
    serializer_class = TransportRouteSerializer
    permission_classes = [AllowAny]


class TransportStageViewSet(viewsets.ModelViewSet):
    queryset = TransportStage.objects.all()
    serializer_class = TransportStageSerializer
    permission_classes = [AllowAny]