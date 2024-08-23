#!/bin/bash
docker-compose -f docker-compose.prod.yml build
grep -oP "container_name:\s\K(\S+)" docker-compose.prod.yml | while read cn; do docker save "${cn}:prod" > "images/${cn}.tar"; done
scp images/*.tar $1:~/sherlock/images/
ssh $1 'cd ~/sherlock/images && for f in $(find . -type f -name '\*.tar'); do docker load -i $base; done'