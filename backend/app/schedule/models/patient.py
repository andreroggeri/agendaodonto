from django.db import models
from django.db.models import CASCADE
from django.db.models.fields.related import ForeignKey
from model_utils.models import TimeStampedModel

from app.schedule.models.clinic import Clinic
from app.schedule.models.dental_plan import DentalPlan


class Patient(TimeStampedModel):
    class Meta:
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'

    def __str__(self):
        return "{} {}".format(self.name, self.last_name)

    def get_sex_prefix(self):
        return 'Sr.' if self.sex == 'M' else 'Sra.'

    SEX_TYPES = (
        ('M', 'Masculino'),
        ('F', 'Feminino')
    )

    name = models.CharField('Nome', max_length=30)
    last_name = models.CharField('Sobrenome', max_length=30)
    phone = models.CharField('Telefone', max_length=14)
    sex = models.CharField('Sexo', max_length=1, choices=SEX_TYPES)
    clinic = models.ForeignKey(Clinic, on_delete=CASCADE)
    dental_plan = ForeignKey(DentalPlan, default=None, null=True, blank=True, on_delete=CASCADE)
