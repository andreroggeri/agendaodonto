import json

from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from app.schedule.models import Dentist, Patient, Clinic


class ClinicAPITest(APITestCase):
    def setUp(self):
        self.dentist = Dentist.objects.create_user('John', 'Snow', 'john@snow.com', 'M', '1234', 'SP', 'john')
        self.extra_dentist = Dentist.objects.create_user('Maria', 'Dolores', 'maria@d.com', 'F', '5555', 'RJ', 'maria')
        self.authenticate()

    def authenticate(self):
        token = Token.objects.create(user=self.dentist)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    def test_get_clinics(self):
        url = reverse('clinics')
        clinic = Clinic.objects.create(
            name='Test clinic',
            owner=self.dentist,
            message='',
            time_delta=1.0
        )
        clinic.dentists.add(self.dentist)
        clinic.dentists.add(self.extra_dentist)
        clinic.save()
        response = self.client.get(url)

        self.assertEqual(len(json.loads(response.content.decode('utf-8'))), Clinic.objects.count())
        self.assertEqual(200, response.status_code)

    def test_get_clinic(self):
        clinic = Clinic.objects.create(
            name='Test clinic',
            owner=self.dentist,
            message='',
            time_delta=1.0
        )
        url = reverse('clinic-detail', kwargs={"pk": clinic.pk})

        response = self.client.get(url)

        self.assertEqual(json.loads(response.content.decode('utf-8')).get('name'), Clinic.objects.first().name)
        self.assertEqual(200, response.status_code)

    def test_create_clinic(self):
        url = reverse('clinics')

        body = {
            'name': 'Test Clinic'
        }

        response = self.client.post(url, body)

        self.assertEqual(1, Clinic.objects.count())
        self.assertEqual(201, response.status_code)

    def test_edit_clinic(self):
        clinic = Clinic.objects.create(
            name='Test clinic',
            owner=self.dentist,
            message='',
            time_delta=1.0
        )

        url = reverse('clinic-detail', kwargs={"pk": clinic.pk})

        body = {
            'name': 'My Clinic'
        }

        response = self.client.put(url, body)

        Clinic.objects.first().name = body.get('name')
        self.assertEqual(200, response.status_code)

    def test_get_clinic_patients(self):
        clinic = Clinic.objects.create(
            name='Test clinic',
            owner=self.dentist,
            message='',
            time_delta=1.0
        )
        clinic.dentists.add(self.dentist)
        clinic.dentists.add(self.extra_dentist)
        clinic2 = Clinic.objects.create(
            name='Test clinic 2',
            owner=self.dentist,
            message='',
            time_delta=1.0
        )
        clinic2.dentists.add(self.dentist)
        clinic2.dentists.add(self.extra_dentist)
        Patient.objects.create(
            name='Patient',
            last_name='One',
            phone='1234',
            sex='F',
            clinic=clinic
        )

        Patient.objects.create(
            name='Patient',
            last_name='Two',
            phone='1234',
            sex='F',
            clinic=clinic
        )

        Patient.objects.create(
            name='Patient',
            last_name='Three',
            phone='1234',
            sex='F',
            clinic=clinic2
        )
        url = reverse('clinic-patients', kwargs={'pk': clinic.pk})

        response = self.client.get(url)

        self.assertEqual(len(json.loads(response.content.decode('utf-8'))),
                         Patient.objects.filter(clinic_id=clinic.id).count())
        self.assertEqual(200, response.status_code)

    def test_list_only_my_clinics(self):
        url = reverse('clinics')

        user2 = Dentist.objects.create_user('Evil', 'Doctor', 'evil@doctor.com', 'F', '11155588', 'SP', 'any')

        clinic_a = Clinic.objects.create(
            name='Test clinic',
            owner=self.dentist,
            message='',
            time_delta=1.0
        )

        clinic_b = Clinic.objects.create(
            name='Evil clinic',
            owner=user2,
            message='',
            time_delta=1.0
        )

        response = self.client.get(url)

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(json.loads(response.content.decode('utf-8'))),
                         Clinic.objects.filter(owner=self.dentist).count())

    def test_show_only_my_clinic(self):
        user2 = Dentist.objects.create_user('Evil', 'Doctor', 'evil@doctor.com', 'F', '11155588', 'RJ', 'any')

        Clinic.objects.create(
            name='Test clinic',
            owner=self.dentist,
            message='',
            time_delta=1.0
        )

        clinic_b = Clinic.objects.create(
            name='Evil clinic',
            owner=user2,
            message='',
            time_delta=1.0
        )

        url = reverse('clinic-detail', kwargs={'pk': clinic_b.pk})

        response = self.client.get(url)

        self.assertEqual(404, response.status_code)
