/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

var wpd = wpd || {};

wpd.initApp = function() {// This is run when the page loads.

	wpd.browserInfo.checkBrowser();
    wpd.layoutManager.initialLayout();
    wpd.graphicsWidget.loadImageFromURL('start.png');
	document.getElementById('loadingCurtain').style.display = 'none';

}

document.addEventListener("DOMContentLoaded", wpd.initApp, true);

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.detectionAlgoManager = (function () {
    var activeAlgorithm = null;

    function setActiveAlgo(algo) {
    };

    function getActiveAlgo() {
        return activeAlgorithm;
    };

    function getAllApplicableAlgorithms() {
        // algorithms applicable to the current axes type
    };

    return {
        setActiveAlgo: setActiveAlgo,
        getActiveAlgo: getActiveAlgo,
        getAllApplicableAlgorithms: getAllApplicableAlgorithms
    };
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};
// maintain and manage current state of the application
wpd.appData = (function () {
    var isAligned = false,
        plotData;

    function reset() {
        isAligned = false;
        plotData = null
    }

    function getPlotData() {
        if(plotData == null) {
            plotData = new wpd.PlotData();
        }
        return plotData;
    }

    function isAlignedFn(is_aligned) {
        if(is_aligned != null) {
            isAligned = is_aligned;
        }
        return isAligned;
    }

    return {
        isAligned: isAlignedFn,
        getPlotData: getPlotData,
        reset: reset
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.AutoDetector = (function () {
    var obj = function () {
        this.fgColor = [0, 0, 200];
        this.bgColor = [255, 255, 255];
        this.mask = null;
        this.colorDetectionMode = 'fg';
        this.colorDistance = 120;
        this.algorithm = null;
        this.binaryData = null;
        this.imageData = null;
        this.imageWidth = 0;
        this.imageHeight = 0;

        this.generateBinaryData = function() {

            if(this.mask == null || this.mask.length === 0) {
                return;
            }

            this.binaryData = [];
            var maski, img_index, dist, 
                ref_color = this.colorDetectionMode === 'fg' ? this.fgColor : this.bgColor;

            for(maski = 0; maski < this.mask.length; maski++) {
                img_index = this.mask[maski];
                dist = Math.sqrt( (this.imageData.data[img_index*4] - ref_color[0])*(this.imageData.data[img_index*4] - ref_color[0]) + 
                    (this.imageData.data[img_index*4+1] - ref_color[1])*(this.imageData.data[img_index*4+1] - ref_color[1]) + 
                    (this.imageData.data[img_index*4+2] - ref_color[2])*(this.imageData.data[img_index*4+2] - ref_color[2]));

                if(this.colorDetectionMode === 'fg') {
                    if(dist <= this.colorDistance) {
                        this.binaryData[img_index] = true;
                    }
                } else {
                    if(dist >= this.colorDistance) {
                        this.binaryData[img_index] = true;
                    }
                }
            }
        };
    };
    return obj;
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.dataEventNames = {
    axesAligned: 'axesAligned',
    imageLoaded: 'imageLoaded'
};

wpd.dataEventManager = (function () {

    var evtMap = {};

    function fireEvent(name, data) {
    }

    function subscribe(name, method) {
    }

    function unsubscribe(name, method) {
    }

    function removeAllSubscriptionsForEvent(name) {
    }

    return {
        fireEvent: fireEvent,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        removeAllSubscriptionsForEvent: removeAllSubscriptionsForEvent
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

var wpd = wpd || {};

// calibration info
wpd.Calibration = (function () {

    var Calib = function(dim) {
        // Pixel information
        var px = [],
            py = [],

            // Data information
            dimensions = dim == null ? 2 : dim,
            dp = [],
            selections = [];

        this.labels = [];

        this.getCount = function () { return px.length; };
        this.getDimensions = function() { return dimensions; };
        this.addPoint = function(pxi, pyi, dxi, dyi, dzi) {
            var plen = px.length, dlen = dp.length;
            px[plen] = pxi;
            py[plen] = pyi;
            dp[dlen] = dxi; dp[dlen+1] = dyi;
            if(dimensions === 3) {
                dp[dlen+2] = dzi;
            }
        };

        this.getPoint = function(index) {
            if(index < 0 || index >= px.length) return null;

            return {
                px: px[index],
                py: py[index],
                dx: dp[dimensions*index],
                dy: dp[dimensions*index+1],
                dz: dimensions === 2 ? null : dp[dimensions*index + 2]
            };
        };

        this.changePointPx = function(index, npx, npy) {
            if(index < 0 || index >= px.length) {
                return;
            }
            px[index] = npx;
            py[index] = npy;
        };

        this.setDataAt = function(index, dxi, dyi, dzi) {
            if(index < 0 || index >= px.length) return;
            dp[dimensions*index] = dxi;
            dp[dimensions*index + 1] = dyi;
            if(dimensions === 3) {
                dp[dimensions*index + 2] = dzi;
            }
        };

        this.findNearestPoint = function(x, y, threshold) {
            threshold = (threshold == null) ? 50 : parseFloat(threshold);
            var minDist, minIndex = -1, 
                i, dist;
            for(i = 0; i < px.length; i++) {
                dist = Math.sqrt((x - px[i])*(x - px[i]) + (y - py[i])*(y - py[i]));
                if((minIndex < 0 && dist <= threshold) || (minIndex >= 0 && dist < minDist)) {
                    minIndex = i;
                    minDist = dist;
                }
            }
            return minIndex;
        };


        this.selectPoint = function(index) {
            if(selections.indexOf(index) < 0) {
                selections[selections.length] = index;
            }
        };

        this.selectNearestPoint = function (x, y, threshold) {
            var minIndex = this.findNearestPoint(x, y, threshold);
            if (minIndex >= 0) {
                this.selectPoint(minIndex);
            }
        };

        this.getSelectedPoints = function () {
            return selections;
        };

        this.unselectAll = function() {
            selections = [];
        };

        this.isPointSelected = function(index) {
            return selections.indexOf(index) >= 0;
        };

        this.dump = function() {
            console.log(px);
            console.log(py);
            console.log(dp);
        };
    };
    return Calib;
})();

// Data from a series
wpd.DataSeries = (function () {
    return function (dim) {
        var pixels = [], // flat array to store (x,y) pixel info.
            connections = [],
            selections = [];

        this.name = "Data Series";

        this.variableNames = ['x', 'y'];

        this.addPixel = function(pxi, pyi) {
            var plen = pixels.length;
            pixels[plen] = pxi;
            pixels[plen+1] = pyi;
        };

        this.getPixel = function(index) {
            return {
                x: pixels[2*index],
                y: pixels[2*index + 1]
            };
        };

        this.setPixelAt = function(index, pxi, pyi) {
            if(2*index < pixels.length) {
                pixels[2*index] = pxi;
                pixels[2*index + 1] = pyi;
            }
        };

        this.insertPixel = function(index, pxi, pyi) {
            pixels.splice(2*index, 0, pxi);
            pixels.splice(2*index + 1, 0, pyi); 
        };

        this.removePixelAtIndex = function(index) {
            if(2*index < pixels.length) {
                pixels.splice(2*index, 2);
            }
        };

        this.removeLastPixel = function() {
            var pIndex = pixels.length/2 - 1;
            this.removePixelAtIndex(pIndex);
        };

        this.findNearestPixel = function(x, y, threshold) {
            threshold = (threshold == null) ? 50 : parseFloat(threshold);
            var minDist, minIndex = -1, 
                i, dist;
            for(i = 0; i < pixels.length; i+= 2) {
                dist = Math.sqrt((x - pixels[i])*(x - pixels[i]) + (y - pixels[i+1])*(y - pixels[i+1]));
                if((minIndex < 0 && dist <= threshold) || (minIndex >= 0 && dist < minDist)) {
                    minIndex = i/2;
                    minDist = dist;
                }
            }
            return minIndex;
        };

        this.removeNearestPixel = function(x, y, threshold) {
            var minIndex = this.findNearestPixel(x, y, threshold);
            if(minIndex >= 0) {
                this.removePixelAtIndex(minIndex);
            }
        };

        this.clearAll = function() { pixels = []; };
        this.getCount = function() { return pixels.length/2; }
 
        this.selectPixel = function(index) {
            if(selections.indexOf(index) >= 0) {
                return;
            }
            selections[selections.length] = index;
        };

        this.unselectAll = function () {
            selections = [];
        };

        this.selectNearestPixel = function(x, y, threshold) {
            var minIndex = this.findNearestPixel(x, y, threshold);
            if(minIndex >= 0) {
                this.selectPixel(minIndex);
            }
        };

        this.getSelectedPixels = function () {
            return selections;
        };

    };
})();


// Plot information
wpd.PlotData = (function () {
    var PlotData = function() {

        var activeSeriesIndex = 0,
            autoDetector = new wpd.AutoDetector();

        this.axes = null;
        this.dataSeriesColl = [];

        this.angleMeasurementData = null;
        this.distanceMeasurementData = null;

        this.getActiveDataSeries = function() {
            if (this.dataSeriesColl[activeSeriesIndex] == null) {
                this.dataSeriesColl[activeSeriesIndex] = new wpd.DataSeries();
            }
            return this.dataSeriesColl[activeSeriesIndex];
        };

        this.getDataSeriesCount = function() {
            return this.dataSeriesColl.length;
        };

        this.setActiveDataSeriesIndex = function(index) {
            activeSeriesIndex = index;
        };

        this.getAutoDetector = function() {
            return autoDetector;
        };

        this.getDataFromActiveSeries = function() {
            if(this.dataSeriesColl[activeSeriesIndex] == null || this.axes == null) {
                return null;
            }
            var i, pt, ptData, rtnData = [], dimi;
            for(i = 0; i < this.dataSeriesColl[activeSeriesIndex].getCount(); i++) {
                pt = this.dataSeriesColl[activeSeriesIndex].getPixel(i);
                ptData = [];
                ptData = this.axes.pixelToData(pt.x, pt.y);
                rtnData[i] = [];
                for(dimi = 0; dimi < ptData.length; dimi++) {
                    rtnData[i][dimi] = ptData[dimi];
                }
            }
            return rtnData;
        };

        this.reset = function() {
            this.axes = null;
            this.angleMeasurementData = null;
            this.distanceMeasurementData = null;
            this.dataSeriesColl = [];
            activeSeriesIndex = 0;
            autoDetector = new wpd.AutoDetector();
        };
    };

    return PlotData;
})();


wpd.ConnectedPoints = (function () {
    var CPoints = function (connectivity) {

        var connections = [],
            selectedConnectionIndex = -1,
            selectedPointIndex = -1;

        this.addConnection = function (plist) {
            connections[connections.length] = plist;
        };

        this.clearAll = function () {
            connections = [];
        };

        this.getConnectionAt = function (index) {
            if(index < connections.length) {
                return connections[index];
            }   
        };

        this.replaceConnectionAt = function (index, plist) {
            if(index < connections.length) {
                connections[index] = plist;
            }
        };

        this.deleteConnectionAt = function (index) {
            if(index < connections.length) {
                connections.splice(index, 1);
            }
        };

        this.connectionCount = function () {
            return connections.length;
        };

        this.getDistance = function(index) {
            if(index < connections.length && connectivity === 2) {
                var dist = Math.sqrt((connections[index][0] - connections[index][2])*(connections[index][0] - connections[index][2])
                    + (connections[index][1] - connections[index][3])*(connections[index][1] - connections[index][3]));
                return dist; // this is in pixels!
            }
        };

        this.getAngle = function(index) {
            if(index < connections.length && connectivity === 3) {

                var ang1 = wpd.taninverse(-(connections[index][5] - connections[index][3]), connections[index][4] - connections[index][2]),
                    ang2 = wpd.taninverse(-(connections[index][1] - connections[index][3]), connections[index][0] - connections[index][2]),
                    ang = ang1 - ang2;

                ang = 180.0*ang/Math.PI;
                ang = ang < 0 ? ang + 360 : ang;
                return ang;
            }
        };

        this.findNearestPointAndConnection = function (x, y) {
            var minConnIndex = -1,
                minPointIndex = -1,
                minDist, dist,
                ci, pi;

            for (ci = 0; ci < connections.length; ci++) {
                for (pi = 0; pi < connectivity*2; pi+=2) {
                    dist = (connections[ci][pi] - x)*(connections[ci][pi] - x) + (connections[ci][pi+1] - y)*(connections[ci][pi+1] - y);
                    if (minPointIndex === -1 || dist < minDist) {
                        minConnIndex = ci;
                        minPointIndex = pi/2;
                        minDist = dist;
                    }
                }
            }

            return {
                connectionIndex: minConnIndex,
                pointIndex: minPointIndex
            }
        };

        this.selectNearestPoint = function (x, y) {
            var nearestPt = this.findNearestPointAndConnection(x, y);
            if (nearestPt.connectionIndex >= 0) {
                selectedConnectionIndex = nearestPt.connectionIndex;
                selectedPointIndex = nearestPt.pointIndex;
            }
        };

        this.deleteNearestConnection = function (x, y) {
            var nearestPt = this.findNearestPointAndConnection(x, y);
            if (nearestPt.connectionIndex >= 0) {
                this.deleteConnectionAt(nearestPt.connectionIndex);
            }
        };

        this.isPointSelected = function (connectionIndex, pointIndex) {
            if (selectedPointIndex === pointIndex && selectedConnectionIndex === connectionIndex) {
                return true;
            }
            return false;
        };

        this.getSelectedConnectionAndPoint = function () {
            return {
                connectionIndex: selectedConnectionIndex,
                pointIndex: selectedPointIndex
            };
        };

        this.unselectConnectionAndPoint = function () {
            selectedConnectionIndex = -1;
            selectedPointIndex = -1;
        };

        this.setPointAt = function (connectionIndex, pointIndex, x, y) {
            connections[connectionIndex][pointIndex*2] = x;
            connections[connectionIndex][pointIndex*2 + 1] = y;
        };

        this.getPointAt = function (connectionIndex, pointIndex) {
            return {
                x: connections[connectionIndex][pointIndex*2],
                y: connections[connectionIndex][pointIndex*2 + 1]
            };
        };
    };
    return CPoints;
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
var wpd = wpd || {};

wpd.dateConverter = (function () {

    function parse(input) {
        if(input == null) { return null; }

        if(input.indexOf('/') < 0) { return null; }

        return toJD(input);
    }

    function toJD(dateString) {
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

        date = parseInt(dateParts[2] === undefined ? 1 : dateParts[2], 10);

        if(isNaN(year) || isNaN(month) || isNaN(date)) {
            return null;
        }

        if(month > 12 || month < 1) {
            return null;
        }

        if(date > 31 || date < 1) {
            return null;
        }

        // Temporary till I figure out julian dates:
        tempDate = new Date();
        tempDate.setUTCFullYear(year);
        tempDate.setUTCMonth(month-1);
        tempDate.setUTCDate(date);
        rtnValue = parseFloat(Date.parse(tempDate));
        if(!isNaN(rtnValue)) {
            return rtnValue;
        }
        return null;
    }

    function fromJD(jd) {
        // Temporary till I figure out julian dates:
        jd = parseFloat(jd);
        var msInDay = 24*60*60*1000,
            roundedDate = parseInt(Math.round(jd/msInDay)*msInDay,10),
            tempDate = new Date(roundedDate);

        return tempDate;
    }
    
    function formatDateNumber(dateNumber, formatString) {
        return formatDate(fromJD(dateNumber), formatString);
    }

    function formatDate(dateObject, formatString) {
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
        
        var outputString = formatString;

        outputString = outputString.replace("YYYY", "yyyy");
        outputString = outputString.replace("YY", "yy");
        outputString = outputString.replace("MMMM", "mmmm");
        outputString = outputString.replace("MMM", "mmm");
        outputString = outputString.replace("MM", "mm");
        outputString = outputString.replace("DD", "dd");

        outputString = outputString.replace("yyyy", dateObject.getUTCFullYear());

        var twoDigitYear = dateObject.getUTCFullYear()%100;
        twoDigitYear = twoDigitYear < 10 ? '0' + twoDigitYear : twoDigitYear;

        outputString = outputString.replace("yy", twoDigitYear);

        outputString = outputString.replace("mmmm", longMonths[dateObject.getUTCMonth()]);
        outputString = outputString.replace("mmm", shortMonths[dateObject.getUTCMonth()]);
        outputString = outputString.replace("mm", (dateObject.getUTCMonth()+1));
        outputString = outputString.replace("dd", dateObject.getUTCDate());
				
		return outputString;
    }

    function getFormatString(dateString) {
    	var dateParts = dateString.split("/"),
            year,
            month,
            date,
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

    return {
        parse: parse,
        getFormatString: getFormatString,
        formatDate: formatDate,
        formatDateNumber: formatDateNumber
    };
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
var wpd = wpd || {};

wpd.InputParser = (function () {
    var Parser = function () {
        this.parse = function (input) {
            this.isValid = false;
            this.isDate = false;
            this.formatting = null;

            if(input == null) {
                return null;
            }

            input = input.trim();

            if(input.indexOf('^') >= 0) {
                return null;
            }

            var parsedDate = wpd.dateConverter.parse(input);
            if(parsedDate != null) {
                this.isValid = true;
                this.isDate = true;
                this.formatting = wpd.dateConverter.getFormatString(input);
                return parsedDate;
            }

            var parsedFloat = parseFloat(input);
            if(!isNaN(parsedFloat)) {
                this.isValid = true;
                return parsedFloat;
            }

            return null;
        };

        this.isValid = false;

        this.isDate = false;

        this.formatting = null;
    };
    return Parser;
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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


/** 
 * Calculate inverse tan with range between 0, 2*pi.
 */
var wpd = wpd || {};

wpd.taninverse = function(y,x) {
    var inv_ans;
    if (y>0) // I & II
    inv_ans = Math.atan2(y,x);
    else if (y<=0) // III & IV
    inv_ans = Math.atan2(y,x) + 2*Math.PI;

    if(inv_ans >= 2*Math.PI)
    inv_ans = 0.0;
    return inv_ans;
};
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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


var wpd = wpd || {};

wpd.AveragingWindowAlgo = (function () {

    var Algo = function () {

        var xStep = 5, yStep = 5;

        this.getParamList = function () {
			return [['ΔX','Px',5],['ΔY','Px',5]];
        };

        this.setParam = function (index, val) {
            if(index === 0) {
                xStep = val;
            } else if(index === 1) {
                yStep = val;
            }
        };

        this.run = function (plotData) {
            var autoDetector = plotData.getAutoDetector(),
                dataSeries = plotData.getActiveDataSeries(),
                xPoints = new Array(),
                xPointsPicked = 0,
                pointsPicked = 0,
                dw = autoDetector.imageWidth,
                dh = autoDetector.imageHeight,
                blobAvg = [],
                coli, rowi,
                firstbloby,
                bi,
                blobs,
                blbi,
                xi, yi,
                pi, inRange, xxi, oldX, oldY, avgX, avgY, newX, newY,
                matches;       


            dataSeries.clearAll();

			for(coli = 0; coli < dw; coli++) {

				blobs = -1;
				firstbloby = -2.0*yStep;
				bi = 0;
				   
				for(rowi = 0; rowi < dh; rowi++) {
					if (autoDetector.binaryData[rowi*dw + coli] === true)	{
					    if (rowi > firstbloby + yStep) {
						    blobs = blobs + 1;
						    bi = 1;
						    blobAvg[blobs] = rowi;
						    firstbloby = rowi;
					    } else {
						    bi = bi + 1;
					    	blobAvg[blobs] = parseFloat((blobAvg[blobs]*(bi-1.0) + rowi)/parseFloat(bi));
					    }
					}
				}
				
				if (blobs >= 0) {
					xi = coli;
					for (blbi = 0; blbi <= blobs; blbi++) {
					  yi = blobAvg[blbi];
					  
					  xPoints[xPointsPicked] = [];
					  xPoints[xPointsPicked][0] = parseFloat(xi);
					  xPoints[xPointsPicked][1] = parseFloat(yi);
					  xPoints[xPointsPicked][2] = true; // true if not filtered, false if processed already
					  xPointsPicked = xPointsPicked + 1;
					}
				}
				
			  }
			  
			  if (xPointsPicked === 0) {
                    return;
              }
			  
			  for(pi = 0; pi < xPointsPicked; pi++) {
				if(xPoints[pi][2] === true) {// if still available
				  inRange = true;
				  xxi = pi+1;
				  
				  oldX = xPoints[pi][0];
				  oldY = xPoints[pi][1];
				  
				  avgX = oldX;
				  avgY = oldY;
				  
				  matches = 1;
				  
				  while((inRange === true) && (xxi < xPointsPicked)) {
                    newX = xPoints[xxi][0];
					newY = xPoints[xxi][1];
				
					if( (Math.abs(newX-oldX) <= xStep) && (Math.abs(newY-oldY) <= yStep) && (xPoints[xxi][2] === true)) {
					    avgX = (avgX*matches + newX)/(matches+1.0);
					    avgY = (avgY*matches + newY)/(matches+1.0);
					    matches = matches + 1;
					    xPoints[xxi][2] = false;
					}

					if (newX > oldX + 2*xStep) {
					    inRange = false;
                    }
				
					xxi = xxi + 1;
				  }
				  
				  xPoints[pi][2] = false; 
				  
				  pointsPicked = pointsPicked + 1;

                  dataSeries.addPixel(parseFloat(avgX), parseFloat(avgY));

				}
				
			  }

			  xPoints = [];
        };
    };
    return Algo;
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var averagingWindowWithStepSizeAlgo = {
	getParamList: function () {
			if (plotType === 'XY') {
				return [["X_min","Units",axesAlignmentData[0].toString()],["ΔX Step","Units","0.1"],["X_max","Units",axesAlignmentData[1].toString()],["Y_min","Units",axesAlignmentData[2].toString()],["Y_max","Units",axesAlignmentData[3].toString()],["Line width","Px","30"]];
			} else {
				closePopup('testImageWindow');
				showPopup('xyAxesOnly');
				return [["X_min","Units", "0"],["ΔX Step","Units","0.1"],["X_max","Units", "0"],["Y_min","Units", "0"],["Y_max","Units", "0"],["Line width","Px","30"]];
			}
		},

	run: function () {

				// NOTE: This only works for XY Plot

				if(plotType === 'XY') {

					var xPointsPicked = 0;
					xyData = [];
					pointsPicked = 0;

			resetLayers();

			var dw = canvasWidth;
			var dh = canvasHeight;

			// Get values from UI:
			var param_xmin_el = document.getElementById("pv0");
			var param_delx_el = document.getElementById("pv1");
			var param_xmax_el = document.getElementById("pv2");
			var param_linewidth_el = document.getElementById("pv5");
			var param_ymin_el = document.getElementById("pv3");
			var param_ymax_el = document.getElementById("pv4");

			var param_xmin = parseFloat(param_xmin_el.value);
			var param_delx = parseFloat(param_delx_el.value);
			var param_xmax = parseFloat(param_xmax_el.value);
			var param_linewidth = parseFloat(param_linewidth_el.value);
			var param_ymin = parseFloat(param_ymin_el.value);
			var param_ymax = parseFloat(param_ymax_el.value);

			var blobx = [];
			var bloby = [];


			// Get corresponding pixels:
			for(var xi = param_xmin; xi <= param_xmax; xi += param_delx) {
				var xmin_pix, xmax_pix, ymin_pix, ymax_pix, dpix, r_unit_per_pix, step_pix = 1;

				dataToPixel(xi, param_ymin, 'XY');
				xmin_pix = dataToPixelxy[0];
				ymin_pix = dataToPixelxy[1];

				dataToPixel(xi, param_ymax, 'XY');
				xmax_pix = dataToPixelxy[0];
				ymax_pix = dataToPixelxy[1];

				dpix = Math.sqrt((ymax_pix-ymin_pix)*(ymax_pix-ymin_pix) + (xmax_pix-xmin_pix)*(xmax_pix-xmin_pix));

				r_unit_per_pix = (param_ymax-param_ymin)/dpix;

				var blobActive = false;
				var blobEntry = 0;
				var blobExit = 0;

				// To account for noise or if actual thickness is less than specified thickness.
				// This flag helps to set blobExit at the end of the thin part or account for noise.
				var blobExitLocked = false; 

				for(var ii = 0; ii <= dpix; ii++) {
					var yi = -ii*step_pix*r_unit_per_pix + param_ymax;
					dataToPixel(xi, yi, 'XY');

					xi_pix = dataToPixelxy[0];
					yi_pix = dataToPixelxy[1];

					if(xi_pix >= 0 && xi_pix < dw && yi_pix >=0 && yi_pix < dh)	{

						if(binaryData[parseInt(yi_pix, 10)][parseInt(xi_pix, 10)] === true)	{

							if(blobActive === false) {
								blobEntry = ii;
								blobExit = blobEntry;
								blobActive = true;
								blobExitLocked = false;
							}

							// Resume collection, it was just noise
							if(blobExitLocked === true) {
								blobExit = ii;
								blobExitLocked = false;
							}
						} else	{

							// collection ended before line thickness was hit. It could just be noise
							// or it could be the actual end.
							if(blobExitLocked === false) {
								blobExit = ii;
								blobExitLocked = true;
							}					
						}

						if(blobActive === true)	{

							if((ii > blobEntry + param_linewidth) || (ii == dpix-1)) {
								blobActive = false;

								if(blobEntry > blobExit) {
									blobExit = ii;							
								}

								var mean_ii = (blobEntry + blobExit)/2.0;
								var mean_yi = -mean_ii*step_pix*r_unit_per_pix + param_ymax;

								dataToPixel(xi, mean_yi, 'XY');
								xyData[pointsPicked] = new Array();
								xyData[pointsPicked][0] = parseFloat(dataToPixelxy[0]);
								xyData[pointsPicked][1] = parseFloat(dataToPixelxy[1]);
								pointsPicked = pointsPicked + 1;
							}
						}
					}

				}
			}
		} else {
			showPopup('xyAxesOnly');
		}
	}
};
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var blobDetectorAlgo = {
	getParamList: function() {
		return [["Min size","Px","0"],["Max size","Px","1000"]];
	  },
	run: function() {

			xyData = [];
			pointsPicked = 0;
			
			var minSize = document.getElementById('pv0').value;
			var maxSize = document.getElementById('pv1').value;
			
			var pixelVisited = []; // flag to determine whether a pixel was visited.
			
			// initialize to zero.
			for (var ri = 0; ri < canvasHeight; ri++) {
				pixelVisited[ri] = new Array();
				for(var ci = 0; ci < canvasWidth; ci++) {
					pixelVisited[ri][ci] = false;
				}
			}
			
			var objectCount = 0;            // number of objects.
			var objectArea = [];            // numbers of pixels in each obejct.
			var objectCentroidx = [];        // location of centroid of each object.
			var objectCentroidy = [];        // location of centroid of each object.
			var objectpx = [];          // list of pixels of each object.
			var objectpy = [];  
			var objectRange = [];    // span of the object in pixels.
			
			for (var rpi = 0; rpi < canvasHeight; rpi++) {
				for (var cpi = 0; cpi < canvasWidth; cpi++) {
					if((binaryData[rpi][cpi] === true) && (pixelVisited[rpi][cpi] === false)) {
						pixelVisited[rpi][cpi] = true;
						
						objectCount = objectCount + 1;
						objectArea[objectCount-1] = 1;
						
						objectpx[objectCount-1] = new Array();
						objectpy[objectCount-1] = new Array();
						
						objectpx[objectCount-1][0] = cpi;
						objectpy[objectCount-1][0] = rpi;
						
						objectCentroidx[objectCount-1] = cpi;
						objectCentroidy[objectCount-1] = rpi;
						
						var pxi = 1;
						var oi = 1;
						
						while (pxi <= oi) {
							ai = objectpy[objectCount-1][pxi-1];
							bi = objectpx[objectCount-1][pxi-1];
							
							for (var pp = -1; pp <= 1; pp++) {
								for (var qq = -1; qq <=1; qq++) {
									if (((ai+pp) >= 0) && ((bi+qq) >= 0) && ((ai+pp) < canvasHeight) && ((bi+qq) < canvasWidth)) {
										if ((binaryData[ai+pp][bi+qq] == true) && (pixelVisited[ai+pp][bi+qq] == false)) {
											objectArea[objectCount-1] = objectArea[objectCount-1] + 1;
											oi = objectArea[objectCount-1];
											objectpy[objectCount-1][oi-1] = ai+pp;
											objectpx[objectCount-1][oi-1] = bi+qq;
											
											objectCentroidy[objectCount-1] = (objectCentroidy[objectCount-1]*(oi-1) + (ai+pp))/oi;
											objectCentroidx[objectCount-1] = (objectCentroidx[objectCount-1]*(oi-1) + (bi+qq))/oi;
											
											pixelVisited[ai+pp][bi+qq] = true;
										}
									}
								}
							}
							
							pxi = pxi + 1;
						}
									   
						
						// Object is now fully captured. Get object range here.
						
									   
					}
					pixelVisited[rpi][cpi] = true;
				}
			}
			
			for (var obi = 0; obi < objectCount; obi++) {
				var sz = 2.0*Math.sqrt(objectArea[obi]/Math.PI);
				if ((sz>=minSize) && (sz<=maxSize)) {
					xyData[pointsPicked] = new Array();
					xyData[pointsPicked][0] = parseFloat(objectCentroidx[obi]);
					xyData[pointsPicked][1] = parseFloat(objectCentroidy[obi]);
					xyData[pointsPicked][2] = objectArea[obi];
					pointsPicked = pointsPicked + 1;
				}
			}
				 
		}
};
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var xStepAlgo = {

	getParamList: function () {
			return [["ΔX","Px","5"],["Line Width","Px","15"]];
		  },

	run: function() {
		  
		   var xPointsPicked = 0;
			  xyData = [];
			  pointsPicked = 0;
			  
			  resetLayers();
			  
			  var xStepEl = document.getElementById("pv0");
			  var xStep = parseFloat(xStepEl.value);
			  
			  var LineThicknessEl = document.getElementById("pv1");
			  var yStep = parseFloat(LineThicknessEl.value);
			  
			  var dw = canvasWidth;
			  var dh = canvasHeight;
			  
			  var blobAvg = new Array();
			  
			  var dx = 1;
			  var coli = 0;
			  
			  while (coli < dw) {
					blobs = -1;
					firstbloby = -2.0*yStep;
					bi = 0;
			
					for(var rowi = 0; rowi < dh; rowi++) {
						if (binaryData[rowi][coli] === true) {
							dx = xStep; // First contact has been made, start moving forward with xStep now.
							
							if (rowi > firstbloby + yStep) {
								blobs = blobs + 1;
								bi = 1;
								blobAvg[blobs] = rowi;
								firstbloby = rowi;
							} else {
								bi = bi + 1;
								blobAvg[blobs] = parseFloat((blobAvg[blobs]*(bi-1.0) + rowi)/parseFloat(bi));
							}
						}
						
					}
					
					if (blobs >= 0) {
						xi = coli;
						for (var blbi = 0; blbi <= blobs; blbi++) {
							  yi = blobAvg[blbi];
							  xyData[pointsPicked] = new Array();
							  xyData[pointsPicked][0] = parseFloat(xi);
							  xyData[pointsPicked][1] = parseFloat(yi);
							  pointsPicked = pointsPicked + 1;	
			 
						}
					}

					
					coli = coli + dx;
			  }
			 
		}
};

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
var yStepAlgo = {
	getParamList: function () {
		return [["ΔY","Px","5"],["Line Width","Px","15"]];
	  },
	  
	run: function() {
		  
		   var xPointsPicked = 0;
			  xyData = [];
			  pointsPicked = 0;
			  
			  resetLayers();
					
			  var yStepEl = document.getElementById("pv0");
			  var yStep = parseFloat(yStepEl.value);
			  
			  var LineThicknessEl = document.getElementById("pv1");
			  var xStep = parseFloat(LineThicknessEl.value);
			  
			  var dw = canvasWidth;
			  var dh = canvasHeight;
			  
			  var blobAvg = new Array();
			  
			  var dy = -1;
			  var rowi = dh-1;
			  
			  while (rowi >= 0) {
					blobs = -1;
					firstblobx = -2.0*xStep;
					bi = 0;
			
					for(var coli = 0; coli < dw; coli++) {
						if (binaryData[rowi][coli] === true) {
							dy = -yStep; // First contact has been made, start moving forward with xStep now.
							
							if (coli > firstblobx + xStep) {
								blobs = blobs + 1;
								bi = 1;
								blobAvg[blobs] = coli;
								firstblobx = coli;
							} else {
								bi = bi + 1;
								blobAvg[blobs] = parseFloat((blobAvg[blobs]*(bi-1.0) + coli)/parseFloat(bi));
							}
						}
						
					}
					
					if (blobs >= 0) {
						yi = rowi;
						for (var blbi = 0; blbi <= blobs; blbi++) {
							  xi = blobAvg[blbi];
							  xyData[pointsPicked] = new Array();
							  xyData[pointsPicked][0] = parseFloat(xi);
							  xyData[pointsPicked][1] = parseFloat(yi);
							  pointsPicked = pointsPicked + 1;	
			 
						}
					}

					
					rowi = rowi + dy;
			  }
			 
			 
		}
};

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

var wpd = wpd || {};

wpd.ImageAxes = (function () {
    var AxesObj = function () {

        this.isCalibrated = function() {
            return true;
        };

        this.calibrate = function () {
            return true;
        };

        this.pixelToData = function(pxi, pyi) {
            var data = [pxi, pyi];
            return data;
        };

        this.dataToPixel = function(x, y) {
            return {
                x: x,
                y: y
            };
        };

        this.pixelToLiveString = function (pxi, pyi) {
            var dataVal = this.pixelToData(pxi, pyi);
            return dataVal[0].toFixed(2) + ', ' + dataVal[1].toFixed(2);
        };
    };

    AxesObj.prototype.numCalibrationPointsRequired = function() {
        return 0;
    };

    AxesObj.prototype.getDimensions = function() {
        return 2;
    };

    AxesObj.prototype.getAxesLabels = function() {
        return ['X', 'Y'];
    };


    return AxesObj;
})();



/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

var wpd = wpd || {};

wpd.MapAxes = (function () {
    var AxesObj = function () {
        var isCalibrated = false,
            scaleLength,
            dist,
            processCalibration = function(cal, scale_length) {
                var cp0 = cal.getPoint(0),
                    cp1 = cal.getPoint(1);
                dist = Math.sqrt((cp0.px-cp1.px)*(cp0.px-cp1.px) + (cp0.py-cp1.py)*(cp0.py-cp1.py));
                scaleLength = parseFloat(scale_length);
                return true;
            };

        this.isCalibrated = function() {
            return isCalibrated;
        };

        this.calibrate = function (calib, scale_length) {
            isCalibrated = processCalibration(calib, scale_length);
            return isCalibrated;
        };

        this.pixelToData = function(pxi, pyi) {
            var data = [];
            data[0] = pxi*scaleLength/dist;
            data[1] = pyi*scaleLength/dist;
            return data;
        };

        this.dataToPixel = function(a, b, c) {
            return {
                x: 0,
                y: 0
            };
        };

        this.pixelToLiveString = function (pxi, pyi) {
            var dataVal = this.pixelToData(pxi, pyi);
            return dataVal[0].toExponential(4) + ', ' + dataVal[1].toExponential(4);
        };
    };

    AxesObj.prototype.numCalibrationPointsRequired = function() {
        return 2;
    };

    AxesObj.prototype.getDimensions = function() {
        return 2;
    };

    AxesObj.prototype.getAxesLabels = function() {
        return ['X', 'Y'];
    };

    return AxesObj;
})();


/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

var wpd = wpd || {};

wpd.PolarAxes = (function () {
    var AxesObj = function () {
        var isCalibrated = false,
            isDegrees = false,
            isClockwise = false,

            x0, y0, x1, y1, x2, y2, r1, theta1, r2, theta2,
            dist10, dist20, dist12, phi0, alpha0;

            processCalibration = function(cal, is_degrees, is_clockwise) {  
                var cp0 = cal.getPoint(0),
                    cp1 = cal.getPoint(1),
                    cp2 = cal.getPoint(2);
                x0 = cp0.px;
                y0 = cp0.py;
                x1 = cp1.px;
                y1 = cp1.py;
                x2 = cp2.px;
                y2 = cp2.py;

                r1 = cp1.dx;
                theta1 = cp1.dy;
                
                r2 = cp2.dx;
                theta2 = cp2.dy;

                isDegrees = is_degrees;
                isClockwise = is_clockwise;
                
                if (isDegrees === true) {// if degrees
    		        theta1 = (Math.PI/180.0)*theta1;
        			theta2 = (Math.PI/180.0)*theta2;
		        }
		    			    
		        // Distance between 1 and 0.
		        dist10 = Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0)); 
		    
		        // Distance between 2 and 0
		        dist20 = Math.sqrt((x2-x0)*(x2-x0) + (y2-y0)*(y2-y0)); 
		    
		        // Radial Distance between 1 and 2.
		        dist12 = dist20 - dist10;
		    
		        phi0 = wpd.taninverse(-(y1-y0),x1-x0);
		    
		        alpha0 = phi0 - theta1;
                
                return true;
            };

        this.isCalibrated = function() {
            return isCalibrated;
        };

        this.calibrate = function (calib, is_degrees, is_clockwise) {
            isCalibrated = processCalibration(calib, is_degrees, is_clockwise);
            return isCalibrated;
        };

        this.pixelToData = function(pxi, pyi) {
            var data = [],
                rp,
                thetap;

            xp = parseFloat(pxi);
            yp = parseFloat(pyi);

            rp = ((r2-r1)/dist12)*(Math.sqrt((xp-x0)*(xp-x0)+(yp-y0)*(yp-y0))-dist10) + r1;
			
			thetap = wpd.taninverse(-(yp-y0),xp-x0) - alpha0;
			
		    if(isDegrees == true) {
		        thetap = 180.0*thetap/Math.PI;
            }

            data[0] = rp;
            data[1] = thetap;

            return data;
        };

        this.dataToPixel = function(r, theta) {
            return {
                x: 0,
                y: 0
            };
        };

        this.pixelToLiveString = function (pxi, pyi) {
            var dataVal = this.pixelToData(pxi, pyi);
            return dataVal[0].toExponential(4) + ', ' + dataVal[1].toExponential(4);
        };
    };

    AxesObj.prototype.numCalibrationPointsRequired = function() {
        return 3;
    };

    AxesObj.prototype.getDimensions = function() {
        return 2;
    };    
    
    AxesObj.prototype.getAxesLabels = function() {
        return ['r', 'θ'];
    };

    return AxesObj;
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

var wpd = wpd || {};

wpd.TernaryAxes = (function () {
    var AxesObj = function () {
        var isCalibrated = false,
            
            x0, y0, x1, y1, x2, y2, L,
            phi0, root3, isRange0to100,
            isOrientationNormal,

            processCalibration = function(cal, range100, is_normal) {  
                var cp0 = cal.getPoint(0),
                    cp1 = cal.getPoint(1),
                    cp2 = cal.getPoint(2);

                x0 = cp0.px;
                y0 = cp0.py;
                x1 = cp1.px;
                y1 = cp1.py;
                x2 = cp2.px;
                y2 = cp2.py;

                L = Math.sqrt((x0-x1)*(x0-x1) + (y0-y1)*(y0-y1));

                phi0 = wpd.taninverse(-(y1-y0),x1-x0);

                root3 = Math.sqrt(3);

                isRange0to100 = range100;

                isOrientationNormal = is_normal;

                return true;
            };

        this.isCalibrated = function() {
            return isCalibrated;
        };

        this.calibrate = function (calib, range100, is_normal) {
            isCalibrated = processCalibration(calib, range100, is_normal);
            return isCalibrated;
        };

        this.pixelToData = function(pxi, pyi) {
            var data = [],
                rp,
                thetap,
                xx,
                yy,
                ap, bp, cp, bpt;

            xp = parseFloat(pxi);
            yp = parseFloat(pyi);

            rp = Math.sqrt((xp-x0)*(xp-x0)+(yp-y0)*(yp-y0));

            thetap = wpd.taninverse(-(yp-y0),xp-x0) - phi0;

            xx = (rp*Math.cos(thetap))/L;
		    yy = (rp*Math.sin(thetap))/L;
			
			ap = 1.0 - xx - yy/root3;
			bp = xx - yy/root3;
			cp = 2.0*yy/root3;
			
			if(isOrientationNormal == false) {
                // reverse axes orientation
			    bpt = bp;
			    bp = ap;
			    ap = cp;
			    cp = bpt;
			      				  
			}
			
			if (isRange0to100 == true) {
			    ap = ap*100; bp = bp*100; cp = cp*100;
			}

            data[0] = ap;
            data[1] = bp;
            data[2] = cp;
            return data;
        };

        this.dataToPixel = function(a, b, c) {
            return {
                x: 0,
                y: 0
            };
        };

        this.pixelToLiveString = function (pxi, pyi) {
            var dataVal = this.pixelToData(pxi, pyi);
            return dataVal[0].toExponential(4) + ', ' + dataVal[1].toExponential(4) + ', ' + dataVal[2].toExponential(4);
        };
    };

    AxesObj.prototype.numCalibrationPointsRequired = function() {
        return 3;
    };

    AxesObj.prototype.getDimensions = function() {
        return 3;
    };

    AxesObj.prototype.getAxesLabels = function() {
        return ['a', 'b', 'c'];
    };

    return AxesObj;
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

var wpd = wpd || {};

wpd.XYAxes = (function () {

    var AxesObj = function () {
        var calibration,
            isCalibrated = false,
            isLogScaleX = false,
            isLogScaleY = false,

            isXDate = false, isYDate = false,

            initialFormattingX, initialFormattingY,

            x1, x2, x3, x4, y1, y2, y3, y4,
            xmin, xmax, ymin, ymax, xm, ym,
            d12, d34, Lx, Ly, 
            thetax, thetay, theta,

            processCalibration = function(cal, isLogX, isLogY) {

                if(cal.getCount() < 4) {
                    return false;
                }

                var cp1 = cal.getPoint(0),
                    cp2 = cal.getPoint(1),
                    cp3 = cal.getPoint(2),
                    cp4 = cal.getPoint(3),
                    ip = new wpd.InputParser();
                
                x1 = cp1.px;
                y1 = cp1.py;
                x2 = cp2.px;
                y2 = cp2.py;
                x3 = cp3.px;
                y3 = cp3.py;
                x4 = cp4.px;
                y4 = cp4.py;

                xmin = cp1.dx;
                xmax = cp2.dx;
                ymin = cp3.dy;
                ymax = cp4.dy;

                // Check for dates, validity etc.

                // Validate X-Axes:
                xmin = ip.parse(xmin);
                if(!ip.isValid) { return false; }
                isXDate = ip.isDate;
                xmax = ip.parse(xmax);
                if(!ip.isValid || (ip.isDate != isXDate)) { return false; }
                initialFormattingX = ip.formatting; 

                // Validate Y-Axes:
                ymin = ip.parse(ymin);
                if(!ip.isValid) { return false; }
                isYDate = ip.isDate;
                ymax = ip.parse(ymax);
                if(!ip.isValid || (ip.isDate != isYDate)) { return false; }
                initialFormattingY = ip.formatting; 

                isLogScaleX = isLogX;
                isLogScaleY = isLogY;

                // If x-axis is log scale
                if (isLogScaleX === true)
                {
                    xmin = Math.log(xmin)/Math.log(10);
                    xmax = Math.log(xmax)/Math.log(10);
                }

                // If y-axis is log scale
                if (isLogScaleY === true)
                {
                     ymin = Math.log(ymin)/Math.log(10);
                     ymax = Math.log(ymax)/Math.log(10);
                }

                xm = xmax - xmin;
                ym = ymax - ymin;

                d12 = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
                d34 = Math.sqrt((x3-x4)*(x3-x4) + (y3-y4)*(y3-y4));

                Lx = xm/d12;
                Ly = ym/d34;

                thetax = wpd.taninverse(-(y2-y1), (x2-x1));
                thetay = wpd.taninverse(-(y4-y3), (x4-x3));

                theta = thetay-thetax;
                calibration = cal;
                return true;
            };


        this.isCalibrated = function() {
            return isCalibrated;
        };

        this.calibrate = function(calib, isLogX, isLogY) {
            isCalibrated = processCalibration(calib, isLogX, isLogY);
            return isCalibrated;
        };

        this.pixelToData = function(pxi, pyi) {
            var data = [],
                xp, yp, xf, yf, dP1, dP3, thetaP1, thetaP3,
                dx, dy;

            xp = parseFloat(pxi);
            yp = parseFloat(pyi);

            dP1 = Math.sqrt((xp-x1)*(xp-x1) + (yp-y1)*(yp-y1));
            thetaP1 = wpd.taninverse(-(yp-y1), (xp-x1)) - thetax;
            dx = dP1*Math.cos(thetaP1) - dP1*Math.sin(thetaP1)/Math.tan(theta);

            xf = dx*Lx + xmin;

            dP3 = Math.sqrt((xp-x3)*(xp-x3) + (yp-y3)*(yp-y3));
            thetaP3 = thetay - wpd.taninverse(-(yp-y3), (xp-x3));
            dy = dP3*Math.cos(thetaP3) - dP3*Math.sin(thetaP3)/Math.tan(theta);

            yf = dy*Ly + ymin;

            // if x-axis is log scale
            if (isLogScaleX === true)
                xf = Math.pow(10,xf);

            // if y-axis is log scale
            if (isLogScaleY === true)
                yf = Math.pow(10,yf);

            data[0] = xf;
            data[1] = yf;

            return data;
        };

        this.dataToPixel = function(x, y) {
            return {
                x: 0,
                y: 0
            };
        };

        this.pixelToLiveString = function(pxi, pyi) {
            var rtnString = '',
                dataVal = this.pixelToData(pxi, pyi);
            if(isXDate) {
                rtnString += wpd.dateConverter.formatDateNumber(dataVal[0], initialFormattingX);
            } else {
                rtnString += dataVal[0].toExponential(4);
            }
            rtnString += ', ';

            if(isYDate) {
                rtnString += wpd.dateConverter.formatDateNumber(dataVal[1], initialFormattingY);
            } else {
                rtnString += dataVal[1].toExponential(4);
            }
            return rtnString;
        };

        this.isDate = function (varIndex) {
            if(varIndex === 0) {
                return isXDate;
            } else {
                return isYDate;
            }
        };

        this.getInitialDateFormat = function (varIndex) {
            if(varIndex === 0) {
                return initialFormattingX;
            } else {
                return initialFormattingY;
            }
        };
    };

    AxesObj.prototype.numCalibrationPointsRequired = function() {
        return 4;
    };

    AxesObj.prototype.getDimensions = function() {
        return 2;
    };

    AxesObj.prototype.getAxesLabels = function() {
        return ['X', 'Y'];
    };

    return AxesObj;

})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};
wpd.dataTable = (function () {

    var rawData,
        sortedData,
        formattedData,
        tableText;

    function getSeriesData() {
        rawData = wpd.appData.getPlotData().getDataFromActiveSeries();
    }

    function sortRawData() {
        sortedData = rawData.slice(0);
        var sortingKey = document.getElementById('data-sort-variables').value,
            sortingOrder = document.getElementById('data-sort-order').value,
            isAscending = sortingOrder === 'ascending',
            isRaw = sortingKey === 'raw',
            isConnectivity = sortingKey === 'NearestNeighbor',
            dataIndex,
            axes = wpd.appData.getPlotData().axes,
            plotDim = axes.getDimensions();

        if (isRaw) {
            return;
        }

        if(!isConnectivity) {
            dataIndex = parseInt(sortingKey, 10);
            sortedData.sort(function(a, b) {
                if(a[dataIndex] > b[dataIndex]) {
                    return isAscending ? 1: -1;
                } else if (a[dataIndex] < b[dataIndex]) {
                    return isAscending ? -1 : 1;
                }
                return 0;
            });
            return;
        }

        if(isConnectivity) {
            var mindist, compdist, minindex,
                swapVariable = [1.0, 1.0, 1.0],
                ii, jj, 
                pointsPicked = rawData.length;

            for(ii = 0; ii < pointsPicked - 1; ii++) {
                minindex = -1;

                for(jj = ii + 1; jj < pointsPicked; jj++) {
                   compdist = (sortedData[ii][0] - sortedData[jj][0])*(sortedData[ii][0] - sortedData[jj][0]) + 
                                    (sortedData[ii][1] - sortedData[jj][1])*(sortedData[ii][1] - sortedData[jj][1]);
                   if(plotDim === 3) {
                       compdist += (sortedData[ii][2] - sortedData[jj][2])*(sortedData[ii][2] - sortedData[jj][2]);
                   }
                   
                   if((compdist < mindist) || (minindex === -1)) {
                        mindist = compdist;
                        minindex = jj;
                   } 
                }

                swapVariable[0] = sortedData[minindex][0];
                sortedData[minindex][0] = sortedData[ii+1][0];
                sortedData[ii+1][0] = swapVariable[0];

                swapVariable[1] = sortedData[minindex][1];
                sortedData[minindex][1] = sortedData[ii+1][1];
                sortedData[ii+1][1] = swapVariable[1];

                if(plotDim === 3) {
                    swapVariable[2] = sortedData[minindex][2];
                    sortedData[minindex][2] = sortedData[ii+1][2];
                    sortedData[ii+1][2] = swapVariable[2];
                }            
            }
        }

    }
  
    function setupControls() {
        var $sortingVariables = document.getElementById('data-sort-variables'),
            $variableNames = document.getElementById('dataVariables'),
            $dateFormattingContainer = document.getElementById('data-date-formatting-container'),
            $dateFormatting = document.getElementById('data-date-formatting'),
            axes = wpd.appData.getPlotData().axes,
            axesLabels = axes.getAxesLabels(),
            labIndex,
            variableHTML = '',
            variableListHTML = axesLabels.join(', '),
            dateFormattingHTML = '';
            isAnyVariableDate = false;

        $dateFormattingContainer.style.display = 'none';
        
        variableHTML += '<option value="raw">Raw</option>';

        for(labIndex = 0; labIndex < axesLabels.length; labIndex++) {
            variableHTML += '<option value="' + labIndex + '">' + axesLabels[labIndex] + '</option>';
            if(axes.isDate != null && axes.getInitialDateFormat != null && axes.isDate(labIndex)) {
                dateFormattingHTML += axesLabels[labIndex] + ' <input type="text" length="15" value="' 
                    + axes.getInitialDateFormat(labIndex) + '" id="data-format-string-'+ labIndex +'"/>';
                isAnyVariableDate = true;
            }
        }
        variableHTML += '<option value="NearestNeighbor">Nearest Neighbor</option>';

        $sortingVariables.innerHTML = variableHTML;
        $variableNames.innerHTML = variableListHTML;

        if(isAnyVariableDate) {
            $dateFormattingContainer.style.display = 'inline-block';
            $dateFormatting.innerHTML = dateFormattingHTML;            
        }

    }

    function updateSortingControls() {
        var sortingKey = document.getElementById('data-sort-variables').value,
            $sortingOrder = document.getElementById('data-sort-order'),
            isConnectivity = sortingKey === 'NearestNeighbor',
            isRaw = sortingKey === 'raw';
        
        if(isConnectivity || isRaw) {
            $sortingOrder.setAttribute('disabled', true);
        } else {
            $sortingOrder.removeAttribute('disabled');
        }
    }

    function makeTable() {
        if(rawData == null) {
            return;
        }
        var axes = wpd.appData.getPlotData().axes,
            dimCount = axes.getDimensions(),
            rowCount = rawData.length,
            rowi, dimi, rowValues,
            $digitizedDataTable = document.getElementById('digitizedDataTable'),
            formatStrings = [];

        tableText = '';
        for(rowi = 0; rowi < rowCount; rowi++) {
            rowValues = [];
            for(dimi = 0; dimi < dimCount; dimi++) {
                if(axes.isDate != null && axes.isDate(dimi)) {
                    if(formatStrings[dimi] === undefined) {
                        formatStrings[dimi] = document.getElementById('data-format-string-' + dimi).value;
                    }
                    rowValues[dimi] = wpd.dateConverter.formatDateNumber(sortedData[rowi][dimi], formatStrings[dimi]);
                } else {
                    rowValues[dimi] = sortedData[rowi][dimi];
                }
            }
            tableText += rowValues.join(', ');
            tableText += '\n';
        }
        $digitizedDataTable.value = tableText;
    }

    function getSortedData() {
        return sortedData;
    }

    function showTable() {
        if(!wpd.appData.isAligned()) {
            return;
        }
        wpd.popup.show('csvWindow');
        getSeriesData();
        setupControls();
        sortRawData();
        makeTable();
        updateSortingControls();
    }

    function generateCSV() {

        var formContainer,
            formElement,
            formData,
            jsonData = JSON.stringify(tableText);
            
        // Create a hidden form and submit
        formContainer = document.createElement('div'),
        formElement = document.createElement('form'),
        formData = document.createElement('input');

        formElement.setAttribute('method', 'post');
        formElement.setAttribute('action', 'php/csvexport.php');

        formData.setAttribute('type', "text");
        formData.setAttribute('name', "data");

        formElement.appendChild(formData);
        formContainer.appendChild(formElement);
        document.body.appendChild(formContainer);
        formContainer.style.display = 'none';

        formData.setAttribute('value', jsonData);
        formElement.submit();
        document.body.removeChild(formContainer);
    }

    function exportToPlotly() {
        if(rawData == null || rawData.length === 0) {
            return;
        }

        var formContainer = document.createElement('div'),
            formElement = document.createElement('form'),
            formData = document.createElement('input');
        
        
        formElement.setAttribute('method', 'post');
        formElement.setAttribute('action', 'https://plot.ly/external');
        formElement.setAttribute('target', '_blank');
        
        formData.setAttribute('type', "text");
        formData.setAttribute('name', "data");

        formElement.appendChild(formData);
        formContainer.appendChild(formElement);
        document.body.appendChild(formContainer);
        formContainer.style.display = 'none';

        var jsonData = { data: [] },
            axes = wpd.appData.getPlotData().axes,
            dimCount = axes.getDimensions(),
            rowCount = rawData.length,
            rowi, dimi,
            //axesLabels = axes.getAxesLabels(); - if I do this then plotly doesn't make a plot by default
            axesLabels = ['x', 'y', 'z'];

        jsonData.data[0] = {};
        for(rowi = 0; rowi < rowCount; rowi++) {
            rowValues = [];
            for(dimi = 0; dimi < dimCount; dimi++) {
                if(rowi === 0) {
                    jsonData.data[0][axesLabels[dimi]] = [];
                }
                if(axes.isDate != null && axes.isDate(dimi)) {
                    jsonData.data[0][axesLabels[dimi]][rowi] = wpd.dateConverter.formatDateNumber(sortedData[rowi][dimi], 'yyyy-mm-dd');
                } else {
                    jsonData.data[0][axesLabels[dimi]][rowi] = sortedData[rowi][dimi];
                }
            }
        }
        console.log(jsonData); 
        formData.setAttribute('value', JSON.stringify(jsonData));
        formElement.submit();
        document.body.removeChild(formContainer); 
    }

    function selectAll() {
        var $digitizedDataTable = document.getElementById('digitizedDataTable');
        $digitizedDataTable.focus();
        $digitizedDataTable.select();
    }

    function reSort() {
        updateSortingControls();
        sortRawData();
        makeTable();
    }

    return {
        getSeriesData: getSeriesData,
        showTable: showTable,
        updateSortingControls: updateSortingControls,
        reSort: reSort,
        selectAll: selectAll,
        generateCSV: generateCSV,
        exportToPlotly: exportToPlotly
    };
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

/* Multi-layered canvas widget to display plot, data, graphics etc. */
var wpd = wpd || {};
wpd.graphicsWidget = (function () {

    var $mainCanvas, // original picture is displayed here
        $dataCanvas, // data points
        $drawCanvas, // selection region graphics etc
        $hoverCanvas, // temp graphics while drawing
        $topCanvas, // top level, handles mouse events

        $oriImageCanvas,
        $oriDataCanvas,

        $canvasDiv,

        mainCtx,
        dataCtx,
        drawCtx,
        hoverCtx,
        topCtx,

        oriImageCtx,
        oriDataCtx,

        width,
        height,
        originalWidth,
        originalHeight,
        
        aspectRatio,
        displayAspectRatio,
        
        originalImageData,
        scaledImage,
        zoomRatio,
        extendedCrosshair = false,
        hoverTimer,
        
        activeTool,
        repaintHandler,
        
        isCanvasInFocus = false;

    function posn(ev) { // get screen pixel from event
        var mainCanvasPosition = $mainCanvas.getBoundingClientRect();
        return {
            x: parseInt(ev.pageX - (mainCanvasPosition.left + window.pageXOffset), 10),
            y: parseInt(ev.pageY - (mainCanvasPosition.top + window.pageYOffset), 10)
        };
    }

    // get image pixel when screen pixel is provided
    function imagePx(screenX, screenY) {
        return {
            x: screenX/zoomRatio,
            y: screenY/zoomRatio
        };
    }

    // get screen pixel when image pixel is provided
    function screenPx(imageX, imageY) {
        return {
            x: imageX*zoomRatio,
            y: imageY*zoomRatio
        };
    }

    function getDisplaySize() {
        return {
            width: width,
            height: height
        };
    }

    function getImageSize() {
        return {
            width: originalWidth,
            height: originalHeight
        };
    }

    function getAllContexts() {
        return {
            mainCtx: mainCtx,
            dataCtx: dataCtx,
            drawCtx: drawCtx,
            hoverCtx: hoverCtx,
            topCtx: topCtx,
            oriImageCtx: oriImageCtx,
            oriDataCtx: oriDataCtx
        };
    }
 
    function resize(cwidth, cheight) {

        cwidth = parseInt(cwidth, 10);
        cheight = parseInt(cheight, 10);

        $canvasDiv.style.width = cwidth + 'px';
        $canvasDiv.style.height = cheight + 'px';

        $mainCanvas.width = cwidth;
        $dataCanvas.width = cwidth;
        $drawCanvas.width = cwidth;
        $hoverCanvas.width = cwidth;
        $topCanvas.width = cwidth;

        $mainCanvas.height = cheight;
        $dataCanvas.height = cheight;
        $drawCanvas.height = cheight;
        $hoverCanvas.height = cheight;
        $topCanvas.height = cheight;

        displayAspectRatio = cwidth/(cheight*1.0);

        width = cwidth;
        height = cheight;

        drawImage();
    }

    function resetAllLayers() {
        $mainCanvas.width = $mainCanvas.width;
        resetDrawingLayers();
    }

    function resetDrawingLayers() {
        $dataCanvas.width = $dataCanvas.width;
        $drawCanvas.width = $drawCanvas.width;
        $hoverCanvas.width = $hoverCanvas.width;
        $topCanvas.width = $topCanvas.width;
    }

    function drawImage() {
        if(originalImageData == null) return;
        
        mainCtx.fillStyle = "rgb(255, 255, 255)";
        mainCtx.fillRect(0, 0, width, height);
        mainCtx.drawImage($oriImageCanvas, 0, 0, width, height);

        if(repaintHandler != null && repaintHandler.onRedraw != undefined) {
            repaintHandler.onRedraw();
        }

        if(activeTool != null && activeTool.onRedraw != undefined) {
            activeTool.onRedraw();
        }
                
    }

    function forceHandlerRepaint() {
        if(repaintHandler != null && repaintHandler.onForcedRedraw != undefined) {
            repaintHandler.onForcedRedraw();
        }
    }

    function setRepainter(fhandle) {
        
        if(repaintHandler != null && repaintHandler.painterName != undefined && fhandle != null && fhandle.painterName != undefined) {
            if(repaintHandler.painterName == fhandle.painterName) {
                return;  // Avoid same handler to be attached repeatedly.
            }
        }

        if(repaintHandler != null && repaintHandler.onRemove != undefined) {
            repaintHandler.onRemove();
        }
        repaintHandler = fhandle;
        if(repaintHandler != null && repaintHandler.onAttach != undefined) {
            repaintHandler.onAttach();
        }
    }

    function getRepainter() {
        return repaintHandler;
    }

    function removeRepainter() {
        if(repaintHandler != null && repaintHandler.onRemove != undefined) {
            repaintHandler.onRemove();
        }
        repaintHandler = null;
    }

    function copyImageDataLayerToScreen() {
        dataCtx.drawImage($oriDataCanvas, 0, 0, width, height); 
    }

    function zoomIn() {
        setZoomRatio(zoomRatio*1.2);
    }

    function zoomOut() {
        setZoomRatio(zoomRatio/1.2);
    }

    function zoomFit() {
        var viewportSize = wpd.layoutManager.getGraphicsViewportSize();
        resize(viewportSize.width, viewportSize.height);

        if(displayAspectRatio > aspectRatio) {
            zoomRatio = height/(originalHeight*1.0);
            resize(height*aspectRatio, height);
        } else {
            zoomRatio = width/(originalWidth*1.0);
            resize(width, width/aspectRatio);
        }
    }

    function zoom100perc() {
        setZoomRatio(1.0);
    }

    function setZoomRatio(zratio) {
        zoomRatio = zratio;
        resize(originalWidth*zoomRatio, originalHeight*zoomRatio);
    }

    function getZoomRatio() {
        return zoomRatio;
    }

    function resetData() {
        $oriDataCanvas.width = $oriDataCanvas.width;
        $dataCanvas.width = $dataCanvas.width;
    }

    function resetHover() {
        $hoverCanvas.width = $hoverCanvas.width;
    }

    function toggleExtendedCrosshair(ev) {
         if (ev.keyCode === 220) {
            ev.preventDefault();
            extendedCrosshair = !(extendedCrosshair);
            $hoverCanvas.width = $hoverCanvas.width;
        }
    }

    function hoverOverCanvas(ev) {
        var pos = posn(ev),
            xpos = pos.x,
            ypos = pos.y,
            imagePos = imagePx(xpos, ypos);

        if(extendedCrosshair) {
            $hoverCanvas.width = $hoverCanvas.width;
            hoverCtx.strokeStyle = "rgba(0,0,0, 0.5)";
            hoverCtx.beginPath();
            hoverCtx.moveTo(xpos, 0);
            hoverCtx.lineTo(xpos, height);
            hoverCtx.moveTo(0, ypos);
            hoverCtx.lineTo(width, ypos);
            hoverCtx.stroke();
        }

        setZoomImage(imagePos.x, imagePos.y);
        wpd.zoomView.setCoords(imagePos.x, imagePos.y);
    }

    function setZoomImage(ix, iy) {
        var zsize = wpd.zoomView.getSize(),
            zratio = wpd.zoomView.getZoomRatio(),
            ix0, iy0,
            zw, zh,
            iw, ih,
            idata, ddata,
            ixmin, iymin, ixmax, iymax,
            zxmin = 0, zymin = 0, zxmax = zsize.width, zymax = zsize.height,
            xcorr, ycorr;

        iw = zsize.width/zratio;
        ih = zsize.height/zratio;
        
        ix0 = ix - iw/2.0; iy0 = iy - ih/2.0;
        
        ixmin = ix0; iymin = iy0;
        ixmax = ix0 + iw; iymax = iy0 + ih;

        if(ix0 < 0) {
            ixmin = 0;
            zxmin = -ix0*zratio;
        }
        if(iy0 < 0) {
            iymin = 0;
            zymin = -iy0*zratio;
        }
        if(ix0 + iw >= originalWidth) {
            ixmax = originalWidth;
            zxmax = zxmax - zratio*(originalWidth - (ix0 + iw));
        }
        if(iy0 + ih >= originalHeight) {
            iymax = originalHeight;
            zymax = zymax - zratio*(originalHeight - (iy0 + ih));
        }
        idata = oriImageCtx.getImageData(parseInt(ixmin, 10), 
                                         parseInt(iymin, 10), 
                                         parseInt(ixmax-ixmin, 10), 
                                         parseInt(iymax-iymin, 10));

        ddata = oriDataCtx.getImageData(parseInt(ixmin, 10), 
                                         parseInt(iymin, 10), 
                                         parseInt(ixmax-ixmin, 10), 
                                         parseInt(iymax-iymin, 10));

        for(var index = 0; index < ddata.data.length; index+=4) {
            if(ddata.data[index] != 0 || ddata.data[index+1] !=0 || ddata.data[index+2] != 0) {
                idata.data[index] = ddata.data[index];
                idata.data[index+1] = ddata.data[index+1];
                idata.data[index+2] = ddata.data[index+2];
            }
        }

        // Make this accurate to subpixel level
        xcorr = zratio*(parseInt(ixmin,10) - ixmin);
        ycorr = zratio*(parseInt(iymin,10) - iymin);

        wpd.zoomView.setZoomImage(idata, parseInt(zxmin + xcorr, 10), 
                                     parseInt(zymin + ycorr, 10), 
                                     parseInt(zxmax - zxmin, 10), 
                                     parseInt(zymax - zymin, 10));
    }

    function updateZoomOnEvent(ev) {
        var pos = posn(ev),
            xpos = pos.x,
            ypos = pos.y,
            imagePos = imagePx(xpos, ypos);
        setZoomImage(imagePos.x, imagePos.y);
        wpd.zoomView.setCoords(imagePos.x, imagePos.y);
    }

    function updateZoomToImagePosn(x, y) {
        setZoomImage(x, y);
        wpd.zoomView.setCoords(x, y);
    }

    function hoverOverCanvasHandler(ev) {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(hoverOverCanvas(ev), 10);
    }

    function dropHandler(ev) {
        var allDrop = ev.dataTransfer.files;
        if (allDrop.length === 1) {
            fileLoader(allDrop[0]);
        }
    }

    function pasteHandler(ev) {
        if(ev.clipboardData !== undefined) {
            var items = ev.clipboardData.items;
            if(items !== undefined) {
                for(var i = 0; i < items.length; i++) {
                    if(items[i].type.indexOf("image") !== -1) {
                        var blob = items[i].getAsFile();
                        var URLObj = window.URL || window.webkitURL;
                        var source = URLObj.createObjectURL(blob);
                        fileLoader(blob);
                    }
                }
            }
        }
    }


    function init() {
        $mainCanvas = document.getElementById('mainCanvas');
        $dataCanvas = document.getElementById('dataCanvas');
        $drawCanvas = document.getElementById('drawCanvas');
        $hoverCanvas = document.getElementById('hoverCanvas');
        $topCanvas = document.getElementById('topCanvas');

        $oriImageCanvas = document.createElement('canvas');
        $oriDataCanvas = document.createElement('canvas');

        mainCtx = $mainCanvas.getContext('2d');
        dataCtx = $dataCanvas.getContext('2d');
        hoverCtx = $hoverCanvas.getContext('2d');
        topCtx = $topCanvas.getContext('2d');
        drawCtx = $drawCanvas.getContext('2d');

        oriImageCtx = $oriImageCanvas.getContext('2d');
        oriDataCtx = $oriDataCanvas.getContext('2d');

        $canvasDiv = document.getElementById('canvasDiv');

        // Extended crosshair
        document.body.addEventListener('keydown', toggleExtendedCrosshair, false);

        // hovering over canvas
        $topCanvas.addEventListener('mousemove', hoverOverCanvasHandler, false);

        // drag over canvas
        $topCanvas.addEventListener('dragover', function(evt) {
                evt.preventDefault();
            }, true);
        $topCanvas.addEventListener("drop", function(evt) { 
                evt.preventDefault(); 
                dropHandler(evt);
            }, true);

        $topCanvas.addEventListener("mousemove", onMouseMove, false);
        $topCanvas.addEventListener("click", onMouseClick, false);
        $topCanvas.addEventListener("mouseup", onMouseUp, false);
        $topCanvas.addEventListener("mousedown", onMouseDown, false);
        $topCanvas.addEventListener("mouseout", onMouseOut, true);
        document.addEventListener("mousedown", function(ev) {
            if(ev.target === $topCanvas) {
                isCanvasInFocus = true;
            } else {
                isCanvasInFocus = false;
            }
        }, false);
        document.addEventListener("keydown", function (ev) {
            if(isCanvasInFocus) {
                onKeyDown(ev);
            }
        }, true);
        
        wpd.zoomView.initZoom();
        
        document.getElementById('fileLoadBox').addEventListener("change", loadNewFile); 

        // Paste image from clipboard
        window.addEventListener('paste', function(event) {pasteHandler(event);}, false);
    }

    function loadImage(originalImage) {
        
        if($mainCanvas == null) {
            init();
        }
        wpd.appData.reset();
        wpd.sidebar.clear();
        originalWidth = originalImage.width;
        originalHeight = originalImage.height;
        aspectRatio = originalWidth/(originalHeight*1.0);
        $oriImageCanvas.width = originalWidth;
        $oriImageCanvas.height = originalHeight;
        $oriDataCanvas.width = originalWidth;
        $oriDataCanvas.height = originalHeight;

        oriImageCtx.drawImage(originalImage, 0, 0, originalWidth, originalHeight);
        originalImageData = oriImageCtx.getImageData(0, 0, originalWidth, originalHeight);
        resetAllLayers();
        zoomFit();
        removeTool();
    }

    function loadImageFromSrc(imgSrc) {
        var originalImage = document.createElement('img');
        originalImage.onload = function () {
            loadImage(originalImage);
        };
        originalImage.src = imgSrc;
    }

    function loadImageFromData(idata, iwidth, iheight) {
        wpd.appData.reset();
        originalWidth = iwidth;
        originalHeight = iheight;
        aspectRatio = originalWidth/(originalHeight*1.0);
        $oriImageCanvas.width = originalWidth;
        $oriImageCanvas.height = originalHeight;
        $oriDataCanvas.width = originalWidth;
        $oriDataCanvas.height = originalHeight;
        oriImageCtx.putImageData(idata, 0, 0);
        originalImageData = idata;
        resetAllLayers();
        zoomFit();
        removeTool();
    }

    function fileLoader(fileInfo) {
        if(fileInfo.type.match("image.*")) {
            var droppedFile = new FileReader();
            droppedFile.onload = function() {
                var imageInfo = droppedFile.result;
                loadImageFromSrc(imageInfo);
            };
            droppedFile.readAsDataURL(fileInfo);
        }
    }

    function loadNewFile() {
        var fileLoadElem = document.getElementById('fileLoadBox');
        if(fileLoadElem.files.length == 1) {
            var fileInfo = fileLoadElem.files[0];
            fileLoader(fileInfo);
        }
    }

    function saveImage() {
        var exportCanvas = document.createElement('canvas'),
            exportCtx = exportCanvas.getContext('2d'),
            exportData,
            di,
            dLayer;
        exportCanvas.width = originalWidth;
        exportCanvas.height = originalHeight;
        exportCtx.drawImage($oriImageCanvas, 0, 0, originalWidth, originalHeight);
        exportData = exportCtx.getImageData(0, 0, originalWidth, originalHeight);
        dLayer = oriDataCtx.getImageData(0, 0, originalWidth, originalHeight);
        for(di = 0; di < exportData.data.length; di+=4) {
            if(dLayer.data[di] != 0 || dLayer.data[di+1] != 0 || dLayer.data[di+2] != 0) {
                exportData.data[di] = dLayer.data[di];
                exportData.data[di+1] = dLayer.data[di+1];
                exportData.data[di+2] = dLayer.data[di+2];
            }
        }
        exportCtx.putImageData(exportData, 0, 0);
        window.open(exportCanvas.toDataURL(), "_blank");
    }

    // run an external operation on the image data. this would normally mean a reset.
    function runImageOp(operFn) {
       var opResult = operFn(originalImageData, originalWidth, originalHeight);
       loadImageFromData(opResult.imageData, opResult.width, opResult.height);
    }

    function setTool(tool) {
        if(activeTool != null && activeTool.onRemove != undefined) {
            activeTool.onRemove();
        }
        activeTool = tool;
        if(activeTool != null && activeTool.onAttach != undefined) {
            activeTool.onAttach();
        }
    }

    function removeTool() {
        if(activeTool != null && activeTool.onRemove != undefined) {
            activeTool.onRemove();
        }
        activeTool = null;
    }

    function onMouseMove(ev) {
        if(activeTool != null && activeTool.onMouseMove != undefined) {
            var pos = posn(ev),
                xpos = pos.x,
                ypos = pos.y,
                imagePos = imagePx(xpos, ypos);
            activeTool.onMouseMove(ev, pos, imagePos);
        }
    }

    function onMouseClick(ev) {
        if(activeTool != null && activeTool.onMouseClick != undefined) {
            var pos = posn(ev),
                xpos = pos.x,
                ypos = pos.y,
                imagePos = imagePx(xpos, ypos);
            activeTool.onMouseClick(ev, pos, imagePos);
        }
    }

    function onMouseUp(ev) {
        if(activeTool != null && activeTool.onMouseUp != undefined) {
            var pos = posn(ev),
                xpos = pos.x,
                ypos = pos.y,
                imagePos = imagePx(xpos, ypos);
            activeTool.onMouseUp(ev, pos, imagePos);
        }
    }

    function onMouseDown(ev) {
        if(activeTool != null && activeTool.onMouseDown != undefined) {
            var pos = posn(ev),
                xpos = pos.x,
                ypos = pos.y,
                imagePos = imagePx(xpos, ypos);
            activeTool.onMouseDown(ev, pos, imagePos);
        }
    }

    function onMouseOut(ev) {
        if(activeTool != null && activeTool.onMouseOut != undefined) {
            var pos = posn(ev),
                xpos = pos.x,
                ypos = pos.y,
                imagePos = imagePx(xpos, ypos);
            activeTool.onMouseOut(ev, pos, imagePos);
        }
    }

    function onKeyDown(ev) {
        if(activeTool != null && activeTool.onKeyDown != undefined) {
            activeTool.onKeyDown(ev);
        }
    }

    return {
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        zoomFit: zoomFit,
        zoom100perc: zoom100perc,
        setZoomRatio: setZoomRatio,
        getZoomRatio: getZoomRatio,

        loadImageFromURL: loadImageFromSrc,
        runImageOp: runImageOp,

        setTool: setTool,
        removeTool: removeTool,

        getAllContexts: getAllContexts,
        resetData: resetData,
        resetHover: resetHover,
        imagePx: imagePx,
        screenPx: screenPx,

        updateZoomOnEvent: updateZoomOnEvent,
        updateZoomToImagePosn: updateZoomToImagePosn,

        getDisplaySize: getDisplaySize,
        getImageSize: getImageSize,

        copyImageDataLayerToScreen: copyImageDataLayerToScreen,
        setRepainter: setRepainter,
        removeRepainter: removeRepainter,
        forceHandlerRepaint: forceHandlerRepaint,
        getRepainter: getRepainter,

        saveImage: saveImage
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

// layoutManager.js - manage layout of main sections on the screen.
var wpd = wpd || {};
wpd.layoutManager = (function () {
    var layoutTimer,
        $graphicsContainer,
        $sidebarContainer,
        $mainContainer;

    // Redo layout when window is resized
    function adjustLayout() {
        var windowWidth = parseInt(document.body.offsetWidth,10),
            windowHeight = parseInt(document.body.offsetHeight,10);

        $sidebarContainer.style.height = windowHeight + 'px';
        $mainContainer.style.width = windowWidth - $sidebarContainer.offsetWidth + 'px';
        $mainContainer.style.height = windowHeight + 'px';
        $graphicsContainer.style.height = windowHeight - 44 + 'px';
    }

    function getGraphicsViewportSize() {
        return {
            width: $graphicsContainer.offsetWidth,
            height: $graphicsContainer.offsetHeight
        };
    }

    // event handler
    function adjustLayoutOnResize(ev) {
        clearTimeout(layoutTimer);
        layoutTimer = setTimeout(adjustLayout, 80);
    }
 
    // Set initial layout. Called right when the app is loaded.
    function initialLayout() {
        // do initial layout and also bind to the window resize event
        $graphicsContainer = document.getElementById('graphicsContainer');
        $sidebarContainer = document.getElementById('sidebarContainer');
        $mainContainer = document.getElementById('mainContainer');
        adjustLayout();
         
        window.addEventListener('resize', adjustLayoutOnResize, false);
    }

    return {
        initialLayout: initialLayout,
        getGraphicsViewportSize: getGraphicsViewportSize
    };

})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

// Handle popup windows
var wpd = wpd || {};
wpd.popup = (function () {

    function show(popupid) {
        // Dim lights :)
        var shadowDiv = document.getElementById('shadow');
        shadowDiv.style.visibility = "visible";

        var pWindow = document.getElementById(popupid);
        var screenWidth = parseInt(window.innerWidth);
        var screenHeight = parseInt(window.innerHeight);
        var pWidth = parseInt(pWindow.offsetWidth);
        var pHeight = parseInt(pWindow.offsetHeight);
        var xPos = (screenWidth - pWidth)/2;
        var yPos = (screenHeight - pHeight)/2;
        yPos = yPos > 60 ? 60 : yPos;
        pWindow.style.left = xPos + 'px';
        pWindow.style.top = yPos + 'px';
        pWindow.style.visibility = "visible";
    }

    function close(popupid) {

        var shadowDiv = document.getElementById('shadow');
        shadowDiv.style.visibility = "hidden";

        var pWindow = document.getElementById(popupid);
        pWindow.style.visibility = "hidden";
    }

    return {
        show: show,
        close: close
    };

})();

wpd.busyNote = (function () {
    function show() {
        document.getElementById('wait').style.visibility = 'visible';
    }

    function close() {
        document.getElementById('wait').style.visibility = 'hidden';
    }

    return {
        show: show,
        close: close
    };
})();

wpd.messagePopup = (function () {
    var close_callback;

    function show(title, msg, callback) {
        wpd.popup.show('messagePopup');
        document.getElementById('message-popup-heading').innerHTML = title;
        document.getElementById('message-popup-text').innerHTML = msg;
        close_callback = callback;
    }

    function close() {
        wpd.popup.close('messagePopup');
        if(close_callback != null) {
            close_callback();
        }
    }

    return {
        show: show,
        close: close
    };
})();

wpd.unsupported = function () {
    wpd.messagePopup.show("Unsupported Feature!", "This feature has not been implemented in the current version. This may be available in a future release.");
};

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};
wpd.sidebar = (function () {

    function show(sbid) { // Shows a specific sidebar
        clear();
        var sb = document.getElementById(sbid);
        sb.style.visibility = "visible";
    }

    function clear() { // Clears all open sidebars
        var sidebarList = document.getElementsByClassName('sidebar'),
            ii;

        for (ii = 0; ii < sidebarList.length; ii ++) {
            sidebarList[ii].style.visibility="hidden";
        }
    }

    return {
        show: show,
        clear: clear
    };

})();


/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
var wpd = wpd || {};
wpd.toolbar = (function () {

    // list of all known toolbars!
    var toolbarList = ['paintToolbar','colorPickerToolbar']; 

    function show(sbid) { // Shows a specific sidebar
        clear();
        var sb = document.getElementById(sbid);
        sb.style.visibility = "visible";
    }

    function clear() { // Clears all open sidebars

          for (ii = 0; ii < toolbarList.length; ii ++) {
              var sbv = document.getElementById(toolbarList[ii]);
              sbv.style.visibility="hidden";
          }
        
    }

    return {
        show: show,
        clear: clear
    };
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.webcamCapture = (function () {

    var cameraStream;

    function isSupported() {
        return !(getUserMedia() == null);
    }

    function unsupportedBrowser() {
        wpd.messagePopup.show('Webcam Capture','Your browser does not support webcam capture using HTML5 APIs. A recent version of Google Chrome is recommended.');
    }

    function getUserMedia() {
        return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    }

    function start() {
        if(!isSupported()) {
            unsupportedBrowser();
            return;
        }
        wpd.popup.show('webcamCapture'); 
        var $camVideo = document.getElementById('webcamVideo');
        navigator.getUserMedia = getUserMedia();
        navigator.getUserMedia({video: true}, function(stream) {
            cameraStream = stream;
            $camVideo.src = window.URL.createObjectURL(stream);
  		}, function() {}); 
    }

    function capture() {
        var $webcamCanvas = document.createElement('canvas'),
            $camVideo = document.getElementById('webcamVideo'),
            webcamCtx = $webcamCanvas.getContext('2d'),
            imageData;
        $webcamCanvas.width = $camVideo.videoWidth;
        $webcamCanvas.height = $camVideo.videoHeight;
        webcamCtx.drawImage($camVideo, 0, 0);
        imageData = webcamCtx.getImageData(0, 0, $webcamCanvas.width, $webcamCanvas.height);
        cameraOff();
        wpd.graphicsWidget.runImageOp(function() {
            return {
                imageData: imageData,
                width: $webcamCanvas.width,
                height: $webcamCanvas.height
            };
        });
    }

    function cameraOff() {
        if(cameraStream != undefined) {
            cameraStream.stop();
        }
        wpd.popup.close('webcamCapture'); 
    }

    function cancel() {
        cameraOff();
    }

    return {
        start: start,
        cancel: cancel,
        capture: capture
    };

})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

/* Zoomed-in view */
var wpd = wpd || {};
wpd.zoomView = (function() {
    var zCanvas, 
        zctx,
        tempCanvas,
        tctx,
        zWindowWidth = 250,
        zWindowHeight = 250,
        $mPosn,
        extendedCrosshair = false,
        pix = [],
        zoomTimeout,
        zoomRatio,
        crosshairColorText = 'black';

    pix[0] = new Array();

    function init() {

        zCanvas = document.getElementById('zoomCanvas');
    	zctx = zCanvas.getContext('2d');
	    tempCanvas = document.createElement('canvas');
        tctx = tempCanvas.getContext('2d');

        $mPosn = document.getElementById('mousePosition');

        zoomRatio = 5;

        drawCrosshair();
    }

    function drawCrosshair() {
        var zCrossHair = document.getElementById("zoomCrossHair");
        var zchCtx = zCrossHair.getContext("2d");
        
        zCrossHair.width = zCrossHair.width;

        if(crosshairColorText === 'black') {
            zchCtx.strokeStyle = "rgba(0,0,0,1)";
        } else if(crosshairColorText === 'red') {
            zchCtx.strokeStyle = "rgba(255,0,0,1)";
        } else if(crosshairColorText === 'yellow') {
            zchCtx.strokeStyle = "rgba(255,255,0,1)";
        } else {
            zchCtx.strokeStyle = "rgba(0,0,0,1)";
        }

        zchCtx.beginPath();
        zchCtx.moveTo(zWindowWidth/2, 0);
        zchCtx.lineTo(zWindowWidth/2, zWindowHeight);
        zchCtx.moveTo(0, zWindowHeight/2);
        zchCtx.lineTo(zWindowWidth, zWindowHeight/2);
        zchCtx.stroke();
    }
 
    function setZoomRatio(zratio) {
        zoomRatio = zratio;
    }

    function getZoomRatio() {
        return zoomRatio;
    }

    function getSize() {
         return {
            width: zWindowWidth,
            height: zWindowHeight
        };

    }

    function setZoomImage(imgData, x0, y0, zwidth, zheight) {
        tempCanvas.width = zwidth/zoomRatio;
        tempCanvas.height = zheight/zoomRatio;
        tctx.putImageData(imgData, 0, 0);
        zCanvas.width = zCanvas.width;
        zctx.drawImage(tempCanvas, x0, y0, zwidth, zheight);
    }

    function setCoords(imageX, imageY) {
        if(wpd.appData.isAligned()) {
            var plotData = wpd.appData.getPlotData();
            $mPosn.innerText = plotData.axes.pixelToLiveString(imageX, imageY);
        } else {
            $mPosn.innerText = imageX.toFixed(2) + ', ' + imageY.toFixed(2);
        }
    }

    function showSettingsWindow() {
        document.getElementById('zoom-magnification-value').value = zoomRatio;
        document.getElementById('zoom-crosshair-color-value').value = crosshairColorText;
        wpd.popup.show('zoom-settings-popup');
    }

    function applySettings() {
        zoomRatio = document.getElementById('zoom-magnification-value').value;
        crosshairColorText = document.getElementById('zoom-crosshair-color-value').value;
        drawCrosshair();
        wpd.popup.close('zoom-settings-popup');
    }

    return {
        initZoom: init,
        setZoomImage: setZoomImage,
        setCoords: setCoords,
        setZoomRatio: setZoomRatio,
        getZoomRatio: getZoomRatio,
        getSize: getSize,
        showSettingsWindow: showSettingsWindow,
        applySettings: applySettings
    };
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.xyCalibration = (function () {

    function start() {
        wpd.popup.show('xyAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('xyAxesInfo');
        var tool = new wpd.AxesCornersTool(4, 2, ['X1', 'X2', 'Y1', 'Y2']);
        wpd.graphicsWidget.setTool(tool);
    }

    function getCornerValues() {
        wpd.popup.show('xyAlignment');
    }

    function align() {
        var xmin = document.getElementById('xmin').value,
	        xmax = document.getElementById('xmax').value,
	        ymin = document.getElementById('ymin').value,
	        ymax = document.getElementById('ymax').value,
	        xlog = document.getElementById('xlog').value,
	        ylog = document.getElementById('ylog').value,
            axes = new wpd.XYAxes(),
            plot,
            calib = wpd.alignAxes.getActiveCalib();

        calib.setDataAt(0, xmin, ymin);
        calib.setDataAt(1, xmax, ymin);
        calib.setDataAt(2, xmin, ymin);
        calib.setDataAt(3, xmax, ymax);
        if(!axes.calibrate(calib, xlog, ylog)) {
            wpd.popup.close('xyAlignment');
            wpd.messagePopup.show('Invalid Inputs', 'Please enter valid values for calibration.', getCornerValues);
            return false;
        }
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        wpd.popup.close('xyAlignment');
        return true;
    }

    return {
        start: start,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };
})();

wpd.polarCalibration = (function () {

    function start() {
        wpd.popup.show('polarAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('polarAxesInfo');
        var tool = new wpd.AxesCornersTool(3, 2, ['Origin', 'P1', 'P2']);
        wpd.graphicsWidget.setTool(tool);
    }

    function getCornerValues() {
        wpd.popup.show('polarAlignment');
    }

    function align() {
        var r1 = parseFloat(document.getElementById('rpoint1').value),
	        theta1 = parseFloat(document.getElementById('thetapoint1').value),
	        r2 = parseFloat(document.getElementById('rpoint2').value),
	        theta2 = parseFloat(document.getElementById('thetapoint2').value),
	        degrees = document.getElementById('degrees').checked,
	        radians = document.getElementById('radians').checked,
	        orientation = document.getElementById('clockwise').checked,
            axes = new wpd.PolarAxes(),
            plot,
            isDegrees = degrees,
            calib = wpd.alignAxes.getActiveCalib();

        calib.setDataAt(1, r1, theta1);
        calib.setDataAt(2, r2, theta2);
        axes.calibrate(calib, isDegrees, orientation);

        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        wpd.popup.close('polarAlignment');
        return true;
    }

    return {
        start: start,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };

})();

wpd.ternaryCalibration = (function () {

    function start() {
        wpd.popup.show('ternaryAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('ternaryAxesInfo');
        var tool = new wpd.AxesCornersTool(3, 3, ['A', 'B', 'C']);
        wpd.graphicsWidget.setTool(tool);
    }

    function getCornerValues() {
        wpd.popup.show('ternaryAlignment');
    }

    function align() {
        var range1 = document.getElementById('range0to1').checked,
	        range100 = document.getElementById('range0to100').checked,
	        ternaryNormal = document.getElementById('ternarynormal').checked,
            axes = new wpd.TernaryAxes(),
            plot,
            calib = wpd.alignAxes.getActiveCalib();

        axes.calibrate(calib, range100, ternaryNormal);
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        wpd.popup.close('ternaryAlignment');
        return true;
    }

    return {
        start: start,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };

})();

wpd.mapCalibration = (function () {

    function start() {
        wpd.popup.show('mapAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('mapAxesInfo');
        var tool = new wpd.AxesCornersTool(2, 2, ['P1', 'P2']);
        wpd.graphicsWidget.setTool(tool);
        tool.onComplete = getCornerValues;
    }

    function getCornerValues() {
        wpd.popup.show('mapAlignment');
    }

    function align() {
        var scaleLength = parseFloat(document.getElementById('scaleLength').value),
            axes = new wpd.MapAxes(),
            plot,
            calib = wpd.alignAxes.getActiveCalib();

        axes.calibrate(calib, scaleLength);
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        wpd.popup.close('mapAlignment');
        return true;
    }

    return {
        start: start,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };

})();


wpd.AxesCornersTool = (function () {

    var Tool = function(maxPoints, dimensions, pointLabels) {
        var pointCount = 0,
            ncal = new wpd.Calibration(dimensions),
            isCapturingCorners = true; 

        ncal.labels = pointLabels;
        wpd.alignAxes.setActiveCalib(ncal);
        wpd.graphicsWidget.resetData();

        this.onMouseClick = function(ev, pos, imagePos) {

            if(isCapturingCorners) {
                pointCount = pointCount + 1;
                
                var calib =  wpd.alignAxes.getActiveCalib();
                calib.addPoint(imagePos.x, imagePos.y, 0, 0);
                calib.unselectAll();
                calib.selectPoint(pointCount-1);
                wpd.graphicsWidget.forceHandlerRepaint(); 

                if(pointCount === maxPoints) {
                    isCapturingCorners = false;
                    wpd.alignAxes.calibrationCompleted();
                }

                wpd.graphicsWidget.updateZoomOnEvent(ev);
            } else {
                var cal = wpd.alignAxes.getActiveCalib();
                cal.unselectAll();
                //cal.selectNearestPoint(imagePos.x, imagePos.y, 15.0/wpd.graphicsWidget.getZoomRatio());
                cal.selectNearestPoint(imagePos.x, imagePos.y);
                wpd.graphicsWidget.forceHandlerRepaint();
                wpd.graphicsWidget.updateZoomOnEvent(ev);

            }
        };

        this.onKeyDown = function(ev) {
            var cal = wpd.alignAxes.getActiveCalib();

            if(cal.getSelectedPoints().length === 0) {
                return;
            }

            var selPoint = cal.getPoint(cal.getSelectedPoints()[0]),
                pointPx = selPoint.px,
                pointPy = selPoint.py,
                stepSize = ev.shiftKey === true ? 5/wpd.graphicsWidget.getZoomRatio() : 0.5/wpd.graphicsWidget.getZoomRatio();

            if(wpd.keyCodes.isUp(ev.keyCode)) {
                pointPy = pointPy - stepSize;
            } else if(wpd.keyCodes.isDown(ev.keyCode)) {
                pointPy = pointPy + stepSize;
            } else if(wpd.keyCodes.isLeft(ev.keyCode)) {
                pointPx = pointPx - stepSize;
            } else if(wpd.keyCodes.isRight(ev.keyCode)) {
                pointPx = pointPx + stepSize;
            } else {
                return;
            }
            
            cal.changePointPx(cal.getSelectedPoints()[0], pointPx, pointPy);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomToImagePosn(pointPx, pointPy);
            ev.preventDefault();
            ev.stopPropagation();
        };

    };

    return Tool;
})();


wpd.AlignmentCornersRepainter = (function () {
    var Tool = function () {

        var ctx = wpd.graphicsWidget.getAllContexts();

        this.painterName = 'AlignmentCornersReptainer';

        this.onForcedRedraw = function () {
            wpd.graphicsWidget.resetData();
            this.onRedraw();
        };

        this.onRedraw = function () {
            var cal = wpd.alignAxes.getActiveCalib();
            if (cal == null) { return; }

            var i, pos, imagePos;

            for(i = 0; i < cal.getCount(); i++) {
                imagePos = cal.getPoint(i);
                pos = wpd.graphicsWidget.screenPx(imagePos.px, imagePos.py);
                ctx.dataCtx.fillStyle = "rgba(255,255,255,0.7)";
                ctx.dataCtx.fillRect(pos.x - 10, pos.y - 10, 20, 40); 
                ctx.dataCtx.beginPath();
                if(cal.isPointSelected(i)) {
                    ctx.dataCtx.fillStyle = "rgba(0,200,0,1)";
                } else {
        		    ctx.dataCtx.fillStyle = "rgba(200,0,0,1)";
                }
	        	ctx.dataCtx.arc(pos.x, pos.y, 3, 0, 2.0*Math.PI, true);
		        ctx.dataCtx.fill();
                ctx.dataCtx.font="14px sans-serif";
                ctx.dataCtx.fillText(cal.labels[i], pos.x-10, pos.y+18);
                
                ctx.oriDataCtx.beginPath();
                if(cal.isPointSelected(i)) {
                    ctx.oriDataCtx.fillStyle = "rgb(0,200,0)";
                } else {
        		    ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
                }

                ctx.oriDataCtx.arc(imagePos.px, imagePos.py, 3, 0, 2.0*Math.PI, true);
                ctx.oriDataCtx.fill();
                ctx.oriDataCtx.font="14px sans-serif";
                ctx.oriDataCtx.fillText(cal.labels[i], parseInt(imagePos.px-10, 10), parseInt(imagePos.py+18,10));
            }
        };
    };
    return Tool;
})();

wpd.alignAxes = (function () {

    var calib, calibrator;

    function initiatePlotAlignment() {
        xyEl = document.getElementById('r_xy');
        polarEl = document.getElementById('r_polar');
        ternaryEl = document.getElementById('r_ternary');
        mapEl = document.getElementById('r_map');
        imageEl = document.getElementById('r_image');

        wpd.popup.close('axesList');

        if (xyEl.checked === true) {
            calibrator = wpd.xyCalibration;
        } else if(polarEl.checked === true) {
            calibrator = wpd.polarCalibration;
        } else if(ternaryEl.checked === true) {
            calibrator = wpd.ternaryCalibration;
        } else if(mapEl.checked === true) {
            calibrator = wpd.mapCalibration;
        } else if(imageEl.checked === true) {
            calibrator = null;
            var imageAxes = new wpd.ImageAxes();
            imageAxes.calibrate();
            wpd.appData.getPlotData().axes = imageAxes;
            wpd.appData.isAligned(true);
            wpd.acquireData.load();
        }

        if(calibrator != null) {
            calibrator.start();
            wpd.graphicsWidget.setRepainter(new wpd.AlignmentCornersRepainter());
        }
    }

    function calibrationCompleted() {
        wpd.sidebar.show('axes-calibration-sidebar');
    }


    function getCornerValues() {
        calibrator.getCornerValues();
    }

    function align() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();
        if(!calibrator.align()) {
            return;
        }
        wpd.appData.isAligned(true);
        wpd.acquireData.load();
    }

    function getActiveCalib() {
        return calib;
    }

    function setActiveCalib(cal) {
        calib = cal;
    }

    return {
        start: initiatePlotAlignment,
        calibrationCompleted: calibrationCompleted,
        getCornerValues: getCornerValues,
        align: align,
        getActiveCalib: getActiveCalib,
        setActiveCalib: setActiveCalib
    };

})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
var wpd = wpd || {};
wpd.autoExtraction = (function () {

    function start() {
        wpd.sidebar.show('auto-extraction-sidebar');
        wpd.colorPicker.init();
        changeAlgorithm();
    }

    function changeAlgorithm() {
        var autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            algoName = document.getElementById('auto-extract-algo-name').value;

        if(algoName === "averagingWindow") {
            autoDetector.algorithm = new wpd.AveragingWindowAlgo();
        }

        displayAlgoParameters(autoDetector.algorithm);
    }

    function displayAlgoParameters(algo) {
        var $paramContainer = document.getElementById('algo-parameter-container'),
            algoParams = algo.getParamList(),
            pi,
            tableString = "";

        
        for(pi = 0; pi < algoParams.length; pi++) {
            tableString += algoParams[pi][0] + 
                ' <input type="text" size=3 id="algo-param-' + pi + 
                '" class="algo-params" value="'+ algoParams[pi][2] + '"/> ' 
                + algoParams[pi][1];
            if(pi != algoParams.length - 1) {
                tableString += ', ';
            } 
        }
        tableString += "</table>";
        $paramContainer.innerHTML = tableString;
    }

    function runAlgo() {
        var autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            algo = autoDetector.algorithm,
            repainter = new wpd.DataPointsRepainter(),
            $paramFields = document.getElementsByClassName('algo-params'),
            pi,
            paramId, paramIndex;
        for(pi = 0; pi < $paramFields.length; pi++) {
            paramId = $paramFields[pi].id;
            paramIndex = parseInt(paramId.replace('algo-param-', ''), 10);
            algo.setParam(paramIndex, parseFloat($paramFields[pi].value));
        }
        wpd.graphicsWidget.removeTool();
        autoDetector.generateBinaryData();
        wpd.graphicsWidget.setRepainter(repainter);
        algo.run(wpd.appData.getPlotData());
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount();
    }
  
    return {
        start: start,
        changeAlgorithm: changeAlgorithm,
        runAlgo: runAlgo
    };
})();



/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.colorPicker = (function () {

    function init() {
        var $colorBtn = document.getElementById('color-button'),
            $colorDistance = document.getElementById('color-distance-value'),
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            $modeSelector = document.getElementById('color-detection-mode-select'),
            color;
        
        if(autoDetector.colorDetectionMode === 'fg') {
            color = autoDetector.fgColor;
        } else {
            color = autoDetector.bgColor;
        }
        color_distance = autoDetector.colorDistance;

        $colorBtn.style.backgroundColor = 'rgb('+color[0]+','+color[1]+','+color[2]+')';
        $colorDistance.value = color_distance;
        $modeSelector.value = autoDetector.colorDetectionMode;
    }

    function startFGPicker() {
        var fg_color = wpd.appData.getPlotData().getAutoDetector().fgColor;
        document.getElementById('color_red_fg').value = fg_color[0];
	    document.getElementById('color_green_fg').value = fg_color[1];
		document.getElementById('color_blue_fg').value = fg_color[2];
        wpd.popup.show('colorPickerFG');
    }

    function startBGPicker() {
        var bg_color = wpd.appData.getPlotData().getAutoDetector().bgColor;
        document.getElementById('color_red_bg').value = bg_color[0];
	    document.getElementById('color_green_bg').value = bg_color[1];
		document.getElementById('color_blue_bg').value = bg_color[2];
        wpd.popup.show('colorPickerBG');
    }

    function pickFGColor(mode) {
        wpd.popup.close('colorPickerFG');
        var tool = new wpd.ColorPickerTool();
        tool.onComplete = function(col) {
                wpd.appData.getPlotData().getAutoDetector().fgColor = col;
                wpd.graphicsWidget.removeTool();
                startFGPicker();
            };
        wpd.graphicsWidget.setTool(tool); 
    }

    function pickBGColor(mode) {
        wpd.popup.close('colorPickerBG');
        var tool = new wpd.ColorPickerTool();
        tool.onComplete = function(col) {
                wpd.appData.getPlotData().getAutoDetector().bgColor = col;
                wpd.graphicsWidget.removeTool();
                startBGPicker();
            };
        wpd.graphicsWidget.setTool(tool); 
    }

    function setFGColor() {
        var fg_color = [];
        fg_color[0] = parseInt(document.getElementById('color_red_fg').value, 10);
	    fg_color[1] = parseInt(document.getElementById('color_green_fg').value, 10);
		fg_color[2] = parseInt(document.getElementById('color_blue_fg').value, 10);
        wpd.appData.getPlotData().getAutoDetector().fgColor = fg_color;
        wpd.popup.close('colorPickerFG');
        init();
    }

    function setBGColor() {
        var bg_color = [];
        bg_color[0] = parseInt(document.getElementById('color_red_bg').value, 10);
	    bg_color[1] = parseInt(document.getElementById('color_green_bg').value, 10);
		bg_color[2] = parseInt(document.getElementById('color_blue_bg').value, 10);
        wpd.appData.getPlotData().getAutoDetector().bgColor = bg_color;
        wpd.popup.close('colorPickerBG');
        init();
    }

    function changeColorDistance() {
        var color_distance = parseFloat(document.getElementById('color-distance-value').value);
        wpd.appData.getPlotData().getAutoDetector().colorDistance = color_distance;
    }

    function paintFilteredColor() {
         var ctx = wpd.graphicsWidget.getAllContexts(),
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            imageSize = wpd.graphicsWidget.getImageSize(),
            maski,
            img_index,
            imgx, imgy,
            dataLayer;

        dataLayer = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        autoDetector.generateBinaryData();
        
        if(autoDetector.mask == null || autoDetector.mask.length === 0) {
            return;
        }

        for(maski = 0; maski < autoDetector.mask.length; maski++) {
            img_index = autoDetector.mask[maski];
            if(autoDetector.binaryData[img_index] === true) {
                imgx = img_index % imageSize.width;
                imgy = parseInt(img_index/imageSize.width, 10);
                dataLayer.data[img_index*4] = 255;
                dataLayer.data[img_index*4+1] = 255;
                dataLayer.data[img_index*4+2] = 0;
                dataLayer.data[img_index*4+3] = 255;                
            } else {
                dataLayer.data[img_index*4] = 0;
                dataLayer.data[img_index*4+1] = 0;
                dataLayer.data[img_index*4+2] = 0;
                dataLayer.data[img_index*4+3] = 150;   
            }
        }

        ctx.oriDataCtx.putImageData(dataLayer, 0, 0);
        wpd.graphicsWidget.copyImageDataLayerToScreen();
    }

    function testColorDetection() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.setRepainter(new wpd.ColorFilterRepainter());
        paintFilteredColor(); 
    }
    
    function startPicker() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();
        if(wpd.appData.getPlotData().getAutoDetector().colorDetectionMode === 'fg') {
            startFGPicker();
        } else {
            startBGPicker();
        }
    }

    function changeDetectionMode() {
        var $modeSelector = document.getElementById('color-detection-mode-select');
        wpd.appData.getPlotData().getAutoDetector().colorDetectionMode = $modeSelector.value;
        init();
    }

    return {
        startPicker: startPicker,
        changeDetectionMode: changeDetectionMode,
        pickFGColor: pickFGColor,
        pickBGColor: pickBGColor,
        setFGColor: setFGColor,
        setBGColor: setBGColor,
        changeColorDistance: changeColorDistance,
        init: init,
        testColorDetection: testColorDetection,
        paintFilteredColor: paintFilteredColor
    };
})();

wpd.ColorPickerTool = (function () {
    var Tool = function () {
        var ctx = wpd.graphicsWidget.getAllContexts();
        this.onMouseClick = function(ev, pos, imagePos) {
            var pixData = ctx.oriImageCtx.getImageData(imagePos.x, imagePos.y, 1, 1);
            this.onComplete([pixData.data[0], pixData.data[1], pixData.data[2]]);
        };
        this.onComplete = function(col) {};
    };
    return Tool;
})();


wpd.ColorFilterRepainter = (function () {
    var Painter = function () {
        this.painterName = 'colorFilterRepainter';

        this.onRedraw = function () {
            wpd.colorPicker.paintFilteredColor();
        };
    }
    return Painter;
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var imageOps = (function () {

    function hflip(idata, iwidth, iheight) {
        var rowi, coli, index, mindex, tval, p;
        for(rowi = 0; rowi < iheight; rowi++) {
            for(coli = 0; coli < iwidth/2; coli++) {
                index = 4*(rowi*iwidth + coli);
                mindex = 4*((rowi+1)*iwidth - (coli+1));
                for(p = 0; p < 4; p++) {
                    tval = idata.data[index + p];
                    idata.data[index + p] = idata.data[mindex + p];
                    idata.data[mindex + p] = tval;
                }
            }
        }
        return {
            imageData: idata,
            width: iwidth,
            height: iheight
        };
    }

    function vflip(idata, iwidth, iheight) {
        var rowi, coli, index, mindex, tval, p;
        for(rowi = 0; rowi < iheight/2; rowi++) {
            for(coli = 0; coli < iwidth; coli++) {
                index = 4*(rowi*iwidth + coli);
                mindex = 4*((iheight - (rowi+2))*iwidth + coli);
                for(p = 0; p < 4; p++) {
                    tval = idata.data[index + p];
                    idata.data[index + p] = idata.data[mindex + p];
                    idata.data[mindex + p] = tval;
                }
            }
        }
        return {
            imageData: idata,
            width: iwidth,
            height: iheight
        };
    }

    return {
        hflip: hflip,
        vflip: vflip
    };
})();

var cropStatus = 0;
var cropCoordinates = [0,0,0,0];

/**
 * Flip picture horizontally
 */
function hflip() {
	processingNote(true);
    wpd.graphicsWidget.runImageOp(imageOps.hflip);
	processingNote(false);
}

function vflip() {
    processingNote(true);
    wpd.graphicsWidget.runImageOp(imageOps.vflip);
    processingNote(false);
}

/**
 * Enable crop mode
 */
function cropPlot() {// crop image

	redrawCanvas();
	canvasMouseEvents.removeAll();
	canvasMouseEvents.add('mousedown',cropMousedown,true);
	canvasMouseEvents.add('mouseup',cropMouseup,true);
	canvasMouseEvents.add('mousemove',cropMousemove,true);
}

/**
 * Crop mode - mouse down
 */
function cropMousedown(ev) {
	var posn = getPosition(ev),
		xi = posn.x,
		yi = posn.y;

	cropCoordinates[0] = xi;
	cropCoordinates[1] = yi;
	cropStatus = 1;
}

/**
 * Crop mode - mouse up
 */
function cropMouseup(ev) {

	var posn = getPosition(ev),
		xi = posn.x,
		yi = posn.y;

      cropCoordinates[2] = xi;
      cropCoordinates[3] = yi;
      cropStatus = 0;
      
      hoverCanvas.width = hoverCanvas.width;
            
      cropWidth = cropCoordinates[2]-cropCoordinates[0];
      cropHeight = cropCoordinates[3]-cropCoordinates[1];
      if ((cropWidth > 0) && (cropHeight > 0)) {

		var tcan = document.createElement('canvas');
		var tcontext = tcan.getContext('2d');
		
		tcan.width = cropWidth;
		tcan.height = cropHeight;
		
		var cropImageData = ctx.getImageData(cropCoordinates[0],cropCoordinates[1],cropWidth,cropHeight);  
				
		tcontext.putImageData(cropImageData,0,0);
		cropSrc = tcan.toDataURL();
		cropImg = new Image();
		cropImg.src = cropSrc;
		cropImg.onload = function() { loadImage(cropImg); }
				
      }
      
}

/**
 * Crop mode - mouse move
 */
function cropMousemove(ev) {

	
	var posn = getPosition(ev),
		xi = posn.x,
		yi = posn.y;

      // this paints a rectangle as the mouse moves
      if(cropStatus == 1) {
        hoverCanvas.width = hoverCanvas.width;
		hoverCtx.strokeStyle = "rgb(0,0,0)";
		hoverCtx.strokeRect(cropCoordinates[0], cropCoordinates[1], xi-cropCoordinates[0], yi-cropCoordinates[1]);
      }
}

/**
 * Restore to original image
 */
function restoreOriginalImage() {
	loadImage(originalImage);
}

/**
 * Rotate image by a certain specified angle. Not implemented yet.
 */
function rotateCanvas() {}// Rotate by a specified amount.

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.keyCodes = (function () {
    return {
        isUp: function(code) {
            return code === 38;
        },
        isDown: function(code) {
            return code === 40;
        },
        isLeft: function(code) {
            return code === 37;
        },
        isRight: function(code) {
            return code === 39;
        },
        isAlphabet: function(code, alpha) {
            if (code > 90 || code < 65) {
                return false;
            }
            return String.fromCharCode(code).toLowerCase() === alpha;
        }
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.acquireData = (function () {
    function load() {
        if(!wpd.appData.isAligned()) {
            wpd.messagePopup.show("Acquire Data", "Please calibrate the axes before acquiring data.");
        } else {
            wpd.sidebar.show('acquireDataSidebar');
            wpd.dataPointCounter.setCount();
            wpd.graphicsWidget.removeTool();
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter());

            manualSelection();
        }
    }

    function manualSelection() {
        var tool = new wpd.ManualSelectionTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function deletePoint() {
        var tool = new wpd.DeleteDataPointTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function clearAll() {
        wpd.appData.getPlotData().getActiveDataSeries().clearAll()
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.dataPointCounter.setCount();
    }

    function undo() {
        wpd.appData.getPlotData().getActiveDataSeries().removeLastPixel();
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount();
    }
 
    function showSidebar() {
        wpd.sidebar.show('acquireDataSidebar');
    }

    function adjustPoints() {
        wpd.graphicsWidget.setTool(new wpd.AdjustDataPointTool());
    }

    function switchToolOnKeyPress(alphaKey) {
        switch(alphaKey) {
            case 'd': 
                deletePoint();
                break;
            case 'a': 
                manualSelection();
                break;
            case 's': 
                adjustPoints();
                break;
            default: 
                break;
        }
    }

    return {
        load: load,
        manualSelection: manualSelection,
        adjustPoints: adjustPoints,
        deletePoint: deletePoint,
        clearAll: clearAll,
        undo: undo,
        showSidebar: showSidebar,
        switchToolOnKeyPress: switchToolOnKeyPress
    };
})();


wpd.ManualSelectionTool = (function () {
    var Tool = function () {
        var ctx = wpd.graphicsWidget.getAllContexts(),
            plotData = wpd.appData.getPlotData();

        this.onAttach = function () {
            document.getElementById('manual-select-button').classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter());
        };

       
        this.onMouseClick = function (ev, pos, imagePos) {
            var activeDataSeries = plotData.getActiveDataSeries();
            activeDataSeries.addPixel(imagePos.x, imagePos.y);

            ctx.dataCtx.beginPath();
    		ctx.dataCtx.fillStyle = "rgb(200,0,0)";
	    	ctx.dataCtx.arc(pos.x, pos.y, 3, 0, 2.0*Math.PI, true);
		    ctx.dataCtx.fill();

            ctx.oriDataCtx.beginPath();
    		ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
	    	ctx.oriDataCtx.arc(imagePos.x, imagePos.y, 3, 0, 2.0*Math.PI, true);
		    ctx.oriDataCtx.fill();
            
            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointCounter.setCount();
        };

        this.onRemove = function () {
            document.getElementById('manual-select-button').classList.remove('pressed-button');
        };

        this.onKeyDown = function (ev) {
            var activeDataSeries = plotData.getActiveDataSeries(),
                lastPtIndex = activeDataSeries.getCount() - 1,
                lastPt = activeDataSeries.getPixel(lastPtIndex),
                stepSize = 0.5/wpd.graphicsWidget.getZoomRatio();

            if(wpd.keyCodes.isUp(ev.keyCode)) {
                lastPt.y = lastPt.y - stepSize;
            } else if(wpd.keyCodes.isDown(ev.keyCode)) {
                lastPt.y = lastPt.y + stepSize;
            } else if(wpd.keyCodes.isLeft(ev.keyCode)) {
                lastPt.x = lastPt.x - stepSize;
            } else if(wpd.keyCodes.isRight(ev.keyCode)) {
                lastPt.x = lastPt.x + stepSize;
            } else if(wpd.keyCodes.isAlphabet(ev.keyCode, 'a') 
                || wpd.keyCodes.isAlphabet(ev.keyCode, 's') 
                || wpd.keyCodes.isAlphabet(ev.keyCode, 'd')) {

                wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
                return;
            } else {
                return;
            }

            activeDataSeries.setPixelAt(lastPtIndex, lastPt.x, lastPt.y);
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomToImagePosn(lastPt.x, lastPt.y);
            ev.preventDefault();
        };
    };
    return Tool;
})();


wpd.DeleteDataPointTool = (function () {
    var Tool = function () {
        var ctx = wpd.graphicsWidget.getAllContexts(),
            plotData = wpd.appData.getPlotData();

        this.onAttach = function () {
            document.getElementById('delete-point-button').classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter());
        };

        this.onMouseClick = function(ev, pos, imagePos) {
            var activeDataSeries = plotData.getActiveDataSeries();
            activeDataSeries.removeNearestPixel(imagePos.x, imagePos.y);
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointCounter.setCount();
        };

        this.onKeyDown = function (ev) {
            if(wpd.keyCodes.isAlphabet(ev.keyCode, 'a') 
                || wpd.keyCodes.isAlphabet(ev.keyCode, 's') 
                || wpd.keyCodes.isAlphabet(ev.keyCode, 'd')) {

                wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
            }
        };

        this.onRemove = function () {
            document.getElementById('delete-point-button').classList.remove('pressed-button');
        };
    };
    return Tool;
})();


wpd.DataPointsRepainter = (function () {
    var Painter = function () {

        var drawPoints = function () {
            var ctx = wpd.graphicsWidget.getAllContexts(),
                 plotData = wpd.appData.getPlotData(),
                 activeDataSeries = plotData.getActiveDataSeries(),
                 dindex,
                 imagePos,
                 pos,
                 isSelected;

            for(dindex = 0; dindex < activeDataSeries.getCount(); dindex++) {
                imagePos = activeDataSeries.getPixel(dindex);
                isSelected = activeDataSeries.getSelectedPixels().indexOf(dindex) >= 0;
                pos = wpd.graphicsWidget.screenPx(imagePos.x, imagePos.y);

                ctx.dataCtx.beginPath();
                if(isSelected) {
                    ctx.dataCtx.fillStyle = "rgb(0,200,0)";
                } else {
                    ctx.dataCtx.fillStyle = "rgb(200,0,0)";
                }
                ctx.dataCtx.arc(pos.x, pos.y, 3, 0, 2.0*Math.PI, true);
                ctx.dataCtx.fill();

                ctx.oriDataCtx.beginPath();
                if(isSelected) {
                    ctx.oriDataCtx.fillStyle = "rgb(0,200,0)";
                } else {
                    ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
                }
                ctx.oriDataCtx.arc(imagePos.x, imagePos.y, 3, 0, 2.0*Math.PI, true);
                ctx.oriDataCtx.fill();
            }
        };
        
        this.painterName = 'dataPointsRepainter';

        this.onAttach = function () {
            wpd.graphicsWidget.resetData();
            drawPoints();
        };

        this.onRedraw = function () {
            drawPoints();
        };

        this.onForcedRedraw = function () {
            wpd.graphicsWidget.resetData();
            drawPoints();
        };
    };
    return Painter;
})();


wpd.AdjustDataPointTool = (function () {
    var Tool = function () {

        this.onAttach = function () {
            document.getElementById('manual-adjust-button').classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter());
        }; 
        
        this.onRemove = function () {
            var dataSeries = wpd.appData.getPlotData().getActiveDataSeries();
            dataSeries.unselectAll();
            wpd.graphicsWidget.forceHandlerRepaint();
            document.getElementById('manual-adjust-button').classList.remove('pressed-button');
        };

        this.onMouseClick = function (ev, pos, imagePos) {
            var dataSeries = wpd.appData.getPlotData().getActiveDataSeries();
            dataSeries.unselectAll();
            dataSeries.selectNearestPixel(imagePos.x, imagePos.y);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
        };

        this.onKeyDown = function (ev) {

            if(wpd.keyCodes.isAlphabet(ev.keyCode, 'a') 
                || wpd.keyCodes.isAlphabet(ev.keyCode, 's') 
                || wpd.keyCodes.isAlphabet(ev.keyCode, 'd')) {

                wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
                return;
            }

            var activeDataSeries = wpd.appData.getPlotData().getActiveDataSeries(),
                selIndex = activeDataSeries.getSelectedPixels()[0];

            if(selIndex == null) { return; }

            var selPoint = activeDataSeries.getPixel(selIndex),
                pointPx = selPoint.x,
                pointPy = selPoint.y,
                stepSize = ev.shiftKey === true ? 5/wpd.graphicsWidget.getZoomRatio() : 0.5/wpd.graphicsWidget.getZoomRatio();

            if(wpd.keyCodes.isUp(ev.keyCode)) {
                pointPy = pointPy - stepSize;
            } else if(wpd.keyCodes.isDown(ev.keyCode)) {
                pointPy = pointPy + stepSize;
            } else if(wpd.keyCodes.isLeft(ev.keyCode)) {
                pointPx = pointPx - stepSize;
            } else if(wpd.keyCodes.isRight(ev.keyCode)) {
                pointPx = pointPx + stepSize;
            } else {
                return;
            }
            
            activeDataSeries.setPixelAt(selIndex, pointPx, pointPy);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomToImagePosn(pointPx, pointPy);
            ev.preventDefault();
            ev.stopPropagation(); 
        };
    };
    return Tool;
})();

wpd.dataPointCounter = (function () {
    function setCount() {
        var $counters = document.getElementsByClassName('data-point-counter'),
            ci;
        for(ci = 0; ci < $counters.length; ci++) {
            $counters[ci].innerHTML = wpd.appData.getPlotData().getActiveDataSeries().getCount();
        }
    }

    return {
        setCount: setCount
    };
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};
wpd.dataMask = (function () {

    function grabMask(grabImageData) {
        // Mask is just a list of pixels with the yellow color in the data layer
        var ctx = wpd.graphicsWidget.getAllContexts(),
            imageSize = wpd.graphicsWidget.getImageSize(),
            maskDataPx = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height),
            maskData = [],
            i,
            mi = 0,
            autoDetector = wpd.appData.getPlotData().getAutoDetector();
        for(i = 0; i < maskDataPx.data.length; i+=4) {
            if (maskDataPx.data[i] === 255 && maskDataPx.data[i+1] === 255 && maskDataPx.data[i+2] === 0) {
                maskData[mi] = i/4; mi++;
            }
        }
        autoDetector.mask = maskData;
        if(grabImageData === true) {
            autoDetector.imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
            autoDetector.imageWidth = imageSize.width;
            autoDetector.imageHeight = imageSize.height;
        }
    }

    function drawMask() {
        var maskData = wpd.appData.getPlotData().getAutoDetector().mask;
        
        if(maskData == null || maskData.length === 0) {
            return;
        }

        var i, ix, iy, img_index, scr_index,
            ctx = wpd.graphicsWidget.getAllContexts(),
            imageSize = wpd.graphicsWidget.getImageSize(),
            oriData = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);

        for(i = 0; i < maskData.length; i++) {
            img_index = maskData[i];
            ix = img_index % imageSize.width;
            iy = parseInt(img_index / imageSize.height, 10);
            oriData.data[img_index*4] = 255;
            oriData.data[img_index*4+1] = 255;
            oriData.data[img_index*4+2] = 0;
            oriData.data[img_index*4+3] = 200;
        }

        ctx.oriDataCtx.putImageData(oriData, 0, 0, imageSize.width, imageSize.height);
        wpd.graphicsWidget.copyImageDataLayerToScreen();
    }

    function markBox() {
        var tool = new wpd.BoxMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function markPen() {
        var tool = new wpd.PenMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function eraseMarks() {
        var tool = new wpd.EraseMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function viewMask() {
        var tool = new wpd.ViewMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    return {
        grabMask: grabMask,
        drawMask: drawMask,
        markBox: markBox,
        markPen: markPen,
        eraseMarks: eraseMarks,
        viewMask: viewMask
    };
})();

wpd.BoxMaskTool = (function () {
    var Tool = function () {
        var isDrawing = false,
            topImageCorner,
            topScreenCorner,
            ctx = wpd.graphicsWidget.getAllContexts(),
            moveTimer,
            screen_pos,
            mouseMoveHandler = function() {
                wpd.graphicsWidget.resetHover();
                ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
    		    ctx.hoverCtx.strokeRect(topScreenCorner.x, topScreenCorner.y, screen_pos.x - topScreenCorner.x, screen_pos.y - topScreenCorner.y);
            };

        this.onAttach = function () {
            wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
            document.getElementById('box-mask').classList.add('pressed-button');
            document.getElementById('view-mask').classList.add('pressed-button');
        };

        this.onMouseDown = function(ev, pos, imagePos) {
            if(isDrawing === true) return;
            isDrawing = true;
            topImageCorner = imagePos;
            topScreenCorner = pos;
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if(isDrawing === false) return;
            screen_pos = pos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 5);
        };

        this.onMouseOut = function () {
            if(isDrawing === true) {
                clearTimeout(moveTimer);
                isDrawing = false;
                wpd.graphicsWidget.resetHover();
            }
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            if(isDrawing === false) {
                return;
            }
            clearTimeout(moveTimer);
            isDrawing = false;
            wpd.graphicsWidget.resetHover();
            ctx.dataCtx.fillStyle = "rgba(255,255,0,0.8)";
    	    ctx.dataCtx.fillRect(topScreenCorner.x, topScreenCorner.y, pos.x-topScreenCorner.x, pos.y-topScreenCorner.y);
            ctx.oriDataCtx.fillStyle = "rgba(255,255,0,0.8)";
            ctx.oriDataCtx.fillRect(topImageCorner.x, topImageCorner.y, imagePos.x - topImageCorner.x, imagePos.y - topImageCorner.y);
        };

        this.onRemove = function () {
            document.getElementById('box-mask').classList.remove('pressed-button');
            document.getElementById('view-mask').classList.remove('pressed-button');
            wpd.dataMask.grabMask(true);
        };
    };
    return Tool;
})();

wpd.PenMaskTool = (function () {
    var Tool = function () {
        var strokeWidth,
            ctx = wpd.graphicsWidget.getAllContexts(),
            isDrawing = false,
            moveTimer,
            screen_pos, image_pos,
            mouseMoveHandler = function() {
                ctx.dataCtx.strokeStyle = "rgba(255,255,0,0.8)";
        	    ctx.dataCtx.lineTo(screen_pos.x,screen_pos.y);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,0.8)";
        	    ctx.oriDataCtx.lineTo(image_pos.x,image_pos.y);
                ctx.oriDataCtx.stroke();
            };

        this.onAttach = function () {
            wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
            document.getElementById('pen-mask').classList.add('pressed-button');
            document.getElementById('view-mask').classList.add('pressed-button');
        };

        this.onMouseDown = function(ev, pos, imagePos) {
            if(isDrawing === true) return;
            isDrawing = true;
            ctx.dataCtx.strokeStyle = "rgba(255,255,0,0.8)";
        	ctx.dataCtx.lineWidth = 20;
	        ctx.dataCtx.beginPath();
        	ctx.dataCtx.moveTo(pos.x,pos.y);

            ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,0.8)";
        	ctx.oriDataCtx.lineWidth = 20;
	        ctx.oriDataCtx.beginPath();
        	ctx.oriDataCtx.moveTo(imagePos.x,imagePos.y);
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if(isDrawing === false) return;
            screen_pos = pos;
            image_pos = imagePos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 5);
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            clearTimeout(moveTimer);
            ctx.dataCtx.closePath();
            ctx.dataCtx.lineWidth = 1;
            ctx.oriDataCtx.closePath();
            ctx.oriDataCtx.lineWidth = 1;
            isDrawing = false;
        };
        
        this.onMouseOut = function(ev, pos, imagePos) {
            this.onMouseUp(ev, pos, imagePos);
        };

        this.onRemove = function() {
            document.getElementById('pen-mask').classList.remove('pressed-button');
            document.getElementById('view-mask').classList.remove('pressed-button');
            wpd.dataMask.grabMask(true);
        };

    };
    return Tool;
})();

wpd.EraseMaskTool = (function () {
    var Tool = function() {
        var strokeWidth,
            ctx = wpd.graphicsWidget.getAllContexts(),
            isDrawing = false,
            moveTimer,
            screen_pos, image_pos,
            mouseMoveHandler = function() {

	            ctx.dataCtx.globalCompositeOperation = "destination-out";
                ctx.oriDataCtx.globalCompositeOperation = "destination-out";

                ctx.dataCtx.strokeStyle = "rgba(255,255,0,1)";
        	    ctx.dataCtx.lineTo(screen_pos.x,screen_pos.y);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,1)";
        	    ctx.oriDataCtx.lineTo(image_pos.x,image_pos.y);
                ctx.oriDataCtx.stroke();
            };

        this.onAttach = function() {
             wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
             document.getElementById('erase-mask').classList.add('pressed-button');
             document.getElementById('view-mask').classList.add('pressed-button');
        };

        this.onMouseDown = function(ev, pos, imagePos) {
            if(isDrawing === true) return;
            isDrawing = true;
	        ctx.dataCtx.globalCompositeOperation = "destination-out";
            ctx.oriDataCtx.globalCompositeOperation = "destination-out";

            ctx.dataCtx.strokeStyle = "rgba(0,0,0,1)";
        	ctx.dataCtx.lineWidth = 20;
	        ctx.dataCtx.beginPath();
        	ctx.dataCtx.moveTo(pos.x,pos.y);

            ctx.oriDataCtx.strokeStyle = "rgba(0,0,0,1)";
        	ctx.oriDataCtx.lineWidth = 20;
	        ctx.oriDataCtx.beginPath();
        	ctx.oriDataCtx.moveTo(imagePos.x,imagePos.y);
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if(isDrawing === false) return;
            screen_pos = pos;
            image_pos = imagePos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 5);
        };

        this.onMouseOut = function(ev, pos, imagePos) {
            this.onMouseUp(ev, pos, imagePos);
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            clearTimeout(moveTimer);
            ctx.dataCtx.closePath();
            ctx.dataCtx.lineWidth = 1;
            ctx.oriDataCtx.closePath();
            ctx.oriDataCtx.lineWidth = 1;

            ctx.dataCtx.globalCompositeOperation = "source-over";
            ctx.oriDataCtx.globalCompositeOperation = "source-over";

            isDrawing = false;
        };

        this.onRemove = function() {
            document.getElementById('erase-mask').classList.remove('pressed-button');
            document.getElementById('view-mask').classList.remove('pressed-button');
            wpd.dataMask.grabMask(true);
        };
       
    };
    return Tool;
})();

wpd.ViewMaskTool = (function() {

    var Tool = function() {

        this.onAttach = function () {
            wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
            document.getElementById('view-mask').classList.add('pressed-button');
        };

        this.onRemove = function () {
            document.getElementById('view-mask').classList.remove('pressed-button');
            wpd.dataMask.grabMask(true);
        };
    };

    return Tool;
})();

wpd.MaskPainter = (function() {
    var Painter = function () {

        var ctx = wpd.graphicsWidget.getAllContexts(),
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            painter = function () {
                if(autoDetector.mask == null || autoDetector.mask.length === 0) {
                    return;
                }
                var maski, img_index,
                    imageSize = wpd.graphicsWidget.getImageSize();
                    imgData = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);

                for(maski = 0; maski < autoDetector.mask.length; maski++) {
                    img_index = autoDetector.mask[maski];
                    imgData.data[img_index*4] = 255;
                    imgData.data[img_index*4+1] = 255;
                    imgData.data[img_index*4+2] = 0;
                    imgData.data[img_index*4+3] = 200;
                }

                ctx.oriDataCtx.putImageData(imgData, 0, 0);
                wpd.graphicsWidget.copyImageDataLayerToScreen();
            };

        this.painterName = 'dataMaskPainter';

        this.onRedraw = function () {
            wpd.dataMask.grabMask(true);
            painter();
        };

        this.onAttach = function () {
            wpd.graphicsWidget.resetData();
            painter();
        };
    };
    return Painter;
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.distanceMeasurement = (function () {

    function start() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        var plotData = wpd.appData.getPlotData();
        if (plotData.distanceMeasurementData == null) {
            plotData.distanceMeasurementData = new wpd.ConnectedPoints(2);
        }
        wpd.sidebar.show('measure-distances-sidebar');
        wpd.graphicsWidget.setTool(new wpd.AdjustMeasurementTool('distance'));
        wpd.graphicsWidget.forceHandlerRepaint();
    }

    function addPair() {
        wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool('distance'));
    }

    function deletePair() {
        wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool('distance'));
    }

    function clearAll() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.appData.getPlotData().distanceMeasurementData = new wpd.ConnectedPoints(2);
    }

    return {
        start: start,
        addPair: addPair,
        deletePair: deletePair,
        clearAll: clearAll
    };
})();

wpd.angleMeasurement = (function () {
    function start() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        var plotData = wpd.appData.getPlotData();
        if (plotData.angleMeasurementData == null) {
            plotData.angleMeasurementData = new wpd.ConnectedPoints(3);
        }
        wpd.sidebar.show('measure-angles-sidebar');
        wpd.graphicsWidget.setTool(new wpd.AdjustMeasurementTool('angle'));
        wpd.graphicsWidget.forceHandlerRepaint();
    }

    function addAngle() {
        wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool('angle'));
    }

    function deleteAngle() {
        wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool('angle'));
    }

    function clearAll() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.appData.getPlotData().angleMeasurementData = new wpd.ConnectedPoints(3);
    }

    return {
        start: start,
        addAngle: addAngle,
        deleteAngle: deleteAngle,
        clearAll: clearAll 
    };
})();

wpd.AddMeasurementTool = (function () {
    var Tool = function (mode) {
        var isDistanceMode = mode === 'distance',
            isAngleMode = mode === 'angle',
            ctx = wpd.graphicsWidget.getAllContexts(),
            plotData = wpd.appData.getPlotData(),
            
            pointsCaptured = 0,
            isCapturing = true,
            plist = [],
            maxPts = isDistanceMode ? 2 : 3;

        this.onAttach = function () {
            var btnId = (isDistanceMode === true) ? 'add-pair-button' : 'add-angle-button';
            document.getElementById(btnId).classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.MeasurementRepainter(mode));
        };

        this.onRemove = function () {
            var btnId = (isDistanceMode === true) ? 'add-pair-button' : 'add-angle-button';
            document.getElementById(btnId).classList.remove('pressed-button');
        };

        this.onMouseClick = function (ev, pos, imagePos) {
            if(isCapturing) {

                wpd.graphicsWidget.resetHover();

                plist[pointsCaptured*2] = imagePos.x;
                plist[pointsCaptured*2 + 1] = imagePos.y;
                pointsCaptured = pointsCaptured + 1;

                if(pointsCaptured === maxPts) {
                    isCapturing = false;

                    if(isDistanceMode) {
                        plotData.distanceMeasurementData.addConnection(plist);
                    } else {
                        plotData.angleMeasurementData.addConnection(plist);
                    }
                    wpd.graphicsWidget.forceHandlerRepaint();
                    wpd.graphicsWidget.setTool(new wpd.AdjustMeasurementTool(mode));
                }

                if(pointsCaptured > 1) {
                    // draw line from previous point to current
                    var prevScreenPx = wpd.graphicsWidget.screenPx(plist[(pointsCaptured-2)*2], plist[(pointsCaptured-2)*2 + 1]);
                    ctx.dataCtx.beginPath();
                    ctx.dataCtx.strokeStyle = "rgb(0,0,10)";
                    ctx.dataCtx.moveTo(prevScreenPx.x, prevScreenPx.y);
                    ctx.dataCtx.lineTo(pos.x, pos.y);
                    ctx.dataCtx.stroke();

                    ctx.oriDataCtx.beginPath();
                    ctx.oriDataCtx.strokeStyle = "rgb(0,0,10)";
                    ctx.oriDataCtx.moveTo(plist[(pointsCaptured-2)*2], plist[(pointsCaptured-2)*2 + 1]);
                    ctx.oriDataCtx.lineTo(imagePos.x, imagePos.y);
                    ctx.oriDataCtx.stroke();
                }

                // draw current point
                ctx.dataCtx.beginPath();
                ctx.dataCtx.fillStyle = "rgb(200, 0, 0)";
                ctx.dataCtx.arc(pos.x, pos.y, 3, 0, 2.0*Math.PI, true);
                ctx.dataCtx.fill();

                ctx.oriDataCtx.beginPath();
    	    	ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
	        	ctx.oriDataCtx.arc(imagePos.x, imagePos.y, 3, 0, 2.0*Math.PI, true);
	    	    ctx.oriDataCtx.fill();

            }
            wpd.graphicsWidget.updateZoomOnEvent(ev); 
        };

        this.onMouseMove = function (ev, pos, imagePos) {
            if(isCapturing && pointsCaptured >= 1) {
                wpd.graphicsWidget.resetHover();
                var prevScreenPx = wpd.graphicsWidget.screenPx(plist[(pointsCaptured-1)*2], plist[(pointsCaptured-1)*2 + 1]);

                ctx.hoverCtx.beginPath();
                ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
                ctx.hoverCtx.moveTo(prevScreenPx.x, prevScreenPx.y);
                ctx.hoverCtx.lineTo(pos.x, pos.y);
                ctx.hoverCtx.stroke();
            }
        };

        this.onKeyDown = function (ev) {

        };

    };
    return Tool;
})();

wpd.DeleteMeasurementTool = (function () {
    var Tool = function (mode) {
        var isDistanceMode = mode === 'distance',
            isAngleMode = mode === 'angle',
            ctx = wpd.graphicsWidget.getAllContexts(),
            plotData = wpd.appData.getPlotData();

        this.onAttach = function () {
            var btnId = (isDistanceMode === true) ? 'delete-pair-button' : 'delete-angle-button';
            document.getElementById(btnId).classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.MeasurementRepainter(mode));
        };

        this.onRemove = function () {
            var btnId = (isDistanceMode === true) ? 'delete-pair-button' : 'delete-angle-button';
            document.getElementById(btnId).classList.remove('pressed-button');
        };

        this.onMouseClick = function (ev, pos, imagePos) {
            if(isDistanceMode) {
                plotData.distanceMeasurementData.deleteNearestConnection(imagePos.x, imagePos.y);
            } else {
                plotData.angleMeasurementData.deleteNearestConnection(imagePos.x, imagePos.y);
            }
            wpd.graphicsWidget.setTool(new wpd.AdjustMeasurementTool(mode));
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
        };

    };
    return Tool;
})();

wpd.AdjustMeasurementTool = (function () {
    var Tool = function (mode) {
        this.onAttach = function () {
            wpd.graphicsWidget.setRepainter(new wpd.MeasurementRepainter(mode));
        };

        this.onMouseClick = function (ev, pos, imagePos) {
            // select the nearest point
            var plotData = wpd.appData.getPlotData();
            if(mode === 'distance') {
                plotData.distanceMeasurementData.selectNearestPoint(imagePos.x, imagePos.y);
            } else if (mode === 'angle') {
                plotData.angleMeasurementData.selectNearestPoint(imagePos.x, imagePos.y);
            }
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
        };

        this.onKeyDown = function (ev) {
            // move the selected point or switch tools
            if(wpd.keyCodes.isAlphabet(ev.keyCode, 'a')) {
                wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(mode));
                return;
            } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'd')) {
                wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool(mode));
                return;
            }

            var plotData = wpd.appData.getPlotData(),
                measurementData = mode === 'distance' ? plotData.distanceMeasurementData : plotData.angleMeasurementData,
                selectedPt = measurementData.getSelectedConnectionAndPoint();

            if(selectedPt.connectionIndex >= 0 && selectedPt.pointIndex >= 0) {

                var stepSize = ev.shiftKey === true ? 5/wpd.graphicsWidget.getZoomRatio() : 0.5/wpd.graphicsWidget.getZoomRatio(),
                    pointPx = measurementData.getPointAt(selectedPt.connectionIndex, selectedPt.pointIndex);

                if(wpd.keyCodes.isUp(ev.keyCode)) {
                    pointPx.y = pointPx.y - stepSize;
                } else if(wpd.keyCodes.isDown(ev.keyCode)) {
                    pointPx.y = pointPx.y + stepSize;
                } else if(wpd.keyCodes.isLeft(ev.keyCode)) {
                    pointPx.x = pointPx.x - stepSize;
                } else if(wpd.keyCodes.isRight(ev.keyCode)) {
                    pointPx.x = pointPx.x + stepSize;
                } else {
                    return;
                }
                
                measurementData.setPointAt(selectedPt.connectionIndex, selectedPt.pointIndex, pointPx.x, pointPx.y);
                wpd.graphicsWidget.forceHandlerRepaint();
                wpd.graphicsWidget.updateZoomToImagePosn(pointPx.x, pointPx.y);
                ev.preventDefault();
                ev.stopPropagation();
            }
        };
    };
    return Tool;
})();

wpd.MeasurementRepainter = (function () {
    var Painter = function (mode) {
        var isDistanceMode = mode === 'distance',
            isAngleMode = mode === 'angle',
            ctx = wpd.graphicsWidget.getAllContexts(),

            drawLine = function(sx0, sy0, sx1, sy1, ix0, iy0, ix1, iy1) {

                ctx.dataCtx.beginPath();
                ctx.dataCtx.strokeStyle = "rgb(0,0,10)";
                ctx.dataCtx.moveTo(sx0, sy0);
                ctx.dataCtx.lineTo(sx1, sy1);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.beginPath();
                ctx.oriDataCtx.strokeStyle = "rgb(0,0,10)";
                ctx.oriDataCtx.moveTo(ix0, iy0);
                ctx.oriDataCtx.lineTo(ix1, iy1);
                ctx.oriDataCtx.stroke();

            },

            drawPoint = function(sx, sy, ix, iy, isSelected) {

                ctx.dataCtx.beginPath();
                if(isSelected) {
                    ctx.dataCtx.fillStyle = "rgb(0, 200, 0)";
                } else {
                    ctx.dataCtx.fillStyle = "rgb(200, 0, 0)";
                }
                ctx.dataCtx.arc(sx, sy, 3, 0, 2.0*Math.PI, true);
                ctx.dataCtx.fill();

                ctx.oriDataCtx.beginPath();
                if(isSelected) {
                    ctx.oriDataCtx.fillStyle = "rgb(0,200,0)";
                } else {
                    ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
                }
                ctx.oriDataCtx.arc(ix, iy, 3, 0, 2.0*Math.PI, true);
                ctx.oriDataCtx.fill();

            },

            drawArc = function(sx, sy, ix, iy, theta1, theta2) {
                ctx.dataCtx.beginPath();
                ctx.dataCtx.strokeStyle = "rgb(0,0,10)";
                ctx.dataCtx.arc(sx, sy, 15, theta1, theta2, true);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.beginPath();
                ctx.oriDataCtx.strokeStyle = "rgb(0,0,10)";
                ctx.oriDataCtx.arc(ix, iy, 15, theta1, theta2, true);
                ctx.oriDataCtx.stroke();
            },

            drawLabel = function(sx, sy, ix, iy, lab) {
                ctx.dataCtx.font="14px sans-serif";
                ctx.dataCtx.fillText(lab, parseInt(sx,10), parseInt(sy,10));
                ctx.oriDataCtx.font="14px sans-serif";
                ctx.oriDataCtx.fillText(lab, parseInt(ix,10), parseInt(iy,10));
            },
            
            drawDistances = function () {
                var distData = wpd.appData.getPlotData().distanceMeasurementData,
                    conn_count = distData.connectionCount(),
                    conni,
                    plist,
                    x0, y0,
                    x1, y1,
                    spx0, spx1,
                    dist,
                    isSelected0, isSelected1;
                for(conni = 0; conni < conn_count; conni++) {
                    plist = distData.getConnectionAt(conni);
                    x0 = plist[0]; y0 = plist[1]; x1 = plist[2]; y1 = plist[3];
                    isSelected0 = distData.isPointSelected(conni, 0);
                    isSelected1 = distData.isPointSelected(conni, 1);
                    dist = '[' + conni.toString() + ']: ' + distData.getDistance(conni).toFixed(2);
                    spx0 = wpd.graphicsWidget.screenPx(x0, y0);
                    spx1 = wpd.graphicsWidget.screenPx(x1, y1);

                    // draw connecting lines:
                    drawLine(spx0.x, spx0.y, spx1.x, spx1.y, x0, y0, x1, y1);
                    
                    // draw data points:
                    drawPoint(spx0.x, spx0.y, x0, y0, isSelected0);
                    drawPoint(spx1.x, spx1.y, x1, y1, isSelected1);
                    
                    // distance label
                    drawLabel(0.5*(spx0.x + spx1.x), 0.5*(spx0.y + spx1.y), 0.5*(x0 + x1), 0.5*(y0 + y1), dist);
                }
            },
            
            drawAngles = function () {
                var angleData = wpd.appData.getPlotData().angleMeasurementData,
                    conn_count = angleData.connectionCount(),
                    conni,
                    plist,
                    x0, y0, x1, y1, x2, y2,
                    spx0, spx1, spx2,
                    theta1, theta2, theta,
                    isSelected0, isSelected1, isSelected2;
                for(conni = 0; conni < conn_count; conni++) {
                    plist = angleData.getConnectionAt(conni);
                    x0 = plist[0]; y0 = plist[1]; x1 = plist[2]; y1 = plist[3]; x2 = plist[4]; y2 = plist[5];
                    isSelected0 = angleData.isPointSelected(conni, 0);
                    isSelected1 = angleData.isPointSelected(conni, 1);
                    isSelected2 = angleData.isPointSelected(conni, 2);
                    theta = '[' + conni.toString() + ']: ' + angleData.getAngle(conni).toFixed(2) + '°';
                    theta1 = Math.atan2((y0 - y1), x0 - x1);
                    theta2 = Math.atan2((y2 - y1), x2 - x1);
                    spx0 = wpd.graphicsWidget.screenPx(x0, y0);
                    spx1 = wpd.graphicsWidget.screenPx(x1, y1);
                    spx2 = wpd.graphicsWidget.screenPx(x2, y2);

                    // draw connecting lines:
                    drawLine(spx0.x, spx0.y, spx1.x, spx1.y, x0, y0, x1, y1);
                    drawLine(spx1.x, spx1.y, spx2.x, spx2.y, x1, y1, x2, y2);

                    // draw data points:
                    drawPoint(spx0.x, spx0.y, x0, y0, isSelected0);
                    drawPoint(spx1.x, spx1.y, x1, y1, isSelected1);
                    drawPoint(spx2.x, spx2.y, x2, y2, isSelected2);

                    // draw angle arc:
                    drawArc(spx1.x, spx1.y, x1, y1, theta1, theta2);

                    // angle label
                    drawLabel(spx1.x + 10, spx1.y + 15, x1 + 10, y1 + 15, theta);
                    
                }
            };

        this.painterName = 'measurementRepainter-'+mode;

        this.onAttach = function () {
            wpd.graphicsWidget.resetData();
        };

        this.onRedraw = function () {
            if(isDistanceMode) {
                drawDistances();
            }
            if(isAngleMode) {
                drawAngles();
            }
        };

        this.onForcedRedraw = function () {
            wpd.graphicsWidget.resetData();
            this.onRedraw();
        };
    };
    return Painter;
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.saveResume = (function () {

    function save() {
        // TRIAL CODE!!
        // None of this works...

        var appData = wpd.appData,
            //appDataBSON = BSON.serialize(appData),
            appDataJSON = JSON.stringify(appData.getPlotData().getAutoDetector().imageData),
            
            formContainer,
            formElement,
            formData;

        // Create a hidden form and submit
        formContainer = document.createElement('div'),
        formElement = document.createElement('form'),
        formData = document.createElement('input');

        formElement.setAttribute('method', 'post');
        //formElement.setAttribute('action', 'php/bson.php');
        formElement.setAttribute('action', 'php/bson.php');

        formData.setAttribute('type', "text");
        formData.setAttribute('name', "data");

        formElement.appendChild(formData);
        formContainer.appendChild(formElement);
        document.body.appendChild(formContainer);
        formContainer.style.display = 'none';

        //formData.setAttribute('value', appDataBSON);
        formData.setAttribute('value', appDataJSON);

        formElement.submit();
        document.body.removeChild(formContainer);
    }

    return {
        save: save
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.scriptInjector = (function () {
    
    function start() {
        wpd.popup.show('runScriptPopup');
    }

    function cancel() {
        wpd.popup.close('runScriptPopup');
    }

    function load() {
        var $scriptFileInput = document.getElementById('runScriptFileInput');
        wpd.popup.close('runScriptPopup');
        if($scriptFileInput.files.length == 1) {
            var fileReader = new FileReader();
            fileReader.onload = function() {
                eval(fileReader.result);
                wpdscript.run();
                window["wpdscript"] = wpdscript;
            };
            fileReader.readAsText($scriptFileInput.files[0]);
        }
    }

    function injectHTML() {
    }

    function injectCSS() {
    }

    return {
        start: start,
        cancel: cancel,
        load: load
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

// browserInfo.js - browser and available HTML5 feature detection
var wpd = wpd || {};
wpd.browserInfo = (function () {

    function checkBrowser() {
        if(!window.FileReader) {
            alert('\tWARNING!\nYour web browser is not supported. This program might not behave as intended. Please use a recent version of Google Chrome, Firefox or Safari browser.');
        }
    }

    return {
        checkBrowser : checkBrowser
    };
})();
