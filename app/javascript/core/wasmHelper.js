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

onWASMLoad = function() {};

wpd.wasmHelper = {
    arrayToPtr: function(array) {
        let ptr = Module._newDoubleArray(array.length);
        Module.HEAPF64.set(new Float64Array(array), ptr / Float64Array.BYTES_PER_ELEMENT);
        return ptr;
    },
    ptrToArray: function(ptr, length) {
        let array = new Float64Array(length);
        array.set(Module.HEAPF64.subarray(ptr / Float64Array.BYTES_PER_ELEMENT, ptr / Float64Array.BYTES_PER_ELEMENT + length));
        return array;
    },
    freePtr: function(ptr) {
        Module._freeArray(ptr);
    },
    printVersion: function() {
        Module._printVersion();
    }
};