/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2020 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.events = (function() {
    // polyfill for IE9+
    if (typeof window.CustomEvent !== "function") {
        window.CustomEvent = function (event, params) {
            params = params || {
                bubbles: false,
                cancelable: false,
                detail: null
            };

            var evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

            return evt;
        };
    }

    function dispatch(type, payload) {
        window.dispatchEvent(new CustomEvent(type, { detail: payload }));
    }

    function addListener(type, handler) {
        // only the payload ("detail") really matters here
        const func = (ev) => {
            handler(ev.detail);
        };

        window.addEventListener(type, func);

        return func;
    }

    function removeListener(type, handler) {
        // note: to remove the listener, pass in the
        // handler returned by addListener
        window.removeEventListener(type, handler);
    }

    return {
        dispatch: dispatch,
        addListener: addListener,
        removeListener: removeListener
    };
})();