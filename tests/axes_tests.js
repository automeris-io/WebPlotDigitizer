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

QUnit.module("Misc Axes tests");
QUnit.test("Get/Set axes metadata", (assert) => {
    const expected = {
        hello: "there"
    };

    // bar
    const barAxes = new wpd.BarAxes();
    barAxes.setMetadata(expected);
    assert.deepEqual(barAxes.getMetadata(), expected, "Get/Set bar axes metadata");

    // image
    const imageAxes = new wpd.ImageAxes();
    imageAxes.setMetadata(expected);
    assert.deepEqual(imageAxes.getMetadata(), expected, "Get/Set image axes metadata");

    // map
    const mapAxes = new wpd.MapAxes();
    mapAxes.setMetadata(expected);
    assert.deepEqual(mapAxes.getMetadata(), expected, "Get/Set map axes metadata");

    // polar
    const polarAxes = new wpd.PolarAxes();
    polarAxes.setMetadata(expected);
    assert.deepEqual(polarAxes.getMetadata(), expected, "Get/Set polar axes metadata");

    // ternary
    const ternaryAxes = new wpd.TernaryAxes();
    ternaryAxes.setMetadata(expected);
    assert.deepEqual(ternaryAxes.getMetadata(), expected, "Get/Set ternary axes metadata");

    // xy
    const xyAxes = new wpd.XYAxes();
    xyAxes.setMetadata(expected);
    assert.deepEqual(xyAxes.getMetadata(), expected, "Get/Set XY axes metadata");
});
