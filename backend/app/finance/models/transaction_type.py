from django.db.models import CharField, IntegerField, ForeignKey, CASCADE
from model_utils.models import TimeStampedModel

from app.schedule.models import Clinic


class TransactionType(TimeStampedModel):
    class Meta:
        unique_together = ('code', 'clinic')

    label = CharField('Descrição', max_length=120)
    code = IntegerField('Código')
    clinic = ForeignKey(Clinic, on_delete=CASCADE)
