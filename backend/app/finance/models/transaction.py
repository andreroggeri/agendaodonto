from django.db.models import ForeignKey, PROTECT, DecimalField, CharField, DateField
from model_utils.models import TimeStampedModel

from app.finance.models import TransactionType
from app.schedule.models import Clinic


class Transaction(TimeStampedModel):
    clinic = ForeignKey(Clinic, on_delete=PROTECT)
    amount = DecimalField(max_digits=8, decimal_places=2)
    payment_holder = CharField('Titular do Pagamento', blank=True, max_length=25)
    service_beneficiary = CharField('Beneficiário do Serviço', blank=True, max_length=25)
    description = CharField('Descrição', max_length=255)
    date = DateField('Data')
    type = ForeignKey(TransactionType, on_delete=PROTECT)
