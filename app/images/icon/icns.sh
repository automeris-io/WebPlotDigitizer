#!/bin/bash
mkdir -p wpd.iconset
cp icon_*.png wpd.iconset/
iconutil -c icns wpd.iconset
