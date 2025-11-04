from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Role
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken



class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # Display user details
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="user", write_only=True
    )
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source="role", write_only=True
    )

    class Meta:
        model = UserProfile
        fields = ["id", "user", "user_id", "role", "role_id"]




class MyTokenObtainPairSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get("username")
        password = data.get("password")
        print("Frontend sent:", username, password)

        if username and password:
            user = authenticate(username=username, password=password)
            print("Authenticated user:", user)
            if user is None:
                raise serializers.ValidationError("Invalid username or password")

            # Get JWT tokens
            refresh = RefreshToken.for_user(user)

            # Get user profile and role
            profile = UserProfile.objects.get(user=user)
            role_name = profile.role.name if profile.role else None
            print("Role:", role_name)

            refresh = RefreshToken.for_user(user)

            return {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username,
                "role": role_name
            }
        else:
            raise serializers.ValidationError("Must provide username and password")
