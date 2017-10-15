#!/bin/bash

# make sure "electron-packager" is available
# on Linux, make sure "wine" is available

# This works on Linux and has not tested on Mac or Windows
cd ..
echo "Packaging..."
APPNAME=WebPlotDigitizer
electron-packager ./electron $APPNAME --platform=darwin --icon=app/images/icon/wpd.icns --arch=x64 --overwrite

# Copy app/* to resources. There's probably a better way to do this:
cp -r ./app $APPNAME-darwin-x64/$APPNAME.app/Contents/Resources/
