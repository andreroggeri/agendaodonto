import dj_database_url

from .default import *

DATABASES = {'default': dj_database_url.config()}

ALLOWED_HOSTS = ['*']

CORS_ORIGIN_ALLOW_ALL = True

DJOSER['DOMAIN'] = 'agendaodontoweb-staging.firebaseapp.com'

DJOSER = {
    'DOMAIN': 'staging.agendaodonto.com',
    'SITE_NAME': 'Agenda Odonto',
    # 'PASSWORD_RESET_CONFIRM_URL': '#/password/reset/confirm/{uid}/{token}',
    'ACTIVATION_URL': 'cadastro/ativar/{uid}/{token}',
    'SEND_ACTIVATION_EMAIL': False,
}

# Celery Settings
CELERY_BROKER_URL = os.environ['RABBITMQ_URL']
CELERY_BROKER_HEARTBEAT = None

MESSAGE_ETA = {'hour': 0, 'minute': 0}
MESSAGE_EXPIRES = {'hour': 23, 'minute': 59}
