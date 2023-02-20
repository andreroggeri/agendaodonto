from rest_framework.serializers import ModelSerializer

from app.schedule.models.treatment_request import TreatmentRequest
from app.schedule.serializers.dental_plan import DentalPlanSerializer
from app.schedule.tasks import fetch_dental_plan_data


class TreatmentRequestSerializer(ModelSerializer):
    class Meta:
        model = TreatmentRequest
        fields = ('id',
                  'dental_plan_card_number',
                  'dental_plan',
                  'patient_phone',
                  'dentist_phone',
                  'status',
                  'patient_first_name',
                  'patient_last_name',
                  'patient_birth_date',
                  'patient_cpf_hash',
                  'patient_gender',
                  'clinic'
                  )

    def create(self, validated_data):
        treatment_request = super().create(validated_data)
        fetch_dental_plan_data.delay(treatment_request.id)
        return treatment_request


class TreatmentRequestListSerializer(TreatmentRequestSerializer):
    dental_plan = DentalPlanSerializer(read_only=True)
