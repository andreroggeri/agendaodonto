from django.db import models
from django.db.models import ForeignKey, IntegerField, CharField, DateField, TextChoices
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from app.schedule.models import DentalPlan, Patient, Clinic


# PENDING = Just created
# DATA_FETCH_FAIL = Failed to fetch data from AMIL = FINAL STATE
# DATA_FETCHED_NEW_PATIENT = Data fetched from AMIL = Dentist must decide to create a new patient or merge info to a new one
# DATA_FETCHED_KNOWN_PATIENT = Data fetched from AMIL = Patient info is available = Patient is now set
# READY = Patient data is merged OR a new patient was created with the data = Patient is now set
# REQUESTED = Basic treatment requested to Amil // DO LATER


class TreatmentRequestStatus(TextChoices):
    PENDING = 'PENDING', _('Pending')
    DATA_FETCHED_NEW_PATIENT = 'DATA_FETCHED_NEW_PATIENT', _('Data Fetched - New Patient')
    DATA_FETCHED_KNOWN_PATIENT = 'DATA_FETCHED_KNOWN_PATIENT', _('Data Fetched - Known Patient')
    DATA_FETCH_FAIL = 'DATA_FETCH_FAIL', _('Data Fetch Fail')
    READY = 'READY', _('Ready')
    CANCELED = 'CANCELED', _('Canceled')
    SUBMITTING = 'SUBMITTING', _('Submitting')
    SUBMITTED = 'SUBMITTED', _('Submitted')
    SUBMIT_FAIL = 'SUBMIT_FAIL', _('Submit Fail')


class TreatmentRequest(TimeStampedModel):
    dental_plan = ForeignKey(DentalPlan, on_delete=models.CASCADE)
    dental_plan_card_number = CharField('Número da carteirinha', max_length=24)
    patient_phone = CharField('Telefone', max_length=14)
    dentist_phone = CharField('Telefone do dentista', max_length=14)
    status = CharField('Status', choices=TreatmentRequestStatus.choices, max_length=50,
                       default=TreatmentRequestStatus.PENDING)
    clinic = ForeignKey(Clinic, on_delete=models.CASCADE)

    # Fetched from Dental Plan later
    patient_first_name = CharField('Nome do Paciente', max_length=64, default=None, null=True, blank=True)
    patient_last_name = CharField('Sobrenome do Paciente', max_length=64, default=None, null=True, blank=True)
    patient_birth_date = DateField('Data de nascimento do paciente', default=None, null=True, blank=True)
    patient_cpf_hash = CharField('CPF do paciente', max_length=64, default=None, null=True, blank=True)
    patient_gender = CharField('Gênero do paciente', max_length=1, default=None, null=True, blank=True)
    patient_age = IntegerField('Idade do paciente', default=None, null=True, blank=True)

    patient = ForeignKey(Patient, on_delete=models.CASCADE, default=None, null=True, blank=True)
