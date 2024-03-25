#!/bin/sh

if [ $# -eq 0 ]; then
    echo "Starting chatbot"
    exec node bot.js
else
    echo "Running command $@"
    cd .. # change to root directory
    exec "$@"
fi
