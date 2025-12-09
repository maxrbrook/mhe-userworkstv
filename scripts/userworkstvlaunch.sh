#!/bin/bash

PATH_TO_FILE=/home/$USER/mhe-userworkstv/src
cd $PATH_TO_FILE
if [ ! -f index.js ]; then
	logger "MECHTV: ERROR - FILE NOT FOUND"
else
	logger "MECHTV: FILE FOUND - STARTING SERVER"
	eval "npm start --no-sandbox"&
	eval "DISPLAY=:0 chromium-browser http://localhost:3000 --kiosk"
fi

