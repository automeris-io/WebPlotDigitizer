#!/bin/bash

# PDFJS
wget -O pdfjs.zip https://github.com/mozilla/pdf.js/releases/download/v2.8.335/pdfjs-2.8.335-dist.zip
unzip pdfjs.zip -d pdfjs

# tarballjs
wget https://github.com/ankitrohatgi/tarballjs/archive/master.zip
unzip master.zip -d tarballjs
rm master.zip

# clean up downloaded packages
rm *.zip

