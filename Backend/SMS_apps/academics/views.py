# ============================================================
# ACADEMICS VIEWS
# ============================================================

from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    AcademicYear,
    AcademicTerm,
    AcademicCalendarEvent,
    ClassLevel,
    Stream,
)

from .serializers import (
    AcademicYearSerializer,
    AcademicTermSerializer,
    AcademicCalendarEventSerializer,
    ClassLevelSerializer,
    StreamSerializer,
)

from .services import (
    create_academic_year,
    update_academic_year,
    create_academic_term,
    update_academic_term,
    create_calendar_event,
    update_calendar_event,
    create_class_level,
    update_class_level,
    create_stream,
    update_stream,
)


# ============================================================
# ACADEMIC YEARS
# ============================================================

class AcademicYearListCreateView(APIView):
    """
    GET:
        Return all academic years.

    POST:
        Create a new academic year.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        years = (
            AcademicYear.objects
            .prefetch_related("terms")
            .all()
        )

        serializer = AcademicYearSerializer(
            years,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = AcademicYearSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        academic_year = create_academic_year(
            **serializer.validated_data
        )

        response_serializer = AcademicYearSerializer(
            academic_year
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class AcademicYearDetailView(APIView):
    """
    GET:
        Retrieve one academic year.

    PATCH:
        Partially update an academic year.

    PUT:
        Fully update an academic year.

    DELETE:
        Delete an academic year.
    """

    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(
            AcademicYear,
            pk=pk,
        )

    def get(self, request, pk):
        academic_year = self.get_object(pk)

        serializer = AcademicYearSerializer(
            academic_year
        )

        return Response(serializer.data)

    def put(self, request, pk):
        academic_year = self.get_object(pk)

        serializer = AcademicYearSerializer(
            academic_year,
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        academic_year = update_academic_year(
            academic_year,
            **serializer.validated_data
        )

        response_serializer = AcademicYearSerializer(
            academic_year
        )

        return Response(response_serializer.data)

    def patch(self, request, pk):
        academic_year = self.get_object(pk)

        serializer = AcademicYearSerializer(
            academic_year,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        academic_year = update_academic_year(
            academic_year,
            **serializer.validated_data
        )

        response_serializer = AcademicYearSerializer(
            academic_year
        )

        return Response(response_serializer.data)

    def delete(self, request, pk):
        academic_year = self.get_object(pk)

        academic_year.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# ACADEMIC TERMS
# ============================================================

class AcademicTermListCreateView(APIView):
    """
    GET:
        Return academic terms.

    Optional filter:
        ?academic_year=1

    POST:
        Create a new academic term.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = (
            AcademicTerm.objects
            .select_related("academic_year")
        )

        academic_year_id = request.query_params.get(
            "academic_year"
        )

        if academic_year_id:
            queryset = queryset.filter(
                academic_year_id=academic_year_id
            )

        serializer = AcademicTermSerializer(
            queryset,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = AcademicTermSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        academic_term = create_academic_term(
            **serializer.validated_data
        )

        response_serializer = AcademicTermSerializer(
            academic_term
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class AcademicTermDetailView(APIView):
    """
    GET:
        Retrieve one academic term.

    PUT/PATCH:
        Update an academic term.

    DELETE:
        Delete an academic term.
    """

    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(
            AcademicTerm,
            pk=pk,
        )

    def get(self, request, pk):
        term = self.get_object(pk)

        serializer = AcademicTermSerializer(term)

        return Response(serializer.data)

    def put(self, request, pk):
        term = self.get_object(pk)

        serializer = AcademicTermSerializer(
            term,
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        term = update_academic_term(
            term,
            **serializer.validated_data
        )

        response_serializer = AcademicTermSerializer(term)

        return Response(response_serializer.data)

    def patch(self, request, pk):
        term = self.get_object(pk)

        serializer = AcademicTermSerializer(
            term,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        term = update_academic_term(
            term,
            **serializer.validated_data
        )

        response_serializer = AcademicTermSerializer(term)

        return Response(response_serializer.data)

    def delete(self, request, pk):
        term = self.get_object(pk)

        term.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# ACADEMIC CALENDAR EVENTS
# ============================================================

class AcademicCalendarEventListCreateView(APIView):
    """
    GET:
        Return calendar events.

    Optional filters:

        ?academic_year=1
        ?term=2
        ?event_type=mid_term_break

    POST:
        Create a calendar event.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = (
            AcademicCalendarEvent.objects
            .select_related(
                "academic_year",
                "term",
            )
        )

        academic_year_id = request.query_params.get(
            "academic_year"
        )

        term_id = request.query_params.get("term")

        event_type = request.query_params.get("event_type")

        if academic_year_id:
            queryset = queryset.filter(
                academic_year_id=academic_year_id
            )

        if term_id:
            queryset = queryset.filter(
                term_id=term_id
            )

        if event_type:
            queryset = queryset.filter(
                event_type=event_type
            )

        serializer = AcademicCalendarEventSerializer(
            queryset,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = AcademicCalendarEventSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        event = create_calendar_event(
            **serializer.validated_data
        )

        response_serializer = AcademicCalendarEventSerializer(
            event
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class AcademicCalendarEventDetailView(APIView):
    """
    GET:
        Retrieve a calendar event.

    PUT/PATCH:
        Update a calendar event.

    DELETE:
        Delete a calendar event.
    """

    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(
            AcademicCalendarEvent,
            pk=pk,
        )

    def get(self, request, pk):
        event = self.get_object(pk)

        serializer = AcademicCalendarEventSerializer(event)

        return Response(serializer.data)

    def put(self, request, pk):
        event = self.get_object(pk)

        serializer = AcademicCalendarEventSerializer(
            event,
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        event = update_calendar_event(
            event,
            **serializer.validated_data
        )

        response_serializer = AcademicCalendarEventSerializer(
            event
        )

        return Response(response_serializer.data)

    def patch(self, request, pk):
        event = self.get_object(pk)

        serializer = AcademicCalendarEventSerializer(
            event,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        event = update_calendar_event(
            event,
            **serializer.validated_data
        )

        response_serializer = AcademicCalendarEventSerializer(
            event
        )

        return Response(response_serializer.data)

    def delete(self, request, pk):
        event = self.get_object(pk)

        event.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# CLASS LEVELS / GRADES
# ============================================================

class ClassLevelListCreateView(APIView):
    """
    GET:
        Return all class levels.

    Optional filters:

        ?is_active=true
        ?is_active=false

    POST:
        Create a new class level.

    The next_class_level field can be supplied when creating
    a class level.

    Example request:

        {
            "name": "Grade 5",
            "code": "G5",
            "description": "",
            "display_order": 5,
            "next_class_level": 6,
            "is_active": true
        }
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = (
            ClassLevel.objects
            .select_related("next_class_level")
            .all()
        )

        is_active = request.query_params.get("is_active")

        if is_active is not None:

            queryset = queryset.filter(
                is_active=is_active.lower() == "true"
            )

        serializer = ClassLevelSerializer(
            queryset,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = ClassLevelSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        class_level = create_class_level(
            **serializer.validated_data
        )

        response_serializer = ClassLevelSerializer(
            class_level
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class ClassLevelDetailView(APIView):
    """
    GET:
        Retrieve a class level.

    PUT/PATCH:
        Update a class level.

    DELETE:
        Delete a class level.

    The next_class_level relationship can be changed
    through PUT/PATCH.

    Example:

        {
            "next_class_level": 7
        }

    To remove the progression target:

        {
            "next_class_level": null
        }
    """

    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(
            ClassLevel.objects.select_related(
                "next_class_level"
            ),
            pk=pk,
        )

    def get(self, request, pk):
        class_level = self.get_object(pk)

        serializer = ClassLevelSerializer(class_level)

        return Response(serializer.data)

    def put(self, request, pk):
        class_level = self.get_object(pk)

        serializer = ClassLevelSerializer(
            class_level,
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        class_level = update_class_level(
            class_level,
            **serializer.validated_data
        )

        response_serializer = ClassLevelSerializer(
            class_level
        )

        return Response(response_serializer.data)

    def patch(self, request, pk):
        class_level = self.get_object(pk)

        serializer = ClassLevelSerializer(
            class_level,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        class_level = update_class_level(
            class_level,
            **serializer.validated_data
        )

        response_serializer = ClassLevelSerializer(
            class_level
        )

        return Response(response_serializer.data)

    def delete(self, request, pk):
        class_level = self.get_object(pk)

        class_level.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# STREAMS
# ============================================================

class StreamListCreateView(APIView):
    """
    GET:
        Return streams.

    Optional filters:

        ?class_level=1
        ?is_active=true
        ?is_active=false

    POST:
        Create a new stream.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = (
            Stream.objects
            .select_related("class_level")
        )

        class_level_id = request.query_params.get(
            "class_level"
        )

        is_active = request.query_params.get("is_active")

        if class_level_id:
            queryset = queryset.filter(
                class_level_id=class_level_id
            )

        if is_active is not None:

            queryset = queryset.filter(
                is_active=is_active.lower() == "true"
            )

        serializer = StreamSerializer(
            queryset,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = StreamSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        stream = create_stream(
            **serializer.validated_data
        )

        response_serializer = StreamSerializer(stream)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class StreamDetailView(APIView):
    """
    GET:
        Retrieve a stream.

    PUT/PATCH:
        Update a stream.

    DELETE:
        Delete a stream.
    """

    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(
            Stream.objects.select_related(
                "class_level"
            ),
            pk=pk,
        )

    def get(self, request, pk):
        stream = self.get_object(pk)

        serializer = StreamSerializer(stream)

        return Response(serializer.data)

    def put(self, request, pk):
        stream = self.get_object(pk)

        serializer = StreamSerializer(
            stream,
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        stream = update_stream(
            stream,
            **serializer.validated_data
        )

        response_serializer = StreamSerializer(stream)

        return Response(response_serializer.data)

    def patch(self, request, pk):
        stream = self.get_object(pk)

        serializer = StreamSerializer(
            stream,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        stream = update_stream(
            stream,
            **serializer.validated_data
        )

        response_serializer = StreamSerializer(stream)

        return Response(response_serializer.data)

    def delete(self, request, pk):
        stream = self.get_object(pk)

        stream.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )

