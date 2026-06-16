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

QUnit.module("Color picker tool tests", {
    afterEach: () => {
        sinon.restore();
    }
});

function makeToolWithPixel(rgba) {
    const fakeCtx = {
        oriImageCtx: {
            getImageData: sinon.stub().returns({ data: rgba })
        }
    };
    sinon.stub(wpd.graphicsWidget, "getAllContexts").returns(fakeCtx);
    const tool = new wpd.ColorPickerTool();
    const completeSpy = sinon.spy(tool, "onComplete");
    tool.onMouseClick({}, {}, { x: 10, y: 20 });
    return completeSpy;
}

QUnit.test("Normal pixel: onComplete receives RGB without alpha", (assert) => {
    const spy = makeToolWithPixel([128, 64, 32, 255]);
    assert.true(spy.calledOnce, "onComplete called");
    assert.deepEqual(spy.firstCall.args[0], [128, 64, 32], "RGB passed, alpha excluded");
});

QUnit.test("Transparent pixel: onComplete receives white [255, 255, 255]", (assert) => {
    const spy = makeToolWithPixel([100, 100, 100, 0]);
    assert.true(spy.calledOnce, "onComplete called");
    assert.deepEqual(spy.firstCall.args[0], [255, 255, 255], "transparent maps to white");
});

QUnit.test("Result always has length 3 (no alpha channel)", (assert) => {
    const spy = makeToolWithPixel([10, 20, 30, 200]);
    assert.equal(spy.firstCall.args[0].length, 3, "result has exactly 3 components");
});
