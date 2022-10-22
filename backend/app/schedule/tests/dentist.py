import json

from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from app.schedule.models import Dentist


class DentistAPITest(APITestCase):
    def setUp(self):
        self.dentist = Dentist.objects.create_user('John', 'Snow', 'john@snow.com', 'M', '1234', 'SP', 'john')
        self.extra_dentist = Dentist.objects.create_user('Maria', 'Dolores', 'maria@d.com', 'F', '5555', 'RJ', 'maria')
        self.authenticate()

    def authenticate(self):
        token = Token.objects.create(user=self.dentist)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    def test_get_dentist(self):
        url = reverse('dentists') + '?cro=234'

        response = self.client.get(url)

        self.assertEqual(len(json.loads(response.content.decode('utf-8'))),
                         Dentist.objects.filter(cro__contains='234').count())
        self.assertEqual(200, response.status_code)

    def test_get_dentist_name(self):
        self.assertEqual(self.dentist.get_short_name(), 'John')
        self.assertEqual(self.dentist.get_full_name(), 'John Snow')
