import importlib
import logging

import bcrypt
from django.conf import settings

from app.schedule.celery import celery_app
from app.schedule.models import Schedule, Dentist, Patient
from app.schedule.models.treatment_request import TreatmentRequest, TreatmentRequestStatus
from app.schedule.service.dental_plan.amil import BaseAmilService
from app.schedule.service.notification.base import BaseNotificationService

logger = logging.getLogger(__name__)


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


@celery_app.task(bind=True)
def fetch_dental_plan_data(self, treatment_request_id):
    logger.info(f'Fetching data for treatment request {treatment_request_id}')
    treatment_request = TreatmentRequest.objects.get(id=treatment_request_id)
    if treatment_request.status != TreatmentRequestStatus.PENDING:
        logging.info(f'Treatment Request {treatment_request_id} is not pending. Skipping.')
        return
    try:
        dentist = Dentist.objects.get(phone__exact=treatment_request.dentist_phone)

        amil: BaseAmilService = load_class_dynamically(settings.AMIL_SERVICE)(dentist.amil_username)
        amil.authenticate(dentist.amil_password)
        data = amil.fetch_dental_plan_data(treatment_request.dental_plan_card_number)

        treatment_request.patient_gender = data.gender
        treatment_request.patient_first_name = data.first_name
        treatment_request.patient_last_name = data.last_name
        treatment_request.patient_birth_date = data.birth_date
        treatment_request.patient_cpf_hash = bcrypt.hashpw(data.cpf.encode(), bcrypt.gensalt()).decode('utf-8')
        patient = Patient.objects.filter(dental_plan_card_number=treatment_request.dental_plan_card_number).first()
        if patient:
            treatment_request.patient = patient
            treatment_request.status = TreatmentRequestStatus.READY
        else:
            treatment_request.status = TreatmentRequestStatus.DATA_FETCHED_NEW_PATIENT
        treatment_request.save()
    except Exception as ex:
        logger.error('Failed to fetch dental plan data', exc_info=ex)
        treatment_request.status = TreatmentRequestStatus.DATA_FETCH_FAIL
        treatment_request.save()


@celery_app.task(bind=True)
def submit_basic_treatment_request(self, treatment_request_id):
    treatment_request = TreatmentRequest.objects.get(id=treatment_request_id)
    try:
        dentist = Dentist.objects.get(phone__exact=treatment_request.dentist_phone)

        amil: BaseAmilService = load_class_dynamically(settings.AMIL_SERVICE)(dentist.amil_username)
        amil.authenticate(dentist.amil_password)
        result = amil.request_basic_treatment(treatment_request.dental_plan_card_number)
        treatment_request.status = TreatmentRequestStatus.SUBMITTED
        treatment_request.save()
        return result
    except Exception as ex:
        logger.error('Failed to submit basic treatment request', exc_info=ex)
        treatment_request.status = TreatmentRequestStatus.SUBMIT_FAIL
        treatment_request.save()
