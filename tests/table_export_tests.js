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

// Minimal store-method zip reader, used only to verify wpd.zipWriter/wpd.xlsxWriter
// output without depending on a third-party unzip library.
function readStoreZip(bytes) {
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var entries = {};
    var offset = 0;
    while (view.getUint32(offset, true) === 0x04034b50) {
        var compSize = view.getUint32(offset + 18, true);
        var nameLen = view.getUint16(offset + 26, true);
        var extraLen = view.getUint16(offset + 28, true);
        var nameStart = offset + 30;
        var name = new TextDecoder().decode(bytes.subarray(nameStart, nameStart + nameLen));
        var dataStart = nameStart + nameLen + extraLen;
        entries[name] = bytes.subarray(dataStart, dataStart + compSize);
        offset = dataStart + compSize;
    }
    return entries;
}

QUnit.module("Table export tests");

QUnit.test("zipWriter produces a readable archive", function(assert) {
    var zipBytes = wpd.zipWriter.build([{
            name: 'hello.txt',
            data: 'Hello, WPD!'
        },
        {
            name: 'dir/nested.txt',
            data: 'nested content'
        }
    ]);

    var entries = readStoreZip(zipBytes);
    assert.equal(new TextDecoder().decode(entries['hello.txt']), 'Hello, WPD!', 'first entry ok');
    assert.equal(new TextDecoder().decode(entries['dir/nested.txt']), 'nested content',
        'second entry ok');

    // End of central directory record must be present.
    var eocdSig = 0x06054b50;
    var view = new DataView(zipBytes.buffer);
    var found = false;
    for (var i = zipBytes.length - 22; i >= 0; i--) {
        if (view.getUint32(i, true) === eocdSig) {
            found = true;
            break;
        }
    }
    assert.ok(found, 'end of central directory record found');
});

QUnit.test("xlsxWriter produces a valid package with expected cell values", function(assert) {
    var tables = [{
        name: 'Dataset 1',
        headers: ['X', 'Y'],
        rows: [
            [1, 2.5],
            ['2020-01-01', 3]
        ]
    }];

    var xlsxBytes = wpd.xlsxWriter.build(tables);
    var entries = readStoreZip(xlsxBytes);

    assert.ok(entries['[Content_Types].xml'] != null, 'content types part present');
    assert.ok(entries['xl/workbook.xml'] != null, 'workbook part present');
    assert.ok(entries['xl/worksheets/sheet1.xml'] != null, 'worksheet part present');

    var sheetXml = new TextDecoder().decode(entries['xl/worksheets/sheet1.xml']);
    assert.ok(sheetXml.indexOf('<is><t xml:space="preserve">X</t></is>') >= 0, 'header X present');
    assert.ok(sheetXml.indexOf('<is><t xml:space="preserve">Y</t></is>') >= 0, 'header Y present');
    assert.ok(sheetXml.indexOf('<v>1</v>') >= 0, 'numeric cell 1 present');
    assert.ok(sheetXml.indexOf('<v>2.5</v>') >= 0, 'numeric cell 2.5 present');
    assert.ok(sheetXml.indexOf('2020-01-01') >= 0, 'string cell present');

    var workbookXml = new TextDecoder().decode(entries['xl/workbook.xml']);
    assert.ok(workbookXml.indexOf('name="Dataset 1"') >= 0, 'sheet named after dataset');
});

QUnit.test("xlsxWriter sanitizes and de-duplicates sheet names", function(assert) {
    var tables = [{
            name: 'a/b:c*d',
            headers: ['H'],
            rows: [
                [1]
            ]
        },
        {
            name: 'a/b:c*d',
            headers: ['H'],
            rows: [
                [2]
            ]
        }
    ];

    var xlsxBytes = wpd.xlsxWriter.build(tables);
    var entries = readStoreZip(xlsxBytes);
    var workbookXml = new TextDecoder().decode(entries['xl/workbook.xml']);

    assert.ok(workbookXml.indexOf('a_b_c_d') >= 0, 'illegal characters replaced');
    assert.ok(/name="[^"]+"[^>]*\/>.*name="[^"]+"/.test(workbookXml.replace(/\n/g, '')) ||
        (workbookXml.match(/<sheet /g) || []).length === 2, 'two distinct sheets written');
});

