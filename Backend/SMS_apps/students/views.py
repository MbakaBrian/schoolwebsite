from rest_framework import viewsets
from .models import Student, Parent
from .serializers import StudentSerializer, ParentSerializer , StreamSerializer
from .models import Stream
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response

class ParentViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] 
    queryset = Parent.objects.all()
    serializer_class = ParentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] 
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class StreamViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Stream.objects.all()
    serializer_class = StreamSerializer
    @action(detail=False, methods=['get'])
    def grade_choices(self, request):
        """Return the list of available grade choices."""
        from .models import GRADE_CHOICES
        return Response([{"value": g[0], "label": g[1]} for g in GRADE_CHOICES])