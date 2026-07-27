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

// Shared entry point for exporting a set of "tables" (one per dataset or
// measurement) to a non-CSV format: MATLAB (.mat), Excel (.xlsx) or a
// dependency-free Python (.py) script. CSV export is left to the existing,
// already-working generateCSV() implementations in dataExport.js/dataTable.js.
//
// A table looks like: { name: string, headers: [string,...], rows: [[value,...],...] }
// where each value is a JS number, string, or null/undefined/'' for a blank cell.
var wpd = wpd || {};

wpd.tableExport = (function() {

    var PYTHON_KEYWORDS = {
        "false": 1,
        "none": 1,
        "true": 1,
        "and": 1,
        "as": 1,
        "assert": 1,
        "async": 1,
        "await": 1,
        "break": 1,
        "class": 1,
        "continue": 1,
        "def": 1,
        "del": 1,
        "elif": 1,
        "else": 1,
        "except": 1,
        "finally": 1,
        "for": 1,
        "from": 1,
        "global": 1,
        "if": 1,
        "import": 1,
        "in": 1,
        "is": 1,
        "lambda": 1,
        "nonlocal": 1,
        "not": 1,
        "or": 1,
        "pass": 1,
        "raise": 1,
        "return": 1,
        "try": 1,
        "while": 1,
        "with": 1,
        "yield": 1
    };

    function sanitizePyName(name, usedNames) {
        var cleaned = String(name || 'dataset').replace(/[^A-Za-z0-9_]/g, '_');
        if (!/^[A-Za-z_]/.test(cleaned)) {
            cleaned = '_' + cleaned;
        }
        if (PYTHON_KEYWORDS.hasOwnProperty(cleaned.toLowerCase())) {
            cleaned += '_';
        }

        var base = cleaned;
        var candidate = cleaned;
        var suffix = 1;
        while (usedNames.hasOwnProperty(candidate)) {
            candidate = base + '_' + suffix;
            suffix++;
        }
        usedNames[candidate] = true;
        return candidate;
    }

    function formatPythonValue(value) {
        if (value === null || value === undefined || value === '') {
            return 'None';
        }
        if (typeof value === 'number') {
            if (isNaN(value)) {
                return "float('nan')";
            }
            if (!isFinite(value)) {
                return value > 0 ? "float('inf')" : "float('-inf')";
            }
            return String(value);
        }
        return JSON.stringify(String(value));
    }

    function toPythonText(tables) {
        var lines = [];
        lines.push('# Data exported from WebPlotDigitizer (https://automeris.io)');
        lines.push('# Each dataset below is a list of row dictionaries, ready to use directly');
        lines.push('# or via pandas, e.g.: import pandas as pd; df = pd.DataFrame(Dataset1)');
        lines.push('');

        var usedNames = {};
        tables.forEach(function(table) {
            var varName = sanitizePyName(table.name, usedNames);
            lines.push(varName + ' = [');
            table.rows.forEach(function(row) {
                var fields = table.headers.map(function(header, i) {
                    return JSON.stringify(String(header)) + ': ' + formatPythonValue(row[i]);
                });
                lines.push('    {' + fields.join(', ') + '},');
            });
            lines.push(']');
            lines.push('');
        });

        return lines.join('\n');
    }

    // format: 'mat' | 'xlsx' | 'python'. CSV is handled separately by callers.
    function download(format, tables, filenameBase) {
        if (format === 'mat') {
            wpd.download.file(wpd.matWriter.build(tables), filenameBase + '.mat',
                'application/x-matlab-data');
        } else if (format === 'xlsx') {
            wpd.download.file(wpd.xlsxWriter.build(tables), filenameBase + '.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        } else if (format === 'python') {
            wpd.download.file(toPythonText(tables), filenameBase + '.py', 'text/x-python');
        }
    }

    return {
        toPythonText: toPythonText,
        download: download
    };
})();
