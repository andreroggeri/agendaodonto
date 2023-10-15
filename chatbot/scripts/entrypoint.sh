#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Starting chatbot"
    node bot.js
else
    echo "Running command $@"
    exec "$@"
fi
