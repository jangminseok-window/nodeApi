#!/bin/bash


# nohup env NODE_ENV=production /home/ubuntu/.nvm/versions/node/v22.9.0/bin/node webApp.js > webApp.log 2>&1 &
nohup env NODE_ENV=production /home/ubuntu/.nvm/versions/node/v22.9.0/bin/node webApp.js > /dev/null 2>&1 &

# 또는 Apache 재시작
sudo systemctl restart apache2

echo "Deployment completed and production services restarted"