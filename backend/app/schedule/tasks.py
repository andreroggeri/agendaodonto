import importlib

from django.conf import settings

from app.schedule.celery import celery_app
from app.schedule.models import Schedule
from app.schedule.service.notification.base import BaseNotificationService


def load_class_dynamically(class_path):
    module_path, class_name = class_path.rsplit('.', 1)
    module = importlib.import_module(module_path)
    klazz = getattr(module, class_name)
    return klazz


@celery_app.task(bind=True)
def send_message(self, schedule_id):
    try:
        schedule = Schedule.objects.get(id=schedule_id)
        messenger: BaseNotificationService = load_class_dynamically(settings.MESSAGE_CLASS)()
        result = messenger.send_notification(schedule)

        if result:
            schedule.notification_status = 1  # TODO: use enum

        return result
    except TimeoutError as e:
        self.retry(exc=e, max_retries=settings.CELERY_TASK_MAX_RETRY, countdown=60 * 5)
