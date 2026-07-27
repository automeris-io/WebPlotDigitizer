/*
    WebPlotDigitizer - web based chart data extraction software (and more)

    Copyright (C) 2026 Ankit Rohatgi

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

// Builds an uncompressed MAT-file (Level 5, MATLAB 5.0), the binary format
// read by `load()` in MATLAB/Octave and `scipy.io.loadmat` in Python. Each
// exported table becomes one workspace variable: a 2-D cell array whose
// first row holds the column headers, so mixed numeric/text columns (e.g.
// dates or bar labels) round-trip without loss.
//
// Reference: MathWorks "MAT-File Format" (Level 5), R2020a.
var wpd = wpd || {};

wpd.matWriter = (function() {

    var MI_INT8 = 1;
    var MI_INT32 = 5;
    var MI_UINT16 = 4;
    var MI_UINT32 = 6;
    var MI_DOUBLE = 9;
    var MI_MATRIX = 14;

    var MX_CELL_CLASS = 1;
    var MX_DOUBLE_CLASS = 6;
    var MX_CHAR_CLASS = 4;

    function ByteWriter() {
        this.chunks = [];
        this.length = 0;
    }
    ByteWriter.prototype.pushBytes = function(bytes) {
        this.chunks.push(bytes);
        this.length += bytes.length;
    };
    ByteWriter.prototype.toUint8Array = function() {
        var out = new Uint8Array(this.length);
        var offset = 0;
        for (var i = 0; i < this.chunks.length; i++) {
            out.set(this.chunks[i], offset);
            offset += this.chunks[i].length;
        }
        return out;
    };

    function uint32LE(val) {
        return new Uint8Array([val & 0xff, (val >>> 8) & 0xff, (val >>> 16) & 0xff, (val >>> 24) &
            0xff
        ]);
    }

    function int32ArrayLE(values) {
        var out = new Uint8Array(values.length * 4);
        var view = new DataView(out.buffer);
        for (var i = 0; i < values.length; i++) {
            view.setInt32(i * 4, values[i], true);
        }
        return out;
    }

    function doubleLE(val) {
        var buf = new ArrayBuffer(8);
        new DataView(buf).setFloat64(0, val, true);
        return new Uint8Array(buf);
    }

    function uint16ArrayLE(codes) {
        var out = new Uint8Array(codes.length * 2);
        var view = new DataView(out.buffer);
        for (var i = 0; i < codes.length; i++) {
            view.setUint16(i * 2, codes[i], true);
        }
        return out;
    }

    function concatBytes(arrays) {
        var total = 0;
        for (var i = 0; i < arrays.length; i++) {
            total += arrays[i].length;
        }
        var out = new Uint8Array(total);
        var offset = 0;
        for (i = 0; i < arrays.length; i++) {
            out.set(arrays[i], offset);
            offset += arrays[i].length;
        }
        return out;
    }

    // Tag (8 bytes: data type + byte count) followed by the data, padded so
    // the data length is a multiple of 8 bytes.
    function writeElement(dataType, payload) {
        var padLen = (8 - (payload.length % 8)) % 8;
        return concatBytes([uint32LE(dataType), uint32LE(payload.length), payload, new Uint8Array(
            padLen)]);
    }

    function buildArrayFlagsElement(mxClass) {
        var flags = new Uint8Array([mxClass, 0, 0, 0, 0, 0, 0, 0]);
        return writeElement(MI_UINT32, flags);
    }

    function buildDimensionsElement(dims) {
        return writeElement(MI_INT32, int32ArrayLE(dims));
    }

    function buildNameElement(name) {
        var bytes = new Uint8Array(name.length);
        for (var i = 0; i < name.length; i++) {
            bytes[i] = name.charCodeAt(i) & 0xff;
        }
        return writeElement(MI_INT8, bytes);
    }

    function buildMatrixElement(name, mxClass, dims, dataElements) {
        var payload = concatBytes([
            buildArrayFlagsElement(mxClass),
            buildDimensionsElement(dims),
            buildNameElement(name)
        ].concat(dataElements));
        return writeElement(MI_MATRIX, payload);
    }

    function buildDoubleScalar(value) {
        var dataEl = writeElement(MI_DOUBLE, doubleLE(value));
        return buildMatrixElement('', MX_DOUBLE_CLASS, [1, 1], [dataEl]);
    }

    function buildCharRow(str) {
        str = str == null ? '' : String(str);
        var codes = [];
        for (var i = 0; i < str.length; i++) {
            codes.push(str.charCodeAt(i));
        }
        var dims = codes.length === 0 ? [0, 0] : [1, codes.length];
        var dataEl = writeElement(MI_UINT16, uint16ArrayLE(codes));
        return buildMatrixElement('', MX_CHAR_CLASS, dims, [dataEl]);
    }

    function buildCellValue(value) {
        if (typeof value === 'number') {
            return buildDoubleScalar(value);
        }
        return buildCharRow(value);
    }

    // MATLAB variable names: start with a letter, then letters/digits/underscores,
    // max 63 characters (namelengthmax), unique per file.
    function sanitizeVarName(name, usedNames) {
        var cleaned = String(name || 'table').replace(/[^A-Za-z0-9_]/g, '_');
        if (!/^[A-Za-z]/.test(cleaned)) {
            cleaned = 'v_' + cleaned;
        }
        cleaned = cleaned.substring(0, 63);

        var base = cleaned;
        var candidate = cleaned;
        var suffix = 1;
        while (usedNames.hasOwnProperty(candidate)) {
            var suffixStr = '_' + suffix;
            candidate = base.substring(0, 63 - suffixStr.length) + suffixStr;
            suffix++;
        }
        usedNames[candidate] = true;
        return candidate;
    }

    // tables: [{ name: string, headers: [string,...], rows: [[value,...],...] }, ...]
    // Each table becomes one workspace variable: a (rows+1) x cols cell
    // array with the header names in row 1.
    function build(tables) {
        var usedNames = {};
        var writer = new ByteWriter();

        // 128-byte header
        var descriptor = 'MATLAB 5.0 MAT-file, Created by WebPlotDigitizer (automeris.io)';
        var headerText = new Uint8Array(116);
        for (var i = 0; i < Math.min(descriptor.length, 116); i++) {
            headerText[i] = descriptor.charCodeAt(i);
        }
        for (i = descriptor.length; i < 116; i++) {
            headerText[i] = 0x20; // space-pad
        }
        writer.pushBytes(headerText);
        writer.pushBytes(new Uint8Array(8)); // subsystem-specific data (unused)
        writer.pushBytes(new Uint8Array([0x00, 0x01])); // version 0x0100
        writer.pushBytes(new Uint8Array([0x49, 0x4d])); // endian indicator: "IM" marks little-endian

        tables.forEach(function(table) {
            var varName = sanitizeVarName(table.name, usedNames);
            var numRows = table.rows.length + 1;
            var numCols = table.headers.length;

            // Column-major cell contents: row 0 is the header row.
            var cells = [];
            for (var c = 0; c < numCols; c++) {
                for (var r = 0; r < numRows; r++) {
                    var value = (r === 0) ? table.headers[c] : table.rows[r - 1][c];
                    cells.push(buildCellValue(value));
                }
            }

            writer.pushBytes(buildMatrixElement(varName, MX_CELL_CLASS, [numRows, numCols],
                cells));
        });

        return writer.toUint8Array();
    }

    return {
        build: build
    };
})();
