#!/bin/bash

echo "Fomatting..."

echo " - Javascript files"
find javascript tests -name "*.js" -exec js-beautify -r {} \;

echo " - HTML templates"
find templates -name "*.html" -exec js-beautify -r {} \;

echo " - CSS styles"
find . -name "*.css" -exec js-beautify -r {} \;

echo " - WebAssembly C++"
cd wasm
./format.sh
cd ..

echo "Done!"
