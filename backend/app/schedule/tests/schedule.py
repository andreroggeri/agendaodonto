import json
import unittest
from datetime import datetime, timedelta
from threading import Timer

import pytz
from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.db import connection
from django.test import TestCase, override_settings
from django.urls import reverse
from pyfcm import FCMNotification
from requests_mock import Mocker
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from app.schedule.models import Schedule
from app.schedule.models.clinic import Clinic
from app.schedule.models.dentist import Dentist
from app.schedule.models.patient import Patient
from app.schedule.service.sms import SMS


class ScheduleAPITest(APITestCase):
    def setUp(self):
        self.dentist = Dentist.objects.create_user('John', 'Snow', 'john@snow.com', 'M', '1234', 'SP', 'john')
        self.dentist.device_token = 'BLAH'
        self.dentist.save()
        self.extra_dentist = Dentist.objects.create_user('Maria', 'Dolores', 'maria@d.com', 'F', '5555', 'RJ', 'maria')
        self.clinic = Clinic.objects.create(
            name='Test Clinic',
            owner=self.dentist,
            message='',
            time_delta=1.0
        )
        self.clinic.dentists.add(self.dentist)
        self.clinic.dentists.add(self.extra_dentist)
        self.patient = Patient.objects.create(
            name='Luís',
            last_name='Cunha Martins',
            phone='+5519993770437',
            sex='M',
            clinic=self.clinic
        )
        self.patient.refresh_from_db()
        self.schedule = Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=datetime.now(tz=pytz.timezone('America/Sao_Paulo')) + timedelta(days=1),
            duration=60
        )
        self.schedule.refresh_from_db()
        self.authenticate()

    def authenticate(self):
        token = Token.objects.create(user=self.dentist)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    def test_get_schedule(self):
        url = reverse('schedules')
        Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=datetime.now(tz=pytz.timezone('America/Sao_Paulo')),
            duration=60
        )
        response = self.client.get(url)
        self.assertEqual(len(json.loads(response.content.decode('utf-8'))), Schedule.objects.count())
        self.assertEqual(200, response.status_code)

    def test_filter_schedule(self):
        url = reverse('schedules') + '?date_after=10/5/2016&date_before=11/5/2016'
        Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=datetime(2016, 5, 10, tzinfo=pytz.UTC),
            duration=60
        )

        Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=datetime(2016, 5, 11, tzinfo=pytz.UTC),
            duration=60
        )

        Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=datetime(2016, 5, 12, tzinfo=pytz.UTC),
            duration=60
        )

        response = self.client.get(url)
        response_data = json.loads(response.content.decode('utf-8'))

        self.assertEqual(200, response.status_code)
        self.assertEqual(2, len(response_data))

    def test_create_schedule(self):
        url = reverse('schedules')
        body = {
            'patient': self.patient.id,
            'dentist': self.dentist.id,
            'date': datetime.now(tz=pytz.timezone('America/Sao_Paulo')),
            'duration': 60
        }

        response = self.client.post(url, body)

        self.assertEqual(201, response.status_code)
        self.assertEqual(2, Schedule.objects.count())

    def test_edit_schedule(self):
        url = reverse('schedule-detail', kwargs={"pk": self.schedule.pk})

        body = {
            'patient': self.patient.id,
            'dentist': self.dentist.id,
            'date': datetime.now(tz=pytz.timezone('America/Sao_Paulo')),
            'duration': 50
        }

        response = self.client.put(url, body)

        response_data = json.loads(response.content.decode('utf-8'))

        schedule = Schedule.objects.get(id=self.schedule.id)

        self.assertEqual(response_data.get('duration'), schedule.duration)

    def test_delete_schedule(self):
        url = reverse('schedule-detail', kwargs={"pk": self.schedule.pk})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, 204)

    def test_get_attendance(self):
        url = reverse('schedule-attendance')

        now = datetime.now(settings.TZ)
        relative_date = (now - relativedelta(months=1))
        date_format = relative_date.strftime('%Y-%m-01')

        Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=relative_date,
            duration=60,
            status=1
        )

        Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=relative_date,
            duration=60,
            status=2
        )

        Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=relative_date,
            duration=60,
            status=3
        )

        Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=relative_date + relativedelta(years=1),
            duration=60,
            status=3
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)

        response_data = json.loads(response.content.decode('utf-8'))

        self.assertEqual(response_data[date_format]['attendances'], 1)
        self.assertEqual(response_data[date_format]['absences'], 1)
        self.assertEqual(response_data[date_format]['cancellations'], 1)
        self.assertEqual(response_data[date_format]['ratio'], 0.3333333333333333)

    def test_attendance_with_date(self):
        url = reverse('schedule-attendance') + '?date=2017-06-15'
        response = self.client.get(url)
        response_data = json.loads(response.content.decode('utf-8'))
        self.assertIsNotNone(response_data.get('2017-05-01'))
        self.assertIsNotNone(response_data.get('2016-06-01'))

    def test_attendance_with_wrong_date(self):
        url = reverse('schedule-attendance') + '?date=NOT A DATE!'
        now = datetime.now()
        date_upper_limit = (now - relativedelta(months=1)).strftime('%Y-%m-01')
        date_lower_limit = (now - relativedelta(years=1)).strftime('%Y-%m-01')
        response = self.client.get(url)
        response_data = json.loads(response.content.decode('utf-8'))
        self.assertIsNotNone(response_data.get(date_upper_limit))
        self.assertIsNotNone(response_data.get(date_lower_limit))

    def test_attendance_ratio_zero_attendance(self):
        url = reverse('schedule-attendance')
        now = datetime.now()
        relative_date = (now - relativedelta(months=1))
        date_format = relative_date.strftime('%Y-%m-01')
        Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=relative_date,
            duration=60,
            status=2
        )

        Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=relative_date,
            duration=60,
            status=3
        )
        response = self.client.get(url)
        response_data = json.loads(response.content.decode('utf-8'))
        self.assertEqual(response_data[date_format]['ratio'], 0)

    def test_notification_status_without_notification(self):
        url = reverse('schedules')
        response = self.client.get(url)
        response_data = json.loads(response.content.decode('utf-8'))
        self.assertEqual(response_data[0]['notification_status'], 0)

    def test_should_create_notification_future_schedule_update(self):
        url = reverse('schedule-detail', kwargs={"pk": self.schedule.pk})
        prev_task_id = self.schedule.notification_task_id
        body = {
            'patient': self.patient.id,
            'dentist': self.dentist.id,
            'date': datetime.now(tz=pytz.timezone('America/Sao_Paulo')) + timedelta(days=1),
            'duration': 50
        }

        response = json.loads(self.client.put(url, body).content.decode('utf-8'))
        self.assertEqual(response['notification_status'], 0)
        self.assertNotEquals(prev_task_id, Schedule.objects.get(pk=self.schedule.pk).notification_task_id)

    def test_should_create_notification_future_schedule_creation(self):
        url = reverse('schedules')
        body = {
            'patient': self.patient.id,
            'dentist': self.dentist.id,
            'date': datetime.now(tz=pytz.timezone('America/Sao_Paulo')) + timedelta(days=1),
            'duration': 50
        }

        response = json.loads(self.client.post(url, body).content.decode('utf-8'))
        self.assertEqual(response['notification_status'], 0)
        self.assertIsNotNone(Schedule.objects.get(pk=response['id']).notification_task_id)

    def test_should_not_create_notification_past_schedule_update(self):
        url = reverse('schedule-detail', kwargs={"pk": self.schedule.pk})
        self.schedule.date = datetime.now(tz=pytz.timezone('America/Sao_Paulo')) - timedelta(days=1)
        self.schedule.save()
        previous_task_id = self.schedule.notification_task_id

        body = {
            'patient': self.patient.id,
            'dentist': self.dentist.id,
            'date': datetime.now(tz=pytz.timezone('America/Sao_Paulo')) - timedelta(days=1),
            'duration': 50
        }

        response = json.loads(self.client.patch(url, body).content.decode('utf-8'))
        self.assertEqual(response['notification_status'], 3)
        self.assertEqual(previous_task_id, Schedule.objects.get(pk=self.schedule.pk).notification_task_id)

    def test_should_not_create_notification_past_schedule_creation(self):
        url = reverse('schedules')
        body = {
            'patient': self.patient.id,
            'dentist': self.dentist.id,
            'date': datetime.now(tz=pytz.timezone('America/Sao_Paulo')) - timedelta(days=1),
            'duration': 50
        }

        response = json.loads(self.client.post(url, body).content.decode('utf-8'))
        self.assertEqual(response['notification_status'], 3)
        self.assertIsNone(Schedule.objects.get(pk=response['id']).notification_task_id)

    def test_update_notification_from_schedule_not_owned_returns_403(self):
        self.schedule.dentist = self.extra_dentist
        self.schedule.save()
        url = reverse('schedule-notification', kwargs={'pk': self.schedule.pk})
        body = {
            'new_status': 1
        }
        response = self.client.post(url, body)
        response_data = json.loads(response.content.decode('utf-8'))

        self.assertEqual(response.status_code, 403)
        self.assertTrue(response_data.get('error', False))

    def test_update_notification_wrong_body_returns_400(self):
        url = reverse('schedule-notification', kwargs={'pk': self.schedule.pk})
        body = {
            'newStatus': 1
        }
        response = self.client.post(url, body)
        response_data = json.loads(response.content.decode('utf-8'))

        self.assertEqual(response.status_code, 400)
        self.assertTrue(response_data.get('error', False))

    def test_update_notification_returns_200(self):
        url = reverse('schedule-notification', kwargs={'pk': self.schedule.pk})
        body = {
            'new_status': 1
        }
        response = self.client.post(url, body)
        response_data = json.loads(response.content.decode('utf-8'))
        self.schedule.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response_data.get('error', False))
        self.assertEqual(self.schedule.notification_status, 1)

    def test_update_notification_to_pending_sends_new_notification(self):
        url = reverse('schedule-notification', kwargs={'pk': self.schedule.pk})
        body = {
            'new_status': 0
        }
        response = self.client.post(url, body)
        response_data = json.loads(response.content.decode('utf-8'))
        self.schedule.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response_data.get('error', False))
        self.assertEqual(self.schedule.notification_status, 0)


