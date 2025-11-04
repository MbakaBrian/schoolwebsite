
from rest_framework import serializers
from .models import TermDate
class TermDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TermDate
        fields = "__all__"
