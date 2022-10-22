from rest_framework.serializers import ModelSerializer

from app.schedule.models.clinic import Clinic
from app.schedule.serializers.dentist import DentistSerializer


class ClinicSerializer(ModelSerializer):
    class Meta:
        model = Clinic
        fields = ('id', 'name', 'dentists', 'created', 'modified')


class ClinicListSerializer(ClinicSerializer):
    dentists = DentistSerializer(read_only=True, many=True)
