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

// Minimal ZIP archive writer. Entries are DEFLATE-compressed via the
// browser's native Compression Streams API (wpd.compression) when
// available, falling back to the uncompressed "store" method otherwise.
// Sufficient to build well-formed .xlsx/.docx-style OOXML packages without
// a third-party dependency.
var wpd = wpd || {};

wpd.zipWriter = (function() {

    var crcTable = null;

    function buildCRCTable() {
        var table = new Uint32Array(256);
        for (var n = 0; n < 256; n++) {
            var c = n;
            for (var k = 0; k < 8; k++) {
                c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
            }
            table[n] = c >>> 0;
        }
        return table;
    }

    function crc32(bytes) {
        if (crcTable == null) {
            crcTable = buildCRCTable();
        }
        var crc = 0xffffffff;
        for (var i = 0; i < bytes.length; i++) {
            crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
        }
        return (crc ^ 0xffffffff) >>> 0;
    }

    function toUTF8Bytes(str) {
        return new TextEncoder().encode(str);
    }

    // DOS date/time encoding used by the ZIP format (local time not tracked,
    // a fixed timestamp is fine since it has no bearing on file validity).
    function dosDateTime() {
        var d = new Date();
        var dosTime = ((d.getHours() & 0x1f) << 11) | ((d.getMinutes() & 0x3f) << 5) |
            ((Math.floor(d.getSeconds() / 2)) & 0x1f);
        var dosDate = (((d.getFullYear() - 1980) & 0x7f) << 9) | (((d.getMonth() + 1) & 0xf) << 5) |
            (d.getDate() & 0x1f);
        return {
            time: dosTime,
            date: dosDate
        };
    }

    // Small helper to accumulate bytes and write little-endian integers.
    function ByteWriter() {
        this.chunks = [];
        this.length = 0;
    }
    ByteWriter.prototype.pushBytes = function(bytes) {
        this.chunks.push(bytes);
        this.length += bytes.length;
    };
    ByteWriter.prototype.pushUint16 = function(val) {
        this.pushBytes(new Uint8Array([val & 0xff, (val >>> 8) & 0xff]));
    };
    ByteWriter.prototype.pushUint32 = function(val) {
        this.pushBytes(new Uint8Array([val & 0xff, (val >>> 8) & 0xff, (val >>> 16) & 0xff,
            (val >>> 24) & 0xff
        ]));
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

    // files: [{ name: 'xl/workbook.xml', data: string|Uint8Array }, ...]
    async function build(files) {
        var localWriter = new ByteWriter();
        var centralWriter = new ByteWriter();
        var offsets = [];
        var dt = dosDateTime();
        var canDeflate = wpd.compression.supportsDeflateRaw();
        var i;

        for (i = 0; i < files.length; i++) {
            var nameBytes = toUTF8Bytes(files[i].name);
            var rawData = (typeof files[i].data === 'string') ? toUTF8Bytes(files[i].data) :
                files[i].data;
            var crc = crc32(rawData); // ZIP always CRCs the uncompressed data

            var method = 0; // store
            var storedData = rawData;
            if (canDeflate) {
                storedData = await wpd.compression.deflateRaw(rawData);
                method = 8; // deflate
            }

            var localOffset = localWriter.length;
            offsets.push(localOffset);

            // Local file header
            localWriter.pushUint32(0x04034b50);
            localWriter.pushUint16(20); // version needed
            localWriter.pushUint16(0x0800); // general purpose flag: UTF-8 filenames
            localWriter.pushUint16(method);
            localWriter.pushUint16(dt.time);
            localWriter.pushUint16(dt.date);
            localWriter.pushUint32(crc);
            localWriter.pushUint32(storedData.length); // compressed size
            localWriter.pushUint32(rawData.length); // uncompressed size
            localWriter.pushUint16(nameBytes.length);
            localWriter.pushUint16(0); // extra field length
            localWriter.pushBytes(nameBytes);
            localWriter.pushBytes(storedData);

            // Central directory header
            centralWriter.pushUint32(0x02014b50);
            centralWriter.pushUint16(20); // version made by
            centralWriter.pushUint16(20); // version needed
            centralWriter.pushUint16(0x0800);
            centralWriter.pushUint16(method);
            centralWriter.pushUint16(dt.time);
            centralWriter.pushUint16(dt.date);
            centralWriter.pushUint32(crc);
            centralWriter.pushUint32(storedData.length);
            centralWriter.pushUint32(rawData.length);
            centralWriter.pushUint16(nameBytes.length);
            centralWriter.pushUint16(0); // extra field length
            centralWriter.pushUint16(0); // comment length
            centralWriter.pushUint16(0); // disk number start
            centralWriter.pushUint16(0); // internal file attributes
            centralWriter.pushUint32(0); // external file attributes
            centralWriter.pushUint32(localOffset);
            centralWriter.pushBytes(nameBytes);
        }

        var centralDirOffset = localWriter.length;
        var centralDirSize = centralWriter.length;

        var endWriter = new ByteWriter();
        endWriter.pushUint32(0x06054b50);
        endWriter.pushUint16(0); // disk number
        endWriter.pushUint16(0); // disk with central dir
        endWriter.pushUint16(files.length); // entries on this disk
        endWriter.pushUint16(files.length); // total entries
        endWriter.pushUint32(centralDirSize);
        endWriter.pushUint32(centralDirOffset);
        endWriter.pushUint16(0); // comment length

        var finalWriter = new ByteWriter();
        finalWriter.pushBytes(localWriter.toUint8Array());
        finalWriter.pushBytes(centralWriter.toUint8Array());
        finalWriter.pushBytes(endWriter.toUint8Array());
        return finalWriter.toUint8Array();
    }

    return {
        build: build,
        crc32: crc32
    };
})();
