#!/bin/bash

if [ "$COLLECT_STATIC" = "1" ]; then
  echo "Collect static files"
  python manage.py collectstatic --noinput
fi

if [ "$DB_MIGRATE" = "1" ]; then
  echo "Migrating database"
  python manage.py migrate --no-input
fi

if [ $# -eq 0 ]; then
  PORT=${PORT:-8000}
  echo "Starting gunicorn on port ${PORT}"
  exec gunicorn app.wsgi -b "0.0.0.0:$PORT" --log-file -
else
  echo "Running command $@"
  exec "$@"
fi
