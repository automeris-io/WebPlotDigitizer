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

// Thin wrapper around the browser-native Compression Streams API
// (CompressionStream/DecompressionStream), used instead of a third-party
// gzip/deflate library. Every function degrades gracefully: callers check
// supportsGzip()/supportsDeflateRaw() up front and fall back to storing data
// uncompressed on browsers that lack the API (Safari < 16.4, Firefox < 113).
var wpd = wpd || {};

wpd.compression = (function() {

    var deflateRawSupported = null;
    var gzipSupported = null;

    function formatIsSupported(format) {
        if (typeof CompressionStream === 'undefined' || typeof DecompressionStream === 'undefined') {
            return false;
        }
        try {
            // Constructing (without using) a stream is enough to detect
            // whether the browser recognizes the format string.
            new CompressionStream(format);
            return true;
        } catch (e) {
            return false;
        }
    }

    function supportsDeflateRaw() {
        if (deflateRawSupported == null) {
            deflateRawSupported = formatIsSupported('deflate-raw');
        }
        return deflateRawSupported;
    }

    function supportsGzip() {
        if (gzipSupported == null) {
            gzipSupported = formatIsSupported('gzip');
        }
        return gzipSupported;
    }

    function concatUint8Arrays(chunks) {
        var total = 0;
        for (var i = 0; i < chunks.length; i++) {
            total += chunks[i].length;
        }
        var out = new Uint8Array(total);
        var offset = 0;
        for (i = 0; i < chunks.length; i++) {
            out.set(chunks[i], offset);
            offset += chunks[i].length;
        }
        return out;
    }

    async function runStream(streamCtor, format, bytes) {
        var stream = new streamCtor(format);
        var writer = stream.writable.getWriter();
        writer.write(bytes);
        writer.close();

        var reader = stream.readable.getReader();
        var chunks = [];
        while (true) {
            var result = await reader.read();
            if (result.done) {
                break;
            }
            chunks.push(result.value);
        }
        return concatUint8Arrays(chunks);
    }

    function gzip(bytes) {
        return runStream(CompressionStream, 'gzip', bytes);
    }

    function gunzip(bytes) {
        return runStream(DecompressionStream, 'gzip', bytes);
    }

    function deflateRaw(bytes) {
        return runStream(CompressionStream, 'deflate-raw', bytes);
    }

    function inflateRaw(bytes) {
        return runStream(DecompressionStream, 'deflate-raw', bytes);
    }

    // gzip files/streams always start with this 2-byte magic number.
    function isGzip(bytes) {
        return bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
    }

    return {
        supportsDeflateRaw: supportsDeflateRaw,
        supportsGzip: supportsGzip,
        gzip: gzip,
        gunzip: gunzip,
        deflateRaw: deflateRaw,
        inflateRaw: inflateRaw,
        isGzip: isGzip
    };
})();
