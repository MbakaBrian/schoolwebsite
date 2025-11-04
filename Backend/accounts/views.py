from rest_framework import viewsets
from .models import Role, UserProfile, User
from .serializers import RoleSerializer, UserProfileSerializer, UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import MyTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated] 



class MyTokenObtainPairView(APIView):
    serializer_class = MyTokenObtainPairSerializer

    # Allow anyone to access this endpoint (login)
    permission_classes = []  # or [AllowAny] if you import it

    def post(self, request, *args, **kwargs):
        print("\n=== JWT Login Attempt ===")
        print("Request method:", request.method)
        print("Request headers:", request.headers)
        print("Request data:", request.data)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            print("Serializer valid ✅")
            print("Validated data:", serializer.validated_data)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        else:
            print("Serializer errors ❌")
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
