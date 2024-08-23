#!/bin/bash
ssh ada -t "cd sherlock; scripts/downloadData.sh"
scp ada:~/sherlock/dump.tar.gz ./dump.tar.gz
docker cp ./dump.tar.gz mongo:/dump.tar.gz
source .env && docker-compose -f docker-compose.dev.yml exec mongo /bin/sh -c "tar xvzf /dump.tar.gz && rm -rf /dump/sherlock && mongorestore --drop --username sherlock_dev --password eJ69vujCfrs9k3 --drop --authenticationDatabase sherlock_dev /dump"
