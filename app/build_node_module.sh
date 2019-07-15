#!/bin/bash

# Code JS
cat javascript/core/*.js > wpd_node.js
cat javascript/core/curve_detection/*.js >> wpd_node.js
cat javascript/core/axes/*.js >> wpd_node.js

# WebAssembly
printf "\nlet Module = require(\"./wasm.js\");\n" >> wpd_node.js

# Export Module
printf "\nmodule.exports = { wpd: wpd };\n" >> wpd_node.js

# Package Module

VERSION=4.3
mkdir -p wpd-$VERSION/
cp wpd_node.js wpd-$VERSION/
cp wasm.js wpd-$VERSION/
cp wasm.wasm wpd-$VERSION/
tar -czf wpd-$VERSION.tar.gz wpd-$VERSION

