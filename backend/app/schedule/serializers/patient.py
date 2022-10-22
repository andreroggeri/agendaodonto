from rest_framework.serializers import ModelSerializer

from app.schedule.models.patient import Patient
from app.schedule.serializers.clinic import ClinicListSerializer
from app.schedule.serializers.dental_plan import DentalPlanSerializer


class PatientSerializer(ModelSerializer):
    class Meta:
        model = Patient
        fields = ('id', 'name', 'last_name', 'sex', 'phone', 'clinic', 'created', 'modified', 'dental_plan')


class PatientListSerializer(PatientSerializer):
    clinic = ClinicListSerializer()
    dental_plan = DentalPlanSerializer()
