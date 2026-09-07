from rest_framework import viewsets
from .models import Enrollment, GalleryImage, Event, TeamMember, Facility, Program
from .serializers import (
    EnrollmentSerializer,
    GalleryImageSerializer,
    EventSerializer,
    TeamMemberSerializer,
    FacilitySerializer,
    ProgramSerializer
)
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.core.mail import send_mail
from .models import Facility
from .serializers import FacilitySerializer

from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Value
from django.db.models.functions import Trim

from .models import Facility
from .serializers import FacilitySerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all().order_by("-submitted_at")
    serializer_class = EnrollmentSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        enrollment = serializer.save()
        self.send_notification_emails(enrollment)

    def send_notification_emails(self, enrollment):
        admin_email = "info@peppercornpremierschools.sc.ke"
        guardian_email = enrollment.guardian_email

        # 1️⃣ Email to admin
        send_mail(
            subject="New Enrollment Submitted",
            message=(
                f"New Enrollment Received:\n\n"
                f"Student: {enrollment.student_name}\n"
                f"Guardian: {enrollment.guardian_name}\n"
                f"Grade Interested: {enrollment.grade_interested}\n"
                f"Boarding/Day: {enrollment.boarder_or_day}\n"
                f"Email: {enrollment.guardian_email}\n"
                f"Phone: {enrollment.guardian_phone}"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            fail_silently=False,
        )

        # 2️⃣ Confirmation email to guardian
        send_mail(
            subject="Enrollment Received - Peppercorn Premier School",
            message=(
                f"Dear {enrollment.guardian_name},\n\n"
                f"Thank you for enrolling {enrollment.student_name} at Peppercorn Premier School.\n"
                f"We have received your enrollment details successfully and our admissions team "
                f"will contact you soon.\n\n"
                f"Warm regards,\nPeppercorn Premier School"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[guardian_email],
            fail_silently=False,
        )

class GalleryImageViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = GalleryImage.objects.all().order_by("-uploaded_at")
    serializer_class = GalleryImageSerializer
    # Add this method to pass the request context to the serializer
    def get_serializer_context(self):
        return {'request': self.request}


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("date")
    serializer_class = EventSerializer
    permission_classes = [AllowAny]


# In your views.py

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]

    # 4. CRITICAL: Add this method to pass the request context
    def get_serializer_context(self):
        """
        Pass the request context to the serializer to build absolute URLs.
        """
        return {'request': self.request}

#---------- Facilities ViewSet --------


from rest_framework.permissions import AllowAny, IsAuthenticated


class FacilityViewSet(viewsets.ModelViewSet):
    """
    Facility API
    - Public: list, retrieve
    - Admin: create, update, delete
    - Categories derived from Facility.category field
    """

    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    lookup_field = "slug"  # ✅ Use slug instead of ID

    # --------------------------------------------------
    # PERMISSIONS
    # --------------------------------------------------
    def get_permissions(self):
        """
        Allow public read access.
        Restrict write actions to authenticated users.
        """
        if self.action in ["list", "retrieve", "categories"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    # --------------------------------------------------
    # SERIALIZER CONTEXT (for image absolute URLs)
    # --------------------------------------------------
    def get_serializer_context(self):
        return {"request": self.request}

    # --------------------------------------------------
    # CREATE
    # --------------------------------------------------
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    # --------------------------------------------------
    # UPDATE (with optional image debugging)
    # --------------------------------------------------
    def update(self, request, *args, **kwargs):
        # 🔧 Debugging — safe to remove later
        print("---- FACILITY UPDATE DEBUG ----")
        print("FILES:", request.FILES)
        print("Image field:", request.data.get("image"))
        print("--------------------------------")

        return super().update(request, *args, **kwargs)

    # --------------------------------------------------
    # CATEGORY MANAGEMENT (NO SEPARATE MODEL)
    # --------------------------------------------------

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def categories(self, request):
        """
        GET /api/facilities/categories/
        Returns distinct category names
        """
        categories = (
            Facility.objects
            .exclude(category="")
            .annotate(category_clean=Trim("category"))
            .values_list("category_clean", flat=True)
            .distinct()
        )

        return Response(
            [{"name": c} for c in categories],
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["patch"], permission_classes=[IsAuthenticated])
    def rename_category(self, request):
        """
        PATCH /api/facilities/rename_category/
        {
            "old": "Science",
            "new": "Science Labs"
        }
        """
        old = request.data.get("old")
        new = request.data.get("new")

        if not old or not new:
            return Response(
                {"error": "Both old and new category names are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        Facility.objects.filter(category=old).update(category=new)

        return Response(
            {"success": True, "message": "Category renamed successfully"},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["delete"], permission_classes=[IsAuthenticated])
    def delete_category(self, request):
        """
        DELETE /api/facilities/delete_category/
        {
            "name": "Science"
        }
        """
        name = request.data.get("name")

        if not name:
            return Response(
                {"error": "Category name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        Facility.objects.filter(category=name).update(category="")

        return Response(
            {"success": True, "message": "Category deleted successfully"},
            status=status.HTTP_200_OK
        )



#---------- Programs ViewSet --------
class ProgramViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer


from .models import AboutHistory, AboutHistoryImage
from .serializers import AboutHistorySerializer, AboutHistoryImageSerializer
from rest_framework.parsers import MultiPartParser, FormParser


class AboutHistoryViewSet(viewsets.ModelViewSet):
    queryset = AboutHistory.objects.all()
    serializer_class = AboutHistorySerializer
    permission_classes = [AllowAny]


class AboutHistoryImageViewSet(viewsets.ModelViewSet):
    queryset = AboutHistoryImage.objects.all()
    serializer_class = AboutHistoryImageSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        # Automatically link to the first About record
        about_instance = AboutHistory.objects.first()
        serializer.save(about=about_instance)