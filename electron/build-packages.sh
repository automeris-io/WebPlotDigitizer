#!/bin/bash

# make sure "electron-packager" is available
# on Linux, make sure "wine" is available

# This works on Linux and has not tested on Mac or Windows
cd ..
echo "Packaging..."
APPNAME=WebPlotDigitizer-4.8

# linux
electron-packager ./electron $APPNAME --platform=linux --icon=app/images/icon/icon.png --arch=x64 --overwrite
rsync -av --progress ./app $APPNAME-linux-x64/resources/ --exclude node_modules --exclude package.json --exclude package-lock.json
zip -r $APPNAME-linux-x64.zip $APPNAME-linux-x64
md5sum $APPNAME-linux-x64.zip > $APPNAME-linux-x64.zip.md5

# windows 64 bit
electron-packager ./electron $APPNAME --platform=win32 --icon=app/images/icon/icon.ico --arch=x64 --overwrite
rsync -av --progress ./app $APPNAME-win32-x64/resources/ --exclude node_modules --exclude package.json --exclude package-lock.json
zip -r $APPNAME-win32-x64.zip $APPNAME-win32-x64
md5sum $APPNAME-win32-x64.zip > $APPNAME-win32-x64.zip.md5

# windows 32 bit
electron-packager ./electron $APPNAME --platform=win32 --icon=app/images/icon/icon.ico --arch=ia32 --overwrite
rsync -av --progress ./app $APPNAME-win32-ia32/resources/ --exclude node_modules --exclude package.json --exclude package-lock.json
zip -r $APPNAME-win32-ia32.zip $APPNAME-win32-ia32
md5sum $APPNAME-win32-ia32.zip > $APPNAME-win32-ia32.zip.md5

# mac
electron-packager ./electron $APPNAME --platform=darwin --icon=app/images/icon/wpd.icns --arch=x64 --overwrite
rsync -av --progress ./app $APPNAME-darwin-x64/$APPNAME.app/Contents/Resources/ --exclude node_modules --exclude package.json --exclude package-lock.json
zip -r $APPNAME-darwin-x64.zip $APPNAME-darwin-x64
md5sum $APPNAME-darwin-x64.zip > $APPNAME-darwin-x64.zip.md5

# mac - m1
electron-packager ./electron $APPNAME --platform=darwin --icon=app/images/icon/wpd.icns --arch=arm64 --overwrite
rsync -av --progress ./app $APPNAME-darwin-arm64/$APPNAME.app/Contents/Resources/ --exclude node_modules --exclude package.json --exclude package-lock.json
zip -r $APPNAME-darwin-arm64.zip $APPNAME-darwin-arm64
md5sum $APPNAME-darwin-arm64.zip > $APPNAME-darwin-arm64.zip.md5
