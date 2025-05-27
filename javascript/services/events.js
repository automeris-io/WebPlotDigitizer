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

var wpd = wpd || {};

wpd.events = (function() {
    let _registeredEvents = {};

    // polyfill for IE9+
    if (typeof window.CustomEvent !== "function") {
        window.CustomEvent = function(event, params) {
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
        // only dispatch events if registered
        if (_isRegisteredEvent(type)) {
            window.dispatchEvent(new CustomEvent(type, {
                detail: payload
            }));
        }
    }

    function addListener(type, handler) {
        // only the payload ("detail") really matters here
        const func = (ev) => {
            handler(ev.detail);
        };

        window.addEventListener(type, func);

        _registerEvent(type, func);

        return func;
    }

    function removeListener(type, handler) {
        // note: to remove the listener, pass in the
        // handler returned by addListener
        window.removeEventListener(type, handler);

        _unregisterEvent(type, handler);
    }

    function removeAllListeners(type) {
        const removeListenersForType = (key) => {
            while (_registeredEvents[key]) {
                removeListener(key, _registeredEvents[key][0]);
            }
        };

        if (type) {
            if (_isRegisteredEvent(type)) {
                removeListenersForType(type);
            }
        } else {
            for (const registeredType in _registeredEvents) {
                removeListenersForType(registeredType);
            }
        }
    }

    function _isRegisteredEvent(type) {
        return _registeredEvents[type] && _registeredEvents[type].length > 0;
    }

    function _registerEvent(type, handler) {
        if (_registeredEvents[type]) {
            _registeredEvents[type].push(handler);
        } else {
            _registeredEvents[type] = [handler];
        }
    }

    function _unregisterEvent(type, handler) {
        if (_isRegisteredEvent(type)) {
            if (handler) {
                const index = _registeredEvents[type].indexOf(handler);

                if (index >= 0) {
                    _registeredEvents[type].splice(index, 1);
                }

                // delete key if there are no handlers registered
                if (_registeredEvents[type].length === 0) {
                    delete _registeredEvents[type];
                }
            } else {
                // unregister all handlers
                delete _registeredEvents[type];
            }
        } else {
            // no type specified; unregister everything
            _registeredEvents = {};
        }
    }

    function getRegisteredEvents() {
        return _registeredEvents;
    }

    return {
        dispatch: dispatch,
        addListener: addListener,
        removeListener: removeListener,
        removeAllListeners: removeAllListeners,
        getRegisteredEvents: getRegisteredEvents
    };
})();
