from app.schedule.models import Schedule


class BaseNotificationService:
    def send_notification(self, schedule: Schedule):
        raise NotImplementedError
