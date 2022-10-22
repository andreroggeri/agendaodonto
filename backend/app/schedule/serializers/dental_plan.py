from rest_framework.serializers import ModelSerializer

from app.schedule.models import DentalPlan


class DentalPlanSerializer(ModelSerializer):
    class Meta:
        model = DentalPlan
        fields = ('id', 'name')
