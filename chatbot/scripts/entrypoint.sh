#!/bin/bash


echo "Starting chatbot"

echo "Waiting for browserless on $BROWSERLESS_URL"
./wait-for-it.sh -t 60 -s "$BROWSERLESS_URL"
echo "Browserless up and running"

node bot.js