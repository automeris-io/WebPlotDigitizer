#!/bin/bash

# load emsdk environment
source thirdparty/emsdk/emsdk_env.sh > debug.out

# build wasm
em++ -std=c++17 -O3 wasm/*.cpp -I /usr/include/eigen3 -o wasm.js
