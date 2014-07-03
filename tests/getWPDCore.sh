#!/bin/bash

cat ../javascript/core/*.js > wpdcore.js
cat ../javascript/core/axes/*.js >> wpdcore.js
cat ../javascript/core/AEalgos/*.js >> wpdcore.js
cat wpdmodule.js >> wpdcore.js
