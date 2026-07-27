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

QUnit.module("ColorGroup tests");

QUnit.test("isColorInGroup - empty group always accepts", function(assert) {
    let g = new wpd.ColorGroup(100);
    assert.true(g.isColorInGroup(255, 0, 0), "empty group accepts any color");
    assert.true(g.isColorInGroup(0, 0, 0), "empty group accepts black");
});

QUnit.test("isColorInGroup - within and outside tolerance", function(assert) {
    let g = new wpd.ColorGroup(50);
    g.addPixel(100, 100, 100); // avg = (100, 100, 100), count = 1

    // Same color → dist=0, in group
    assert.true(g.isColorInGroup(100, 100, 100), "same color in group");

    // Just within tolerance: dist = sqrt(50^2) = 50, check is dist <= tolerance → dist^2 <= tol^2 = 2500
    // (100+50, 100, 100): dist^2 = 50^2 = 2500 ≤ 2500 ✓
    assert.true(g.isColorInGroup(150, 100, 100), "on tolerance boundary");

    // Just outside: dist^2 = 51^2 = 2601 > 2500
    assert.false(g.isColorInGroup(151, 100, 100), "outside tolerance");
});

QUnit.test("addPixel - running average and count", function(assert) {
    const eps = 1e-6;
    let g = new wpd.ColorGroup(200);
    g.addPixel(100, 0, 0);
    assert.equal(g.getPixelCount(), 1, "count = 1");
    let avg = g.getAverageColor();
    assert.ok(Math.abs(avg.r - 100) < eps, "avg.r after 1st = 100");

    g.addPixel(200, 0, 0);
    assert.equal(g.getPixelCount(), 2, "count = 2");
    avg = g.getAverageColor();
    assert.ok(Math.abs(avg.r - 150) < eps, "avg.r after 2nd = 150");

    g.addPixel(0, 0, 0);
    assert.equal(g.getPixelCount(), 3, "count = 3");
    avg = g.getAverageColor();
    assert.ok(Math.abs(avg.r - 100) < eps, "avg.r after 3rd = 100");
});

QUnit.module("colorAnalyzer tests");

QUnit.test("getTopColors - all-red image", function(assert) {
    // 4 red pixels: RGBA = [255,0,0,255] each
    let data = new Uint8ClampedArray([
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255
    ]);
    let imageData = {
        data: data,
        width: 2,
        height: 2
    };
    let colors = wpd.colorAnalyzer.getTopColors(imageData);
    assert.ok(colors.length >= 1, "at least one color group");
    assert.equal(colors[0].r, 255, "top color is red (r=255)");
    assert.equal(colors[0].g, 0, "top color is red (g=0)");
    assert.equal(colors[0].b, 0, "top color is red (b=0)");
    assert.equal(colors[0].pixels, 4, "4 pixels in top group");
});

QUnit.test("getTopColors - two distinct color groups, sorted by count", function(assert) {
    // 3 red pixels + 1 blue pixel; red should sort first
    let data = new Uint8ClampedArray([
        255, 0, 0, 255, // red
        255, 0, 0, 255, // red
        255, 0, 0, 255, // red
        0, 0, 255, 255 // blue
    ]);
    let imageData = {
        data: data,
        width: 2,
        height: 2
    };
    let colors = wpd.colorAnalyzer.getTopColors(imageData);
    assert.ok(colors.length >= 2, "at least two color groups");
    assert.ok(colors[0].pixels >= colors[1].pixels, "sorted by descending pixel count");
    assert.equal(colors[0].pixels, 3, "dominant group has 3 pixels");
});

QUnit.test("getTopColors - transparent pixels treated as white", function(assert) {
    // 2 transparent pixels (a=0) should count as white (255,255,255)
    let data = new Uint8ClampedArray([
        0, 0, 0, 0, // transparent → treated as white
        0, 0, 0, 0 // transparent → treated as white
    ]);
    let imageData = {
        data: data,
        width: 1,
        height: 2
    };
    let colors = wpd.colorAnalyzer.getTopColors(imageData);
    assert.ok(colors.length >= 1, "at least one group");
    assert.equal(colors[0].r, 255, "transparent → white r=255");
    assert.equal(colors[0].g, 255, "transparent → white g=255");
    assert.equal(colors[0].b, 255, "transparent → white b=255");
});
