from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from app.finance.models import Transaction
from app.finance.serializers import TransactionSerializer
from app.finance.tests.utils.data import create_inflow_transaction_model, create_inflow_transaction
from app.schedule.models import Dentist, Clinic
from app.schedule.tests.utils.data import create_clinic, create_dentist


class InflowTransactionDetailAPITest(APITestCase):
    def setUp(self):
        self.dentist = Dentist.objects.create_user('John', 'Snow', 'john@snow.com', 'M', '1234', 'SP', 'john')
        self.clinic = Clinic.objects.create(
            name='Test Clinic',
            owner=self.dentist,
            message='',
            time_delta=0
        )
        self.authenticate()
        self.serializer = TransactionSerializer()

    def authenticate(self):
        token = Token.objects.create(user=self.dentist)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    def test_should_update_inflow_transaction(self):
        # Arrange
        avail_transaction = create_inflow_transaction_model(self.clinic)
        url = reverse('transaction-detail', kwargs={'clinic_id': self.clinic.id, 'pk': avail_transaction.id})
        new_data = create_inflow_transaction(self.clinic)

        # Act
        new_data['clinic'] = new_data['clinic'].id
        new_data['type'] = new_data['type'].id
        req = self.client.put(url, new_data)
        avail_transaction.refresh_from_db()

        # Assert
        expected_result = self.serializer.to_representation(avail_transaction)
        expected_result.pop('id')
        del new_data['clinic']
        self.assertEqual(req.status_code, 200)
        self.assertEqual(expected_result, new_data)

    def test_should_delete_inflow_transaction(self):
        # Arrange
        avail_transaction = create_inflow_transaction_model(self.clinic)
        url = reverse('transaction-detail', kwargs={'clinic_id': self.clinic.id, 'pk': avail_transaction.id})

        # Act
        req = self.client.delete(url)

        # Assert
        self.assertEqual(req.status_code, 204)
        self.assertEqual(Transaction.objects.count(), 0)

    def test_should_not_allow_update_transaction_from_a_non_owned_clinic(self):
        # Arrange
        other_dentist = create_dentist()
        other_clinic = create_clinic(other_dentist)
        other_clinic_transaction = create_inflow_transaction_model(other_clinic)
        url = reverse('transaction-detail', kwargs={
            'clinic_id': other_clinic.id,
            'pk': other_clinic_transaction.id
        })

        new_data = create_inflow_transaction(other_clinic)

        # Act
        new_data['clinic'] = new_data['clinic'].id
        new_data['type'] = new_data['type'].id
        req = self.client.put(url, new_data)

        # Assert
        refreshed_model = Transaction.objects.get(pk=other_clinic_transaction.pk)
        self.assertEqual(req.status_code, 404)
        self.assertEqual(other_clinic_transaction, refreshed_model)

    def test_should_not_allow_delete_transaction_from_a_non_owned_clinic(self):
        # Arrange
        other_dentist = create_dentist()
        other_clinic = create_clinic(other_dentist)
        other_clinic_transaction = create_inflow_transaction_model(other_clinic)
        url = reverse('transaction-detail', kwargs={
            'clinic_id': other_clinic.id,
            'pk': other_clinic_transaction.id
        })

        # Act
        req = self.client.delete(url)

        # Assert
        self.assertEqual(req.status_code, 404)
        self.assertEqual(Transaction.objects.count(), 1)
