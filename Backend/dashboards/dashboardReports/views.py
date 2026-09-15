# dashboard/views.py

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from SMS_apps.students.models import (
    Student,
    StudentEnrollment,
)

from SMS_apps.academics.models import (
    AcademicYear,
    AcademicTerm,
)

from .serializers import (
    HeadTeacherDashboardSerializer,
)


class HeadTeacherDashboardView(APIView):
    """
    Dashboard for the Head Teacher.

    Currently uses only the completed Student and Academics
    foundations.

    The following modules will be added later when their new
    foundations are completed:

        - Teachers
        - Fees
        - Inventory
        - Attendance
        - Library
    """

    permission_classes = [AllowAny]

    def get(self, request):

        # ============================================================
        # CURRENT ACADEMIC YEAR
        # ============================================================

        current_year = (
            AcademicYear.objects
            .filter(
                is_current=True,
                is_active=True,
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
                    is_current=True,
                )
                .first()
            )

        # ============================================================
        # ACADEMIC INFORMATION
        # ============================================================

        year = current_year
        term = current_term

        previous_year = None
        previous_term = None

        if year and term:

            # --------------------------------------------------------
            # Determine previous term
            # --------------------------------------------------------

            term_order = {
                "term_1": 1,
                "term_2": 2,
                "term_3": 3,
            }

            current_term_number = term_order.get(
                term.term
            )

            if current_term_number:

                # ----------------------------------------------------
                # Previous term in the same academic year
                # ----------------------------------------------------

                if current_term_number > 1:

                    previous_term = (
                        AcademicTerm.objects
                        .filter(
                            academic_year=year,
                            start_date__lt=term.start_date,
                        )
                        .order_by("-start_date")
                        .first()
                    )

                    previous_year = year

                # ----------------------------------------------------
                # Term 1 → Term 3 of previous academic year
                # ----------------------------------------------------

                else:

                    previous_year = (
                        AcademicYear.objects
                        .filter(
                            name__lt=year.name,
                            is_active=True,
                        )
                        .order_by("-name")
                        .first()
                    )

                    if previous_year:

                        previous_term = (
                            AcademicTerm.objects
                            .filter(
                                academic_year=previous_year,
                                term="term_3",
                            )
                            .first()
                        )

        # ============================================================
        # RECENT STUDENTS
        # ============================================================

        recent_students = (
            Student.objects
            .filter(
                status="active"
            )
            .order_by("-id")[:5]
        )

        recent_students_data = []

        for student in recent_students:
            recent_students_data.append({
                "student_id": student.student_id,
                "admission_number": student.admission_number,
                "name": student.full_name,
                "status": student.status,
            })

        # ============================================================
        # STUDENT STATISTICS
        # ============================================================

        current_students = 0
        previous_students = 0

        if year and term:

            # --------------------------------------------------------
            # Students currently enrolled in the current term/year
            #
            # StudentEnrollment is now the source of truth for
            # academic placement.
            # --------------------------------------------------------

            current_students = (
                StudentEnrollment.objects
                .filter(
                    academic_year=year,
                    status="active",
                )
                .values("student")
                .distinct()
                .count()
            )

            # --------------------------------------------------------
            # Previous term/year students
            #
            # Since enrollment is currently modeled by academic year,
            # we use the previous academic year's enrollment count
            # when a previous year exists.
            # --------------------------------------------------------

            if previous_year:

                previous_students = (
                    StudentEnrollment.objects
                    .filter(
                        academic_year=previous_year,
                    )
                    .values("student")
                    .distinct()
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
        # PACKAGE DASHBOARD RESPONSE
        # ============================================================

        dashboard_data = {

            # --------------------------------------------------------
            # HERO
            # --------------------------------------------------------

            "hero": {

                "recent_students": recent_students_data,

                # Teachers will be added later.
                "recent_teachers": [],

                # Inventory integration will be added later.
                "recent_inventory_removed": [],

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
                    2,
                ),

            },

            # --------------------------------------------------------
            # FEE STATS
            # --------------------------------------------------------
            #
            # Fees is currently being rebuilt, so we deliberately
            # return empty/zero values instead of querying the old
            # Fee models.
            #

            "fee_stats": {

                "expected_fees": 0,

                "collected_fees": 0,

                "outstanding_balance": 0,

                "collection_rate": 0,

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

