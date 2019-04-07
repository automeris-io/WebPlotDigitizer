# Calling WebPlotDigitizer algos from NodeJS

## Purpose

For some applications, the simple-to-use WebPlotDigitizer GUI can be quite restrictive and a programmatic/command-line access to the underlying algorithms is needed. Being able to process a large number of similar images is one such example. 

To make this possible, the core functions of WebPlotDigitizer have been packaged into a [NodeJS](https://nodejs.org) module that can be called from custom NodeJS scripts or applications.

## Current State

The current module is the first attempt at providing a WebPlotDigitizer "library". The API is not very developer friendly and using this module requires familiarity with Javascript and NodeJS. These things will change in the future as the API is cleaned up and packaging is improved. You should watch out for breaking changes that may happen from version to version. I am also considering publishing non-Javascript versions of the library in the future (most likely in C with wrappers for Python etc.).

## Pre-Requisites

### Install NodeJS

On Linux, you should be able to use the package manager. On other operating systems, visit: https://nodejs.org/

### Build or Download WebPlotDigitizer NodeJS Module

The module has not been submitted to the NPM registry yet, so just download the necessary module files from the downloads page: https://automeris.io/WebPlotDigitizer/download.html

To build the module from source, follow the relevant information in the [developer guidelines](../DEVELOPER_GUIDELINES.md) (Linux is preferred).

After downloading or building the NodeJS package, use the module with `require` as:

    const wpd = require("./path/to/wpd-4.2/wpd_node.js").wpd

In the examples here, the path is assumed to be `../app/wpd_node.js` which is likely the case if you build the package from source.

### Install other dependencies

For many scripts, you may need to install additional packages to open images etc. You can install those as needed via the `npm install` command. For example,

    npm install jimp # package used in examples to read images

## Examples

See `*.js` files in this folder.
