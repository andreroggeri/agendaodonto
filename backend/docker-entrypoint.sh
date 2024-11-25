#!/bin/bash

if [ $# -eq 0 ]; then
  PORT=${PORT:-8000}
  echo "Starting gunicorn on port ${PORT}"
  exec gunicorn app.wsgi -b "0.0.0.0:$PORT" --log-file -
else
  echo "Running command $@"
  exec "$@"
fi
