#!/bin/bash

echo "Combining Javascript Files..."
bash combine.sh

echo "Compiling Javascript Files..."
bash compile.sh

echo "Rendering HTML Pages..."
python renderHtml.py

echo "Done!"
echo "To test this WebPlotDigitizer build, run: "
echo " php -S localhost:8000"
echo "Then open http://localhost:8000/dev.html or http://localhost:8000/index.html"
