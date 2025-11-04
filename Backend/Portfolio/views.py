from rest_framework import viewsets, permissions
from .models import Project
from .serializers import ProjectSerializer
from rest_framework.permissions import AllowAny

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]


