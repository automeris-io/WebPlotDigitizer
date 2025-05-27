#!/bin/bash

# generate source files for MacOS icns
inkscape --export-filename=icon_512x512@2x.png -w 1024 -h 1024 icon.svg
inkscape --export-filename=icon_512x512.png -w 512 -h 512 icon.svg
inkscape --export-filename=icon_256x256@2x.png -w 512 -h 512 icon.svg
inkscape --export-filename=icon_256x256.png -w 256 -h 256 icon.svg
inkscape --export-filename=icon_128x128@2x.png -w 256 -h 256 icon.svg
inkscape --export-filename=icon_128x128.png -w 128 -h 128 icon.svg
inkscape --export-filename=icon_32x32@2x.png -w 64 -h 64 icon.svg
inkscape --export-filename=icon_32x32.png -w 32 -h 32 icon.svg
inkscape --export-filename=icon_16x16@2x.png -w 32 -h 32 icon.svg
inkscape --export-filename=icon_16x16.png -w 16 -h 16 icon.svg

# generate Windows ICO file
convert -background transparent -density 384 icon.svg -define icon:auto-resize icon.ico

# generate favicon.ico
convert -background transparent -density 384 icon.svg -define icon:auto-resize=16,32 favicon.ico

# default icon png
cp icon_128x128.png icon.png

