from django.db import models
from django.db.models import ForeignKey, IntegerField, CharField, DateField
from model_utils.models import TimeStampedModel

from app.schedule.models import DentalPlan


class TreatmentRequest(TimeStampedModel):
    STATUS_CHOICES = (
        (0, 'Pending'),
        (1, 'Processing'),
        (2, 'Ready'),
        (3, 'Canceled'),
    )

    dental_plan = ForeignKey(DentalPlan, on_delete=models.CASCADE)
    dental_plan_card_number = CharField('Número da carteirinha', max_length=24)
    patient_phone = CharField('Telefone', max_length=14)
    dentist_phone = CharField('Telefone do dentista', max_length=14)
    status = IntegerField('Status', choices=STATUS_CHOICES, default=0)

    # Fetched from Dental Plan later
    patient_first_name = CharField('Nome do Paciente', max_length=64, default=None, null=True, blank=True)
    patient_last_name = CharField('Sobrenome do Paciente', max_length=64, default=None, null=True, blank=True)
    patient_birth_date = DateField('Data de nascimento do paciente', default=None, null=True, blank=True)
    patient_cpf_hash = CharField('CPF do paciente', max_length=64, default=None, null=True, blank=True)
    patient_gender = CharField('Gênero do paciente', max_length=1, default=None, null=True, blank=True)
