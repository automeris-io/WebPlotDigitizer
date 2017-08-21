#!/bin/bash

echo "Combining Javascript Files..."
bash combine.sh

echo "Compiling Javascript Files..."
bash compile.sh

echo "Update translation files..."
bash generateTranslationFiles.sh

echo "Rendering HTML Pages..."
python renderHtml.py

echo "Done!"
