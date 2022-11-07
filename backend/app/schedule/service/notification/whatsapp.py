import requests
from django.conf import settings

from app.schedule.models import Schedule
from app.schedule.service.notification.base import BaseNotificationService


class Whatsapp(BaseNotificationService):

    def send_notification(self, schedule_id):
        schedule = Schedule.objects.get(pk=schedule_id)

        payload = {
            'phone': f'+55{schedule.patient.phone}',
            'message': schedule.get_message(),
        }

        response = requests.post(settings.MESSAGING_URL, data=payload, headers={
            'Authorization': f'Bearer {settings.MESSAGING_TOKEN}',
            'Content-Type': 'application/json'
        })

        response.raise_for_status()

        data = response.json()

        return data['sent']
