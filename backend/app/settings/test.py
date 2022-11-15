import datetime

import dj_database_url

from .default import *

# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases

ALLOWED_HOSTS = ['*']
DATABASES = {'default': dj_database_url.config()}

CORS_ORIGIN_ALLOW_ALL = True

JWT_AUTH = {
    'JWT_EXPIRATION_DELTA': datetime.timedelta(days=10)
}

DJOSER['SEND_ACTIVATION_EMAIL'] = False

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
    ),
}

CELERY_ALWAYS_EAGER = True
CELERY_BROKER_URL = 'memory://localhost:8000//'
CELERY_EAGER_PROPAGATE = True
CELERY_TASK_MAX_RETRY = 1

FIREBASE_TOKEN = 'A-FAKE-TOKEN'

MESSAGE_CLASS = 'app.schedule.service.notification.fake.FakeSMS'
