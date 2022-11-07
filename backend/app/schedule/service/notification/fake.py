from app.schedule.service.notification.base import BaseNotificationService


class FakeSMS(BaseNotificationService):
    def send_notification(self, schedule_id):
        return True
