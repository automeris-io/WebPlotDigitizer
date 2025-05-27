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

/* Parse dates and convert back and forth to Julian days */
var wpd = wpd || {};

wpd.dateConverter = (function() {
    function parse(input) {
        if (input == null) {
            return null;
        }

        if (typeof input === "string") {
            if (input.indexOf('/') < 0 && input.indexOf(':') < 0) {
                return null;
            }
        }

        return toJD(input);
    }

    function toJD(dateString) {
        dateString = dateString.toString();
        var dateParts = dateString.split(/[/ :]/),
            hasDatePart = dateString.indexOf('/') >= 0,
            year,
            month, date, hour, min, sec, msec, timeIdxOffset, today, tempDate, rtnValue;

        if (dateParts.length <= 0 || dateParts.length > 6) {
            return null;
        }

        if (hasDatePart) {
            year = parseInt(dateParts[0], 10);
            month = parseInt(dateParts[1] === undefined ? 0 : dateParts[1], 10);
            date = parseInt(dateParts[2] === undefined ? 1 : dateParts[2], 10);
            timeIdxOffset = 3;
        } else {
            today = new Date();
            year = today.getFullYear();
            month = today.getMonth() + 1;
            date = today.getDate();
            timeIdxOffset = 0;
        }
        hour = parseInt(dateParts[timeIdxOffset] === undefined ? 0 : dateParts[timeIdxOffset], 10);
        min = parseInt(
            dateParts[timeIdxOffset + 1] === undefined ? 0 : dateParts[timeIdxOffset + 1], 10);

        let hasSec = (dateParts[timeIdxOffset + 2] != undefined);
        if (hasSec) {
            let fval = parseFloat(dateParts[timeIdxOffset + 2]);
            sec = parseInt(fval, 10);
            if (fval - sec >= 0.001 && dateParts[timeIdxOffset + 2].indexOf('.') >= 0) {
                msec = parseInt(parseFloat('.' + dateParts[timeIdxOffset + 2].split(".")[1]) * 1000, 10);
            } else {
                msec = 0;
            }
        } else {
            sec = 0;
            msec = 0;
        }

        if (isNaN(year) || isNaN(month) || isNaN(date) || isNaN(hour) || isNaN(min) || isNaN(sec)) {
            return null;
        }

        if (month > 12 || month < 1) {
            return null;
        }

        if (date > 31 || date < 1) {
            return null;
        }

        if (hour > 23 || hour < 0) {
            return null;
        }

        if (min > 59 || min < 0) {
            return null;
        }

        if (sec > 59 || sec < 0) {
            return null;
        }

        if (msec > 1000 || msec < 0) {
            return null;
        }

        // Temporary till I figure out julian dates:
        tempDate = new Date();
        tempDate.setUTCFullYear(year);
        tempDate.setUTCMonth(month - 1);
        tempDate.setUTCDate(date);
        tempDate.setUTCHours(hour, min, sec, msec);
        rtnValue = parseFloat(tempDate.getTime());
        if (!isNaN(rtnValue)) {
            return rtnValue;
        }
        return null;
    }

    function formatDateNumber(dateNumber, formatString) {
        // round to smallest time unit
        var coeff = 1;

        if (formatString.indexOf('frac') >= 0)
            coeff = 1.0;
        else if (formatString.indexOf('s') >= 0)
            coeff = 1000;
        else if (formatString.indexOf('i') >= 0)
            coeff = 1000 * 60;
        else if (formatString.indexOf('h') >= 0)
            coeff = 1000 * 60 * 60;
        else if (formatString.indexOf('d') >= 0)
            coeff = 1000 * 60 * 60 * 24;
        else if (formatString.indexOf('m') >= 0)
            coeff = 1.0;
        else if (formatString.indexOf('y') >= 0)
            coeff = 1.0;

        return formatDate(new Date(Math.round(new Date(dateNumber).getTime() / coeff) * coeff),
            formatString);
    }

    function formatDate(dateObject, formatString) {

        var longMonths = [],
            shortMonths = [],
            tmpDate = new Date('1/1/2021');

        for (var i = 0; i < 12; i++) {
            tmpDate.setUTCMonth(i);
            longMonths.push(tmpDate.toLocaleString(undefined, {
                month: "long"
            }));
            shortMonths.push(tmpDate.toLocaleString(undefined, {
                month: "short"
            }));
        }

        var outputString = formatString;

        outputString = outputString.replace("YYYY", "yyyy");
        outputString = outputString.replace("YY", "yy");
        outputString = outputString.replace("MMMM", "mmmm");
        outputString = outputString.replace("MMM", "mmm");
        outputString = outputString.replace("MM", "mm");
        outputString = outputString.replace("DD", "dd");
        outputString = outputString.replace("HH", "hh");
        outputString = outputString.replace("II", "ii");
        outputString = outputString.replace("SS", "ss");
        outputString = outputString.replace(".FRAC", ".frac");

        outputString = outputString.replace("yyyy", dateObject.getUTCFullYear());

        var twoDigitYear = dateObject.getUTCFullYear() % 100;
        twoDigitYear = twoDigitYear < 10 ? '0' + twoDigitYear : twoDigitYear;

        outputString = outputString.replace("yy", twoDigitYear);

        outputString = outputString.replace("mmmm", longMonths[dateObject.getUTCMonth()]);
        outputString = outputString.replace("mmm", shortMonths[dateObject.getUTCMonth()]);
        outputString = outputString.replace("mm", ("0" + (dateObject.getUTCMonth() + 1)).slice(-2));
        outputString = outputString.replace("dd", ("0" + dateObject.getUTCDate()).slice(-2));

        outputString = outputString.replace("hh", ("0" + dateObject.getUTCHours()).slice(-2));
        outputString = outputString.replace("ii", ("0" + dateObject.getUTCMinutes()).slice(-2));
        let secStr = ("0" + dateObject.getUTCSeconds()).slice(-2);
        let milliStr = ("00" + dateObject.getUTCMilliseconds()).slice(-3);
        outputString = outputString.replace("ss.frac", secStr + "." + milliStr);
        outputString = outputString.replace("ss", secStr);

        return outputString;
    }

    function getFormatString(dateString) {
        var dateParts = dateString.split(/[/ :]/),
            hasDatePart = dateString.indexOf('/') >= 0,
            formatString = 'yyyy/mm/dd hh:ii:ss';

        if (dateParts.length >= 1) {
            formatString = hasDatePart ? 'yyyy' : 'hh';
        }

        if (dateParts.length >= 2) {
            formatString += hasDatePart ? '/mm' : ':ii';
        }

        if (dateParts.length >= 3) {
            formatString += hasDatePart ? '/dd' : ':ss';
        }

        if (dateParts.length >= 4) {
            formatString += ' hh';
        }

        if (dateParts.length >= 5) {
            formatString += ':ii';
        }

        if (dateParts.length === 6) {
            formatString += ':ss';
        }

        return formatString;
    }

    return {
        parse: parse,
        getFormatString: getFormatString,
        formatDateNumber: formatDateNumber
    };
})();
