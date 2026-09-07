# dashboard/serializers.py
from rest_framework import serializers
from SMS_apps.students.models import Student
from SMS_apps.teachers.models import Teacher

class StudentSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "first_name", "surname", "admission_number"]

class TeacherSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ["id", "first_name", "surname", "tsc_number"]

class InventoryRemovedSerializer(serializers.Serializer):
    name = serializers.CharField()
    removed_on = serializers.DateField()

class StudentStatsSerializer(serializers.Serializer):
    current_term_students = serializers.IntegerField()
    previous_term_students = serializers.IntegerField()
    growth = serializers.FloatField()

class FeeStatsSerializer(serializers.Serializer):
    expected_fees = serializers.DecimalField(max_digits=12, decimal_places=2)
    collected_fees = serializers.DecimalField(max_digits=12, decimal_places=2)
    outstanding_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    collection_rate = serializers.FloatField()

class HeroSectionSerializer(serializers.Serializer):
    recent_students = StudentSummarySerializer(many=True)
    recent_teachers = TeacherSummarySerializer(many=True)
    recent_inventory_removed = InventoryRemovedSerializer(many=True)

class HeadTeacherDashboardSerializer(serializers.Serializer):
    hero = HeroSectionSerializer()
    student_stats = StudentStatsSerializer()
    fee_stats = FeeStatsSerializer()