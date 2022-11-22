from datetime import timedelta, date

from django.conf import settings
from rest_framework.serializers import ModelSerializer

from app.schedule.models import Schedule
from app.schedule.serializers.dentist import DentistSerializer
from app.schedule.serializers.patient import PatientListSerializer
from app.schedule.tasks import send_message


def create_notification(schedule: Schedule):
    if date.today() > schedule.date.date():
        schedule.notification_status = 3  # TODO: use enum
    else:
        start_time = settings.MESSAGE_ETA
        end_time = settings.MESSAGE_EXPIRES
        msg_datetime = schedule.date.astimezone(settings.TZ).replace(**start_time) - timedelta(days=1)
        msg_expires = msg_datetime.replace(**end_time)
        message = send_message.apply_async((schedule.id,), eta=msg_datetime,
                                           expires=msg_expires)
        if schedule.notification_task_id:
            schedule.revoke_notification()
        schedule.notification_task_id = message.id
        schedule.notification_status = 0  # TODO: Use enum


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
        create_notification(schedule)
        schedule.save()
        return schedule

    def update(self, instance, validated_data):
        schedule = super().update(instance, validated_data)
        create_notification(schedule)
        schedule.save()
        return schedule


class ScheduleListSerializer(ScheduleSerializer):
    patient = PatientListSerializer(read_only=True)
    dentist = DentistSerializer(read_only=True)