class ScheduleNotificationTest(TestCase):
    def setUp(self):
        self.dentist = Dentist.objects.create_user('John', 'Snow', 'john@snow.com', 'M', '1234', 'SP', 'john')
        self.dentist.device_token = ''
        self.dentist.save()
        self.clinic = Clinic.objects.create(
            name='Test Clinic',
            owner=self.dentist,
            message='',
            time_delta=1.0
        )
        self.clinic.refresh_from_db()
        self.patient = Patient.objects.create(
            name='Luís',
            last_name='Cunha Martins',
            phone='+5519993770437',
            sex='M',
            clinic=self.clinic
        )
        self.patient.refresh_from_db()
        self.schedule = Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=datetime(2016, 9, 15, 15, 0, tzinfo=settings.TZ),
            duration=60
        )
        self.patient.refresh_from_db()
        self.future_schedule = Schedule.objects.create(
            patient=self.patient,
            dentist=self.dentist,
            date=datetime.now(settings.TZ) + timedelta(days=1),
            duration=60
        )
        self.future_schedule.refresh_from_db()

    def test_get_schedule_message_any_date(self):
        expected = "Olá Sr. Luís, " \
                   "não se esqueça de sua consulta odontológica " \
                   "dia 15/09 às 15:00."

        self.assertEqual(self.schedule.get_message(), expected)

    def test_get_schedule_message_today(self):
        self.schedule.date = datetime.now(tz=pytz.timezone('America/Sao_Paulo'))
        expected = "Olá Sr. Luís, " \
                   "não se esqueça de sua consulta odontológica " \
                   "hoje às {}.".format(self.schedule.date.strftime("%H:%M"))

        self.assertEqual(self.schedule.get_message(), expected)

    def test_get_schedule_message_tomorrow(self):
        self.schedule.date = datetime.now(tz=pytz.timezone('America/Sao_Paulo')) + timedelta(days=1)
        expected = "Olá Sr. Luís, " \
                   "não se esqueça de sua consulta odontológica " \
                   "amanhã às {}.".format(self.schedule.date.strftime("%H:%M"))
        self.assertEqual(self.schedule.get_message(), expected)

    @override_settings(SMS_TIMEOUT=1)
    def test_sms_timeout_raises_exception(self):
        with Mocker() as mock:
            mock.post(FCMNotification.FCM_END_POINT, text='{"key": "value"}', status_code=400)
            client = SMS()
            self.assertFalse(client.send_message(self.future_schedule.id))
            self.future_schedule.refresh_from_db()


class ScheduleNotificationTransactionTest(unittest.TestCase):
    @override_settings(SMS_TIMEOUT=5)
    def test_sms_successful_updates_status(self):
        dentist = Dentist.objects.create_user('John', 'Snow', 'john@snow.com', 'M', '1234', 'SP', 'john')
        dentist.device_token = ''
        dentist.save()
        clinic = Clinic.objects.create(
            name='Test Clinic',
            owner=dentist,
            message='',
            time_delta=1.0
        )
        patient = Patient.objects.create(
            name='Luís',
            last_name='Cunha Martins',
            phone='+5519993770437',
            sex='M',
            clinic=clinic
        )
        future_schedule = Schedule.objects.create(
            patient=patient,
            dentist=dentist,
            date=datetime.now(settings.TZ) + timedelta(days=1),
            duration=60
        )

        def async_update_schedule():
            future_schedule.notification_status = 1
            future_schedule.save()
            connection.close()

        with Mocker() as mock:
            mock.post(FCMNotification.FCM_END_POINT, text='{"key": "value"}')
            client = SMS()
            Timer(0.1, async_update_schedule).start()
            self.assertTrue(client.wait_for_status_change(future_schedule))
