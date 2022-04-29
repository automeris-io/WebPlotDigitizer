# WebPlotDigitizer Developer Guidelines

Please note the following before you begin:
- By contributing to WebPlotDigitizer, you are automatically agreeing to the [Contributor License Agreement](CONTRIBUTING.md).
- Opensource doesn't automatically imply that this project is open for all kinds of contributions. Please consult with Ankit Rohatgi before considering to make any large contributions.

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

It should be easy to setup any Linux distribution for development purposes, but Ubuntu is preferred. MacOS has a few different setup steps and is currently experimental. Windows is unsupported for development.

To install Ubuntu packages and download other dependencies, you can try the script [setupUbuntuDev.sh](setupUbuntuDev.sh).
To install MacOS packages and download other dependencies, you can try the script [setupMacOSDev.sh](setupMacOSDev.sh).

For other operating systems, please install the following dependencies manually:

UI:
- See app/thirdparty folder and download the required third party libraries and dependencies.
- The Eigen C++ template library (see <http://eigen.tuxfamily.org/>).
- A recent Java to run the javascript compiler (Google Closure Compiler).
- Python 3 with python3-jinja2 package and python3-babel to compile the HTML templates.
- js-beautify npm package to autoformat javascript, HTML and CSS files.

Web Server:
- A recent Go compiler

Electron App:
- `electron-packager` npm package to create packages for distributions
- `wine` on Linux systems to create Windows distributions
- Run `npm install` in the electron folder to fetch any other dependencies

## Building Source

**Building HTML5 Source**

To build the HTML5 code, do the following (make sure you have checked out the dependencies above):

    cd app
    npm install
    npm run build

This should generate a combined-compiled.js file and several HTML files in the 'app' directory. Use the web server (see webserver folder) or Electron app (see electron folder) to host this app.

**Web Server**

PHP backend has now been replaced with a simple Go server. To start the server do the following:

    cd webserver
    cp settings.json.example settings.json
    # edit settings.json as needed
    go build
    ./webserver

You can now open WebPlotDigitizer in your web browser.

The Go based server will be extended to include typical server side features like server-side data storage, remote APIs etc.

**Electron App**

To run the electron app, follow these steps:

    cd electron
    npm install
    npm start

At the moment, this is only an basic implementation. If you are familiar with electron app development, then feel free to contribute here.

On a Linux development machine, you will also need `wine` to build the Windows app. To build the apps, run:

    cd electron
    npm install
    npm run build # Windows, Mac and Linux
    ./build-mac.sh # MacOS only (may require global install of `electron-packager` from `npm`)

This will create apps for Mac, Windows and Linux.

## Unit Tests

Please consider adding unit tests when adding or editing code. Any contributions to increase existing code coverage is greatly appreciated.

Unit tests are located in the `app/tests` directory. The tests are written for [QUnit](https://api.qunitjs.com/). The test runner [Karma](https://karma-runner.github.io/) is used to enable command-line results. The mocking library [Sinon.js](https://sinonjs.org/) is included as well to facilitate unit test creation.

**Adding tests**

To add tests, locate the appropriate test file under `app/tests` (or create an appropriate file) and add the tests there.

This isn't always possible, but ideally, each unit test assertion should complete execution within 10ms.

**Running tests**

To run the tests, use the following commands:

    cd app
    npm test

This will load the QUnit tests, run them, and display the results.

To view the QUnit results in the browser, start a development server and append `/tests` to the url (e.g. `http://localhost:8080/tests`).

**Testing different browsers**

To run the unit tests in different browsers, use this command:

    npm test -- --browsers [browser-name]

Note: `[browser-name]` is sentence-cased (e.g. Chrome).

Or, alternatively, edit `karma.conf.js`, uncomment all desired browsers to concurrently run tests on under `browsers`, and re-run the tests.

Karma can run the tests on a plethora of browsers. To use another browser, visit https://karma-runner.github.io/latest/config/browsers.html for more information on how to set it up. This typically involves having the desired browser installed on your local machine, and a Karma plugin for the browser. By default, Karma plugins for Chrome, Firefox, and Edge are already installed.

**Auto-watch**

Karma has been configured to run in single-run mode. But Karma has the ability to watch files for changes and re-run tests. To enable this behavior, run the following instead of `npm test`:

    npm test -- --single-run false

## Coding Style

- **Javascript**: ES6 with [AirBnB's style guide](https://github.com/airbnb/javascript) is recommended. A lot of older code does not follow this style and should be updated eventually.

To run automatic formatting on the Javascript and C++ code, use this command:

    cd app
    npm run format

Or, alternatively, run the [format.sh](app/format.sh) script in the `app` folder.

## Scripts

Custom JS scripts can be loaded into WebPlotDigitizer and executed. See [script_examples](script_examples/README.md) for more details.

## Docker

To build a docker image see the file `research/Dockerfile`.

## Internationalization (Language Translations)

Use [Poedit](https://poedit.net/) to edit the `.po` files in `app/locale` folder. To add support for a new language, please contact Ankit Rohatgi.

## Documentation, Tutorial Videos

Good documentation and tutorials are severly lacking and any help would be highly appreciated. The LaTeX source for the current user manual is in the `docs/latex` folder.
