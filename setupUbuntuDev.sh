#!/bin/bash

# Setup an Ubuntu 20.04 system for development

# install Ubuntu packages
sudo apt install \
     python3-jinja2 \
     python3-babel \
     wine-stable \
     npm \
     golang

# get other dependencies
cd electron
npm install
cd ..

cd app
npm install
cd ..

