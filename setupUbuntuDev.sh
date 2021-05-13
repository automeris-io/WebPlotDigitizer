#!/bin/bash

# Setup an Ubuntu 20.04 system for development

# install Ubuntu packages
sudo apt install \
     python3-jinja2 \
     python3-babel \
     wine-stable \
     npm \
     default-jre \
     golang \
     libeigen3-dev

# install global npm packages
sudo npm install -g electron-packager 
sudo npm install -g js-beautify

# get other dependencies
cd electron
npm install
cd ..

cd app/thirdparty
./getThirdparty.sh
cd ../..


