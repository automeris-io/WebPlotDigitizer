#!/bin/bash

# make sure "electron-packager" is available
# on Linux, make sure "wine" is available

# This works on Linux and has not tested on Mac or Windows
cd ..
echo "Packaging..."
APPNAME=WebPlotDigitizer-4.3
electron-packager ./electron $APPNAME --platform=darwin --icon=app/images/icon/wpd.icns --arch=x64 --overwrite

# mac
electron-packager ./electron $APPNAME --platform=darwin --icon=app/images/icon/wpd.icns --arch=x64 --overwrite
cp -r ./app $APPNAME-darwin-x64/$APPNAME.app/Contents/Resources/
rm -rf $APPNAME-darwin-x64/$APPNAME.app/Contents/Resources/app/thirdparty/compiler-latest.zip
rm -rf $APPNAME-darwin-x64/$APPNAME.app/Contents/Resources/app/thirdparty/closure-compiler
rm -rf $APPNAME-darwin-x64/$APPNAME.app/Contents/Resources/app/thirdparty/emsdk
zip -r $APPNAME-darwin-x64.zip $APPNAME-darwin-x64
md5 $APPNAME-darwin-x64.zip > $APPNAME-darwin-x64.zip.md5
