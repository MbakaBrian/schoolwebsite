# dashboard/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from SMS_apps.students.models import Student
from SMS_apps.teachers.models import Teacher
from SMS_apps.fees.models import FeePayment, GradeFeeStructure
from SMS_apps.schoolcalendar.models import CurrentTermYear
from .serializers import (
    StudentSummarySerializer,
    TeacherSummarySerializer,
    HeadTeacherDashboardSerializer,
)
from rest_framework.permissions import AllowAny


class HeadTeacherDashboardView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        # --- HERO SECTION ---
        students = Student.objects.order_by("-id")[:5]
        students_data = StudentSummarySerializer(students, many=True).data

        teachers = Teacher.objects.order_by("-id")[:5]
        teachers_data = TeacherSummarySerializer(teachers, many=True).data

        inventory_removed = [
            {"name": "Desk", "removed_on": "2025-09-20"},
            {"name": "Projector", "removed_on": "2025-09-15"},
            {"name": "Chairs", "removed_on": "2025-09-10"}
        ]

        # --- STUDENT STATS ---
        active = CurrentTermYear.get_active()
        if active:
            term = active.term
            year = active.year
        else:
            term, year = None, None

        current_students = Student.objects.filter(term_registered=term, year_registered=year).count()

        prev_term, prev_year = CurrentTermYear.get_previous(term, year)
        prev_students = Student.objects.filter(term_registered=prev_term, year_registered=prev_year).count()

        student_growth = 0
        if prev_students > 0:
            student_growth = ((current_students - prev_students) / prev_students) * 100

        # --- FEES STATS ---
        expected = GradeFeeStructure.objects.filter(term=term, year=year).aggregate(
            total=Sum("total_fees")
        )["total"] or 0

        collected = FeePayment.objects.filter(term=term, date__year=year).aggregate(
            total=Sum("total_amount")
        )["total"] or 0

        balance = expected - collected if expected > collected else 0
        collection_rate = (collected / expected) * 100 if expected > 0 else 0

        # --- PACKAGE RESPONSE ---
        dashboard_data = {
            "hero": {
                "recent_students": students_data,
                "recent_teachers": teachers_data,
                "recent_inventory_removed": inventory_removed,
            },
            "student_stats": {
                "current_term_students": current_students,
                "previous_term_students": prev_students,
                "growth": round(student_growth, 2),
            },
            "fee_stats": {
                "expected_fees": expected,
                "collected_fees": collected,
                "outstanding_balance": balance,
                "collection_rate": round(collection_rate, 2),
            },
        }

        serializer = HeadTeacherDashboardSerializer(dashboard_data)
        return Response(serializer.data)
