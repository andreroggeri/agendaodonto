web: gunicorn app.wsgi --log-file -
worker: celery -A app.schedule worker --autoscale=4,1 --loglevel=info -Q $WORKER_QUEUE
release: python manage.py migrate --no-input
