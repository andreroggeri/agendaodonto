from django.conf import settings

from app.schedule.celery import celery_app


@celery_app.task(bind=True)
def send_message(self, schedule_id):
    try:
        messenger = settings.MESSAGE_CLASS()
        return messenger.send_message(schedule_id)
    except TimeoutError as e:
        self.retry(exc=e, max_retries=settings.CELERY_TASK_MAX_RETRY, countdown=60 * 5)
