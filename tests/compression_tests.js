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

QUnit.module("Compression tests");

QUnit.test("capability detection matches the test browser", function(assert) {
    // This suite runs in ChromeHeadless, which has supported the
    // Compression Streams API (including deflate-raw) for a long time; a
    // false result here would mean the feature-detection itself is broken.
    assert.ok(wpd.compression.supportsGzip(), 'gzip format detected as supported');
    assert.ok(wpd.compression.supportsDeflateRaw(), 'deflate-raw format detected as supported');
});

QUnit.test("gzip/gunzip round-trips arbitrary bytes", async function(assert) {
    var original = new TextEncoder().encode('WebPlotDigitizer '.repeat(200));

    var compressed = await wpd.compression.gzip(original);
    assert.ok(wpd.compression.isGzip(compressed), 'compressed output has the gzip magic number');
    assert.ok(compressed.length < original.length, 'repetitive input actually shrinks');

    var restored = await wpd.compression.gunzip(compressed);
    assert.deepEqual(Array.from(restored), Array.from(original), 'round-trip is byte-identical');
});

QUnit.test("deflateRaw/inflateRaw round-trips arbitrary bytes", async function(assert) {
    var original = new TextEncoder().encode(JSON.stringify({
        hello: 'world',
        values: [1, 2, 3, 4, 5]
    }));

    var compressed = await wpd.compression.deflateRaw(original);
    var restored = await wpd.compression.inflateRaw(compressed);
    assert.deepEqual(Array.from(restored), Array.from(original), 'round-trip is byte-identical');
});

QUnit.test("isGzip only matches the gzip magic number", function(assert) {
    assert.ok(wpd.compression.isGzip(new Uint8Array([0x1f, 0x8b, 0x08, 0x00])), 'true positive');
    assert.notOk(wpd.compression.isGzip(new Uint8Array([0x50, 0x4b, 0x03, 0x04])),
        'zip magic number is not gzip');
    assert.notOk(wpd.compression.isGzip(new Uint8Array([0x1f])), 'too short to have a magic number');
    assert.notOk(wpd.compression.isGzip(new Uint8Array([])), 'empty input');
});
