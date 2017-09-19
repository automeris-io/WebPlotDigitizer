#!/bin/bash
# make sure "electron-packager" is available

cd ..

echo "Packaging..."
electron-packager ./electron WPD --platform=linux,darwin,win32 --arch=x64
cp -r ./app WPD-linux-x64/resources/
cp -r ./app WPD-win32-x64/resources/
cp -r ./app WPD-darwin-x64/WPD.app/Contents/Resources/

