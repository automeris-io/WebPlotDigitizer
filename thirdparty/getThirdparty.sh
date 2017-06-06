#!/bin/bash

# closure compiler
wget https://dl.google.com/closure-compiler/compiler-latest.zip
unzip compiler-latest.zip -d closure-compiler
cd closure-compiler
jarfile=(*.jar)
ln -s $jarfile compiler.jar
cd ..

