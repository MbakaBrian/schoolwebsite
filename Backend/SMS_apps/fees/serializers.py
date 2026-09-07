from rest_framework import serializers
from .models import Fee, GradeFeeStructure, FeePayment
from .models import TransportRoute, TransportStage

class FeeSerializer(serializers.ModelSerializer):
    is_paid_in_full = serializers.ReadOnlyField()
    is_partially_paid = serializers.ReadOnlyField()
    is_unpaid = serializers.ReadOnlyField()

    class Meta:
        model = Fee
        fields = "__all__"



class TransportStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportStage
        fields = "__all__"


class TransportRouteSerializer(serializers.ModelSerializer):
    # Nested stages inside route
    stages = TransportStageSerializer(many=True, read_only=True)

    class Meta:
        model = TransportRoute
        fields = "__all__"


class GradeFeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeFeeStructure
        fields = "__all__"


class FeePaymentSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()

    class Meta:
        model = FeePayment
        fields = "__all__"

    def get_balance(self, obj):
        return obj.get_balance()
