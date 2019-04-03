QUnit.module("Date/Time Parsing Tests");
QUnit.test("Date Format", function(assert) {
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

QUnit.test("Date Value", function(assert) {
    let val = wpd.dateConverter.parse("2017/10/12 5:11:55.5");

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
});

QUnit.test("Date Input Parser", function(assert) {
    let ip = new wpd.InputParser();
    ip.parse("2017/10/11 5:10:16");
    assert.equal(ip.isValid, true, "isValid with date ok");
    assert.equal(ip.isDate, true, "isDate with date ok");
    assert.equal(ip.formatting, "yyyy/mm/dd hh:ii:ss", "formatting with date ok");

    ip.parse("2017");
    assert.equal(ip.isValid, true, "isValid without date ok");
    assert.equal(ip.isDate, false, "isDate without date ok");
});