#!/bin/bash

# make sure "electron-packager" is available
# on Linux, make sure "wine" is available

# This works on Linux and has not tested on Mac or Windows
cd ..
echo "Packaging..."
APPNAME=WebPlotDigitizer-4.8

# mac
electron-packager ./electron $APPNAME --platform=darwin --icon=app/images/icon/wpd.icns --arch=x64 --overwrite
rsync -av --progress ./app $APPNAME-darwin-x64/$APPNAME.app/Contents/Resources/ --exclude node_modules --exclude package.json --exclude package-lock.json
zip -r $APPNAME-darwin-x64.zip $APPNAME-darwin-x64
md5 $APPNAME-darwin-x64.zip > $APPNAME-darwin-x64.zip.md5
