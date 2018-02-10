#!/bin/bash

echo "Combining Javascript Files..."
cat javascript/*.js > combined.js
cat javascript/core/*.js >> combined.js
cat javascript/core/AEalgos/*.js >> combined.js
cat javascript/core/axes/*.js >> combined.js
cat javascript/widgets/*.js >> combined.js
cat javascript/tools/*.js >> combined.js
cat javascript/services/*.js >> combined.js
cat javascript/controllers/*.js >> combined.js

echo "Compiling Javascript Files..."
java -jar thirdparty/closure-compiler/compiler.jar --js combined.js --js_output_file combined-compiled.js
echo "done."

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

echo "Done!"
