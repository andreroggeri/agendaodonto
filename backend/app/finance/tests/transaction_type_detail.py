from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from app.finance.models import TransactionType
from app.finance.serializers.transaction_type import TransactionTypeSerializer
from app.finance.tests.utils.data import create_type
from app.schedule.models import Dentist, Clinic


class TransactionTypeDetailAPITest(APITestCase):
    def setUp(self):
        self.dentist = Dentist.objects.create_user('John', 'Snow', 'john@snow.com', 'M', '1234', 'SP', 'john')
        self.clinic = Clinic.objects.create(
            name='Test Clinic',
            owner=self.dentist,
            message='',
            time_delta=0
        )
        self.authenticate()
        self.serializer = TransactionTypeSerializer()

    def authenticate(self):
        token = Token.objects.create(user=self.dentist)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    def test_should_update_transaction_type(self):
        # Arrange
        clinic2 = Clinic.objects.create(
            name='Test Clinic2',
            owner=self.dentist,
            message='',
            time_delta=0
        )
        avail_transaction = create_type(clinic2)
        url = reverse('transaction-type-detail', kwargs={'clinic_id': clinic2.id, 'pk': avail_transaction.id})

        # Act
        content = {
            'code': 5599,
            'label': 'Some !!! Label1234'
        }
        req = self.client.put(url, content)

        # Assert
        transaction_types = TransactionType.objects.filter(clinic=clinic2).all()
        retrieved_content = self.serializer.to_representation(transaction_types[0])
        retrieved_content.pop('id')
        self.assertEqual(req.status_code, 200)
        self.assertEqual(transaction_types.count(), 1)
        self.assertEqual(content, retrieved_content)
        self.assertEqual(transaction_types[0].clinic, clinic2)

    def test_should_delete_transaction_type(self):
        # Arrange
        avail_transaction = create_type(self.clinic)
        url = reverse('transaction-type-detail', kwargs={'clinic_id': self.clinic.id, 'pk': avail_transaction.id})

        # Act
        req = self.client.delete(url)

        # Assert
        transaction_types = TransactionType.objects.all()
        self.assertEqual(req.status_code, 204)
        self.assertEqual(transaction_types.count(), 0)
