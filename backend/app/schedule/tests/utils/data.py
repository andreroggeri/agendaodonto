import random

from faker import Faker

from app.schedule.models import Clinic, Dentist

faker = Faker('pt_BR')


def create_clinic(owner: Dentist) -> Clinic:
    return Clinic.objects.create(
        name=faker.company(),
        owner=owner,
        message='',
        time_delta=0
    )


def create_dentist() -> Dentist:
    return Dentist.objects.create_user(
        faker.first_name(),
        faker.last_name(),
        faker.email(),
        random.choice(['M', 'F']),
        faker.random_number(),
        'SP',
        faker.job()
    )
