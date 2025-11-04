from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.models import Role, UserProfile  # adjust import to your app
from .models import Teacher


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = "__all__"
        read_only_fields = ["user"]

    def create(self, validated_data):
        national_id = validated_data.get("national_id")
        first_name = validated_data.get("first_name", "")
        surname = validated_data.get("surname", "")

        # ✅ Create User for Teacher
        user = User.objects.create_user(
            username=national_id,
            password=national_id,
            first_name=first_name,
            last_name=surname,
        )

        # ✅ Assign Role "Teacher"
        teacher_role, _ = Role.objects.get_or_create(name="Teacher")
        UserProfile.objects.create(user=user, role=teacher_role)

        # ✅ Link User to Teacher model
        teacher = Teacher.objects.create(user=user, **validated_data)
        return teacher
