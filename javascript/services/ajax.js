/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2016 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var wpd = wpd || {};

// Very simple GET/POST methods.
wpd.ajax = (function() {

    function get(url, responseHandler) {
        if(responseHandler != null) {
            var oReq = new XMLHttpRequest();
            oReq.onload = function(e) {
                if(this.status === 200) {
                    responseHandler(oReq);
                }
            };
            oReq.open("GET", url, true);
            oReq.send();
        }
    }

    function post(url, data, responseHandler) {
        if(responseHandler != null) {
            var oReq = new XMLHttpRequest();
            oReq.onload = function(e) {
                if(this.status === 200) {
                    responseHandler(oReq);
                }
            };
            oReq.open("POST", url, true);
            oReq.setRequestHeader('Content-type', 'application/json');
            oReq.send(data);
        }
    }

    return {
        get: get,
        post: post
    };

})();
