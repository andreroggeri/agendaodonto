import logging

from app.schedule.models import Schedule
from app.schedule.service.notification.base import BaseNotificationService

logger = logging.getLogger(__name__)


class FakeSMS(BaseNotificationService):
    def send_notification(self, schedule: Schedule) -> bool:
        logger.info(f'Fake SMS sent to {schedule.patient.phone}')
        return True
