#!/bin/bash

cat javascript/*.js > combined.js
cat javascript/core/*.js >> combined.js
cat javascript/core/AEalgos/*.js >> combined.js
cat javascript/core/axes/*.js >> combined.js
cat javascript/widgets/*.js >> combined.js
cat javascript/tools/*.js >> combined.js
cat javascript/services/*.js >> combined.js
cat javascript/browser/*.js >> combined.js

