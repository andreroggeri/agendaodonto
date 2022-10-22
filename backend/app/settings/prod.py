import dj_database_url
from .default import *

DEBUG = False

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', None)

ALLOWED_HOSTS = [
    'backend.agendaodonto.com'
]

DATABASES = {'default': dj_database_url.config()}

CORS_ORIGIN_WHITELIST = (
    'agendaodonto.com',
    'backend.agendaodonto.com',
)

DJOSER['DOMAIN'] = 'agendaodonto.com'

# Celery Settings
CELERY_BROKER_URL = os.getenv('RABBITMQ_URL', None)
CELERY_BROKER_HEARTBEAT = None
