WebPlotDigitizer
================

A web based tool to extract numerical data from plot images. Supports XY, Polar, Ternary diagrams and Maps. This is an opensource tool that is used by thousands and [cited in over 600 published articles](https://scholar.google.com/scholar?as_vis=1&q=WebPlotDigitizer&hl=en&as_sdt=0,44). Checkout https://automeris.io/WebPlotDigitizer for more details.

![WebPlotDigitizer Screenshot](screenshot.png?raw=true "WebPlotDigitizer")

Contact
-------

Ankit Rohatgi <ankitrohatgi@hotmail.com>

License
-------

WebPlotDigitizer is distributed under [GNU AGPL v3](https://www.gnu.org/licenses/agpl-3.0.en.html).

Stable Versions
---------------

The master branch in this repository is unstable and not recommended to be used in production. To access stable releases, checkout: https://github.com/ankitrohatgi/WebPlotDigitizer/releases

Development Dependencies
------------------------
(You can also use the pre-configured Ubuntu based Dockerfile from the docker folder)

UI:
- See app/thirdparty folder and download the required third party libraries and dependencies.
- A recent Java to run the javascript compiler (Google Closure Compiler).
- Python 3 with jinja2 package and pybabel to compile the HTML templates.

Web Server:
- A recent Go compiler

Electron App:
- npm


Building the App
----------------
To build the HTML5 code, do the following (make sure you have checked out the dependencies above):

    cd app
    ./build.sh

This should generate a combined-compiled.js file and several HTML files in the 'app' directory. Use the web server (see webserver folder) or Electron app (see electron folder) to host this app.


Web Server
----------

PHP backend has now been replaced with a simple Go server. To start the server do the following:

    cd webserver
    cp settings.json.example settings.json
    # edit settings.json as needed
    go build
    ./webserver

You can now open this WPD in your web browser.

The Go based server will be extended to include typical server side features like server-side data storage, remote APIs etc.

Electron App
------------

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


Translations
------------

If you would like to translate WPD to your language, then please email me.

