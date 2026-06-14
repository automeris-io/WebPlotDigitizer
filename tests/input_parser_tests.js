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

QUnit.module("InputParser tests");

QUnit.test("null input", function(assert) {
    let parser = new wpd.InputParser();
    let result = parser.parse(null);
    assert.equal(result, null, "null input → null");
    assert.false(parser.isValid, "isValid = false");
});

QUnit.test("string with ^ character", function(assert) {
    let parser = new wpd.InputParser();
    let result = parser.parse("2^3");
    assert.equal(result, null, "^ in string → null");
    assert.false(parser.isValid, "isValid = false");
});

QUnit.test("valid float string", function(assert) {
    const eps = 1e-10;
    let parser = new wpd.InputParser();
    let result = parser.parse("3.14");
    assert.ok(Math.abs(result - 3.14) < eps, "result ≈ 3.14");
    assert.true(parser.isValid, "isValid = true");
    assert.false(parser.isDate, "isDate = false");
    assert.false(parser.isArray, "isArray = false");
});

QUnit.test("integer string", function(assert) {
    let parser = new wpd.InputParser();
    let result = parser.parse("42");
    assert.equal(result, 42, "result = 42");
    assert.true(parser.isValid, "isValid = true");
    assert.false(parser.isDate, "isDate = false");
});

QUnit.test("negative float string", function(assert) {
    const eps = 1e-10;
    let parser = new wpd.InputParser();
    let result = parser.parse("-2.5");
    assert.ok(Math.abs(result - (-2.5)) < eps, "result = -2.5");
    assert.true(parser.isValid, "isValid = true");
});

QUnit.test("invalid non-numeric string", function(assert) {
    let parser = new wpd.InputParser();
    let result = parser.parse("abc");
    assert.equal(result, null, "non-numeric → null");
    assert.false(parser.isValid, "isValid = false");
});

QUnit.test("valid date string", function(assert) {
    let parser = new wpd.InputParser();
    let result = parser.parse("2023/01/15");
    assert.ok(result !== null, "date → non-null result");
    assert.true(parser.isValid, "isValid = true");
    assert.true(parser.isDate, "isDate = true");
    assert.ok(parser.formatting !== null, "formatting set");
});

QUnit.test("numeric array string", function(assert) {
    let parser = new wpd.InputParser();
    let result = parser.parse("[1.0, 2.5, 3.0]");
    assert.ok(Array.isArray(result), "result is array");
    assert.equal(result.length, 3, "array length = 3");
    assert.equal(result[0], 1.0, "result[0] = 1.0");
    assert.equal(result[1], 2.5, "result[1] = 2.5");
    assert.equal(result[2], 3.0, "result[2] = 3.0");
    assert.true(parser.isValid, "isValid = true");
    assert.true(parser.isArray, "isArray = true");
    assert.false(parser.isDate, "isDate = false for numeric array");
});

QUnit.test("date array string", function(assert) {
    let parser = new wpd.InputParser();
    let result = parser.parse("[2023/01/01, 2023/06/01]");
    assert.ok(Array.isArray(result), "result is array");
    assert.equal(result.length, 2, "array length = 2");
    assert.true(parser.isValid, "isValid = true");
    assert.true(parser.isArray, "isArray = true");
    assert.true(parser.isDate, "isDate = true for date array");
});

QUnit.test("empty array string", function(assert) {
    let parser = new wpd.InputParser();
    // "[]" has brackets but no valid float elements; filter removes NaN
    let result = parser.parse("[]");
    assert.equal(result, null, "empty array → null (no valid values)");
});

QUnit.test("whitespace trimming", function(assert) {
    const eps = 1e-10;
    let parser = new wpd.InputParser();
    let result = parser.parse("  3.14  ");
    assert.ok(Math.abs(result - 3.14) < eps, "whitespace trimmed, result ≈ 3.14");
    assert.true(parser.isValid, "isValid = true");
});
