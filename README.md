WebPlotDigitizer 4.0
====================

A web based tool to extract numerical data from plot images. Supports XY, Polar, Ternary diagrams and Maps. This is an opensource tool that is used by thousands and [cited in over 600 published articles](https://scholar.google.com/scholar?as_vis=1&q=WebPlotDigitizer&hl=en&as_sdt=0,44). Checkout http://arohatgi.info/WebPlotDigitizer for more details.

License
-------

WebPlotDigitizer is distributed under [GNU AGPL v3](https://www.gnu.org/licenses/agpl-3.0.en.html).

Contact
-------

Ankit Rohatgi <ankitrohatgi@hotmail.com>

Stable Versions
---------------

The master branch in this repository is unstable and it is not recommended to use this code in production. To access stable releases, checkout: https://github.com/ankitrohatgi/WebPlotDigitizer/releases

Web Version
-----------

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

Development Dependencies
------------------------
UI:
    - See app/thirdparty folder and download the required third party libraries and dependencies.
    - A recent Java to run the javascript compiler (Google Closure Compiler).
    - Python 2.7 with jinja2 package and pybabel to compile the HTML templates.

Web Server:
    - A recent Go compiler

Electron App:
    - npm

Translations
------------

If you would like to translate WPD to your language, then please email me.

