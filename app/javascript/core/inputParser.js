/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2022 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

/* Parse user provided expressions, dates etc. */
var wpd = wpd || {};

wpd.InputParser = class {
    constructor() {
        // public:
        this.isValid = false;
        this.isDate = false;
        this.formatting = null;
        this.isArray = false;
    }

    parse(input) {
        this.isValid = false;
        this.isDate = false;
        this.formatting = null;

        if (input == null) {
            return null;
        }

        if (typeof input === "string") {
            input = input.trim();

            if (input.indexOf('^') >= 0) {
                return null;
            }
        }

        let parsedDate = wpd.dateConverter.parse(input);
        if (parsedDate != null) {
            this.isValid = true;
            this.isDate = true;
            this.formatting = wpd.dateConverter.getFormatString(input);
            return parsedDate;
        }

        let parsedArray = this._parseArray(input);
        if (parsedArray != null) {
            this.isValid = true;
            this.isArray = true;
            return parsedArray;
        }

        let parsedFloat = parseFloat(input);
        if (!isNaN(parsedFloat)) {
            this.isValid = true;
            return parsedFloat;
        }

        return null;
    }

    _parseArray(input) {
        // e.g. convert "[1.2, 3.4, 100]" to an array [1.2, 3.4, 100]
        // TODO: support comma decimal separators somehow...
        let valArray = input.replace("[", "").replace("]", "").split(",").map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (valArray.length == 0) {
            return null;
        }
        return valArray;
    }
};