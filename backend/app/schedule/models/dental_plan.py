from django.db.models import CharField
from model_utils.models import TimeStampedModel


class DentalPlan(TimeStampedModel):
    name = CharField('Nome do convênio', max_length=100)
