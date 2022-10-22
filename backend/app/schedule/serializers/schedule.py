from rest_framework.serializers import ModelSerializer

from app.schedule.models import Schedule
from app.schedule.serializers.dentist import DentistSerializer
from app.schedule.serializers.patient import PatientListSerializer


class ScheduleSerializer(ModelSerializer):
    class Meta:
        model = Schedule
        fields = ('id',
                  'patient',
                  'dentist',
                  'date',
                  'duration',
                  'status',
                  'created',
                  'modified',
                  'notification_status')

        read_only_fields = ('notification_status',)

    def create(self, validated_data):
        schedule = super().create(validated_data)
        schedule.create_notification()
        schedule.save()
        return schedule

    def update(self, instance, validated_data):
        schedule = super().update(instance, validated_data)
        schedule.create_notification()
        schedule.save()
        return schedule


class ScheduleListSerializer(ScheduleSerializer):
    patient = PatientListSerializer(read_only=True)
    dentist = DentistSerializer(read_only=True)
