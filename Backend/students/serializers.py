from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Student, Parent
from accounts.models import Role, UserProfile   # ✅ adjust import path if needed


# ✅ Parent Serializer
class ParentSerializer(serializers.ModelSerializer):
    referred_by = serializers.PrimaryKeyRelatedField(
        queryset=Parent.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Parent
        fields = "__all__"
        read_only_fields = ["user"]

    def create(self, validated_data):
        national_id = validated_data.get("national_id")

        # ✅ Create User for Parent
        user = User.objects.create_user(
            username=national_id,
            password=national_id,
            first_name=validated_data.get("name", ""),
            email=validated_data.get("email", ""),
        )

        # ✅ Assign Role "Parent"
        parent_role, _ = Role.objects.get_or_create(name="Parent")
        UserProfile.objects.create(user=user, role=parent_role)

        # ✅ Link User to Parent
        parent = Parent.objects.create(user=user, **validated_data)
        return parent


# ✅ Student Serializer
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"
        read_only_fields = ["admission_number", "user"]

    def create(self, validated_data):
        # ✅ Auto-generate Admission Number
        last_student = Student.objects.order_by("id").last()
        if last_student:
            last_id = int(last_student.admission_number.split("-")[-1])
            new_id = last_id + 1
        else:
            new_id = 1

        admission_number = f"PEP-{new_id:04d}"

        # ✅ Create User for Student
        user = User.objects.create_user(
            username=admission_number,
            password=admission_number,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("surname", "")
        )

        # ✅ Assign Role "Student"
        student_role, _ = Role.objects.get_or_create(name="Student")
        UserProfile.objects.create(user=user, role=student_role)

        # ✅ Create Student record
        student = Student.objects.create(
            user=user,
            admission_number=admission_number,
            **validated_data
        )
        return student

from .models import Stream

class StreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stream
        fields = "__all__"