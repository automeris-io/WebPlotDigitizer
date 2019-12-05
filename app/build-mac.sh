#!/bin/bash

echo "Compiling WebAssembly Code..."
./build_wasm-mac.sh

./build-helper.sh

echo "Done!"
