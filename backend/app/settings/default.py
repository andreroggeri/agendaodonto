"""
Django settings for scheduleserver project.

Generated by 'django-admin startproject' using Django 1.9.6.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.9/ref/settings/
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import pytz

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'Not-So-Secret'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

ADMINS = [('André Roggeri Campos', 'a.roggeri.c@gmail.com')]

# Application definition

INSTALLED_APPS = [
    # Django apps
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    # 3rd Party apps
    'rest_framework',
    'rest_framework.authtoken',
    'djoser',
    'corsheaders',
    'crispy_forms',
    'django_celery_results',
    'django_filters',
    'drf_yasg',
    # User Apps
    'app.schedule',
    'app.finance',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'app.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['app/template'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'app.wsgi.application'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Password validation
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/1.9/topics/i18n/

LANGUAGE_CODE = 'pt-BR'

TIME_ZONE = 'America/Sao_Paulo'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/

STATIC_URL = '/static/'

# noinspection PyUnresolvedReferences
STATIC_ROOT = os.path.join(BASE_DIR, 'static/')

# Rest Framework

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
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 100

}

AUTH_USER_MODEL = 'schedule.Dentist'

# Configs do email

SERVER_EMAIL = 'admin@agendaodonto.com.br'

EMAIL_HOST = os.environ.get('EMAIL_HOST')
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
EMAIL_PORT = 587
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'admin@agendaodonto.com'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(asctime)s - %(levelname)s - %(filename)s : %(funcName)s %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'app.schedule': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'DEBUG'),
        },
    },
}

DJOSER = {
    'DOMAIN': 'localhost:4200',
    'SITE_NAME': 'Agenda Odonto',
    # 'PASSWORD_RESET_CONFIRM_URL': '#/password/reset/confirm/{uid}/{token}',
    'ACTIVATION_URL': 'cadastro/ativar/{uid}/{token}',
    'SEND_ACTIVATION_EMAIL': True,
}

FIREBASE_TOKEN = os.getenv('FIREBASE_TOKEN')

MESSAGE_CLASS = os.getenv('MESSAGE_CLASS', 'app.schedule.service.notification.sms.SMS')
AMIL_SERVICE = os.getenv('AMIL_SERVICE', 'app.schedule.service.dental_plan.amil.AmilService')
INTERODONTO_SERVICE = os.getenv('INTERODONTO_SERVICE',
                                'app.schedule.service.dental_plan.interodonto.InterodontoService')

MESSAGE_ETA = {'hour': 9, 'minute': 30}
MESSAGE_EXPIRES = {'hour': 22, 'minute': 30}

# Celery Settings

CELERY_BROKER_URL = 'amqp://localhost//'
CELERY_BROKER_HEARTBEAT = 120.0
CELERY_SEND_EVENTS = False
CELERY_EVENT_QUEUE_EXPIRES = 60
CELERY_RESULT_BACKEND = 'django-db'
CELERY_ALWAYS_EAGER = False
CELERY_EAGER_PROPAGATE = False
CELERY_TASK_MAX_RETRY = 2000
CELERY_DEFAULT_QUEUE = os.getenv('WORKER_QUEUE', 'default')

# SMS Settings
SMS_TIMEOUT = 60 * 15

# Global TZ Setting
TZ = pytz.timezone(TIME_ZONE)

SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    }
}

# Notification Settings
MESSAGING_URL = os.getenv('MESSAGING_URL', 'http://localhost:8000')
MESSAGING_API_KEY = os.getenv('MESSAGING_API_KEY')
API_KEY = os.getenv('API_KEY')
