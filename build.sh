#!/bin/sh

echo "Combining Javascript Code..."
cat javascript/core/*.js > combined.js
cat javascript/core/curve_detection/*.js >> combined.js
cat javascript/core/point_detection/templateMatcherAlgo.js >> combined.js
cat javascript/core/axes/*.js >> combined.js
cat javascript/widgets/*.js >> combined.js
cat javascript/tools/base/*.js >> combined.js
cat javascript/tools/*.js >> combined.js
cat javascript/controllers/*.js >> combined.js
cat javascript/services/*.js >> combined.js
cat javascript/*.js >> combined.js

echo "Update translation files..."
pybabel -v extract -F templates/babel.config -o ./locale/messages.pot ./templates
pybabel update -l en_US -d ./locale/ -i ./locale/messages.pot
pybabel update -l fr_FR -d ./locale/ -i ./locale/messages.pot
pybabel update -l zh_CN -d ./locale/ -i ./locale/messages.pot
pybabel update -l de_DE -d ./locale/ -i ./locale/messages.pot
pybabel update -l ja -d ./locale/ -i ./locale/messages.pot
pybabel update -l ru -d ./locale/ -i ./locale/messages.pot

echo "Rendering HTML Pages..."
python3 renderHTML.py

