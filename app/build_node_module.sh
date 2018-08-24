#!/bin/bash

echo "Creating node module with core functionality..."
cat javascript/core/*.js > wpd_node.js
cat javascript/core/AEalgos/*.js >> wpd_node.js
cat javascript/core/axes/*.js >> wpd_node.js

printf "\nmodule.exports = { wpd: wpd };\n" >> wpd_node.js

echo "Done!"
