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

wpd.keyCodes = {
    isUp: function(code) {
        return code === 38;
    },
    isDown: function(code) {
        return code === 40;
    },
    isLeft: function(code) {
        return code === 37;
    },
    isRight: function(code) {
        return code === 39;
    },
    isTab: function(code) {
        return code === 9;
    },
    isDel: function(code) {
        return code === 46;
    },
    isBackspace: function(code) {
        return code === 8;
    },
    isAlphabet: function(code, alpha) {
        if (code > 90 || code < 65) {
            return false;
        }
        return String.fromCharCode(code).toLowerCase() === alpha;
    },
    isPeriod: function(code) {
        return code === 190;
    },
    isComma: function(code) {
        return code === 188;
    },
    isEnter: function(code) {
        return code === 13;
    },
    isEsc: function(code) {
        return code === 27;
    }
};
