#!/usr/bin/env bash

if [[ ${TRAVIS_TEST_RESULT=0} == 1 ]]; then
  exit 1;
fi

if [[ $1 == "production" ]]; then
  echo "Deploying to Production"
  mv dist-prod dist
  firebase use --token $FIREBASE_TOKEN agendaodonto-29023
  firebase deploy --non-interactive --token $FIREBASE_TOKEN
fi

if [[ $1 == "staging" ]]; then
  echo "Deploying to Staging"
  mv dist-staging dist
  firebase use --token $FIREBASE_TOKEN agendaodontoweb-staging
  firebase deploy --non-interactive --token $FIREBASE_TOKEN
fi

