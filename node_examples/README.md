NOTE: This document is a work in progress

# Calling WebPlotDigitizer algos from NodeJS

## Purpose

For some applications, the simple-to-use WebPlotDigitizer GUI can be quite restrictive and a programmatic/command-line access to the underlying algorithms is needed. Being able to process a large number of similar images is one such example. 

To make this possible, the core functions of WebPlotDigitizer have been packaged into a [NodeJS](https://nodejs.org) module that can be called from custom NodeJS scripts or applications.

## Current State

The current module is the first attempt at providing a "library" for users. In the future, the API and capabilities are likely to change quite a bit.

## Pre-Requisites

### Install NodeJS

On Linux, you should be able to use the package manager. On other operating systems, visit: https://nodejs.org/

### Build or Download WebPlotDigitizer NodeJS Module

WIP

### Install other dependencies

For many scripts, you may need to install additional packages to open images etc. You can install those as needed via the `npm install` command. For example,

    npm install jimp # package used in examples to read images

## Examples

See `*.js` files in this folder.
