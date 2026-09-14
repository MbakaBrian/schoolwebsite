# academics/urls.py

from django.urls import path

from .views import (
    # Academic Years
    AcademicYearListCreateView,
    AcademicYearDetailView,

    # Academic Terms
    AcademicTermListCreateView,
    AcademicTermDetailView,

    # Academic Calendar Events
    AcademicCalendarEventListCreateView,
    AcademicCalendarEventDetailView,

    # Class Levels / Grades
    ClassLevelListCreateView,
    ClassLevelDetailView,

    # Streams
    StreamListCreateView,
    StreamDetailView,
)


urlpatterns = [

    # ============================================================
    # ACADEMIC YEARS
    # ============================================================

    path(
        "years/",
        AcademicYearListCreateView.as_view(),
        name="academic-year-list-create",
    ),

    path(
        "years/<int:pk>/",
        AcademicYearDetailView.as_view(),
        name="academic-year-detail",
    ),


    # ============================================================
    # ACADEMIC TERMS
    # ============================================================

    path(
        "terms/",
        AcademicTermListCreateView.as_view(),
        name="academic-term-list-create",
    ),

    path(
        "terms/<int:pk>/",
        AcademicTermDetailView.as_view(),
        name="academic-term-detail",
    ),


    # ============================================================
    # ACADEMIC CALENDAR EVENTS
    # ============================================================

    path(
        "calendar-events/",
        AcademicCalendarEventListCreateView.as_view(),
        name="calendar-event-list-create",
    ),

    path(
        "calendar-events/<int:pk>/",
        AcademicCalendarEventDetailView.as_view(),
        name="calendar-event-detail",
    ),


    # ============================================================
    # CLASS LEVELS / GRADES
    # ============================================================

    path(
        "class-levels/",
        ClassLevelListCreateView.as_view(),
        name="class-level-list-create",
    ),

    path(
        "class-levels/<int:pk>/",
        ClassLevelDetailView.as_view(),
        name="class-level-detail",
    ),


    # ============================================================
    # STREAMS
    # ============================================================

    path(
        "streams/",
        StreamListCreateView.as_view(),
        name="stream-list-create",
    ),

    path(
        "streams/<int:pk>/",
        StreamDetailView.as_view(),
        name="stream-detail",
    ),
]

