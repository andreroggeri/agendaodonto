web: gunicorn app.wsgi --log-file -
worker: celery -A app.schedule worker --autoscale=4,1 --loglevel=info
release: python manage.py migrate --no-input
