import datetime
import json

from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT
from rest_framework.test import APITestCase

from app.schedule.models import Dentist, Clinic, DentalPlan
from app.schedule.models.treatment_request import TreatmentRequest, TreatmentRequestStatus


class TreatmentRequestAPITest(APITestCase):
    def setUp(self):
        self.dentist = Dentist.objects.create_user('John', 'Snow', 'john@snow.com', 'M', '1234', 'SP', 'john',
                                                   phone='11912345678')
        self.clinic = Clinic.objects.create(
            name='Test Clinic',
            owner=self.dentist,
            message='',
            time_delta=0
        )
        self.dental_plan = DentalPlan.objects.create(name='Test Plan')
        self.authenticate()

    def authenticate(self):
        token = Token.objects.create(user=self.dentist)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    def test_get_treatment_requests(self):
        url = reverse('treatment-requests')
        TreatmentRequest.objects.create(dental_plan=self.dental_plan, dental_plan_card_number='1234',
                                        patient_phone='13245678912',
                                        dentist_phone=self.dentist.phone, status=0)
        response = self.client.get(url)

        self.assertEqual(len(json.loads(response.content.decode('utf-8'))), TreatmentRequest.objects.count())
        self.assertEqual(HTTP_200_OK, response.status_code)

    def test_create_treatment_request(self):
        url = reverse('treatment-requests')

        body = {
            'dental_plan': self.dental_plan.pk,
            'dental_plan_card_number': '1234',
            'patient_phone': '13245678912',
            'dentist_phone': self.dentist.phone,
            'status': 0
        }

        response = self.client.post(url, body)

        self.assertEqual(HTTP_201_CREATED, response.status_code)
        self.assertEqual(TreatmentRequest.objects.count(), 1)

    def test_edit_treatment_request(self):
        treatment_request = TreatmentRequest.objects.create(dental_plan=self.dental_plan,
                                                            dentist_phone=self.dentist.phone,
                                                            dental_plan_card_number='1234', patient_phone='13245678912',
                                                            status=0)

        url = reverse('treatment-request-detail', kwargs={'pk': treatment_request.pk})

        body = {
            'patient_first_name': 'John the Doe'
        }

        response = self.client.patch(url, body)
        treatment_request.refresh_from_db()
        self.assertEqual(HTTP_200_OK, response.status_code)
        self.assertEqual(treatment_request.patient_first_name, body['patient_first_name'])

    def test_delete_treatment_request(self):
        treatment_request = TreatmentRequest.objects.create(dental_plan=self.dental_plan,
                                                            dentist_phone=self.dentist.phone,
                                                            dental_plan_card_number='1234', patient_phone='13245678912',
                                                            status=0)

        url = reverse('treatment-request-detail', kwargs={'pk': treatment_request.pk})

        response = self.client.delete(url)
        self.assertEqual(HTTP_204_NO_CONTENT, response.status_code)
        self.assertEqual(TreatmentRequest.objects.count(), 0)

    def test_treatment_request_should_be_updated_with_dental_plan_data(self):
        url = reverse('treatment-requests')

        body = {
            'dental_plan': self.dental_plan.pk,
            'dental_plan_card_number': '1234',
            'patient_phone': '13245678912',
            'dentist_phone': self.dentist.phone,
            'status': 0
        }

        response = self.client.post(url, body)

        treatment_request = TreatmentRequest.objects.get(pk=json.loads(response.content.decode('utf-8'))['id'])

        self.assertEqual(treatment_request.patient_first_name, 'John')
        self.assertEqual(treatment_request.patient_last_name, 'Doe')
        self.assertEqual(treatment_request.patient_birth_date, datetime.date(1990, 1, 1), )
        self.assertEqual(treatment_request.patient_gender, 'M')

    def test_submit_request(self):
        treatment_request = TreatmentRequest.objects.create(
            dental_plan=self.dental_plan,
            dentist_phone=self.dentist.phone,
            dental_plan_card_number='1234', patient_phone='13245678912',
            clinic_id=self.clinic.pk,
            status=TreatmentRequestStatus.READY
        )

        url = reverse('treatment-request-submit', kwargs={'pk': treatment_request.id})

        response = self.client.post(url)

        self.assertEqual(HTTP_201_CREATED, response.status_code)
