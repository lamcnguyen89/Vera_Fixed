#!/bin/bash
# docker-compose -f docker-compose.dev.yml exec rm -rf dump/
# docker cp ./dump.tar.gz mongo:/dump.tar.gz
# source .env && docker-compose -f docker-compose.prod.yml exec mongo /bin/sh -c "tar xvzf /dump.tar.gz && mongorestore --username ${DB_USERNAME} --password ${DB_PASSWORD} --authenticationDatabase ${DB_DATABASE} /dump"
source .env
docker-compose -f docker-compose.dev.yml exec mongo /bin/sh -c "echo mongodump --username $MONGO_USER --password $MONGO_PASS --authenticationDatabase $MONGO_DB && mongodump --username $MONGO_USER --password $MONGO_PASS --authenticationDatabase $MONGO_DB && tar cvzf dump.tar.gz dump/"
docker cp mongo:/dump.tar.gz ./dump.tar.gz 
# docker-compose -f docker-compose.dev.yml exec mongo /bin/sh -c "rm -rf /dump/sherlock"
