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

/* Parse user provided expressions, dates etc. */

var InputParser = function () {
	var self = this;

	self.parse = function(input) {
		
		self.isValid = false;
		self.isDate = false;

		if (input == null) {
			return null;
		}

		input = input.trim();

		if (input.indexOf("^") !== -1) {
			return null;
		}

		var parsedDate = dateConverter.parse(input);
		if(parsedDate !== null) {
			self.isValid = true;
			self.isDate = true;
			return parsedDate;
		}

		var parsedFloat = parseFloat(input);
		if(!isNaN(parsedFloat)) {
			self.isValid = true;
			return parsedFloat;
		}

		return null;
	};

	self.isValid = false;

	self.isDate = false;
};
