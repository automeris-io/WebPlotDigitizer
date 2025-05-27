/*
    WebPlotDigitizer - web based chart data extraction software (and more)
    
    Copyright (C) 2025 Ankit Rohatgi

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>
*/

// Karma configuration
// Generated on Fri Apr 29 2022 09:54:51 GMT-0400 (Eastern Daylight Time)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: "",


        // frameworks to use
        // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
        frameworks: ["qunit", "sinon"],

        // plugins to use
        plugins: [
            "karma-*",
        ],


        // list of files / patterns to load in the browser
        files: [
            "javascript/*.js",
            "javascript/core/*.js",
            "javascript/core/axes/*.js",
            "javascript/core/curve_detection/*.js",
            "javascript/core/point_detection/*.js",
            "javascript/services/saveResume.js",
            "javascript/services/events.js",
            "javascript/widgets/*.js",
            "javascript/tools/base/*.js",
            "javascript/tools/*.js",
            "javascript/controllers/*.js",
            "tests/**/*_tests.js",  // qunit tests
            "tests/testhelpers.js", // test helper
            {
                pattern: "start.png",
                watched: false,
                included: false,
            },
            {
                pattern: "tests/files/*.json",
                watched: false,
                included: false,
            }
        ],


        // proxies
        proxies: {
            "/start.png": "/base/start.png",
            "/files/": "/base/tests/files/",
        },


        // list of files / patterns to exclude
        exclude: [
            "javascript/main.js", // main wpd entry point
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
        preprocessors: {
        },


        // test results reporter to use
        // possible values: "dots", "progress"
        // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
        reporters: ["progress"],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
        browsers: [
            // "Chrome",
            "ChromeHeadless",
            // "Edge",
            // "Firefox",	    
        ],	
	
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser instances should be started simultaneously
        concurrency: Infinity,

        // client configuration
        client: {
            clearContext: false,
            qunit: {
                showUI: true,
                testTimeout: 5000,
            },
            useIframe: false,
        },
    })
}
