import json
from datetime import datetime

import pytz
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from app.schedule.models import Schedule
from app.schedule.models.clinic import Clinic
from app.schedule.models.dentist import Dentist
from app.schedule.models.patient import Patient


class PatientAPITest(APITestCase):
    def setUp(self):
        self.dentist = Dentist.objects.create_user('John', 'Snow', 'john@snow.com', 'M', '1234', 'SP', 'john')
        self.extra_dentist = Dentist.objects.create_user('Maria', 'Dolores', 'maria@d.com', 'F', '5555', 'RJ', 'maria')
        self.clinic = Clinic.objects.create(
            name='Test Clinic',
            owner=self.dentist,
            message='',
            time_delta=0
        )
        self.clinic.dentists.add(self.dentist)
        self.clinic.dentists.add(self.extra_dentist)
        self.clinic.save()
        self.authenticate()

    def authenticate(self):
        token = Token.objects.create(user=self.dentist)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    def test_get_patients(self):
        url = reverse('patients')
        Patient.objects.create(
            name='Test',
            last_name='Patient',
            phone='1234',
            sex='M',
            clinic=self.clinic
        )
        Patient.objects.create(
            name='Test',
            last_name='Patient',
            phone='1234',
            sex='M',
            clinic=self.clinic
        )

        response = self.client.get(url)

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(json.loads(response.content.decode('utf-8'))), Patient.objects.count())

    def test_create_patient(self):
        url = reverse('patients')

        body = {
            'name': 'Test',
            'last_name': 'Patient',
            'phone': '1234',
            'sex': 'M',
            'clinic': self.clinic.pk
        }

        response = self.client.post(url, body)

        self.assertEqual(201, response.status_code)
        self.assertEqual(1, Patient.objects.count())

    def test_edit_patient(self):
        patient = Patient.objects.create(
            name='Test',
            last_name='Patient',
            phone='1234',
            sex='M',
            clinic=self.clinic
        )

        url = reverse('patient-detail', kwargs=({'pk': patient.pk}))

        body = {
            'name': 'Test',
            'last_name': 'Patient',
            'phone': '5555',
            'sex': 'M',
            'clinic': self.clinic.pk
        }

        response = self.client.put(url, body)
        response_data = json.loads(response.content.decode('utf-8'))

        patient = Patient.objects.get(pk=patient.pk)

        self.assertEqual(200, response.status_code)
        self.assertEqual(patient.phone, response_data.get('phone'))

    def test_delete_patient(self):
        patient = Patient.objects.create(
            name='Test',
            last_name='Patient',
            phone='1234',
            sex='M',
            clinic=self.clinic
        )

        url = reverse('patient-detail', kwargs=({'pk': patient.pk}))

        response = self.client.delete(url)

        self.assertEqual(204, response.status_code)
        self.assertEqual(0, Patient.objects.count())

    def test_get_patient_schedules(self):
        patient_a = Patient.objects.create(
            name='Test',
            last_name='Patient A',
            phone='1234',
            sex='M',
            clinic=self.clinic
        )

        patient_b = Patient.objects.create(
            name='Test',
            last_name='Patient B',
            phone='1234',
            sex='M',
            clinic=self.clinic
        )

        Schedule.objects.create(
            patient=patient_a,
            dentist=self.dentist,
            date=datetime.now(tz=pytz.timezone('America/Sao_Paulo')),
            duration=60,
        )

        Schedule.objects.create(
            patient=patient_b,
            dentist=self.dentist,
            date=datetime.now(tz=pytz.timezone('America/Sao_Paulo')),
            duration=60,
        )

        Schedule.objects.create(
            patient=patient_a,
            dentist=self.dentist,
            date=datetime.now(tz=pytz.timezone('America/Sao_Paulo')),
            duration=60,
        )
        url = reverse('patient-schedules', kwargs=({'pk': patient_a.pk}))
        response = self.client.get(url)

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(json.loads(response.content.decode('utf-8'))),
                         Schedule.objects.filter(patient=patient_a).count())

    def test_get_sex_prefix(self):
        patient = Patient.objects.create(
            name='Test',
            last_name='Patient A',
            phone='1234',
            sex='M',
            clinic=self.clinic
        )

        self.assertEqual(patient.get_sex_prefix(), 'Sr.')

        patient.sex = 'F'

        self.assertEqual(patient.get_sex_prefix(), 'Sra.')

    def test_filter_full_name(self):
        def test_filter(term, expected_count):
            url = reverse('patients') + '?full_name=' + term
            response = self.client.get(url)
            data = json.loads(response.content.decode())
            self.assertEquals(200, response.status_code)
            self.assertEquals(len(data), expected_count)

        common_data = {'phone': '1234', 'sex': 'M', 'clinic': self.clinic}

        Patient.objects.create(name='John', last_name='Smith Joe', **common_data)
        Patient.objects.create(name='John', last_name='Carl Joe', **common_data)
        Patient.objects.create(name='Janet', last_name='Carl Joe', **common_data)
        Patient.objects.create(name='Paul', last_name='Max Joe', **common_data)
        Patient.objects.create(name='Robert', last_name='Adams Clark', **common_data)

        test_filter('John Joe', 2)
        test_filter('Joe', 4)
        test_filter('B M L', 1)  # roBert adaMs cLark

    def test_get_patient_details(self):
        patient = Patient.objects.create(
            name='Test',
            last_name='Patient A',
            phone='1234',
            sex='M',
            clinic=self.clinic
        )
        url = reverse('patient-detail', kwargs=({'pk': patient.pk}))
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
