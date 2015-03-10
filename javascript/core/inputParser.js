/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
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

/* Parse user provided expressions, dates etc. */
var wpd = wpd || {};

wpd.InputParser = (function () {
    var Parser = function () {
        this.parse = function (input) {
            this.isValid = false;
            this.isDate = false;
            this.formatting = null;

            if(input == null) {
                return null;
            }

            if(typeof input === "string") {
                input = input.trim();

                if(input.indexOf('^') >= 0) {
                    return null;
                }
            }

            var parsedDate = wpd.dateConverter.parse(input);
            if(parsedDate != null) {
                this.isValid = true;
                this.isDate = true;
                this.formatting = wpd.dateConverter.getFormatString(input);
                return parsedDate;
            }

            var parsedFloat = parseFloat(input);
            if(!isNaN(parsedFloat)) {
                this.isValid = true;
                return parsedFloat;
            }

            return null;
        };

        this.isValid = false;

        this.isDate = false;

        this.formatting = null;
    };
    return Parser;
})();

