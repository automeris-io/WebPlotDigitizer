#!/bin/bash

# Setup an MacOS system for development

# Java installations can be tricky to manage
# only check if it exists, if not then exit
if ! [ -x "$(command -v java)" ]; then
	echo "Error: java is not installed." >&2
	exit 1
fi

# install MacOS packages
brew install python3 node go eigen git-lfs

# install python packages
pip3 install Jinja2 babel

# install global npm packages
npm install -g electron-packager
npm install -g js-beautify
npm install -g uglify-js@1

# get other dependencies
cd electron
npm install
cd ..

# get third party libraries
cd app/thirdparty
./getThirdparty.sh
cd ../..

# refresh git lfs pointers
git lfs pull
