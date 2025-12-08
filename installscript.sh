#!/bin/bash
set -e
SUDO=''

echo '>>>> RUNNING INSTALL SCRIPT'

echo '>> INSTALLING NODEJS'
sudo apt-get install -y nodejs npm
npm install dotenv express axios ejs

cd scripts
# Add required information into the service script
sed -i "7i\\User="$USER worktvstart.service
sed -i "8i\\Group="$USER worktvstart.service
sed -i "9i\\WorkingDirectory=/home/"$USER"/mhe-qrprinter/src" worktvstart.service

echo '>> MOVING SCRIPTS'
if [ "$(id -u)" -ne 0 ]; then
  echo ">> SETTING SUDO COMMAND"
  SUDO='sudo'
fi

$SUDO cp -f worktvautostart.sh /usr/local/bin
$SUDO cp -f worktvstart.service /etc/systemd/system
$SUDO systemctl enable --now worktvstart.service

echo '>> INSTALL SUCCESSFUL'
