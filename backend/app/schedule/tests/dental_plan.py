import json
from datetime import datetime
from urllib.parse import urlencode

import pytz
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_200_OK, HTTP_201_CREATED
from rest_framework.test import APITestCase

from app.schedule.models import Dentist, Clinic, DentalPlan, Schedule, Patient


class DentalPlanAPITest(APITestCase):
    def setUp(self):
        self.dentist = Dentist.objects.create_user('John', 'Snow', 'john@snow.com', 'M', '1234', 'SP', 'john')
        self.clinic = Clinic.objects.create(
            name='Test Clinic',
            owner=self.dentist,
            message='',
            time_delta=0
        )
        self.patient_1 = Patient.objects.create(name='Blah', clinic=self.clinic)
        self.patient_2 = Patient.objects.create(name='Blah', clinic=self.clinic)
        self.authenticate()

    def authenticate(self):
        token = Token.objects.create(user=self.dentist)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    def test_get_dental_plan_list(self):
        url = reverse('dental-plans')
        DentalPlan.objects.create(name='some plan')
        response = self.client.get(url)

        self.assertEqual(len(json.loads(response.content.decode('utf-8'))), DentalPlan.objects.count())
        self.assertEqual(HTTP_200_OK, response.status_code)

    def test_get_dental_plan(self):
        plan = DentalPlan.objects.create(name='some plan')
        url = reverse('dental-plan-detail', kwargs={"pk": plan.pk})

        response = self.client.get(url)

        self.assertEqual(json.loads(response.content.decode('utf-8')).get('name'), DentalPlan.objects.first().name)
        self.assertEqual(HTTP_200_OK, response.status_code)

    def test_create_dental_plan(self):
        url = reverse('dental-plans')

        body = {
            'name': 'Test Plan'
        }

        response = self.client.post(url, body)

        self.assertEqual(Clinic.objects.count(), 1)
        self.assertEqual(HTTP_201_CREATED, response.status_code)

    def test_edit_dental_plan(self):
        plan = DentalPlan.objects.create(name='some plan')

        url = reverse('dental-plan-detail', kwargs={"pk": plan.pk})

        body = {
            'name': 'Some Plan'
        }

        response = self.client.put(url, body)
        plan.refresh_from_db()
        self.assertEqual(HTTP_200_OK, response.status_code)
        self.assertEqual(plan.name, body['name'])

    def test_get_aggregated_data(self):
        plan1 = DentalPlan.objects.create(name='Plan 1')
        plan2 = DentalPlan.objects.create(name='Plan 2')
        self.patient_1.dental_plan = plan1
        self.patient_2.dental_plan = plan2
        self.patient_1.save()
        self.patient_2.save()

        # Creates schedules for the range filtered
        for _ in range(20):
            Schedule.objects.create(patient=self.patient_1,
                                    date=datetime(2019, 10, 5, 10, 1, tzinfo=pytz.timezone('America/Sao_Paulo')),
                                    duration=1,
                                    dentist=self.dentist)

        for _ in range(5):
            Schedule.objects.create(patient=self.patient_2,
                                    date=datetime(2019, 10, 15, 20, 15, tzinfo=pytz.timezone('America/Sao_Paulo')),
                                    duration=1,
                                    dentist=self.dentist)

        # Creates schedules outside the filtered range
        for _ in range(20):
            Schedule.objects.create(patient=self.patient_1,
                                    date=datetime(2019, 9, 5, 7, 1, tzinfo=pytz.timezone('America/Sao_Paulo')),
                                    duration=1,
                                    dentist=self.dentist)

        params = urlencode({'start_date': '2019-10-01', 'end_date': '2019-10-15'})
        url = reverse('dental-plan-stats') + '?' + params

        response = self.client.get(url)
        expected_response = [
            {'count': 20, 'dental_plan': 'Plan 1'},
            {'count': 5, 'dental_plan': 'Plan 2'},
        ]

        self.assertEqual(HTTP_200_OK, response.status_code)
        self.assertListEqual(expected_response, response.json())

    def test_get_aggregated_data_without_date_throws(self):
        url = reverse('dental-plan-stats')

        response = self.client.get(url)

        self.assertEqual(HTTP_400_BAD_REQUEST, response.status_code)

    def test_get_aggregated_data_with_invalid_date_throws(self):
        params = urlencode({'start_date': 'some-date', 'end_date': '2019-13-10'})
        url = reverse('dental-plan-stats') + '?' + params

        response = self.client.get(url)

        self.assertEqual(HTTP_400_BAD_REQUEST, response.status_code)
