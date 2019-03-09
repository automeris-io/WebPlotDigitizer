# WebPlotDigitizer Developer Guidelines

NOTE: By contributing to WebPlotDigitizer, you are automatically agreeing to the [Contributor License Agreement](CONTRIBUTING.md).

## Where to start?

Areas to contribute:
- Documentation and tutorial videos
- Language translations
- Unit tests or other tests
- Code cleanup
- Tooling for building, formatting etc.
- Bug fixes and pruning GitHub issues list
- New features

## Development Setup

It should be easy to setup any Linux distribution for development purposes, but Ubuntu is preferred. Windows and MacOS are unsupported for development. To install Ubuntu packages and download other dependencies, you can try the script [setupUbuntuDev.sh](setupUbuntuDev.sh).

For other operating systems, please install the following dependencies manually:

UI:
- See app/thirdparty folder and download the required third party libraries and dependencies.
- A recent Java to run the javascript compiler (Google Closure Compiler).
- Python 3 with python3-jinja2 package and python3-babel to compile the HTML templates.
- js-beautify npm package to autoformat javascript, HTML and CSS files.

Web Server:
- A recent Go compiler

Electron App:
- `electron-packager` npm package to create packages for distributions
- `wine` on Linux systems to create Windows distributins
- Run `npm install` in the electron folder to fetch any other dependencies

## Building Source

**Building HTML5 Source**

To build the HTML5 code, do the following (make sure you have checked out the dependencies above):

    cd app
    ./build.sh

This should generate a combined-compiled.js file and several HTML files in the 'app' directory. Use the web server (see webserver folder) or Electron app (see electron folder) to host this app.

**Web Server**

PHP backend has now been replaced with a simple Go server. To start the server do the following:

    cd webserver
    cp settings.json.example settings.json
    # edit settings.json as needed
    go build
    ./webserver

You can now open this WPD in your web browser.

The Go based server will be extended to include typical server side features like server-side data storage, remote APIs etc.

**Electron App**

To run the electron app, follow these steps:

    cd electron
    npm install
    npm start

At the moment, this is only an basic implementation. If you are familiar with electron app development, then feel free to contribute here.

To build MacOS, Windows or Linux apps, make sure "electron-packager" is available:
    
    npm install electron-packager -g

On a Linux development machine, you will also need "wine" to build the Windows app. To build the apps, run:
   
    cd electron
    ./build-packages.sh # Windows, Mac and Linux
    ./build-mac.sh      # Mac only

This will create apps for Mac, Windows and Linux.

# Coding Style

- **Javascript**: ES6 with [AirBnB's style guide](https://github.com/airbnb/javascript) is recommended. A lot of older code does not follow this style and should be updated eventually.
- **WebAssembly C++**: C++17 or newer is preferred. The [Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html) is a good resource.

To run automatic formatting on the Javascript and C++ code, run the [format.sh](app/format.sh) script in the `app` folder.

# Internationalization (Language Translations)

Use [Poedit](https://poedit.net/) to edit the `.po` files in `app/locale` folder. To add support for a new language, please contact Ankit Rohatgi.

# Documentation, Tutorial Videos

Good documentation and tutorials are severly lacking and any help would be highly appreciated. The LaTeX source for the current user manual is in the `docs/latex` folder.
