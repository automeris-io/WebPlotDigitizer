#!/bin/bash

# load emsdk environment
source thirdparty/emsdk/emsdk_env.sh

# build wasm
em++ -std=c++17 wasm/*.cpp -I /usr/include/eigen3 -o wasm.js
