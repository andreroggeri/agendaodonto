from datetime import datetime
from time import sleep

from django.conf import settings
from pyfcm import FCMNotification

from app.schedule.models import Schedule
from app.schedule.service.notification.base import BaseNotificationService


class SMS(BaseNotificationService):
    def __init__(self):
        self.client = FCMNotification(settings.FIREBASE_TOKEN)

    def wait_for_status_change(self, schedule) -> bool:
        start_time = datetime.now()
        timeout = settings.SMS_TIMEOUT
        status_changed = False

        while not status_changed:
            schedule.refresh_from_db()
            if schedule.notification_status != 0:
                status_changed = True
            if (datetime.now() - start_time).total_seconds() >= timeout:
                schedule.notification_status = 3
                schedule.save()
                raise SMSTimeoutError('Tempo excedido')
            sleep(1)

        return True

    def send_notification(self, schedule: Schedule) -> bool:
        phone = f'+55{schedule.patient.phone}'
        try:
            self.client.single_device_data_message(schedule.dentist.device_token, data_message={
                'sendTo': phone,
                'content': schedule.get_message(),
                'scheduleId': schedule.id
            })
            return True
        except:
            return False


class SMSTimeoutError(BaseException):
    pass
