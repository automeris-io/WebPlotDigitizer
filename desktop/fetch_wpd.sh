#!/bin/bash

cp ../wpd.min.js .
cp ../offline.html .
cp ../start.png .
cp -r ../images .
cp -r ../styles .
mkdir -p javascript/core/point_detection
cp ../javascript/core/point_detection/templateMatcherWorker.js javascript/core/point_detection/templateMatcherWorker.js
