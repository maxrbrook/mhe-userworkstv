#!/bin/bash
set -e
SUDO=''

echo '>>>> RUNNING INSTALL SCRIPT'

echo '>> INSTALLING NODEJS'
sudo apt-get install -y nodejs npm
npm install dotenv express axios ejs

cd scripts
# Add required information into the service script
sed -i "7i\\User="$USER userworkstv.service
sed -i "8i\\Group="$USER userworkstv.service
sed -i "9i\\WorkingDirectory=/home/"$USER"/mhe-userworkstv/src" userworkstv.service

echo '>> MOVING SCRIPTS'
if [ "$(id -u)" -ne 0 ]; then
  echo ">> SETTING SUDO COMMAND"
  SUDO='sudo'
fi

$SUDO cp -f userworkstvlaunch.sh /usr/local/bin
$SUDO cp -f userworkstv.service /etc/systemd/system
$SUDO systemctl enable --now userworkstv.service

echo '>> INSTALL SUCCESSFUL'
