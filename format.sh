#!/bin/sh

echo "Fomatting..."

echo " - Javascript files"
find javascript tests -name "*.js" -exec js-beautify -n -r {} \;

echo " - HTML templates"
find templates -name "*.html" -exec js-beautify -n -r {} \;

echo " - CSS styles"
find . -name "*.css" -exec js-beautify -n -r {} \;

echo "Done!"
