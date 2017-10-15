#!/bin/bash

# make sure "electron-packager" is available
# on Linux, make sure "wine" is available

# This works on Linux and has not tested on Mac or Windows
cd ..
echo "Packaging..."
APPNAME=WebPlotDigitizer
electron-packager ./electron $APPNAME --platform=linux --icon=app/images/icon/icon.png --arch=x64
electron-packager ./electron $APPNAME --platform=win32 --icon=app/images/icon/icon.ico --arch=x64

# Copy app/* to resources. There's probably a better way to do this:
cp -r ./app $APPNAME-linux-x64/resources/
cp -r ./app $APPNAME-win32-x64/resources/
