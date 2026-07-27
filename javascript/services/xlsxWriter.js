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

// Builds a minimal, valid .xlsx workbook (one worksheet per table) using
// only inline strings (no shared-strings table, no styles) so the whole
// thing can be generated without any third-party spreadsheet library.
var wpd = wpd || {};

wpd.xlsxWriter = (function() {

    function escapeXml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    function columnLetter(colIndex) {
        var letters = '';
        var n = colIndex + 1;
        while (n > 0) {
            var rem = (n - 1) % 26;
            letters = String.fromCharCode(65 + rem) + letters;
            n = Math.floor((n - 1) / 26);
        }
        return letters;
    }

    // Excel worksheet names: <=31 chars, no \ / ? * [ ] : , not blank,
    // can't start/end with an apostrophe, must be unique (case-insensitive).
    function sanitizeSheetName(name, usedNames) {
        var cleaned = String(name || 'Sheet').replace(/[\\\/\?\*\[\]:]/g, '_');
        cleaned = cleaned.replace(/^'+|'+$/g, '_');
        if (cleaned.length === 0) {
            cleaned = 'Sheet';
        }
        cleaned = cleaned.substring(0, 31);

        var base = cleaned;
        var candidate = cleaned;
        var suffix = 1;
        while (usedNames.hasOwnProperty(candidate.toLowerCase())) {
            var suffixStr = '_' + suffix;
            candidate = base.substring(0, 31 - suffixStr.length) + suffixStr;
            suffix++;
        }
        usedNames[candidate.toLowerCase()] = true;
        return candidate;
    }

    function cellXml(rowIndex, colIndex, value) {
        var ref = columnLetter(colIndex) + (rowIndex + 1);
        if (value === null || value === undefined || value === '') {
            return '';
        }
        if (typeof value === 'number' && isFinite(value)) {
            return '<c r="' + ref + '"><v>' + value + '</v></c>';
        }
        return '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' +
            escapeXml(value) + '</t></is></c>';
    }

    function buildSheetXml(table) {
        var rowsXml = '';
        var colCount = table.headers.length;

        var headerCells = '';
        for (var c = 0; c < colCount; c++) {
            headerCells += cellXml(0, c, table.headers[c]);
        }
        rowsXml += '<row r="1">' + headerCells + '</row>';

        for (var r = 0; r < table.rows.length; r++) {
            var rowCells = '';
            for (var c2 = 0; c2 < colCount; c2++) {
                rowCells += cellXml(r + 1, c2, table.rows[r][c2]);
            }
            rowsXml += '<row r="' + (r + 2) + '">' + rowCells + '</row>';
        }

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
            '<sheetData>' + rowsXml + '</sheetData>' +
            '</worksheet>';
    }

    // tables: [{ name: string, headers: [string,...], rows: [[value,...],...] }, ...]
    async function build(tables) {
        var usedNames = {};
        var sheetNames = tables.map(function(t) {
            return sanitizeSheetName(t.name, usedNames);
        });

        var files = [];

        var contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
            '<Default Extension="xml" ContentType="application/xml"/>' +
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>';
        tables.forEach(function(t, i) {
            contentTypes += '<Override PartName="/xl/worksheets/sheet' + (i + 1) +
                '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
        });
        contentTypes += '</Types>';
        files.push({
            name: '[Content_Types].xml',
            data: contentTypes
        });

        files.push({
            name: '_rels/.rels',
            data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
                '</Relationships>'
        });

        var sheetsXml = '';
        var workbookRels =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
        tables.forEach(function(t, i) {
            var rId = 'rId' + (i + 1);
            sheetsXml += '<sheet name="' + escapeXml(sheetNames[i]) + '" sheetId="' + (i + 1) +
                '" r:id="' + rId + '"/>';
            workbookRels += '<Relationship Id="' + rId +
                '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' +
                (i + 1) + '.xml"/>';
        });
        workbookRels += '</Relationships>';

        files.push({
            name: 'xl/workbook.xml',
            data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
                '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
                '<sheets>' + sheetsXml + '</sheets>' +
                '</workbook>'
        });

        files.push({
            name: 'xl/_rels/workbook.xml.rels',
            data: workbookRels
        });

        tables.forEach(function(t, i) {
            files.push({
                name: 'xl/worksheets/sheet' + (i + 1) + '.xml',
                data: buildSheetXml(t)
            });
        });

        return wpd.zipWriter.build(files);
    }

    return {
        build: build
    };
})();
