#!/bin/bash

# load emsdk environment
source thirdparty/emsdk/emsdk_env.sh > debug.out

# build wasm
# note: macos places headers in /usr/local/include instead of /usr/include
em++ -std=c++17 -O3 wasm/*.cpp -I /usr/local/include/eigen3 -o wasm.js
