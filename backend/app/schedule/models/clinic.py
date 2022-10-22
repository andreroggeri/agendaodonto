from django.db import models
from django.db.models import CASCADE
from model_utils.models import TimeStampedModel

from app.schedule.models.dentist import Dentist


class Clinic(TimeStampedModel):
    class Meta:
        verbose_name = 'Clínica'
        verbose_name_plural = 'Clínicas'

    def __str__(self):
        return self.name

    name = models.CharField('Nome', max_length=50)
    owner = models.ForeignKey(Dentist, related_name='owner', on_delete=CASCADE)
    dentists = models.ManyToManyField(Dentist, related_name='dentists', blank=True)
    message = models.CharField('Mensagem', max_length=160)
    time_delta = models.FloatField('Tempo para notificar (horas)', default=1.0)
