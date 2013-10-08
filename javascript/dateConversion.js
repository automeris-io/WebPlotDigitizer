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
				return 0;
			},

	// Convert back from Julian Date
	fromJD: function(jd) {
				return {
					year: 0,
					month: 0,
					day: 0
				};
			},

	formatDate: function(dateObject, formatString) {
				return dateObject.year + "/" + dateObject.month + "/" + dateObject.date;
			}
};
