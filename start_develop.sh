#!/bin/bash

# Build HTML5 Source
cd app
npm install
npm run build

# Start Web Server
cd ../webserver
cp settings.json.example settings.json
# edit settings.json as needed
go build
./webserver