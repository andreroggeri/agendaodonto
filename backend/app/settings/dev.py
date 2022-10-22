import datetime

import dj_database_url

from .default import *

ALLOWED_HOSTS = ['*']

DATABASES = {'default': dj_database_url.config()}

CORS_ORIGIN_ALLOW_ALL = True

JWT_AUTH = {
    'JWT_EXPIRATION_DELTA': datetime.timedelta(days=10)
}

DJOSER = {
    'DOMAIN': 'localhost:4200',
    'SITE_NAME': 'Agenda Odonto',
    # 'PASSWORD_RESET_CONFIRM_URL': '#/password/reset/confirm/{uid}/{token}',
    'ACTIVATION_URL': 'cadastro/ativar/{uid}/{token}',
    'SEND_ACTIVATION_EMAIL': False,
}

# Celery Settings
CELERY_BROKER_URL = os.environ.get('RABBITMQ_URL', '')
CELERY_BROKER_HEARTBEAT = None

MESSAGE_ETA = {'hour': 0, 'minute': 0}
MESSAGE_EXPIRES = {'hour': 23, 'minute': 59}
