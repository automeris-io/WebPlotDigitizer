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

QUnit.module("Calibrator metadata contract tests");

const ALL_CALIBRATORS = [
    wpd.XYAxesCalibrator,
    wpd.BarAxesCalibrator,
    wpd.PolarAxesCalibrator,
    wpd.TernaryAxesCalibrator,
    wpd.MapAxesCalibrator,
    wpd.CircularChartRecorderCalibrator,
];

QUnit.test("Every calibrator has a non-empty typeString", (assert) => {
    for (const C of ALL_CALIBRATORS) {
        assert.ok(typeof C.typeString === "string" && C.typeString.length > 0,
            `${C.name} has typeString`);
    }
});

QUnit.test("Every calibrator has an axesClass that is a function", (assert) => {
    for (const C of ALL_CALIBRATORS) {
        assert.equal(typeof C.axesClass, "function", `${C.name} axesClass is a constructor`);
    }
});

QUnit.test("calibrationSpec: maxPointCount is positive and labels length matches", (assert) => {
    for (const C of ALL_CALIBRATORS) {
        const spec = C.calibrationSpec;
        assert.ok(spec.maxPointCount > 0, `${C.name} maxPointCount > 0`);
        assert.equal(spec.labels.length, spec.maxPointCount,
            `${C.name} labels.length matches maxPointCount`);
        assert.equal(spec.labelPositions.length, spec.maxPointCount,
            `${C.name} labelPositions.length matches maxPointCount`);
    }
});

QUnit.test("Every calibrator instance has a non-empty calibrateButtonId", (assert) => {
    for (const C of ALL_CALIBRATORS) {
        const instance = new C(new wpd.Calibration(2));
        assert.ok(typeof instance.calibrateButtonId === "string" &&
            instance.calibrateButtonId.length > 0,
            `${C.name} instance has calibrateButtonId`);
    }
});
