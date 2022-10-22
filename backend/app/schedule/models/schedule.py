from datetime import datetime, timedelta, date

from django.conf import settings
from django.db.models import ForeignKey, DateTimeField, IntegerField, CharField, CASCADE
from model_utils.models import TimeStampedModel

from app.schedule.celery import celery_app
from app.schedule.models.dentist import Dentist
from app.schedule.models.patient import Patient
from app.schedule.tasks import send_message
from app.settings.default import TZ


class Schedule(TimeStampedModel):
    STATUS_CHOICES = (
        (0, 'Pendente'),
        (1, 'Confirmado'),
        (2, 'Faltou'),
        (3, 'Cancelou'),
    )
    NOTIFICATION_STATUS_CHOICES = (
        (0, 'Pending'),
        (1, 'Success'),
        (2, 'Error'),
        (3, 'Expired'),
        (4, 'Unknown')
    )

    class Meta:
        verbose_name = 'Agendamento'
        verbose_name_plural = 'Agendamentos'

    # Model Fields
    patient = ForeignKey(Patient, on_delete=CASCADE)
    dentist = ForeignKey(Dentist, on_delete=CASCADE)
    date = DateTimeField('Data')
    duration = IntegerField('Duração')
    notification_status = IntegerField('Status da notificação', default=0)
    notification_task_id = CharField('ID Notificação', max_length=50, default=None, null=True)
    status = IntegerField('Status do agendamento', choices=STATUS_CHOICES, default=0)

    def get_message(self) -> str:
        local_date = self.date.astimezone(settings.TZ)

        now = datetime.now(tz=settings.TZ).date()

        if (local_date.date() - now).days == 0:
            schedule_date = 'hoje'
        elif (local_date.date() - now).days == 1:
            schedule_date = 'amanhã'
        else:
            schedule_date = local_date.strftime("dia %d/%m")

        message = "Olá {patient_prefix} {patient_name}, " \
                  "não se esqueça de sua consulta odontológica " \
                  "{schedule_date} às {schedule_time}.".format(
                    patient_prefix=self.patient.get_sex_prefix(),
                    patient_name=self.patient.name,
                    dentist_prefix=self.dentist.get_sex_prefix(),
                    dentist_name=self.dentist.first_name,
                    schedule_date=schedule_date,
                    schedule_time=local_date.strftime("%H:%M"))

        return message

    def delete(self, using=None, keep_parents=False):
        self.revoke_notification()
        return super().delete(using, keep_parents)

    def revoke_notification(self):
        celery_app.control.revoke(self.notification_task_id)

    def create_notification(self):
        if date.today() > self.date.date():
            self.notification_status = self.NOTIFICATION_STATUS_CHOICES[3][0]
        else:
            start_time = settings.MESSAGE_ETA
            end_time = settings.MESSAGE_EXPIRES
            msg_datetime = self.date.astimezone(TZ).replace(**start_time) - timedelta(days=1)
            msg_expires = msg_datetime.replace(**end_time)
            message = send_message.apply_async((self.id,), eta=msg_datetime,
                                               expires=msg_expires)
            if self.notification_task_id:
                self.revoke_notification()
            self.notification_task_id = message.id
            self.notification_status = self.NOTIFICATION_STATUS_CHOICES[0][0]
