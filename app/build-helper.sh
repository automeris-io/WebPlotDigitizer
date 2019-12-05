#!/bin/bash

echo "Compiling Javascript Code..."
./build_js.sh

echo "Update translation files..."
./build_translations.sh

echo "Rendering HTML Pages..."
python3 renderHTML.py

echo "Generating NodeJS module..."
./build_node_module.sh
