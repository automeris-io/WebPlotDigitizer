#!/bin/bash

# closure compiler
mkdir -p closure-compiler
cd closure-compiler
wget https://repo1.maven.org/maven2/com/google/javascript/closure-compiler/v20200719/closure-compiler-v20200719.jar
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

# clean up downloaded packages
rm *.zip

