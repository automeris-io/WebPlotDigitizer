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

// Build a Set of pixel indices for a W×H image where pixel (x, y) is at index y*W + x.
function makePixelSet(pixels, width) {
    let s = new Set();
    pixels.forEach(([x, y]) => s.add(y * width + x));
    return s;
}

QUnit.module("AveragingWindowCore tests");

QUnit.test("single pixel - returns one point at pixel center", function(assert) {
    const eps = 1e-10;
    let W = 10,
        H = 10;
    let binaryData = makePixelSet([
        [5, 3]
    ], W);
    let ds = new wpd.Dataset();
    let core = new wpd.AveragingWindowCore(binaryData, H, W, 0.4, 0.4, ds);
    core.run();
    assert.equal(ds.getCount(), 1, "one output point for one input pixel");
    let pt = ds.getPixel(0);
    assert.ok(Math.abs(pt.x - 5.5) < eps, "x = 5.5 (pixel center)");
    assert.ok(Math.abs(pt.y - 3.5) < eps, "y = 3.5 (pixel center)");
});

QUnit.test("empty binary data - no output points", function(assert) {
    let W = 10,
        H = 10;
    let binaryData = new Set();
    let ds = new wpd.Dataset();
    let core = new wpd.AveragingWindowCore(binaryData, H, W, 2, 2, ds);
    core.run();
    assert.equal(ds.getCount(), 0, "empty input → empty output");
});

QUnit.test("single horizontal line - dx < column spacing keeps separate points", function(assert) {
    const eps = 1e-6;
    // 5×3 image. Row y=1 (all 5 columns). dx=0.4, dy=0.4 → no merging across columns.
    let W = 5,
        H = 3;
    let pixels = [];
    for (let x = 0; x < W; x++) pixels.push([x, 1]);
    let binaryData = makePixelSet(pixels, W);
    let ds = new wpd.Dataset();
    let core = new wpd.AveragingWindowCore(binaryData, H, W, 0.4, 0.4, ds);
    core.run();
    assert.equal(ds.getCount(), W, `${W} columns → ${W} output points`);
    // All y-values should be at y=1.5 (pixel center)
    for (let i = 0; i < ds.getCount(); i++) {
        let pt = ds.getPixel(i);
        assert.ok(Math.abs(pt.y - 1.5) < eps, `point ${i} y ≈ 1.5`);
    }
});

QUnit.test("two parallel horizontal lines - distinct y values per column", function(assert) {
    const eps = 1e-6;
    // 4×5 image. Rows y=1 and y=3. dx=0.4, dy=0.4.
    // Each column gets 2 blobs → 8 points total.
    let W = 4,
        H = 5;
    let pixels = [];
    for (let x = 0; x < W; x++) {
        pixels.push([x, 1]);
        pixels.push([x, 3]);
    }
    let binaryData = makePixelSet(pixels, W);
    let ds = new wpd.Dataset();
    let core = new wpd.AveragingWindowCore(binaryData, H, W, 0.4, 0.4, ds);
    core.run();
    assert.equal(ds.getCount(), 2 * W, "2 rows × 4 cols = 8 points");

    // Collect unique y-values: should contain 1.5 and 3.5
    let ys = new Set();
    for (let i = 0; i < ds.getCount(); i++) {
        ys.add(Math.round(ds.getPixel(i).y * 10) / 10);
    }
    assert.true(ys.has(1.5), "y=1.5 present (row 1 centers)");
    assert.true(ys.has(3.5), "y=3.5 present (row 3 centers)");
});

QUnit.test("large dx merges adjacent column points", function(assert) {
    // 6×3 image, row y=1, all 6 columns. dx=5 means xStep=5.
    // Starting from x=0.5, all points within |newX - 0.5| ≤ 5 and within inRange cutoff
    // get merged into fewer output points.
    let W = 6,
        H = 3;
    let pixels = [];
    for (let x = 0; x < W; x++) pixels.push([x, 1]);
    let binaryData = makePixelSet(pixels, W);
    let ds = new wpd.Dataset();
    let core = new wpd.AveragingWindowCore(binaryData, H, W, 5, 5, ds);
    core.run();
    // With dx=5, many points get merged; output count should be less than W
    assert.ok(ds.getCount() < W, `merged output (${ds.getCount()}) < ${W} input columns`);
});

QUnit.test("dataset is cleared before run", function(assert) {
    let W = 5,
        H = 3;
    let ds = new wpd.Dataset();
    // Pre-populate the dataset with a stale point
    ds.addPixel(999, 999);
    assert.equal(ds.getCount(), 1, "stale point exists before run");

    let binaryData = makePixelSet([
        [2, 1]
    ], W);
    let core = new wpd.AveragingWindowCore(binaryData, H, W, 0.4, 0.4, ds);
    core.run();
    assert.equal(ds.getCount(), 1, "stale point cleared; only new point present");
    let pt = ds.getPixel(0);
    assert.ok(Math.abs(pt.x - 2.5) < 1e-10, "new point is at x=2.5");
});
