#!/bin/bash

clear

printf "====> updating frontend"

cd frontend/
export CI=true
npm install

printf "\n====> start frontend testsuits"

npm test a

printf "\n====> updating backend"

cd ..
cd backend/
npm install

printf "\n====> run backend testsuits"

npm test a

printf "\n====> start backend server and kill all running docker container"

docker kill $(docker ps -q)
npm start &

printf "\n====> updating REST"

cd rest/
npm install

printf "\n====> check mongoDB"

unamestr=`uname`
if [[ "$unamestr" == 'Linux' ]]; then
   sudo mongod --fork --syslog
elif [[ "$unamestr" == 'Darwin' ]]; then
  mongo --eval "db.stats()"  # do a simple harmless command of some sort
  RESULT=$?   # returns 0 if mongo eval succeeds
  if [ $RESULT -ne 0 ]; then
   echo "mongodb not running ====> start mongod"
   sudo mongod --fork --syslog
  else
   echo "====> mongodb is running!"
  fi
fi

printf "\n====> waiting some time until server runs"
sleep 10s

printf "\n====> run REST testsuits"

npm test
