#!/bin/bash

# closure compiler
wget https://dl.google.com/closure-compiler/compiler-latest.zip
unzip compiler-latest.zip -d closure-compiler
cd closure-compiler
jarfile=(*.jar)
ln -s $jarfile compiler.jar
cd ..

# PDFJS
wget -O pdfjs.zip https://github.com/mozilla/pdf.js/releases/download/v2.1.266/pdfjs-2.1.266-dist.zip
unzip pdfjs.zip -d pdfjs

# tarballjs
wget https://github.com/ankitrohatgi/tarballjs/archive/master.zip
unzip master.zip -d tarballjs
rm master.zip

# emscripten
wget https://github.com/juj/emsdk/archive/master.zip
unzip master.zip
mv emsdk-master emsdk
cd emsdk
./emsdk install latest
./emsdk activate latest
cd ..
rm master.zip

# clean up downloaded packages
rm *.zip

