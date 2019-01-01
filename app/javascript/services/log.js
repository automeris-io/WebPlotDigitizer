/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

    This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.
*/

var wpd = wpd || {};

wpd.log = function() {
    // Capture some basic info that helps WPD development.
    // Never capture anything about the data here!

    // if we're running inside electron, then skip
    if (wpd.browserInfo.isElectronBrowser()) {
        return;
    }

    // if server has disabled logging, then skip
    fetch("log").then(function(response) {
        return response.text();
    }).then(function(text) {
        if (text == "true") {
            // logging is enabled
            let data = {};
            data["screen-size"] = window.screen.width + "x" + window.screen.height;
            data["document-location"] = document.location.href;
            data["document-referrer"] = document.referrer;
            data["platform"] = window.navigator.platform;
            data["userAgent"] = window.navigator.userAgent;
            data["language"] = window.navigator.language;
            fetch("log", {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
    });
};