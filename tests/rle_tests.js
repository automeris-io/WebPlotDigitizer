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

QUnit.module("RLE tests");

QUnit.test("Encode array", function(assert) {
    let array = [1, 2, 3, 6, 10, 11, 12, 13, 30, 31];
    let rleArray = wpd.rle.encode(array);
    assert.deepEqual(rleArray, [
        [1, 3],
        [6, 1],
        [10, 4],
        [30, 2]
    ], "encoded array");
});

QUnit.test("Decode RLE array", function(assert) {
    let rleArray = [
        [1, 3],
        [6, 1],
        [10, 4],
        [30, 2]
    ];
    let array = wpd.rle.decode(rleArray);
    assert.deepEqual(array, [1, 2, 3, 6, 10, 11, 12, 13, 30, 31], "decoded RLE array");
});
