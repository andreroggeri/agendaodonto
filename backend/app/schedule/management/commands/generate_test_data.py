import random
import re
import string
from datetime import datetime

import pytz
from django.conf import settings
from django.core.management import BaseCommand
from django.db.models import Count
from faker import Faker

from app.schedule.models import *


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--dentists', type=bool)
        parser.add_argument('--patients', type=bool)
        parser.add_argument('--clinics', type=bool)
        parser.add_argument('--schedules', type=bool)
        parser.add_argument('--patient_count', type=int)
        parser.add_argument('--schedule_count', type=int)

    def generate_dentists(self):
        s = string.ascii_lowercase + string.digits
        dentists_data = (
            ('André', 'Roggeri Campos', 'a.roggeri.c@gmail.com', 'M', random.randint(100000, 999999),
             Dentist.CRO_STATE_OPTIONS[random.randint(0, 26)][0], 'andre'),
            ('Paulo', 'Dias Azevedo', 'PauloDiasAzevedo@rhyta.com', 'M', random.randint(100000, 999999),
             Dentist.CRO_STATE_OPTIONS[random.randint(0, 26)][0], ''.join(random.sample(s, 10))),
            ('Vitória', 'Barbosa Ferreira', 'VitoriaBarbosaFerreira@armyspy.com', 'F', random.randint(100000, 999999),
             Dentist.CRO_STATE_OPTIONS[random.randint(0, 26)][0], ''.join(random.sample(s, 10))),
            ('Danilo', 'Gomes Barros', 'DaniloGomesBarros@jourrapide.com', 'M', random.randint(100000, 999999),
             Dentist.CRO_STATE_OPTIONS[random.randint(0, 26)][0], ''.join(random.sample(s, 10))),
            ('João', 'Almeida Ribeiro', 'JoaoAlmeidaRibeiro@teleworm.us', 'M', random.randint(100000, 999999),
             Dentist.CRO_STATE_OPTIONS[random.randint(0, 26)][0], ''.join(random.sample(s, 10))),
            ('Manuela', 'Rocha Cardoso', 'ManuelaRochaCardoso@teleworm.us', 'F', random.randint(100000, 999999),
             Dentist.CRO_STATE_OPTIONS[random.randint(0, 26)][0], ''.join(random.sample(s, 10))),
            ('Luís', 'Silva Ferreira', 'LuisSilvaFerreira@teleworm.us', 'M', random.randint(100000, 999999),
             Dentist.CRO_STATE_OPTIONS[random.randint(0, 26)][0], ''.join(random.sample(s, 10))),
            ('Kauan', 'Souza Costa', 'KauanSouzaCosta@teleworm.us', 'M', random.randint(100000, 999999),
             Dentist.CRO_STATE_OPTIONS[random.randint(0, 26)][0], ''.join(random.sample(s, 10))),
            ('Bruna', 'Dias Costa', 'BrunaDiasCosta@dayrep.com', 'F', random.randint(100000, 999999),
             Dentist.CRO_STATE_OPTIONS[random.randint(0, 26)][0], ''.join(random.sample(s, 10)))
        )

        dentist_list = []
        for d in dentists_data:
            dentist_list.append(Dentist.objects.create_user(d[0], d[1], d[2], d[3], d[4], d[5], d[6]))

    def generate_patients(self, count):
        faker = Faker('pt_BR')
        for _ in range(0, count):
            Patient.objects.create(
                name=faker.first_name(),
                last_name=faker.last_name(),
                phone=''.join(re.findall('\d', faker.phone_number())),
                sex=random.choice(['M', 'F']),
                clinic=random.choice(Clinic.objects.all())
            )

    def generate_clinics(self):
        clinic_data = (
            ('Clinica Moura', random.choice(Dentist.objects.all()),
             random.sample(list(Dentist.objects.all()), random.randint(0, Dentist.objects.count() - 1))),
            ('Clinica Costa', Dentist.objects.all()[random.randint(0, Dentist.objects.count() - 1)],
             random.sample(list(Dentist.objects.all()), random.randint(0, Dentist.objects.count() - 1))),
            ('Clinica Grátis', random.choice(Dentist.objects.all()),
             random.sample(list(Dentist.objects.all()), random.randint(0, Dentist.objects.count() - 1))),
            ('Clinica Cardoso', random.choice(Dentist.objects.all()),
             random.sample(list(Dentist.objects.all()), random.randint(0, Dentist.objects.count() - 1))),
            ('Clinica Ferreira', random.choice(Dentist.objects.all()),
             random.sample(list(Dentist.objects.all()), random.randint(0, Dentist.objects.count() - 1)))
        )

        clinic_list = []
        for c in clinic_data:
            clinic = Clinic.objects.create(
                name=c[0],
                owner=c[1],
                message=''
            )

            clinic.dentists = c[2]
            clinic.save()
            clinic_list.append(clinic)

    def generate_schedules(self, count):
        for _ in range(0, count):
            start_date = datetime.now().replace(day=1, month=1).toordinal()
            end_date = datetime.today().toordinal()
            random_day = datetime.fromordinal(random.randint(start_date, end_date))
            random_day = pytz.timezone('America/Sao_Paulo').localize(random_day)
            random_day = random_day.replace(hour=random.randint(0, 23), minute=random.randint(0, 59))
            p = random.choice(
                Patient.objects.annotate(dentist_count=Count('clinic__dentists')).filter(dentist_count__gt=0))

            Schedule.objects.create(
                patient=p,
                dentist=random.choice(p.clinic.dentists.all()),
                date=random_day,
                duration=random.randint(15, 120),
                status=random.choice(Schedule.STATUS_CHOICES)[0]
            )

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise Exception('DO NOT RUN THIS ON PRODUCTION !!')

        if options.get('dentists'):
            print("Creating dentists...")
            self.generate_dentists()

        if options.get('clinics'):
            print("Creating clinics...")
            self.generate_clinics()

        if options.get('patients'):
            count = options.get('patient_count', 100)
            count = 100 if count is None else count
            print("Creating {} patients...".format(count))
            self.generate_patients(count)

        if options.get('schedules'):
            count = options.get('schedule_count')
            count = 100 if count is None else count
            print("Creating {} schedules...".format(count))
            self.generate_schedules(count)
