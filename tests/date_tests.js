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

QUnit.module("Date/Time parsing tests");
QUnit.test("Date format", function(assert) {
    // yyyy/mm
    let formatStr = wpd.dateConverter.getFormatString("2017/10");
    assert.equal(formatStr, "yyyy/mm", "yyyy/mm ok");

    // yyyy/mm/dd
    formatStr = wpd.dateConverter.getFormatString("2017/10/12");
    assert.equal(formatStr, "yyyy/mm/dd", "yyyy/mm/dd ok");

    // yyyy/mm/dd hh
    formatStr = wpd.dateConverter.getFormatString("2017/10/12 12");
    assert.equal(formatStr, "yyyy/mm/dd hh", "yyyy/mm/dd hh ok");

    // yyyy/mm/dd hh:ii
    formatStr = wpd.dateConverter.getFormatString("2017/10/12 12:10");
    assert.equal(formatStr, "yyyy/mm/dd hh:ii", "yyyy/mm/dd hh:ii ok");

    // yyyy/mm/dd hh:ii:ss
    formatStr = wpd.dateConverter.getFormatString("2017/10/12 12:10:45");
    assert.equal(formatStr, "yyyy/mm/dd hh:ii:ss", "yyyy/mm/dd hh:ii:ss ok");

    // yyyy/mm/dd hh:ii:ss.frac
    formatStr = wpd.dateConverter.getFormatString("2017/10/12 12:10:45.66");
    assert.equal(formatStr, "yyyy/mm/dd hh:ii:ss", "yyyy/mm/dd hh:ii:ss.frac ok");
});

QUnit.test("Date value", function(assert) {
    let val = wpd.dateConverter.parse("2017/10/12 5:11:55.41");

    let dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy");
    assert.equal(dateStr, "2017", "yyyy ok");

    dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy/mm");
    assert.equal(dateStr, "2017/10", "yyyy/mm ok");

    dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy/mm/dd");
    assert.equal(dateStr, "2017/10/12", "yyyy/mm/dd ok");

    dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy/mm/dd hh");
    assert.equal(dateStr, "2017/10/12 05", "yyyy/mm/dd hh ok");

    dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy/mm/dd hh:ii");
    assert.equal(dateStr, "2017/10/12 05:12", "yyyy/mm/dd hh:ii ok");

    dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy/mm/dd hh:ii:ss");
    assert.equal(dateStr, "2017/10/12 05:11:55", "yyyy/mm/dd hh:ii:ss ok");

    dateStr = wpd.dateConverter.formatDateNumber(val, "ss ii hh yyyy mm dd");
    assert.equal(dateStr, "55 11 05 2017 10 12", "ss ii hh yyyy mm dd ok");

    dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy/mmm/dd hh:ii:ss");
    assert.equal(dateStr, "2017/Oct/12 05:11:55", "yyyy/mmm/dd hh:ii:ss ok");

    dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy/mmmm/dd hh:ii:ss");
    assert.equal(dateStr, "2017/October/12 05:11:55", "yyyy/mmmm/dd hh:ii:ss ok");

    dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy/mmmm/dd hh:ii:ss.frac");
    assert.equal(dateStr, "2017/October/12 05:11:55.410", "yyyy/mmmm/dd hh:ii:ss.frac ok");
});

QUnit.test("Date input parser", function(assert) {
    let ip = new wpd.InputParser();
    ip.parse("2017/10/11 5:10:16");
    assert.equal(ip.isValid, true, "isValid with date ok");
    assert.equal(ip.isDate, true, "isDate with date ok");
    assert.equal(ip.formatting, "yyyy/mm/dd hh:ii:ss", "formatting with date ok");

    ip.parse("2017");
    assert.equal(ip.isValid, true, "isValid without date ok");
    assert.equal(ip.isDate, false, "isDate without date ok");
});

QUnit.test("Date array", function(assert) {
    let ip = new wpd.InputParser();
    ip.parse("[2010/1/1, 2011/1/1]");
    assert.equal(ip.isArray, true, "isArray ok");
    assert.equal(ip.isDate, true, "isDate ok");
});


QUnit.test("Parse array", function(assert) {
    let ip = new wpd.InputParser();
    let vals = ip.parse("[1, 2, 3]");
    assert.equal(ip.isArray, true, "isArray ok");
    assert.equal(ip.isDate, false, "isDate ok");
    assert.equal(vals[0], 1, "array value ok");
});

QUnit.test("Parse simple dates", function(assert) {
    // just year and month
    let val = wpd.dateConverter.parse("2023/1/1");
    let dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy");
    assert.equal(dateStr, "2023");

    dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy/mm");
    assert.equal(dateStr, "2023/01");

    dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy/mm/dd");
    assert.equal(dateStr, "2023/01/01");

    val = wpd.dateConverter.parse("2024/1");
    dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy/mm");
    assert.equal(dateStr, "2024/01");

    // with time
    val = wpd.dateConverter.parse("2022/12/31 12:10:5.5");
    dateStr = wpd.dateConverter.formatDateNumber(val, "yyyy/mm/dd hh");
    assert.equal(dateStr, "2022/12/31 12");

    dateStr = wpd.dateConverter.formatDateNumber(val, "hh");
    assert.equal(dateStr, "12");
});
