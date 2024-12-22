#!/bin/bash

echo "DEPRECATED! Because target VPS does not exist anymore...!

exit 1

set -e

echo -e "Deleting 'dist' directory...\n"
rm -rf dist

echo -e "\nBuilding Go backend...\n"
CGO_ENABLED=0 go build -o dist/calendar-app .

echo -e "\nBuilding React frontend...\n"
npm -C web-frontend run build

ssh christian@83.171.248.78 'mkdir -p ~/projects/calendar-app/production'

echo -e "\nUploading binaries and frontend app assets...\n"
scp -r ./dist/pb_public christian@83.171.248.78:/home/christian/projects/calendar-app/production/pb_public_new
scp -r ./dist/calendar-app christian@83.171.248.78:/home/christian/projects/calendar-app/production/new-calendar-app

ssh christian@83.171.248.78 'rm -rf ~/projects/calendar-app/production/pb_public && mv -f ~/projects/calendar-app/production/pb_public_new ~/projects/calendar-app/production/pb_public'  
ssh christian@83.171.248.78 'mv -f ~/projects/calendar-app/production/new-calendar-app ~/projects/calendar-app/production/calendar-app'
ssh christian@83.171.248.78 'chmod +x ~/projects/calendar-app/production/calendar-app'

echo -e "\nSuccessfully uploaded!\n"
