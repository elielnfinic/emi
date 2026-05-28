#!/bin/bash

git pull
npm run build
cp .env build/
cp -r public build/

# restart pm2
pm2 delete emi-api
pm2 start ecosystem.config.cjs 

echo "Deployed successfully"