// Minimal MAT5 reader sufficient to validate matWriter output: walks a
// top-level cell-array variable (starting at `offset`, 128 = file start)
// and reconstructs its headers/rows. Returns `nextOffset` so callers can
// read subsequent top-level variables in the same file.
function readMatVariable(bytes, offset) {
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    function readElement(offset) {
        var dataType = view.getUint32(offset, true);
        var numBytes = view.getUint32(offset + 4, true);
        var dataStart = offset + 8;
        var padLen = (8 - (numBytes % 8)) % 8;
        var nextOffset = dataStart + numBytes + padLen;
        return {
            dataType: dataType,
            numBytes: numBytes,
            dataStart: dataStart,
            nextOffset: nextOffset
        };
    }

    function readMatrix(offset) {
        var outer = readElement(offset);
        if (outer.dataType !== 14) {
            throw new Error('expected miMATRIX, got ' + outer.dataType);
        }
        var p = outer.dataStart;

        var flagsEl = readElement(p);
        var mxClass = bytes[flagsEl.dataStart];
        p = flagsEl.nextOffset;

        var dimsEl = readElement(p);
        var numDims = dimsEl.numBytes / 4;
        var dims = [];
        for (var d = 0; d < numDims; d++) {
            dims.push(view.getInt32(dimsEl.dataStart + d * 4, true));
        }
        p = dimsEl.nextOffset;

        var nameEl = readElement(p);
        var name = new TextDecoder().decode(bytes.subarray(nameEl.dataStart, nameEl.dataStart +
            nameEl.numBytes));
        p = nameEl.nextOffset;

        var result = {
            mxClass: mxClass,
            dims: dims,
            name: name,
            nextOffset: outer.nextOffset
        };

        if (mxClass === 6) { // double
            var doubleEl = readElement(p);
            result.value = view.getFloat64(doubleEl.dataStart, true);
        } else if (mxClass === 4) { // char
            var numChars = dims[0] * dims[1];
            var charEl = readElement(p);
            var chars = '';
            for (var c = 0; c < numChars; c++) {
                chars += String.fromCharCode(view.getUint16(charEl.dataStart + c * 2, true));
            }
            result.value = chars;
        } else if (mxClass === 1) { // cell
            var numCells = dims[0] * dims[1];
            var cells = [];
            var cellOffset = p;
            for (var i = 0; i < numCells; i++) {
                var cell = readMatrix(cellOffset);
                cells.push(cell);
                cellOffset = cell.nextOffset;
            }
            result.cells = cells;
        }
        return result;
    }

    return readMatrix(offset);
}

function readMatFileHeaderEndian(bytes) {
    return String.fromCharCode(bytes[126], bytes[127]);
}

QUnit.test("matWriter round-trips headers and mixed-type rows", function(assert) {
    var tables = [{
        name: 'My Dataset 1',
        headers: ['X', 'Label'],
        rows: [
            [1.5, 'alpha'],
            [2.25, null]
        ]
    }];

    var matBytes = wpd.matWriter.build(tables);
    assert.equal(readMatFileHeaderEndian(matBytes), 'IM', 'endian indicator marks little-endian');

    var top = readMatVariable(matBytes, 128);

    assert.equal(top.mxClass, 1, 'top-level variable is a cell array');
    assert.equal(top.name, 'My_Dataset_1', 'variable name sanitized');
    assert.deepEqual(top.dims, [3, 2], 'dims are (rows+1) x cols');

    // Column-major order: col0 = [X, 1.5, 2.25], col1 = [Label, alpha, '']
    var cells = top.cells;
    assert.equal(cells[0].value, 'X', 'header col0');
    assert.equal(cells[1].value, 1.5, 'row0 col0');
    assert.equal(cells[2].value, 2.25, 'row1 col0');
    assert.equal(cells[3].value, 'Label', 'header col1');
    assert.equal(cells[4].value, 'alpha', 'row0 col1');
    assert.equal(cells[5].value, '', 'row1 col1 (null becomes empty string)');
});

QUnit.test("matWriter sanitizes and de-duplicates variable names", function(assert) {
    var tables = [{
            name: '1 bad name!',
            headers: ['A'],
            rows: [
                [1]
            ]
        },
        {
            name: '1 bad name!',
            headers: ['A'],
            rows: [
                [2]
            ]
        }
    ];

    var matBytes = wpd.matWriter.build(tables);
    var first = readMatVariable(matBytes, 128);
    assert.ok(/^[A-Za-z]/.test(first.name), 'sanitized name starts with a letter');

    var second = readMatVariable(matBytes, first.nextOffset);
    assert.notEqual(first.name, second.name, 'duplicate table names de-duplicated');
    assert.equal(second.cells[1].value, 2, 'second variable retains its own data');
});

QUnit.test("tableExport.toPythonText emits a usable python literal", function(assert) {
    var tables = [{
        name: 'Dataset 1',
        headers: ['X', 'Y'],
        rows: [
            [1, 2.5],
            [null, 'text']
        ]
    }];

    var text = wpd.tableExport.toPythonText(tables);

    assert.ok(/Dataset_1 = \[/.test(text), 'sanitized variable name assignment present');
    assert.ok(text.indexOf('"X": 1') >= 0, 'numeric field present');
    assert.ok(text.indexOf('"Y": 2.5') >= 0, 'float field present');
    assert.ok(text.indexOf('"X": None') >= 0, 'null becomes None');
    assert.ok(text.indexOf('"Y": "text"') >= 0, 'string field quoted');
});
