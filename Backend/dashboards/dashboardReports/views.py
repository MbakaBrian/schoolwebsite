# dashboard/views.py

from django.db.models import Sum
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from SMS_apps.students.models import Student
from SMS_apps.teachers.models import Teacher
from SMS_apps.fees.models import FeePayment, GradeFeeStructure
from SMS_apps.academics.models import (
    AcademicYear,
    AcademicTerm,
)

from .serializers import (
    StudentSummarySerializer,
    TeacherSummarySerializer,
    HeadTeacherDashboardSerializer,
)


class HeadTeacherDashboardView(APIView):
    """
    Dashboard for the Head Teacher.

    Academic information is now obtained from the
    SMS_apps.academics application.

    The Academics app is the source of truth for:
        - Current academic year
        - Current academic term
        - Previous academic term
    """

    permission_classes = [AllowAny]

    def get(self, request):

        # ============================================================
        # HERO SECTION
        # ============================================================

        students = Student.objects.order_by("-id")[:5]

        students_data = StudentSummarySerializer(
            students,
            many=True
        ).data

        teachers = Teacher.objects.order_by("-id")[:5]

        teachers_data = TeacherSummarySerializer(
            teachers,
            many=True
        ).data

        # Temporary inventory data.
        # This should later come from the inventory app.
        inventory_removed = [
            {
                "name": "Desk",
                "removed_on": "2025-09-20"
            },
            {
                "name": "Projector",
                "removed_on": "2025-09-15"
            },
            {
                "name": "Chairs",
                "removed_on": "2025-09-10"
            }
        ]

        # ============================================================
        # CURRENT ACADEMIC YEAR
        # ============================================================

        current_year = (
            AcademicYear.objects
            .filter(
                is_current=True,
                is_active=True
            )
            .first()
        )

        # ============================================================
        # CURRENT ACADEMIC TERM
        # ============================================================

        current_term = None

        if current_year:
            current_term = (
                AcademicTerm.objects
                .filter(
                    academic_year=current_year,
                    is_current=True
                )
                .first()
            )

        # ============================================================
        # ACADEMIC INFORMATION
        # ============================================================

        if current_year and current_term:

            year = current_year
            term = current_term

            # --------------------------------------------------------
            # Find previous term
            # --------------------------------------------------------

            term_order = {
                "term_1": 1,
                "term_2": 2,
                "term_3": 3,
            }

            current_term_number = term_order.get(
                term.term
            )

            previous_term = None
            previous_year = None

            if current_term_number:

                # ----------------------------------------------------
                # Previous term in the same academic year
                # ----------------------------------------------------

                if current_term_number > 1:

                    previous_term = (
                        AcademicTerm.objects
                        .filter(
                            academic_year=current_year,
                            term__in=[
                                "term_1",
                                "term_2",
                                "term_3",
                            ]
                        )
                        .order_by("start_date")
                    )

                    previous_term = previous_term.filter(
                        start_date__lt=term.start_date
                    ).order_by("-start_date").first()

                    previous_year = current_year

                # ----------------------------------------------------
                # If current term is Term 1, use Term 3 of
                # previous academic year
                # ----------------------------------------------------

                else:

                    previous_year = (
                        AcademicYear.objects
                        .filter(
                            name__lt=current_year.name,
                            is_active=True
                        )
                        .order_by("-name")
                        .first()
                    )

                    if previous_year:

                        previous_term = (
                            AcademicTerm.objects
                            .filter(
                                academic_year=previous_year,
                                term="term_3"
                            )
                            .first()
                        )

        else:

            year = None
            term = None
            previous_year = None
            previous_term = None

        # ============================================================
        # STUDENT STATISTICS
        # ============================================================

        current_students = 0
        previous_students = 0

        if year and term:

            # --------------------------------------------------------
            # CURRENT TERM STUDENTS
            #
            # NOTE:
            # This section currently assumes the existing Student
            # model still has:
            #
            #     term_registered
            #     year_registered
            #
            # Once StudentEnrollment is implemented, this query
            # should be moved to StudentEnrollment.
            # --------------------------------------------------------

            current_students = (
                Student.objects
                .filter(
                    term_registered=term.term,
                    year_registered=year.name
                )
                .count()
            )

            # --------------------------------------------------------
            # PREVIOUS TERM STUDENTS
            # --------------------------------------------------------

            if previous_year and previous_term:

                previous_students = (
                    Student.objects
                    .filter(
                        term_registered=previous_term.term,
                        year_registered=previous_year.name
                    )
                    .count()
                )

        # ============================================================
        # STUDENT GROWTH
        # ============================================================

        student_growth = 0

        if previous_students > 0:

            student_growth = (
                (
                    current_students - previous_students
                )
                / previous_students
            ) * 100

        # ============================================================
        # FEES STATISTICS
        # ============================================================

        expected = 0
        collected = 0

        if year and term:

            # --------------------------------------------------------
            # Expected fees
            # --------------------------------------------------------

            expected = (
                GradeFeeStructure.objects
                .filter(
                    term=term.term,
                    year=year.name
                )
                .aggregate(
                    total=Sum("total_fees")
                )["total"] or 0
            )

            # --------------------------------------------------------
            # Collected fees
            # --------------------------------------------------------

            collected = (
                FeePayment.objects
                .filter(
                    term=term.term,
                    date__year=year.name
                )
                .aggregate(
                    total=Sum("total_amount")
                )["total"] or 0
            )

        # ============================================================
        # FEE BALANCE
        # ============================================================

        balance = expected - collected

        if balance < 0:
            balance = 0

        # ============================================================
        # COLLECTION RATE
        # ============================================================

        collection_rate = 0

        if expected > 0:

            collection_rate = (
                collected / expected
            ) * 100

        # ============================================================
        # PACKAGE DASHBOARD RESPONSE
        # ============================================================

        dashboard_data = {

            # --------------------------------------------------------
            # HERO
            # --------------------------------------------------------

            "hero": {

                "recent_students": students_data,

                "recent_teachers": teachers_data,

                "recent_inventory_removed": inventory_removed,

            },

            # --------------------------------------------------------
            # ACADEMIC INFORMATION
            # --------------------------------------------------------

            "academic": {

                "academic_year": (
                    year.name
                    if year
                    else None
                ),

                "current_term": (
                    term.get_term_display()
                    if term
                    else None
                ),

                "current_term_code": (
                    term.term
                    if term
                    else None
                ),

                "term_start_date": (
                    term.start_date
                    if term
                    else None
                ),

                "term_end_date": (
                    term.end_date
                    if term
                    else None
                ),

            },

            # --------------------------------------------------------
            # STUDENT STATS
            # --------------------------------------------------------

            "student_stats": {

                "current_term_students": current_students,

                "previous_term_students": previous_students,

                "growth": round(
                    student_growth,
                    2
                ),

            },

            # --------------------------------------------------------
            # FEE STATS
            # --------------------------------------------------------

            "fee_stats": {

                "expected_fees": expected,

                "collected_fees": collected,

                "outstanding_balance": balance,

                "collection_rate": round(
                    collection_rate,
                    2
                ),

            },

        }

        # ============================================================
        # SERIALIZE RESPONSE
        # ============================================================

        serializer = HeadTeacherDashboardSerializer(
            dashboard_data
        )

        return Response(
            serializer.data
        )

