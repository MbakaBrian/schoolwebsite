from django.db import models
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Staff,
    StaffReferee,
    StaffRole,
    StaffRoleAssignment,
)

from .serializers import (
    StaffSerializer,
    StaffListSerializer,
    StaffDetailSerializer,
    StaffRefereeSerializer,
    StaffRoleSerializer,
    StaffRoleAssignmentSerializer,
)

from .services import (
    create_staff,
    update_staff,
    deactivate_staff,

    create_staff_referee,
    update_staff_referee,
    delete_staff_referee,

    create_staff_role,
    update_staff_role,
    deactivate_staff_role,

    create_staff_role_assignment,
    update_staff_role_assignment,
    deactivate_staff_role_assignment,
)


# ============================================================
# STAFF VIEWS
# ============================================================


class StaffListCreateView(
    generics.ListCreateAPIView
):
    """
    Staff list and creation API.

    GET:
        Return all staff members.

    POST:
        Create a new staff member.

    Endpoint:
        /api/staff/
    """

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):
        """
        Return staff members.

        Optional filters:

        ?status=active
        ?employment_type=permanent
        ?search=brian
        """

        queryset = Staff.objects.all()

        # ----------------------------------------------------
        # STATUS FILTER
        # ----------------------------------------------------

        staff_status = self.request.query_params.get(
            "status"
        )

        if staff_status:
            queryset = queryset.filter(
                status=staff_status
            )

        # ----------------------------------------------------
        # EMPLOYMENT TYPE FILTER
        # ----------------------------------------------------

        employment_type = (
            self.request.query_params.get(
                "employment_type"
            )
        )

        if employment_type:
            queryset = queryset.filter(
                employment_type=employment_type
            )

        # ----------------------------------------------------
        # SEARCH
        # ----------------------------------------------------

        search = (
            self.request.query_params.get(
                "search"
            )
        )

        if search:

            queryset = queryset.filter(
                models.Q(
                    first_name__icontains=search
                )
                |
                models.Q(
                    middle_name__icontains=search
                )
                |
                models.Q(
                    last_name__icontains=search
                )
                |
                models.Q(
                    staff_id__icontains=search
                )
                |
                models.Q(
                    employee_number__icontains=search
                )
                |
                models.Q(
                    phone__icontains=search
                )
            )

        return queryset

    def get_serializer_class(self):
        """
        Use the lightweight serializer for lists and the
        normal serializer for creation.
        """

        if self.request.method == "GET":
            return StaffListSerializer

        return StaffSerializer

    def create(self, request, *args, **kwargs):
        """
        Create a staff member through the service layer.
        """

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            staff = create_staff(
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            if hasattr(
                exc,
                "message_dict"
            ):
                detail = exc.message_dict

            else:
                detail = exc.messages

            return Response(
                {
                    "success": False,
                    "detail": detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_serializer = StaffSerializer(
            staff
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Staff member created successfully."
                ),
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class StaffDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Staff detail API.

    GET:
        Retrieve detailed staff information.

    PUT/PATCH:
        Update staff information.

    DELETE:
        Deactivate the staff member.

    Endpoint:
        /api/staff/<id>/
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = Staff.objects.prefetch_related(
        "referees",
        "role_assignments",
        "role_assignments__role",
    )

    serializer_class = StaffDetailSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):
        """
        Update a staff member through the service layer.
        """

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = StaffSerializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            staff = update_staff(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            if hasattr(
                exc,
                "message_dict"
            ):
                detail = exc.message_dict

            else:
                detail = exc.messages

            return Response(
                {
                    "success": False,
                    "detail": detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_serializer = StaffDetailSerializer(
            staff
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Staff member updated successfully."
                ),
                "data": response_serializer.data,
            }
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):
        """
        Deactivate the staff member instead of permanently
        deleting the record.
        """

        instance = self.get_object()

        try:

            deactivate_staff(
                instance
            )

        except DjangoValidationError as exc:

            if hasattr(
                exc,
                "message_dict"
            ):
                detail = exc.message_dict

            else:
                detail = exc.messages

            return Response(
                {
                    "success": False,
                    "detail": detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Staff member deactivated successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# STAFF REFEREE VIEWS
# ============================================================


class StaffRefereeListCreateView(
    generics.ListCreateAPIView
):
    """
    Staff referee list and creation API.

    GET:
        List referees.

    POST:
        Create a referee.

    Endpoint:
        /api/staff/referees/
    """

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = StaffRefereeSerializer

    def get_queryset(self):

        queryset = (
            StaffReferee.objects
            .select_related("staff")
            .all()
        )

        # ----------------------------------------------------
        # FILTER BY STAFF
        # ----------------------------------------------------

        staff_id = (
            self.request.query_params.get(
                "staff"
            )
        )

        if staff_id:
            queryset = queryset.filter(
                staff_id=staff_id
            )

        return queryset

    def create(
        self,
        request,
        *args,
        **kwargs
    ):
        """
        Create a referee through the service layer.
        """

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        staff = serializer.validated_data.get(
            "staff"
        )

        if not staff:
            return Response(
                {
                    "success": False,
                    "detail": (
                        "A staff member is required."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = dict(
            serializer.validated_data
        )

        data.pop(
            "staff",
            None
        )

        try:

            referee = create_staff_referee(
                staff,
                **data
            )

        except DjangoValidationError as exc:

            if hasattr(
                exc,
                "message_dict"
            ):
                detail = exc.message_dict

            else:
                detail = exc.messages

            return Response(
                {
                    "success": False,
                    "detail": detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_serializer = (
            StaffRefereeSerializer(
                referee
            )
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Staff referee created successfully."
                ),
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class StaffRefereeDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Staff referee detail API.

    GET:
        Retrieve referee.

    PUT/PATCH:
        Update referee.

    DELETE:
        Permanently remove referee.

    Endpoint:
        /api/staff/referees/<id>/
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = StaffReferee.objects.select_related(
        "staff"
    )

    serializer_class = StaffRefereeSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):
        """
        Update referee through the service layer.
        """

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = StaffRefereeSerializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            referee = update_staff_referee(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            if hasattr(
                exc,
                "message_dict"
            ):
                detail = exc.message_dict

            else:
                detail = exc.messages

            return Response(
                {
                    "success": False,
                    "detail": detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_serializer = (
            StaffRefereeSerializer(
                referee
            )
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Staff referee updated successfully."
                ),
                "data": response_serializer.data,
            }
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):
        """
        Permanently delete a referee.
        """

        instance = self.get_object()

        delete_staff_referee(
            instance
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Staff referee deleted successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# STAFF ROLE VIEWS
# ============================================================


class StaffRoleListCreateView(
    generics.ListCreateAPIView
):
    """
    Staff role list and creation API.

    GET:
        List available staff roles.

    POST:
        Create a new staff role.

    Endpoint:
        /api/staff/roles/
    """

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = StaffRoleSerializer

    def get_queryset(self):

        queryset = StaffRole.objects.all()

        # ----------------------------------------------------
        # ACTIVE FILTER
        # ----------------------------------------------------

        is_active = (
            self.request.query_params.get(
                "is_active"
            )
        )

        if is_active is not None:

            if is_active.lower() == "true":
                queryset = queryset.filter(
                    is_active=True
                )

            elif is_active.lower() == "false":
                queryset = queryset.filter(
                    is_active=False
                )

        return queryset

    def create(
        self,
        request,
        *args,
        **kwargs
    ):
        """
        Create a staff role through the service layer.
        """

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            role = create_staff_role(
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            if hasattr(
                exc,
                "message_dict"
            ):
                detail = exc.message_dict

            else:
                detail = exc.messages

            return Response(
                {
                    "success": False,
                    "detail": detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_serializer = (
            StaffRoleSerializer(
                role
            )
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Staff role created successfully."
                ),
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class StaffRoleDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Staff role detail API.

    DELETE:
        Deactivates the role rather than permanently deleting
        it.

    Endpoint:
        /api/staff/roles/<id>/
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = StaffRole.objects.all()

    serializer_class = StaffRoleSerializer

    def update(
        self,
        request,
        *args,
        **kwargs
    ):
        """
        Update a staff role through the service layer.
        """

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = StaffRoleSerializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            role = update_staff_role(
                instance,
                **serializer.validated_data
            )

        except DjangoValidationError as exc:

            if hasattr(
                exc,
                "message_dict"
            ):
                detail = exc.message_dict

            else:
                detail = exc.messages

            return Response(
                {
                    "success": False,
                    "detail": detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_serializer = (
            StaffRoleSerializer(
                role
            )
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Staff role updated successfully."
                ),
                "data": response_serializer.data,
            }
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):
        """
        Deactivate a staff role instead of permanently
        deleting it.
        """

        instance = self.get_object()

        try:

            deactivate_staff_role(
                instance
            )

        except DjangoValidationError as exc:

            if hasattr(
                exc,
                "message_dict"
            ):
                detail = exc.message_dict

            else:
                detail = exc.messages

            return Response(
                {
                    "success": False,
                    "detail": detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Staff role deactivated successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# STAFF ROLE ASSIGNMENT VIEWS
# ============================================================


class StaffRoleAssignmentListCreateView(
    generics.ListCreateAPIView
):
    """
    Staff role assignment list and creation API.

    GET:
        List role assignments.

    POST:
        Assign a role to a staff member.

    Endpoint:
        /api/staff/role-assignments/
    """

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        StaffRoleAssignmentSerializer
    )

    def get_queryset(self):

        queryset = (
            StaffRoleAssignment.objects
            .select_related(
                "staff",
                "role",
            )
            .all()
        )

        # ----------------------------------------------------
        # STAFF FILTER
        # ----------------------------------------------------

        staff_id = (
            self.request.query_params.get(
                "staff"
            )
        )

        if staff_id:

            queryset = queryset.filter(
                staff_id=staff_id
            )

        # ----------------------------------------------------
        # ROLE FILTER
        # ----------------------------------------------------

        role_id = (
            self.request.query_params.get(
                "role"
            )
        )

        if role_id:

            queryset = queryset.filter(
                role_id=role_id
            )

        # ----------------------------------------------------
        # STATUS FILTER
        # ----------------------------------------------------

        assignment_status = (
            self.request.query_params.get(
                "status"
            )
        )

        if assignment_status:

            queryset = queryset.filter(
                status=assignment_status
            )

        # ----------------------------------------------------
        # PRIMARY FILTER
        # ----------------------------------------------------

        is_primary = (
            self.request.query_params.get(
                "is_primary"
            )
        )

        if is_primary is not None:

            if is_primary.lower() == "true":

                queryset = queryset.filter(
                    is_primary=True
                )

            elif is_primary.lower() == "false":

                queryset = queryset.filter(
                    is_primary=False
                )

        return queryset

    def create(
        self,
        request,
        *args,
        **kwargs
    ):
        """
        Assign a role to a staff member through the service
        layer.
        """

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        staff = serializer.validated_data.get(
            "staff"
        )

        role = serializer.validated_data.get(
            "role"
        )

        if not staff:

            return Response(
                {
                    "success": False,
                    "detail": (
                        "A staff member is required."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not role:

            return Response(
                {
                    "success": False,
                    "detail": (
                        "A staff role is required."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = dict(
            serializer.validated_data
        )

        data.pop(
            "staff",
            None
        )

        data.pop(
            "role",
            None
        )

        try:

            assignment = (
                create_staff_role_assignment(
                    staff,
                    role,
                    **data
                )
            )

        except DjangoValidationError as exc:

            if hasattr(
                exc,
                "message_dict"
            ):
                detail = exc.message_dict

            else:
                detail = exc.messages

            return Response(
                {
                    "success": False,
                    "detail": detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_serializer = (
            StaffRoleAssignmentSerializer(
                assignment
            )
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Staff role assigned successfully."
                ),
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class StaffRoleAssignmentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Staff role assignment detail API.

    GET:
        Retrieve an assignment.

    PUT/PATCH:
        Update an assignment.

    DELETE:
        Deactivate the assignment.

    Endpoint:
        /api/staff/role-assignments/<id>/
    """

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        StaffRoleAssignment.objects
        .select_related(
            "staff",
            "role",
        )
    )

    serializer_class = (
        StaffRoleAssignmentSerializer
    )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):
        """
        Update a role assignment through the service layer.
        """

        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = (
            StaffRoleAssignmentSerializer(
                instance,
                data=request.data,
                partial=partial,
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            assignment = (
                update_staff_role_assignment(
                    instance,
                    **serializer.validated_data
                )
            )

        except DjangoValidationError as exc:

            if hasattr(
                exc,
                "message_dict"
            ):
                detail = exc.message_dict

            else:
                detail = exc.messages

            return Response(
                {
                    "success": False,
                    "detail": detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_serializer = (
            StaffRoleAssignmentSerializer(
                assignment
            )
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Staff role assignment updated successfully."
                ),
                "data": response_serializer.data,
            }
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):
        """
        Deactivate the role assignment instead of permanently
        deleting it.
        """

        instance = self.get_object()

        try:

            deactivate_staff_role_assignment(
                instance
            )

        except DjangoValidationError as exc:

            if hasattr(
                exc,
                "message_dict"
            ):
                detail = exc.message_dict

            else:
                detail = exc.messages

            return Response(
                {
                    "success": False,
                    "detail": detail,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Staff role assignment deactivated successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )

