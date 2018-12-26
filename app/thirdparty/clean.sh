#!/bin/bash
# Remove all thirdparty dependencies

shopt -s extglob
rm -rf !(README.md|getThirdparty.sh|clean.sh)
shopt -u extglob
