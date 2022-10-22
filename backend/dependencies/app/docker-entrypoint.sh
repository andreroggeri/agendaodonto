#!/bin/bash

echo "Collect static files"
python manage.py collectstatic --noinput

echo "Migrating database"
python manage.py migrate --no-input

echo "Starting gunicorn"
gunicorn app.wsgi -b 0.0.0.0:8000 --reload --log-file -
