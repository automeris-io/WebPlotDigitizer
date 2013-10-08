/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

/* Parse dates and convert back and forth to Julian days */

var dateConverter = {
	
	parse: function(input) {
				if(input == null) {
					return null;
				}

				if(input.indexOf("/") === -1) {
					return null;
				}

				return this.toJD(input);
			},

	// Convert to Julian Date
	toJD: function(dateString) {
				var dateParts = dateString.split("/"),
					year,
					month,
					day,
					tempDate,
					rtnValue;

				if(dateParts.length <= 0 || dateParts.length > 3) {
					return null;
				}

				year = parseInt(dateParts[0], 10);

				month = parseInt(dateParts[1] === undefined ? 0 : dateParts[1], 10);

				day = parseInt(dateParts[2] === undefined ? 1 : dateParts[2], 10);

				if(isNaN(year) || isNaN(month) || isNaN(day)) {
					return null;
				}

				if(month > 12 || month < 1) {
					return null;
				}

				if(day > 31 || day < 1) {
					return null;
				}

				// Temporary till I figure out julian dates:
				tempDate = new Date();
				tempDate.setUTCFullYear(year);
				tempDate.setUTCMonth(month-1);
				tempDate.setUTCDate(day);
				rtnValue = parseFloat(Date.parse(tempDate));
				if(!isNaN(rtnValue)) {
					return rtnValue;
				}
				return null;
			},

	// Convert back from Julian Date
	fromJD: function(jd) {

				// Temporary till I figure out julian dates:
				var msInDay = 24*60*60*1000,
					roundedDate = Math.round(jd/msInDay)*msInDay,
					tempDate = new Date(Date.parse(jd));

				return {
					year: tempDate.getUTCFullYear(),
					month: tempDate.getUTCMonth(),
					day: tempDate.getUTCDate()
				};
			},

	formatDate: function(dateObject, formatString) {
				var longMonths = [
									"January", 
									"February", 
									"March", 
									"April", 
									"May", 
									"June", 
									"July", 
									"August", 
									"September",
									"October",
									"November",
									"December"
								],
					shortMonths = [
									"Jan",
									"Feb",
									"Mar",
									"Apr",
									"May",
									"Jun",
									"Jul",
									"Aug",
									"Sep",
									"Oct",
									"Nov",
									"Dec"
								];

				return dateObject.year + "/" + dateObject.month + "/" + dateObject.date;
			},

	getFormatString: function(dateString) {
				var dateParts = dateString.split("/"),
					year,
					month,
					day,
					formatString = 'yyyy/mm/dd';
				
				if(dateParts.length >= 1) {
					formatString = 'yyyy';
				}

				if(dateParts.length >= 2) {
					formatString += '/mm';
				}

				if(dateParts.length === 3) {
					formatString += '/dd';
				}

				return formatString;
			}
};
