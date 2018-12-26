#!/bin/bash

# closure compiler
wget https://dl.google.com/closure-compiler/compiler-latest.zip
unzip compiler-latest.zip -d closure-compiler
cd closure-compiler
jarfile=(*.jar)
ln -s $jarfile compiler.jar
cd ..

# PDFJS
wget https://github.com/mozilla/pdf.js/releases/download/v1.8.188/pdfjs-1.8.188-dist.zip
unzip pdfjs-1.8.188-dist.zip -d pdfjs

# tarballjs
wget https://github.com/ankitrohatgi/tarballjs/archive/master.zip
unzip master.zip -d tarballjs

# numericjs
wget https://github.com/sloisel/numeric/archive/v1.2.6.zip
unzip v1.2.6.zip -d numericjs
cd numericjs
ln -s numeric-1.2.6/src/numeric.js numeric-1.2.6.min.js
cd ..


