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

QUnit.module("Image ops tests", {
    afterEach: () => {
        sinon.restore();
    }
});

// Capture the pixel operation passed to graphicsWidget.runImageOp so we can
// test it directly without a real canvas.
function captureOp(triggerFn) {
    let capturedOp;
    sinon.stub(wpd.graphicsWidget, "runImageOp").callsFake((op) => {
        capturedOp = op;
    });
    triggerFn();
    return capturedOp;
}

function makeImageData(pixels) {
    return { data: new Uint8ClampedArray(pixels) };
}

QUnit.test("hflip: 2×1 image swaps left and right pixels", (assert) => {
    const op = captureOp(() => wpd.imageOps.hflip());
    // Red pixel at col 0, Blue pixel at col 1
    const imgData = makeImageData([255, 0, 0, 255, 0, 0, 255, 255]);
    const result = op(imgData, 2, 1);
    // After hflip: col 0 should be blue, col 1 should be red
    assert.equal(result.imageData.data[0], 0, "col 0 R is now 0 (was blue)");
    assert.equal(result.imageData.data[2], 255, "col 0 B is now 255");
    assert.equal(result.imageData.data[4], 255, "col 1 R is now 255 (was red)");
    assert.equal(result.imageData.data[6], 0, "col 1 B is now 0");
});

QUnit.test("hflip: 1×1 image is unchanged", (assert) => {
    const op = captureOp(() => wpd.imageOps.hflip());
    const imgData = makeImageData([128, 64, 32, 255]);
    const result = op(imgData, 1, 1);
    assert.equal(result.imageData.data[0], 128, "R unchanged");
    assert.equal(result.imageData.data[1], 64, "G unchanged");
    assert.equal(result.imageData.data[2], 32, "B unchanged");
});

QUnit.test("hflip: returns correct dimensions", (assert) => {
    const op = captureOp(() => wpd.imageOps.hflip());
    const result = op(makeImageData([0, 0, 0, 255, 0, 0, 0, 255]), 2, 1);
    assert.equal(result.width, 2, "width preserved");
    assert.equal(result.height, 1, "height preserved");
});

QUnit.test("vflip: returns correct dimensions", (assert) => {
    const op = captureOp(() => wpd.imageOps.vflip());
    const result = op(makeImageData([0, 0, 0, 255, 0, 0, 0, 255]), 1, 2);
    assert.equal(result.width, 1, "width preserved");
    assert.equal(result.height, 2, "height preserved");
});

QUnit.test("vflip: 1×1 image returns correct dimensions", (assert) => {
    const op = captureOp(() => wpd.imageOps.vflip());
    const result = op(makeImageData([100, 150, 200, 255]), 1, 1);
    assert.equal(result.width, 1, "width preserved");
    assert.equal(result.height, 1, "height preserved");
});
