from django.urls import reverse
from faker import Faker
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from app.finance.serializers import TransactionSerializer
from app.finance.tests.utils.data import create_inflow_transaction_model, create_inflow_transaction
from app.schedule.tests.utils.data import create_clinic, create_dentist


class InflowTransactionListAPITest(APITestCase):
    def setUp(self):
        self.dentist = create_dentist()
        self.clinic = create_clinic(self.dentist)
        self.authenticate()
        self.serializer = TransactionSerializer()
        self.faker = Faker('pt_BR')

    def authenticate(self):
        token = Token.objects.create(user=self.dentist)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def test_should_list_inflow_transactions(self):
        # Arrange
        other_clinic = create_clinic(self.dentist)
        avail_transaction = create_inflow_transaction_model(self.clinic)
        create_inflow_transaction_model(other_clinic)
        url = reverse('transactions', kwargs={'clinic_id': self.clinic.id})

        # Act
        req = self.client.get(url)

        # Assert
        content = req.json()
        self.assertEqual(req.status_code, 200)
        self.assertEqual(content, [self.serializer.to_representation(avail_transaction)])

    def test_should_create_inflow_transaction(self):
        # Arrange
        url = reverse('transactions', kwargs={'clinic_id': self.clinic.id})
        body = create_inflow_transaction(self.clinic)
        body['clinic'] = body['clinic'].id
        body['type'] = body['type'].id

        # Act
        req = self.client.post(url, body)

        # Assert
        content = req.json()
        content.pop('id')
        expected_response = body.copy()
        del expected_response['clinic']
        self.assertEqual(req.status_code, 201)
        self.assertEqual(content, expected_response)

    def test_should_not_list_transactions_from_a_not_owned_clinic(self):
        # Arrange
        other_dentist = create_dentist()
        other_clinic = create_clinic(other_dentist)
        url = reverse('transactions', kwargs={'clinic_id': other_clinic.id})

        # Act
        req = self.client.get(url)

        # Assert
        self.assertEqual(req.status_code, 404)

    def test_should_not_allow_create_transactions_from_a_non_owned_clinic(self):
        # Arrange
        other_dentist = create_dentist()
        other_clinic = create_clinic(other_dentist)
        url = reverse('transactions', kwargs={'clinic_id': other_clinic.id})
        body = create_inflow_transaction(self.clinic)
        body['clinic'] = body['clinic'].id
        body['type'] = body['type'].id

        # Act
        req = self.client.post(url, body)

        # Assert
        self.assertEqual(req.status_code, 404)
