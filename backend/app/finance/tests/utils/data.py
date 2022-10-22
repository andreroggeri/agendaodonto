import random
from decimal import Decimal

from faker import Faker

from app.finance.models import Transaction, TransactionType
from app.schedule.models import Clinic

faker = Faker('pt_BR')


def create_inflow_transaction(clinic: Clinic) -> dict:
    two_places = Decimal("0.01")
    return {
        'clinic': clinic,
        'amount': str((Decimal(random.randrange(500, 10000)) / 100).quantize(two_places)),
        'payment_holder': faker.cpf(),
        'service_beneficiary': faker.cpf(),
        'date': faker.date(),
        'type': create_type(clinic),
        'description': faker.catch_phrase(),
    }


def create_inflow_transaction_model(clinic: Clinic) -> Transaction:
    return Transaction.objects.create(**create_inflow_transaction(clinic))


def create_type(clinic: Clinic) -> TransactionType:
    return TransactionType.objects.create(code=faker.random_number(), clinic=clinic, label=faker.catch_phrase())
