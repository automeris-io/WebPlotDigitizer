/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
    if(!wpd.loadRemoteData()) {
        wpd.graphicsWidget.loadImageFromURL('start.png');
        //wpd.messagePopup.show('Unstable Version Warning!', 'You are using a beta version of WebPlotDigitizer. There may be some issues with the software that are expected.');
    }
    document.getElementById('loadingCurtain').style.display = 'none';

};

wpd.loadRemoteData = function() {

    if(typeof wpdremote === "undefined") { 
        return false; 
    }
    if(wpdremote.status != null && wpdremote.status === 'fail') {
        wpd.messagePopup.show('Remote Upload Failed!', 'Remote Upload Failed!');
        return false;
    }
    if(wpdremote.status === 'success' && wpdremote.localUrl != null) {
        wpd.graphicsWidget.loadImageFromURL(wpdremote.localUrl);
        wpd.popup.show('axesList');
        return true;
    }
    return false;
};

document.addEventListener("DOMContentLoaded", wpd.initApp, true);

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
        plotData = null;
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

    function plotLoaded(imageData) {
        getPlotData().topColors = wpd.colorAnalyzer.getTopColors(imageData);
    }

    return {
        isAligned: isAlignedFn,
        getPlotData: getPlotData,
        reset: reset,
        plotLoaded: plotLoaded
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
        this.gridMask = { xmin: null, xmax: null, ymin: null, ymax: null, pixels: [] };
        this.gridLineColor = [150, 150, 150];
        this.gridColorDistance = 150;
        this.gridData = null;
        this.colorDetectionMode = 'fg';
        this.colorDistance = 120;
        this.algorithm = null;
        this.binaryData = null;
        this.gridBinaryData = null;
        this.imageData = null;
        this.imageWidth = 0;
        this.imageHeight = 0;
        
        this.reset = function () {
            this.mask = null;
            this.binaryData = null;
            this.imageData = null;
            this.gridData = null;
            this.gridMask = { xmin: null, xmax: null, ymin: null, ymax: null, pixels: [] };
        };

        this.generateBinaryDataFromMask = function () {

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

        this.generateBinaryDataUsingFullImage = function () {
            
            var dist, img_index,
                ref_color = this.colorDetectionMode === 'fg' ? this.fgColor : this.bgColor; 

            for(img_index = 0; img_index < this.imageData.data.length/4; img_index++) {
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

        this.generateBinaryData = function () {

            this.binaryData = [];

            if(this.imageData == null) {
                this.imageHeight = 0;
                this.imageWidth = 0;
                return;
            }

            this.imageHeight = this.imageData.height;
            this.imageWidth = this.imageData.width;

            if (this.mask == null || this.mask.length === 0) {
                this.generateBinaryDataUsingFullImage();
            } else {
                this.generateBinaryDataFromMask();
            }
        };

        this.generateGridBinaryData = function () {
            this.gridBinaryData = [];

            if (this.gridMask.pixels == null || this.gridMask.pixels.length === 0) {
                return; // TODO: Allow full image to be used if no mask is present.
            }

            if (this.imageData == null) {
                this.imageWidth = 0;
                this.imageHeight = 0;
                return;
            }

            this.imageWidth = this.imageData.width;
            this.imageHeight = this.imageData.height;

            var maski, img_index, dist;

            for (maski = 0; maski < this.gridMask.pixels.length; maski++) {
                img_index = this.gridMask.pixels[maski];
                dist = wpd.dist3d(this.gridLineColor[0], this.gridLineColor[1], this.gridLineColor[2],
                                  this.imageData.data[img_index*4], this.imageData.data[img_index*4 + 1],
                                  this.imageData.data[img_index*4 + 2]);
                if (dist < this.gridColorDistance) {
                    this.gridBinaryData[img_index] = true;
                }
            }
        };

    };
    return obj;
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd = wpd || {};

wpd.ColorGroup = (function () {
    var CGroup = function(tolerance) {
        
        var totalPixelCount = 0,
            averageColor = {r: 0, g: 0, b: 0};
        
        tolerance = tolerance == null ? 100 : tolerance;

        this.getPixelCount = function () {
            return totalPixelCount;
        };

        this.getAverageColor = function () {
            return averageColor;
        };

        this.isColorInGroup = function (r, g, b) {
            if (totalPixelCount === 0) {
                return true;
            }

            var dist = (averageColor.r - r)*(averageColor.r - r) + (averageColor.g - g)*(averageColor.g - g) + (averageColor.b - b)*(averageColor.b - b);

            return (dist <= tolerance*tolerance);
        };

        this.addPixel = function (r, g, b) {
            averageColor.r = (averageColor.r*totalPixelCount + r)/(totalPixelCount + 1.0);
            averageColor.g = (averageColor.g*totalPixelCount + g)/(totalPixelCount + 1.0);
            averageColor.b = (averageColor.b*totalPixelCount + b)/(totalPixelCount + 1.0);
            totalPixelCount = totalPixelCount + 1;
        };

    };
    return CGroup;
})();



wpd.colorAnalyzer = (function () {

    function getTopColors (imageData) {

        var colorGroupColl = [], // collection of color groups
            pixi,
            r, g, b,
            groupi,
            groupMatched,
            rtnVal = [],
            avColor,
            tolerance = 120;

        colorGroupColl[0] = new wpd.ColorGroup(tolerance); // initial group
        
        for (pixi = 0; pixi < imageData.data.length; pixi += 4) {
            r = imageData.data[pixi];
            g = imageData.data[pixi + 1];
            b = imageData.data[pixi + 2];

            groupMatched = false;

            for (groupi = 0; groupi < colorGroupColl.length; groupi++) {
                if (colorGroupColl[groupi].isColorInGroup(r, g, b)) {
                    colorGroupColl[groupi].addPixel(r, g, b);
                    groupMatched = true;
                    break;
                }
            }

            if (!groupMatched) {
                colorGroupColl[colorGroupColl.length] = new wpd.ColorGroup(tolerance);
                colorGroupColl[colorGroupColl.length - 1].addPixel(r, g, b);
            }
        }
        
        // sort groups
        colorGroupColl.sort(function(a, b) {
            if ( a.getPixelCount() > b.getPixelCount() ) {
                return -1;
            } else if (a.getPixelCount() < b.getPixelCount() ) {
                return 1;
            }
            return 0;
        });

        for (groupi = 0; groupi < colorGroupColl.length; groupi++) {
            
            avColor = colorGroupColl[groupi].getAverageColor();

            rtnVal[groupi] = {
                r: parseInt(avColor.r, 10),
                g: parseInt(avColor.g, 10),
                b: parseInt(avColor.b, 10),
                pixels: colorGroupColl[groupi].getPixelCount(),
                percentage: 100.0*colorGroupColl[groupi].getPixelCount()/(0.25*imageData.data.length)
            };
        }

        return rtnVal;
    }

    return {
        getTopColors: getTopColors
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
            };
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
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

// Data from a series
wpd.DataSeries = (function () {
    return function (dim) {
        var dataPoints = [],
            connections = [],
            selections = [],
            hasMetadata = false,
            mkeys = [];

        this.name = "Default Dataset";

        this.variableNames = ['x', 'y'];

        this.hasMetadata = function () {
            return hasMetadata;
        };

        this.setMetadataKeys = function (metakeys) {
            mkeys = metakeys;
        };

        this.getMetadataKeys = function () {
            return mkeys;
        };

        this.addPixel = function(pxi, pyi, mdata) {
            var dlen = dataPoints.length;
            dataPoints[dlen] = {x: pxi, y: pyi, metadata: mdata};
            if (mdata != null) {
                hasMetadata = true;
            }
        };

        this.getPixel = function(index) {
            return dataPoints[index];
        };

        this.setPixelAt = function (index, pxi, pyi) {
            if(index < dataPoints.length) {
                dataPoints[index].x = pxi;
                dataPoints[index].y = pyi;
            }
        };

        this.setMetadataAt = function (index, mdata) {
            if (index < dataPoints.length) {
                dataPoints[index].metadata = mdata;
            }
        };

        this.insertPixel = function(index, pxi, pyi, mdata) {
            dataPoints.splice(index, 0, {x: pxi, y: pyi, metadata: mdata});
        };

        this.removePixelAtIndex = function(index) {
            if(index < dataPoints.length) {
                dataPoints.splice(index, 1);
            }
        };

        this.removeLastPixel = function() {
            var pIndex = dataPoints.length - 1;
            this.removePixelAtIndex(pIndex);
        };

        this.findNearestPixel = function(x, y, threshold) {
            threshold = (threshold == null) ? 50 : parseFloat(threshold);
            var minDist, minIndex = -1, 
                i, dist;
            for(i = 0; i < dataPoints.length; i++) {
                dist = Math.sqrt((x - dataPoints[i].x)*(x - dataPoints[i].x) + (y - dataPoints[i].y)*(y - dataPoints[i].y));
                if((minIndex < 0 && dist <= threshold) || (minIndex >= 0 && dist < minDist)) {
                    minIndex = i;
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

        this.clearAll = function() { 
            dataPoints = []; 
            hasMetadata = false; 
            mkeys = []; 
        };

        this.getCount = function() { return dataPoints.length; };
 
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
            return minIndex;
        };

        this.selectNextPixel = function() {
            for(var i = 0; i < selections.length; i++) {
                selections[i] = (selections[i] + 1) % dataPoints.length;
            }
        };

        this.selectPreviousPixel = function() {
            var i, newIndex;
            for(i = 0; i < selections.length; i++) {
                newIndex = selections[i];
                if(newIndex === 0) {
                    newIndex = dataPoints.length - 1;
                } else {
                    newIndex = newIndex - 1;
                }
                selections[i] = newIndex;
            }
        };

        this.getSelectedPixels = function () {
            return selections;
        };

    };
})();


/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

        if(typeof input === "string") {
            if(input.indexOf('/') < 0) { return null; }
        }

        return toJD(input);
    }

    function toJD(dateString) {
        dateString = dateString.toString();
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
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.gridDetectionCore = (function () {

    var hasHorizontal, hasVertical, xDetectionWidth, yDetectionWidth, xMarkWidth, yMarkWidth;

    function run() {
        var gridData = [],
            xi,
            delx,
            yi,
            dely,
            pix,
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            xmin = autoDetector.gridMask.xmin,
            xmax = autoDetector.gridMask.xmax,
            ymin = autoDetector.gridMask.ymin,
            ymax = autoDetector.gridMask.ymax,
            xp, yp,
            dw = autoDetector.imageWidth,
            dh = autoDetector.imageHeight,
            linePixCount,
            linePix,
            pix_index,
            ii;

        if (hasVertical) {
        
            for (xi = xmin; xi <= xmax; xi += xDetectionWidth) {

                pix = [];
                linePix = [];
                linePixCount = 0;

                for ( xp = xi - xDetectionWidth; xp <= xi + xDetectionWidth; xp++ ) {

                    for (yi = ymin; yi <= ymax; yi++) {                        
                        pix_index = yi*dw + parseInt(xp, 10);
                        if (autoDetector.gridBinaryData[pix_index] === true) {
                            pix[pix.length] = pix_index;
                            if (!(linePix[yi] === true)) {
                                linePixCount++;
                                linePix[yi] = true;
                            }
                        }
                    }
                }

                if (linePixCount > (ymax - ymin)*0.3) {
                    for (ii = 0; ii < pix.length; ii++) {
                        gridData[pix[ii]] = true;
                    }
                }
            }
        }

        if (hasHorizontal) {
            for (yi = ymin; yi <= ymax; yi += yDetectionWidth) {
                pix = [];
                linePix = [];
                linePixCount = 0;

                for (yp = yi - yDetectionWidth; yp <= yi + yDetectionWidth; yp++) {
                    for (xi = xmin; xi <= xmax; xi++) {
                        pix_index = parseInt(yp, 10)*dw + xi;
                        if (autoDetector.gridBinaryData[pix_index] === true) {
                            pix[pix.length] = pix_index;
                            if(!(linePix[xi] === true)) {
                                linePixCount++;
                                linePix[xi] = true;
                            }
                        }
                    }
                }

                if (linePixCount > (xmax - xmin)*0.3) {
                    for (ii = 0; ii < pix.length; ii++) {
                        gridData[pix[ii]] = true;
                    }
                }
            }
        }

        wpd.appData.getPlotData().gridData = gridData;
    }

    function setHorizontalParameters(has_horizontal, y_det_w, y_mark_w) {
        hasHorizontal = has_horizontal;
        yDetectionWidth = y_det_w;
        yMarkWidth = y_mark_w;
    }

    function setVerticalParameters(has_vertical, x_det_w, x_mark_w) {
        hasVertical = has_vertical;
        xDetectionWidth = x_det_w;
        xMarkWidth = x_mark_w;
    }

    return {
        run: run,
        setHorizontalParameters: setHorizontalParameters,
        setVerticalParameters: setVerticalParameters
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

            if(typeof input === "string") {
                input = input.trim();

                if(input.indexOf('^') >= 0) {
                    return null;
                }
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.sqDist2d = function (x1, y1, x2, y2) {
    return (x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2);
};

wpd.sqDist3d = function (x1, y1, z1, x2, y2, z2) {
    return (x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2) + (z1 - z2)*(z1 - z2);
};

wpd.dist2d = function (x1, y1, x2, y2) {
    return Math.sqrt(wpd.sqDist2d(x1, y1, x2, y2));
};

wpd.dist3d = function (x1, y1, z1, x2, y2, z2) {
    return Math.sqrt(wpd.sqDist3d(x1, y1, z1, x2, y2, z2));
};

wpd.mat = (function () {
    
    function det2x2(m) {
        return m[0]*m[3] - m[1]*m[2];
    }

    function inv2x2(m) {
        var det = det2x2(m);
        return [m[3]/det, -m[1]/det, -m[2]/det, m[0]/det];
    }

    function mult2x2(m1, m2) {
        return [
                    m1[0]*m2[0] + m1[1]*m2[2], 
                    m1[0]*m2[1] + m1[1]*m2[3], 
                    m1[2]*m2[0] + m1[3]*m2[2], 
                    m1[2]*m2[1] + m1[3]*m2[3]
               ];
    }

    function mult2x2Vec(m, v) {
        return [m[0]*v[0] + m[1]*v[1], m[2]*v[0] + m[3]*v[1]];
    }

    function multVec2x2(v, m) {
        return [m[0]*v[0] + m[2]*v[1], m[1]*v[0] + m[3]*v[1]];
    }

    return {
        det2x2: det2x2,
        inv2x2: inv2x2,
        mult2x2: mult2x2,
        mult2x2Vec: mult2x2Vec,
        multVec2x2: multVec2x2
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

// Plot information
wpd.PlotData = (function () {
    var PlotData = function() {

        var activeSeriesIndex = 0,
            autoDetector = new wpd.AutoDetector();
        
        this.topColors = null;
        this.axes = null;
        this.dataSeriesColl = [];
        this.gridData = null;
        this.calibration = null;

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

        this.getActiveDataSeriesIndex = function() {
            return activeSeriesIndex;
        };

        this.getAutoDetector = function() {
            return autoDetector;
        };

        this.getDataSeriesNames = function() {
            var rtnVal = [];
            for(var i = 0; i < this.dataSeriesColl.length; i++) {
                rtnVal[i] = this.dataSeriesColl[i].name;
            }
            return rtnVal;
        };

        this.reset = function() {
            this.axes = null;
            this.angleMeasurementData = null;
            this.distanceMeasurementData = null;
            this.dataSeriesColl = [];
            this.gridData = null;
            this.calibration = null;
            activeSeriesIndex = 0;
            autoDetector = new wpd.AutoDetector();
        };
    };

    return PlotData;
})();


/*
    WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

    Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.AveragingWindowCore = (function () {
    var Algo = function (binaryData, imageHeight, imageWidth, dx, dy, dataSeries) {
        this.run = function () {
            var xPoints = [],
                xPointsPicked = 0,
                pointsPicked = 0,
                dw = imageWidth,
                dh = imageHeight,
                blobAvg = [],
                coli, rowi,
                firstbloby,
                bi, blobs, blbi, xi, yi,
                pi, inRange, xxi, oldX, oldY, avgX, avgY, newX, newY,
                matches,
                xStep = dx,
                yStep = dy;

            dataSeries.clearAll();

            for (coli = 0; coli < dw; coli++) {
                
                blobs = -1;
                firstbloby = -2.0*yStep;
                bi = 0;
                
                // Scan vertically for blobs:

                for (rowi = 0; rowi < dh; rowi++) {
                    if(binaryData[rowi*dw + coli] === true) {
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

              return dataSeries;
        };
    };
    return Algo;
})();

/*
    WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

    Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
            return [['ΔX', 'Px', 10], ['ΔY', 'Px', 10]];
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
                algoCore = new wpd.AveragingWindowCore(autoDetector.binaryData, autoDetector.imageHeight, autoDetector.imageWidth, xStep, yStep, dataSeries);

            algoCore.run();
        };

    };
    return Algo;
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.AveragingWindowWithStepSizeAlgo = (function () {
    var Algo = function () {

        var param_xmin, param_delx, param_xmax,
            param_linewidth, param_ymin, param_ymax;

        this.getParamList = function () {
            var isAligned = wpd.appData.isAligned(),
                axes = wpd.appData.getPlotData().axes;

            if(isAligned && axes instanceof wpd.XYAxes) {
                var bounds = axes.getBounds();
                return [["X_min","Units", bounds.x1],["ΔX Step","Units", 0.1],["X_max","Units", bounds.x2],["Y_min","Units", bounds.y3],["Y_max","Units", bounds.y4],["Line width","Px",30]];

            } 

            return [["X_min","Units", 0],["ΔX Step","Units", 0.1],["X_max","Units", 0],["Y_min","Units", 0],["Y_max","Units", 0],["Line width","Px",30]];
        };

        this.setParam = function (index, val) {
            if (index === 0) {
                param_xmin = val;
            } else if (index === 1) {
                param_delx = val;
            } else if (index === 2) {
                param_xmax = val;
            } else if (index === 3) {
                param_ymin = val;
            } else if (index === 4) {
                param_ymax = val;
            } else if (index === 5) {
                param_linewidth = val;
            }
        };

        this.run = function (plotData) {
            var autoDetector = plotData.getAutoDetector(),
                dataSeries = plotData.getActiveDataSeries(),
                axes = plotData.axes,
                pointsPicked = 0,
                dw = autoDetector.imageWidth,
                dh = autoDetector.imageHeight,
                blobx = [],
                bloby = [],
                xi, xmin_pix, xmax_pix, ymin_pix, ymax_pix, dpix, r_unit_per_pix, step_pix,
                blobActive, blobEntry, blobExit,
                blobExitLocked,
                ii, yi,
                mean_ii,
                mean_yi,
                pdata;

            dataSeries.clearAll();

            for (xi = param_xmin; xi <= param_xmax; xi+= param_delx) {
                step_pix = 1;

                pdata = axes.dataToPixel(xi, param_ymin);
                xmin_pix = pdata.x;
                ymin_pix = pdata.y;

                pdata = axes.dataToPixel(xi, param_ymax);
                xmax_pix = pdata.x;
                ymax_pix = pdata.y;

                dpix = Math.sqrt((ymax_pix-ymin_pix)*(ymax_pix-ymin_pix) + (xmax_pix-xmin_pix)*(xmax_pix-xmin_pix));
                r_unit_per_pix = (param_ymax-param_ymin)/dpix;

                blobActive = false;
                blobEntry = 0;
                blobExit = 0;
                // To account for noise or if actual thickness is less than specified thickness.
				// This flag helps to set blobExit at the end of the thin part or account for noise.
				blobExitLocked = false;

                for (ii = 0; ii <= dpix; ii++) {
                    yi = -ii*step_pix*r_unit_per_pix + param_ymax;
                    pdata = axes.dataToPixel(xi, yi);
                    xi_pix = pdata.x;
                    yi_pix = pdata.y;

                    if(xi_pix >= 0 && xi_pix < dw && yi_pix >=0 && yi_pix < dh)	{
                        if (autoDetector.binaryData[parseInt(yi_pix, 10)*dw + parseInt(xi_pix, 10)] === true) {
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

								mean_ii = (blobEntry + blobExit)/2.0;
								mean_yi = -mean_ii*step_pix*r_unit_per_pix + param_ymax;

								pdata = axes.dataToPixel(xi, mean_yi);
								dataSeries.addPixel(parseFloat(pdata.x), parseFloat(pdata.y));
								pointsPicked = pointsPicked + 1;
							}
						}
                    }
                }
            }

        };

    };
    return Algo;
})();

/*
    WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

    Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.BarValue = function () {
    this.npoints = 0;

    this.avgVal = 0;

    this.avgX = 0;

    this.append = function(x,val) {
        this.avgX = (this.npoints*this.avgX + x)/(this.npoints + 1.0);
        this.avgVal = (this.npoints*this.avgVal + val)/(this.npoints + 1.0);
        this.npoints++;
    };

    this.isPointInGroup = function(x,val,del_x, del_val) {
        if(this.npoints === 0) {
            return true;
        }

        if(Math.abs(this.avgX - x) <= del_x && Math.abs(this.avgVal - val) <= del_val) {
            return true;
        }

        return false;
    };
};


wpd.BarExtractionAlgo = function() {

    var delX, delVal;
    
    this.getParamList = function() {
        var axes = wpd.appData.getPlotData().axes,
            orientationAxes = axes.getOrientation().axes;

        if(orientationAxes === 'Y') {
            return [['ΔX', 'Px', 30], ['ΔVal', 'Px', 10]];
        } else {
            return [['ΔY', 'Px', 30], ['ΔVal', 'Px', 10]];
        }
    };

    this.setParam = function (index, val) {
        if (index === 0) {
            delX = parseFloat(val);
        } else if (index === 1) {
            delVal = parseFloat(val);
        }
    };

    this.run = function(plotData) {
        var autoDetector = plotData.getAutoDetector(),
            dataSeries = plotData.getActiveDataSeries(),
            orientation = plotData.axes.getOrientation(),
            barValueColl = [],
            px, py,
            width = autoDetector.imageWidth,
            height = autoDetector.imageHeight,
            pixelAdded,
            barValuei,
            bv,
            dataVal,
            pxVal,
            mkeys,
            
            detectData = function (pix_x, pix_y, dir) {
                if(autoDetector.binaryData[pix_y*width + pix_x]) {

                    pixelAdded = false;
                    barValuei = 0;
                    dataVal = [pix_x, pix_y];
                    
                    for(barValuei = 0; barValuei < barValueColl.length; barValuei++) {
                        bv = barValueColl[barValuei];
                        if(dir === 'Y') {
                            if(bv.isPointInGroup(dataVal[0], dataVal[1], delX, delVal)) {
                                bv.append(dataVal[0], dataVal[1]);
                                pixelAdded = true;
                                break;
                            }
                        } else { // X
                            if(bv.isPointInGroup(dataVal[1], dataVal[0], delX, delVal)) {
                                bv.append(dataVal[1], dataVal[0]);
                                pixelAdded = true;
                                break;
                            }
                        }
                    }
                    if(!pixelAdded) {
                        barValueColl.push(new wpd.BarValue());
                        if(dir === 'Y') {
                            barValueColl[barValueColl.length-1].append(dataVal[0], dataVal[1]);
                        } else {
                            barValueColl[barValueColl.length-1].append(dataVal[1], dataVal[0]);
                        }
                        pixelAdded = true;
                    }
                    return true;
                }
                return false;
            };

        dataSeries.clearAll();

        // Switch directions based on axes orientation and direction of data along that axes:
        if(orientation.axes === 'Y') {
            for (px = 0; px < width; px++) {
                if(orientation.direction === 'increasing') {
                    for(py = 0; py < height; py++) {
                        if(detectData(px, py, orientation.axes)) {
                            break;
                        }
                    }
                } else {
                    for(py = height-1; py >= 0; py--) {
                        if(detectData(px, py, orientation.axes)) {
                            break;
                        }
                    }
                }
            }
        } else {
            for (py = 0; py < height; py++) {
                if(orientation.direction === 'increasing') {
                    for(px = width-1; px >= 0; px--) {
                        if(detectData(px, py, orientation.axes)) {
                            break;
                        }
                    }
                } else {
                    for(px = 0; px < width; px++) {
                        if(detectData(px, py, orientation.axes)) {
                            break;
                        }
                    }
                }
            }
        }
        
        if(plotData.axes.dataPointsHaveLabels) {
            mkeys = dataSeries.getMetadataKeys();
            if(mkeys == null || mkeys[0] !== 'Label') {
                dataSeries.setMetadataKeys(['Label']);
            }
        }

        for(barValuei = 0; barValuei < barValueColl.length; barValuei++) {
            bv = barValueColl[barValuei];
            if(plotData.axes.dataPointsHaveLabels) {
                if(orientation.axes === 'Y') {
                    dataSeries.addPixel(bv.avgX, bv.avgVal, ["Bar" + barValuei]);
                } else {
                    dataSeries.addPixel(bv.avgVal, bv.avgX, ["Bar" + barValuei]);
                }
            } else {
                 if(orientation.axes === 'Y') {
                    dataSeries.addPixel(bv.avgX, bv.avgVal);
                } else {
                    dataSeries.addPixel(bv.avgVal, bv.avgX);
                }
            }
        }
    };
};
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
wpd = wpd || {};

wpd.BlobDetectorAlgo = (function () {
    
    var Algo = function () {
        var min_dia, max_dia;

        this.getParamList = function () {
            var isAligned = wpd.appData.isAligned(),
                axes = wpd.appData.getPlotData().axes;
            
            if (isAligned && axes instanceof wpd.MapAxes) { 
			    return [['Min Diameter', 'Units', 0], ['Max Diameter', 'Units', 5000]];
            }

			return [['Min Diameter', 'Px', 0], ['Max Diameter', 'Px', 5000]];
        };

        this.setParam = function (index, val) {
            if (index === 0) {
                min_dia = parseFloat(val);
            } else if (index === 1) {
                max_dia = parseFloat(val);
            }
        };

        this.run = function (plotData) {
            var autoDetector = plotData.getAutoDetector(),
                dataSeries = plotData.getActiveDataSeries(),
                dw = autoDetector.imageWidth,
                dh = autoDetector.imageHeight,
                pixelVisited = [],
                blobCount = 0,
                blobs = [],
                xi, yi,
                blobPtIndex,
                bIndex, 
                nxi, nyi,
                bxi, byi,
                pcount,
                dia;

            if (dw <= 0 || dh <= 0 || autoDetector.binaryData == null 
                || autoDetector.binaryData.length === 0) {
                return;
            }

            dataSeries.clearAll();
            dataSeries.setMetadataKeys(["area", "moment"]);

            for (xi = 0; xi < dw; xi++) {
                for (yi = 0; yi < dh; yi++) {
                    if (autoDetector.binaryData[yi*dw + xi] === true && !(pixelVisited[yi*dw + xi] === true)) {

                        pixelVisited[yi*dw + xi] = true;

                        bIndex = blobs.length;

                        blobs[bIndex] = {
                            pixels: [{x: xi, y: yi}],
                            centroid: {x: xi, y: yi},
                            area: 1.0,
                            moment: 0.0
                        };

                        blobPtIndex = 0;
                        while (blobPtIndex < blobs[bIndex].pixels.length) {
                            bxi = blobs[bIndex].pixels[blobPtIndex].x;
                            byi = blobs[bIndex].pixels[blobPtIndex].y;

                            for (nxi = bxi - 1; nxi <= bxi + 1; nxi++) {
                                for(nyi = byi - 1; nyi <= byi + 1; nyi++) {
                                    if (nxi >= 0 && nyi >= 0 && nxi < dw && nyi < dh) {
                                        if (!(pixelVisited[nyi*dw + nxi] === true) && autoDetector.binaryData[nyi*dw + nxi] === true) {

                                            pixelVisited[nyi*dw + nxi] = true;
                                            
                                            pcount = blobs[bIndex].pixels.length;

                                            blobs[bIndex].pixels[pcount] = {
                                                x: nxi,
                                                y: nyi
                                            };

                                            blobs[bIndex].centroid.x = (blobs[bIndex].centroid.x*pcount + nxi)/(pcount + 1.0);
                                            blobs[bIndex].centroid.y = (blobs[bIndex].centroid.y*pcount + nyi)/(pcount + 1.0);
                                            blobs[bIndex].area = blobs[bIndex].area + 1.0;
                                        }
                                    }
                                }
                            }
                            blobPtIndex = blobPtIndex + 1;
                        }
                    }
                }
            }

            for (bIndex = 0; bIndex < blobs.length; bIndex++) {
                blobs[bIndex].moment = 0;
                for (blobPtIndex = 0; blobPtIndex < blobs[bIndex].pixels.length; blobPtIndex++) {
                    blobs[bIndex].moment = blobs[bIndex].moment 
                        + (blobs[bIndex].pixels[blobPtIndex].x - blobs[bIndex].centroid.x)*(blobs[bIndex].pixels[blobPtIndex].x - blobs[bIndex].centroid.x)
                        + (blobs[bIndex].pixels[blobPtIndex].y - blobs[bIndex].centroid.y)*(blobs[bIndex].pixels[blobPtIndex].y - blobs[bIndex].centroid.y);
                        
                }
                if (plotData.axes instanceof wpd.MapAxes) {
                    blobs[bIndex].area = plotData.axes.pixelToDataArea(blobs[bIndex].area);
                }

                dia = 2.0*Math.sqrt(blobs[bIndex].area/Math.PI);
                if (dia <= max_dia && dia >= min_dia) {
                    dataSeries.addPixel(blobs[bIndex].centroid.x, blobs[bIndex].centroid.y, [blobs[bIndex].area, blobs[bIndex].moment]);
                }
            }
        };
    };

    return Algo;
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.XStepWithInterpolationAlgo = (function () {
    var Algo = function () {
        var param_xmin, param_delx, param_xmax, 
            param_smoothing, param_ymin, param_ymax;

        this.getParamList = function () {
            var isAligned = wpd.appData.isAligned(),
                axes = wpd.appData.getPlotData().axes;
        
            if(isAligned && axes instanceof wpd.XYAxes) {
                var bounds = axes.getBounds();
                return [["X_min","Units", bounds.x1],["ΔX Step","Units", (bounds.x2 - bounds.x1)/50.0], 
                        ["X_max","Units", bounds.x2],["Y_min","Units", bounds.y3],
                        ["Y_max","Units", bounds.y4],["Smoothing","% of ΔX", 0]];

            } 

            return [["X_min","Units", 0],["ΔX Step","Units", 0.1],
                    ["X_max","Units", 0],["Y_min","Units", 0],
                    ["Y_max","Units", 0],["Smoothing","% of ΔX", 0]];
        };
        
        this.setParam = function (index, val) {
            if (index === 0) {
                param_xmin = val;
            } else if (index === 1) {
                param_delx = val;
            } else if (index === 2) {
                param_xmax = val;
            } else if (index === 3) {
                param_ymin = val;
            } else if (index === 4) {
                param_ymax = val;
            } else if (index === 5) {
                param_smoothing = val;
            }
        };

        this.run = function (plotData) {
            var autoDetector = plotData.getAutoDetector(),
                dataSeries = plotData.getActiveDataSeries(),
                axes = plotData.axes,
                pointsPicked = 0,
                dw = autoDetector.imageWidth,
                dh = autoDetector.imageHeight,
                xi,
                dist_y_px,
                dist_x_px,
                ii, yi, jj, 
                mean_yi,
                y_count,
                pdata,
                pdata0,
                pdata1,
                xpoints = [],
                ypoints = [],
                xpoints_mean = [],
                ypoints_mean = [],
                mean_x, mean_y,
                delx,
                dely,
                xinterp,
                yinterp,
                param_width = Math.abs(param_delx*(param_smoothing/100.0));

            dataSeries.clearAll();

            // Calculate pixel distance between y_min and y_max:
            pdata0 = axes.dataToPixel(param_xmin, param_ymin);
            pdata1 = axes.dataToPixel(param_xmin, param_ymax);
            dist_y_px = Math.sqrt((pdata0.x - pdata1.x)*(pdata0.x - pdata1.x) + (pdata0.y - pdata1.y)*(pdata0.y - pdata1.y));
            dely = (param_ymax - param_ymin)/dist_y_px;

            // Calculate pixel distance between x_min and x_max:
            pdata1 = axes.dataToPixel(param_xmax, param_ymin);
            dist_x_px = Math.sqrt((pdata0.x - pdata1.x)*(pdata0.x - pdata1.x) + (pdata0.y - pdata1.y)*(pdata0.y - pdata1.y));
            delx = (param_xmax - param_xmin)/dist_x_px;

            if(Math.abs(param_width/delx) > 0 && Math.abs(param_width/delx) < 1) {
                param_width = delx;
            }

            xi = param_xmin;
            while( ( delx > 0 && xi <= param_xmax ) || ( delx < 0 && xi >= param_xmax ) ) {

                mean_yi = 0; y_count = 0;
                yi = param_ymin;
                while ( ( dely > 0 && yi <= param_ymax ) || ( dely < 0 && yi >= param_ymax ) ) {
                    pdata = axes.dataToPixel(xi, yi);
                    if (pdata.x > 0 && pdata.y > 0 && pdata.x < dw && pdata.y < dh) {
                        if (autoDetector.binaryData[parseInt(pdata.y, 10)*dw + parseInt(pdata.x, 10)] === true) {
                            mean_yi = (mean_yi*y_count + yi)/(parseFloat(y_count+1));
                            y_count++;
                        }
                    }
                    yi = yi + dely;
                }

                if (y_count > 0) {
                    xpoints[pointsPicked] = parseFloat(xi);
                    ypoints[pointsPicked] = parseFloat(mean_yi);
                    pointsPicked = pointsPicked + 1;
                }

                xi = xi + delx;
            }
            
            if (xpoints.length <= 0 || ypoints.length <= 0) {
                return; // kill if nothing was detected so far.
            }

            if (param_width > 0) {
                xpoints_mean = [];
                ypoints_mean = [];

                xi = xpoints[0];
                while ( (delx > 0 && xi <= xpoints[xpoints.length-1]) || (delx < 0 && xi >= xpoints[xpoints.length-1]) ) {
                    mean_x = 0;
                    mean_y = 0;
                    y_count = 0;
                    for (ii = 0; ii < xpoints.length; ii++) {
                        if (xpoints[ii] <= xi + param_width && xpoints[ii] >= xi - param_width) {
                            mean_x = (mean_x*y_count + xpoints[ii])/parseFloat(y_count + 1);
                            mean_y = (mean_y*y_count + ypoints[ii])/parseFloat(y_count + 1);
                            y_count++;
                        }
                    }

                    if (y_count > 0) {
                        xpoints_mean[xpoints_mean.length] = mean_x;
                        ypoints_mean[ypoints_mean.length] = mean_y;
                    }

                    if(delx > 0) {
                        xi = xi + param_width;
                    } else {
                        xi = xi - param_width;
                    }
                }

            } else {
                xpoints_mean = xpoints;
                ypoints_mean = ypoints;
            }

            if (xpoints_mean.length <= 0 || ypoints_mean.length <= 0) {
                return;
            }

            xinterp = [];
            ii = 0;
            xi = param_xmin;

            if (( delx < 0 && param_delx > 0) || (delx > 0 && param_delx < 0)) {
                return;
            }
            
            while ( (delx > 0 && xi <= param_xmax) || (delx < 0 && xi >= param_xmax) ) {
                xinterp[ii] = xi;
                ii++;
                xi = xi + param_delx;
            }

            if(delx < 0) {
                xpoints_mean = xpoints_mean.reverse();
                ypoints_mean = ypoints_mean.reverse();
            }

            yinterp = numeric.spline(xpoints_mean, ypoints_mean).at(xinterp);

            for(ii = 0; ii < yinterp.length; ii++) {
                if (!isNaN(xinterp[ii]) && !isNaN(yinterp[ii])) {
                    pdata = axes.dataToPixel(xinterp[ii], yinterp[ii]);
                    dataSeries.addPixel(pdata.x, pdata.y);
                }
            }

         };
            
    };
    return Algo;
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.BarAxes = (function () {

    var AxesObj = function () {
        // Throughout this code, it is assumed that "y" is the continuous axes and "x" is
        // the discrete axes. In practice, this shouldn't matter even if the orientation
        // is different.
        var isCalibrated = false,
            isLogScale = false,
            x1, y1, x2, y2, p1, p2,
            orientation;

        this.isCalibrated = function () {
            return isCalibrated;
        };

        this.calibrate = function(calibration, isLog) {
            isCalibrated = false;
            var cp1 = calibration.getPoint(0),
                cp2 = calibration.getPoint(1);

            x1 = cp1.px;
            y1 = cp1.py;
            x2 = cp2.px;
            y2 = cp2.py;
            p1 = parseFloat(cp1.dy);
            p2 = parseFloat(cp2.dy);

            if(isLog) {
                isLogScale = true;
                p1 = Math.log(p1)/Math.log(10);
                p2 = Math.log(p2)/Math.log(10);
            } else {
                isLogScale = false;
            }

            orientation = this.calculateOrientation();

            isCalibrated = true;
            return true;
        };

        this.pixelToData = function (pxi, pyi) {
            var data = [],
                c_c2 = ((pyi-y1)*(y2-y1) + (x2-x1)*(pxi-x1))/((y2-y1)*(y2-y1) + (x2-x1)*(x2-x1));
            // We could return X pixel value (or Y, depending on orientation) but that's not very useful.
            // For now, just return the bar value. That's it.
            data[0] = (p2 - p1)*c_c2 + p1;
            if(isLogScale) {
                data[0] = Math.pow(10, data[0]);
            }
            return data;
        };

        this.dataToPixel = function (x, y) {
            // not implemented yet
            return {
                x: 0,
                y: 0
            };
        };

        this.pixelToLiveString = function (pxi, pyi) {
            var dataVal = this.pixelToData(pxi, pyi);
            return dataVal[0].toExponential(4);
        };

        this.isLog = function () {
            return isLogScale;
        };

        this.getTransformationEquations = function () {
            return {
                pixelToData: ['This will be available in a future release.']
            };
        };

        this.dataPointsHaveLabels = true;

        this.dataPointsLabelPrefix = 'Bar';

        this.calculateOrientation = function () { // Used by auto-extract algo to switch orientation.
        
            var orientationAngle = wpd.taninverse(-(y2-y1), x2-x1)*180/Math.PI,
                orientation = {
                    axes: 'Y',
                    direction: 'increasing',
                    angle: orientationAngle
                },
                tol = 30; // degrees.
            
            if(Math.abs(orientationAngle - 90) < tol) {
                orientation.axes = 'Y';
                orientation.direction = 'increasing';
            } else if(Math.abs(orientationAngle - 270) < tol) {
                orientation.axes = 'Y';
                orientation.direction = 'decreasing';
            } else if(Math.abs(orientationAngle - 0) < tol || Math.abs(orientationAngle - 360) < tol) {
                orientation.axes = 'X';
                orientation.direction = 'increasing';
            } else if(Math.abs(orientationAngle - 180) < tol) {
                orientation.axes = 'X';
                orientation.direction = 'decreasing';
            }

            return orientation;

        };

        this.getOrientation = function() {
            return orientation;
        };
    };

    AxesObj.prototype.numCalibrationPointsRequired = function () {
        return 2;
    };

    AxesObj.prototype.getDimensions = function () {
        return 2;
    };

    AxesObj.prototype.getAxesLabels = function () {
        return ['Label', 'Y'];
    };

    return AxesObj;
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

        this.getTransformationEquations = function () {
            return {
                pixelToData: ['x_data = x_pixel','y_data = y_pixel'],
                dataToPixel: ['x_pixel = x_data', 'y_pixel = y_data']
            };
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
            scaleUnits,
            dist,
            processCalibration = function(cal, scale_length, scale_units) {
                var cp0 = cal.getPoint(0),
                    cp1 = cal.getPoint(1);
                dist = Math.sqrt((cp0.px-cp1.px)*(cp0.px-cp1.px) + (cp0.py-cp1.py)*(cp0.py-cp1.py));
                scaleLength = parseFloat(scale_length);
                scaleUnits = scale_units;
                return true;
            };

        this.isCalibrated = function() {
            return isCalibrated;
        };

        this.calibrate = function (calib, scale_length, scale_units) {
            isCalibrated = processCalibration(calib, scale_length, scale_units);
            return isCalibrated;
        };

        this.pixelToData = function(pxi, pyi) {
            var data = [];
            data[0] = pxi*scaleLength/dist;
            data[1] = pyi*scaleLength/dist;
            return data;
        };

        this.pixelToDataDistance = function(distancePx) {
            return distancePx*scaleLength/dist;
        };

        this.pixelToDataArea = function (areaPx) {
            return areaPx*scaleLength*scaleLength/(dist*dist);
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

        this.getScaleLength = function () {
            return scaleLength;
        };

        this.getUnits = function () {
            return scaleUnits;
        };

        this.getTransformationEquations = function () {
            return {
                pixelToData:[
                                'x_data = ' + scaleLength/dist + '*x_pixel',
                                'y_data = ' + scaleLength/dist + '*y_pixel'
                            ],
                dataToPixel:[
                                'x_pixel = ' + dist/scaleLength + '*x_data', 
                                'y_pixel = ' + dist/scaleLength + '*y_data'
                            ]
            };
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
                
                if(isClockwise) {
                    alpha0 = phi0 + theta1;
                } else {
		            alpha0 = phi0 - theta1;
                }

                return true;
            };

        this.isCalibrated = function() {
            return isCalibrated;
        };

        this.calibrate = function (calib, is_degrees, is_clockwise) {
            isCalibrated = processCalibration(calib, is_degrees, is_clockwise);
            return isCalibrated;
        };

        this.isThetaDegrees = function () {
            return isDegrees;
        };

        this.isThetaClockwise = function () {
            return isClockwise;
        };

        this.pixelToData = function(pxi, pyi) {
            var data = [],
                rp,
                thetap;

            xp = parseFloat(pxi);
            yp = parseFloat(pyi);

            rp = ((r2-r1)/dist12)*(Math.sqrt((xp-x0)*(xp-x0)+(yp-y0)*(yp-y0))-dist10) + r1;
			
            if(isClockwise) {
                thetap = alpha0 - wpd.taninverse(-(yp-y0), xp-x0);
            } else {
                thetap = wpd.taninverse(-(yp-y0),xp-x0) - alpha0;
            }

            if(thetap < 0) {
                thetap = thetap + 2*Math.PI;
            }
			
		    if(isDegrees === true) {
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

        this.getTransformationEquations = function () {
            var rEqn = 'r = (' + (r2 - r1)/dist12 + ')*sqrt((x_pixel - ' + x0 + ')^2 + (y_pixel - ' + y0 + ')^2) + ('
                        + (r1-dist10*(r2-r1)/dist12) + ')',
                thetaEqn;

            if(isClockwise) {
                thetaEqn = alpha0 - 'atan2((' + y0 + ' - y_pixel), (x_pixel - ' + x0 + '))';
            } else {
                thetaEqn = 'atan2((' + y0 + ' - y_pixel), (x_pixel - ' + x0 + ')) - (' + alpha0 + ')';
            }

            if(isDegrees) {
                thetaEqn = 'theta = (180/PI)*(' + thetaEqn + '), theta = theta + 360 if theta < 0';
            } else {
                thetaEqn = 'theta = ' + thetaEqn + ' theta = theta + 2*PI if theta < 0';
            }

            return {
                pixelToData: [rEqn, thetaEqn]
            };
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

        this.isRange100 = function () {
            return isRange0to100;
        };

        this.isNormalOrientation = function () {
            return isOrientationNormal;
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

        this.getTransformationEquations = function () {
            var rpEqn = 'rp = sqrt((x_pixel - ' + x0 + ')^2 + (y_pixel - ' + y0 + ')^2)/(' + L + ')',
                thetapEqn = 'thetap = atan2(('+y0+' -  y_pixel), (x_pixel - ' + x0 + ')) - (' + Math.atan2(-(y1-y0),x1-x0) + ')',
                apEqn = '1 - rp*(cos(thetap) - sin(thetap)/sqrt(3))', 
                bpEqn = 'rp*(cos(thetap) - sin(thetap)/sqrt(3))', 
                cpEqn = '2*rp*sin(thetap)/sqrt(3)',bpEqnt;

            if(isRange0to100) {
                apEqn = '100*(' + apEqn + ')'; 
                bpEqn = '100*(' + bpEqn + ')'; 
                cpEqn = '100*(' + cpEqn + ')';
            }

            apEqn = 'a_data = ' + apEqn;
            bpEqn = 'b_data = ' + bpEqn;
            cpEqn = 'c_data = ' + cpEqn;

            if(!isOrientationNormal) {
                bpEqnt = bpEqn;
			    bpEqn = apEqn;
			    apEqn = cpEqn;
			    cpEqn = bpEqnt;
            }

            return {
                pixelToData: [
                                rpEqn,
                                thetapEqn,
                                apEqn,
                                bpEqn,
                                cpEqn
                             ]
            };
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
            xmin, xmax, ymin, ymax, 
            a_mat = [0, 0, 0, 0], a_inv_mat = [0, 0, 0, 0],
            c_vec = [0, 0],

            processCalibration = function(cal, isLogX, isLogY) {

                if(cal.getCount() < 4) {
                    return false;
                }

                var cp1 = cal.getPoint(0),
                    cp2 = cal.getPoint(1),
                    cp3 = cal.getPoint(2),
                    cp4 = cal.getPoint(3),
                    ip = new wpd.InputParser(),
                    dat_mat, pix_mat;
                
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

                dat_mat = [xmin-xmax, 0, 0, ymin - ymax];
                pix_mat = [x1 - x2, x3 - x4, y1 - y2, y3 - y4];

                a_mat = wpd.mat.mult2x2(dat_mat, wpd.mat.inv2x2(pix_mat));
                a_inv_mat = wpd.mat.inv2x2(a_mat);
                c_vec[0] = xmin - a_mat[0]*x1 - a_mat[1]*y1;
                c_vec[1] = ymin - a_mat[2]*x3 - a_mat[3]*y3;

                calibration = cal;
                return true;
            };
        
        this.getBounds = function() {
            return {
                x1: xmin,
                x2: xmax,
                y3: ymin,
                y4: ymax
            };
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
                xp, yp, xf, yf, dat_vec;

            xp = parseFloat(pxi);
            yp = parseFloat(pyi);

            dat_vec = wpd.mat.mult2x2Vec(a_mat, [xp, yp]);
            dat_vec[0] = dat_vec[0] + c_vec[0];
            dat_vec[1] = dat_vec[1] + c_vec[1];

            xf = dat_vec[0];
            yf = dat_vec[1];

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
            var xf, yf, dat_vec, rtnPix;

            dat_vec = [x - c_vec[0], y - c_vec[1]];
            rtnPix = wpd.mat.mult2x2Vec(a_inv_mat, dat_vec);
            // TODO: add support for log-scale
            xf = rtnPix[0];
            yf = rtnPix[1];

            return {
                x: xf,
                y: yf
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

        this.isLogX = function () {
            return isLogScaleX;
        };

        this.isLogY = function () {
            return isLogScaleY;
        };

        this.getTransformationEquations = function() {
            var xdEqn = '(' + a_mat[0] + ')*x_pixel + (' + a_mat[1] + ')*y_pixel + (' + c_vec[0] + ')',
                ydEqn = '(' + a_mat[2] + ')*x_pixel + (' + a_mat[3] + ')*y_pixel + (' + c_vec[1] + ')',
                xpEqn = 'x_pixel = (' + a_inv_mat[0] + ')*x_data + (' + a_inv_mat[1] + ')*y_data + (' + (-a_inv_mat[0]*c_vec[0]-a_inv_mat[1]*c_vec[1]) + ')',
                ypEqn = 'y_pixel = (' + a_inv_mat[2] + ')*x_data + (' + a_inv_mat[3] + ')*y_data + (' + (-a_inv_mat[2]*c_vec[0]-a_inv_mat[3]*c_vec[1]) + ')';

            if (isLogScaleX) {
                xdEqn = 'x_data = pow(10, ' + xdEqn + ')';
            } else {
                xdEqn = 'x_data = ' + xdEqn;
            }
            
            if (isLogScaleY) {
                ydEqn = 'y_data = pow(10, ' + ydEqn + ')';
            } else {
                ydEqn = 'y_data = ' + ydEqn;
            }

            if(isLogScaleX || isLogScaleY) {
                return {
                     pixelToData: [xdEqn, ydEqn]
                };
            }

            return {
                pixelToData: [xdEqn, ydEqn],
                dataToPixel: [xpEqn, ypEqn]
            };
        };

        this.getOrientation = function() {
            // Used by histogram auto-extract method only at the moment.
            // Just indicate increasing y-axis at the moment so that we can work with histograms.
            return {
                axes: 'Y',
                direction: 'increasing',
                angle: 90
            };
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.dataSeriesManagement = (function () {

    var nameIndex = 1;
    
    function updateSeriesList() {
    }

    function manage() {
        if(!wpd.appData.isAligned()) {
            wpd.messagePopup.show("Manage Datasets", "Please calibrate the axes before managing datasets.");
        } else {
            var $nameField = document.getElementById('manage-data-series-name'),
                $pointCount = document.getElementById('manage-data-series-point-count'),
                $datasetList = document.getElementById('manage-data-series-list'),
                plotData = wpd.appData.getPlotData(),
                activeDataSeries = plotData.getActiveDataSeries(),
                seriesList = plotData.getDataSeriesNames(),
                activeSeriesIndex = plotData.getActiveDataSeriesIndex(),
                listHtml = '',
                i;

            $nameField.value = activeDataSeries.name;
            $pointCount.innerHTML = activeDataSeries.getCount();
            for(i = 0; i < seriesList.length; i++) {
                listHtml += '<option value="'+ i + '">' + seriesList[i] + '</option>';
            }
            $datasetList.innerHTML = listHtml;
            $datasetList.selectedIndex = activeSeriesIndex;

            // TODO: disable delete button if only one series is present
            wpd.popup.show('manage-data-series-window');
        }
    }

    function addSeries() {
        var plotData = wpd.appData.getPlotData(),
            seriesName = 'Dataset ' + nameIndex,
            index = plotData.dataSeriesColl.length;
        
        close();
        plotData.dataSeriesColl[index] = new wpd.DataSeries();
        plotData.dataSeriesColl[index].name = seriesName;
        plotData.setActiveDataSeriesIndex(index);
        updateApp();
        nameIndex++;
        manage();
    }

    function deleteSeries() {
        // if this is the only dataset, then disallow delete!
        close();

        if(wpd.appData.getPlotData().dataSeriesColl.length === 1) {
            wpd.messagePopup.show("Can Not Delete!", "You can not delete this dataset as at least one dataset is required.", manage);
            return;
        }

        wpd.okCancelPopup.show("Delete Dataset", "Are you sure that you want to delete the dataset and all containing data points?", function() {
            // delete the dataset
            var plotData = wpd.appData.getPlotData(),
                index = plotData.getActiveDataSeriesIndex();
            plotData.dataSeriesColl.splice(index,1);
            plotData.setActiveDataSeriesIndex(0);
            manage();
        }, function() {
            // 'cancel'
            manage();
        });
    }

    function viewData() {
        close();
        wpd.dataTable.showTable();
    }

    function changeSelectedSeries() {
        var $list = document.getElementById('manage-data-series-list'),
            plotData = wpd.appData.getPlotData();

        close();
        plotData.setActiveDataSeriesIndex($list.selectedIndex);
        updateApp();
        manage();
    }

    function updateApp() {
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.autoExtraction.updateDatasetControl();
        wpd.acquireData.updateDatasetControl();
        wpd.dataPointCounter.setCount();
    }

    function editSeriesName() {
        var activeSeries = wpd.appData.getPlotData().getActiveDataSeries(),
            $name = document.getElementById('manage-data-series-name');
        close();
        activeSeries.name = $name.value;
        updateApp(); // overkill, but not too bad.
        manage();
    }

    function close() {
        wpd.popup.close('manage-data-series-window');
    }

    return {
        manage: manage,
        addSeries: addSeries,
        deleteSeries: deleteSeries,
        viewData: viewData,
        changeSelectedSeries: changeSelectedSeries,
        editSeriesName: editSeriesName
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

    var dataProvider,
        dataCache,
        sortedData,
        tableText;
    
    function showPlotData() {
        dataProvider = wpd.plotDataProvider;
        show();
    }

    function showAngleData() {
        dataProvider = wpd.measurementDataProvider;
        dataProvider.setDataSource('angle');
        show();
    }

    function showDistanceData() {
        dataProvider = wpd.measurementDataProvider;
        dataProvider.setDataSource('distance');
        show();
    }

    function show() {
        wpd.graphicsWidget.removeTool();
        wpd.popup.show('csvWindow');
        refresh();
    }

    function refresh() {
        dataCache = dataProvider.getData();
        setupControls();
        sortRawData();
        makeTable();
    }

    function setupControls() {

        var $datasetControl = document.getElementById('data-table-dataset-control'),
            $datasetList = document.getElementById('data-table-dataset-list'),
            datasetNames = dataProvider.getDatasetNames(),
            $sortingVariables = document.getElementById('data-sort-variables'),
            $variableNames = document.getElementById('dataVariables'),
            $dateFormattingContainer = document.getElementById('data-date-formatting-container'),
            $dateFormatting = document.getElementById('data-date-formatting'),
            i,
            datasetHTML = '',
            sortingHTML = '',
            dateFormattingHTML = '',
            isAnyVariableDate = false;

        // Datasets
        for (i = 0; i < datasetNames.length; i++) {
            datasetHTML += '<option>' + datasetNames[i] + '</option>';
        }
        $datasetList.innerHTML = datasetHTML;
        $datasetList.selectedIndex = dataProvider.getDatasetIndex();

        // Variable Names
        $variableNames.innerHTML = dataCache.fields.join(', ');

        $dateFormattingContainer.style.display = 'none';
        sortingHTML += '<option value="raw">Raw</option>';
        for(i = 0; i < dataCache.fields.length; i++) {

            // Sorting
            if(dataCache.isFieldSortable[i]) {
                sortingHTML += '<option value="' + dataCache.fields[i] + '">' + dataCache.fields[i] + '</option>';
            }

            // Date formatting
            if(dataCache.fieldDateFormat[i] != null) {
                dateFormattingHTML += '<p>' + dataCache.fields[i] + ' <input type="text" length="15" value="' + dataCache.fieldDateFormat[i] + '" id="data-format-string-' + i + '"/></p>';
                isAnyVariableDate = true;
            }
        }
        if(dataCache.allowConnectivity) {
            sortingHTML += '<option value="NearestNeighbor">Nearest Neighbor</option>';
        }
        $sortingVariables.innerHTML = sortingHTML;
        updateSortingControls();

        if(isAnyVariableDate) {
            $dateFormattingContainer.style.display = 'inline-block';
            $dateFormatting.innerHTML = dateFormattingHTML;
        } else {
            $dateFormattingContainer.style.display = 'hidden';
        }
    }

    function changeDataset() {
        var $datasetList = document.getElementById('data-table-dataset-list');
        dataProvider.setDatasetIndex($datasetList.selectedIndex);
        refresh();
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

    function reSort() {
        updateSortingControls();
        sortRawData();
        makeTable();
    }

    function sortRawData() {

        if(dataCache == null || dataCache.rawData == null) {
            return;
        }

        sortedData = dataCache.rawData.slice(0);
        var sortingKey = document.getElementById('data-sort-variables').value,
            sortingOrder = document.getElementById('data-sort-order').value,
            isAscending = sortingOrder === 'ascending',
            isRaw = sortingKey === 'raw',
            isConnectivity = sortingKey === 'NearestNeighbor',
            dataIndex,
            fieldCount = dataCache.fields.length;

        if(isRaw) {
            return;
        }

        if(!isConnectivity) {
            dataIndex = dataCache.fields.indexOf(sortingKey);
            if(dataIndex < 0) {
                return;
            }
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
                rowi, rowcompi,
                rowCount = sortedData.length,
                connFieldIndices = dataCache.connectivityFieldIndices,
                fi, cfi,
                swp;

            for(rowi = 0; rowi < rowCount - 1; rowi++) {
                minindex = -1;
                
                // loop through all other points and find the nearest next neighbor
                for(rowcompi = rowi + 1; rowcompi < rowCount; rowcompi++) {
                    compdist = 0;
                    for(fi = 0; fi < connFieldIndices.length; fi++) {
                        cfi = connFieldIndices[fi];       
                        compdist += (sortedData[rowi][cfi] - sortedData[rowcompi][cfi])*(sortedData[rowi][cfi] - sortedData[rowcompi][cfi]);
                    }

                    if((compdist < mindist) || (minindex === -1)) {
                        mindist = compdist;
                        minindex = rowcompi;
                    }
                }
                
                // swap (minindex) and (rowi+1) rows
                for(fi = 0; fi < dataCache.fields.length; fi++) {
                    swp = sortedData[minindex][fi];
                    sortedData[minindex][fi] = sortedData[rowi+1][fi];
                    sortedData[rowi+1][fi] = swp;
                }
            }

        }
    }

    function makeTable() {
        if(sortedData == null) { return; }

        var $digitizedDataTable = document.getElementById('digitizedDataTable'),
            numFormattingDigits = parseInt(document.getElementById('data-number-format-digits').value, 10),
            numFormattingStyle = document.getElementById('data-number-format-style').value,
            colSeparator = document.getElementById('data-number-format-separator').value,
            rowi,
            coli,
            rowValues,
            dateFormattingStrings = [];

        // "\t" in the column separator should translate to a tab:
        colSeparator = colSeparator.replace(/[^\\]\\t/, "\t").replace(/^\\t/, "\t");

        tableText = '';
        for(rowi = 0; rowi < sortedData.length; rowi++) {
            rowValues = [];
            for(coli = 0; coli < dataCache.fields.length; coli++) {
                if(dataCache.fieldDateFormat[coli] != null) { // Date
                    if(dateFormattingStrings[coli] === undefined) {
                        dateFormattingStrings[coli] = document.getElementById('data-format-string-'+ coli).value;
                    }
                    rowValues[coli] = wpd.dateConverter.formatDateNumber(sortedData[rowi][coli], dateFormattingStrings[coli]);
                } else { // Non-date values
                    if(typeof sortedData[rowi][coli] === 'string') {
                        rowValues[coli] = sortedData[rowi][coli];
                    } else {
                        if(numFormattingStyle === 'fixed' && numFormattingDigits >= 0) {
                            rowValues[coli] = sortedData[rowi][coli].toFixed(numFormattingDigits);
                        } else if(numFormattingStyle === 'precision' && numFormattingDigits >= 0) {
                            rowValues[coli] = sortedData[rowi][coli].toPrecision(numFormattingDigits);
                        } else if(numFormattingStyle === 'exponential' && numFormattingDigits >= 0) {
                            rowValues[coli] = sortedData[rowi][coli].toExponential(numFormattingDigits);
                        } else {
                            rowValues[coli] = sortedData[rowi][coli];
                        }
                    }
                }
            }
            tableText += rowValues.join(colSeparator);
            tableText += '\n';
        }
        $digitizedDataTable.value = tableText;
    }

    function selectAll() {
        var $digitizedDataTable = document.getElementById('digitizedDataTable');
        $digitizedDataTable.focus();
        $digitizedDataTable.select();
    }

    function generateCSV() {
        var datasetName = dataProvider.getDatasetNames()[dataProvider.getDatasetIndex()];
        wpd.download.csv(JSON.stringify(tableText), datasetName);
    }

    function exportToPlotly() {
        if (sortedData == null) { return; }
        var plotlyData = { "data": [] },
            rowi,
            coli,
            fieldName;

        plotlyData.data[0] = {};

        for (rowi = 0; rowi < sortedData.length; rowi++) {
            for (coli = 0; coli < dataCache.fields.length; coli++) {

                fieldName = dataCache.fields[coli];
                // Replace first two to keep plotly happy:
                if(coli === 0) {
                    fieldName = 'x';
                } else if(coli === 1) {
                    fieldName = 'y';
                }

                if (rowi === 0) {
                    plotlyData.data[0][fieldName] = [];
                }

                if (dataCache.fieldDateFormat[coli] != null) {
                    plotlyData.data[0][fieldName][rowi] = wpd.dateConverter.formatDateNumber(sortedData[rowi][coli], 'yyyy-mm-dd');
                } else {
                    plotlyData.data[0][fieldName][rowi] = sortedData[rowi][coli];
                }
            }
        }

        wpd.plotly.send(plotlyData);
    }

    return {
        showTable: showPlotData,
        showAngleData: showAngleData,
        showDistanceData: showDistanceData,
        updateSortingControls: updateSortingControls,
        reSort: reSort,
        selectAll: selectAll,
        generateCSV: generateCSV,
        exportToPlotly: exportToPlotly,
        changeDataset: changeDataset
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
        
        isCanvasInFocus = false,
        
        firstLoad = true;
        

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
        $oriDataCanvas.width = $oriDataCanvas.width;
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

    function toggleExtendedCrosshair(ev) { // called when backslash is hit
        if (ev.keyCode === 220) {
            ev.preventDefault();
            toggleExtendedCrosshairBtn(); 
        }
    }

    function toggleExtendedCrosshairBtn() { // called directly when toolbar button is hit
        extendedCrosshair = !(extendedCrosshair);
        var $crosshairBtn = document.getElementById('extended-crosshair-btn');
        if(extendedCrosshair) {
            $crosshairBtn.classList.add('pressed-button');
        } else {
            $crosshairBtn.classList.remove('pressed-button');
        }
        $hoverCanvas.width = $hoverCanvas.width;
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
            xcorr, ycorr,
            alpha;

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
                alpha = ddata.data[index+3]/255;
                idata.data[index] = (1-alpha)*idata.data[index] + alpha*ddata.data[index];
                idata.data[index+1] = (1-alpha)*idata.data[index+1] + alpha*ddata.data[index+1];
                idata.data[index+2] = (1-alpha)*idata.data[index+2] + alpha*ddata.data[index+2];
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
        wpd.busyNote.show();
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
                        wpd.busyNote.show();
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
        document.addEventListener('keydown', function(ev) {
            if(isCanvasInFocus) {
                toggleExtendedCrosshair(ev);
            }
        }, false);

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
        document.addEventListener("mouseup", onDocumentMouseUp, false);

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
        removeTool();
        removeRepainter();
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
        wpd.appData.plotLoaded(originalImageData);
        
        wpd.busyNote.close();

        // TODO: move this logic outside the graphics widget!
        if (firstLoad === false) {
            wpd.popup.show('axesList');
        }
        firstLoad = false;
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
        removeTool();
        removeRepainter();
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
        wpd.appData.plotLoaded(originalImageData);
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
            wpd.busyNote.show();
            fileLoader(fileInfo);
        }
        wpd.popup.close('loadNewImage');
    }

    function saveImage() {
        var exportCanvas = document.createElement('canvas'),
            exportCtx = exportCanvas.getContext('2d'),
            exportData,
            di,
            dLayer,
            alpha;
        exportCanvas.width = originalWidth;
        exportCanvas.height = originalHeight;
        exportCtx.drawImage($oriImageCanvas, 0, 0, originalWidth, originalHeight);
        exportData = exportCtx.getImageData(0, 0, originalWidth, originalHeight);
        dLayer = oriDataCtx.getImageData(0, 0, originalWidth, originalHeight);
        for(di = 0; di < exportData.data.length; di+=4) {
            if(dLayer.data[di] != 0 || dLayer.data[di+1] != 0 || dLayer.data[di+2] != 0) {
                alpha = dLayer.data[di+3]/255;
                exportData.data[di] = (1 - alpha)*exportData.data[di] + alpha*dLayer.data[di];
                exportData.data[di+1] = (1 - alpha)*exportData.data[di + 1] + alpha*dLayer.data[di+1];
                exportData.data[di+2] = (1 - alpha)*exportData.data[di + 2] + alpha*dLayer.data[di+2];
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

    function getImageData() {
        return originalImageData;
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

    function onDocumentMouseUp(ev) {
        if(activeTool != null && activeTool.onDocumentMouseUp != undefined) {
            var pos = posn(ev),
                xpos = pos.x,
                ypos = pos.y,
                imagePos = imagePx(xpos, ypos);
            activeTool.onDocumentMouseUp(ev, pos, imagePos);
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
        toggleExtendedCrosshairBtn: toggleExtendedCrosshairBtn,
        setZoomRatio: setZoomRatio,
        getZoomRatio: getZoomRatio,

        loadImageFromURL: loadImageFromSrc,
        load: loadNewFile,
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
        $sidebarControlsContainer,
        $mainContainer;

    // Redo layout when window is resized
    function adjustLayout() {
        var windowWidth = parseInt(document.body.offsetWidth,10),
            windowHeight = parseInt(document.body.offsetHeight,10);

        $sidebarContainer.style.height = windowHeight + 'px';
        $sidebarControlsContainer.style.height = windowHeight - 280 + 'px';
        $mainContainer.style.width = windowWidth - $sidebarContainer.offsetWidth - 5 + 'px';
        $mainContainer.style.height = windowHeight + 'px';
        $graphicsContainer.style.height = windowHeight - 44 + 'px';
        wpd.sidebar.resize();
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
        $sidebarControlsContainer = document.getElementById('sidebarControlsContainer');
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

    var dragInfo = null,
        $activeWindow = null;

    function show(popupid) {

        // Dim lights to make it obvious that these are modal dialog boxes.
        var shadowDiv = document.getElementById('shadow');
        shadowDiv.style.visibility = "visible";
        
        // Display the popup
        var pWindow = document.getElementById(popupid);
        var screenWidth = parseInt(window.innerWidth, 10);
        var screenHeight = parseInt(window.innerHeight, 10);
        var pWidth = parseInt(pWindow.offsetWidth, 10);
        var pHeight = parseInt(pWindow.offsetHeight, 10);
        var xPos = (screenWidth - pWidth)/2;
        var yPos = (screenHeight - pHeight)/2;
        yPos = yPos > 60 ? 60 : yPos;
        pWindow.style.left = xPos + 'px';
        pWindow.style.top = yPos + 'px';
        pWindow.style.visibility = "visible";

        // Attach drag events to the header
        for(var i = 0; i < pWindow.childNodes.length; i++) {
            if(pWindow.childNodes[i].className === 'popupheading') {
                pWindow.childNodes[i].addEventListener("mousedown", startDragging, false);
                break;
            }
        }

        $activeWindow = pWindow;
    }

    function close(popupid) {

        var shadowDiv = document.getElementById('shadow');
        shadowDiv.style.visibility = "hidden";

        var pWindow = document.getElementById(popupid);
        pWindow.style.visibility = "hidden";

        removeDragMask();
        $activeWindow = null;
    }

    function startDragging(ev) {
        // Create a drag mask that will react to mouse action after this point
        var $dragMask = document.createElement('div');
        $dragMask.className = 'popup-drag-mask';
        $dragMask.style.display = 'inline-block';
        $dragMask.addEventListener('mousemove', dragMouseMove, false);
        $dragMask.addEventListener('mouseup', dragMouseUp, false);
        $dragMask.addEventListener('mouseout', dragMouseOut, false);
        document.body.appendChild($dragMask);

        dragInfo = {
            dragMaskDiv: $dragMask,
            initialMouseX: ev.pageX,
            initialMouseY: ev.pageY,
            initialWindowX: $activeWindow.offsetLeft,
            initialWindowY: $activeWindow.offsetTop
        };

        ev.preventDefault();
        ev.stopPropagation();
    }

    function dragMouseMove(ev) {
        moveWindow(ev);
        ev.stopPropagation();
        ev.preventDefault();
    }

    function dragMouseUp(ev) {
        moveWindow(ev);
        removeDragMask(); 
        ev.stopPropagation();
        ev.preventDefault();
    }

    function moveWindow(ev) {
        var newWindowX = (dragInfo.initialWindowX + ev.pageX - dragInfo.initialMouseX),
            newWindowY = (dragInfo.initialWindowY + ev.pageY - dragInfo.initialMouseY),
            appWidth =  parseInt(document.body.offsetWidth, 10),
            appHeight =  parseInt(document.body.offsetHeight, 10),
            windowWidth = parseInt($activeWindow.offsetWidth, 10),
            windowHeight = parseInt($activeWindow.offsetHeight, 10);

        // move only up to a reasonable bound:
        if(newWindowX + 0.7*windowWidth < appWidth && newWindowX > 0 && newWindowY > 0
            && newWindowY + 0.5*windowHeight < appHeight) {
            $activeWindow.style.top = newWindowY + 'px';
            $activeWindow.style.left = newWindowX + 'px';
        }
    }

    function dragMouseOut(ev) {
        removeDragMask();
    }

    function removeDragMask() {
        if(dragInfo != null && dragInfo.dragMaskDiv != null) {
            dragInfo.dragMaskDiv.removeEventListener('mouseout', dragMouseOut, false);
            dragInfo.dragMaskDiv.removeEventListener('mouseup', dragMouseUp, false);
            dragInfo.dragMaskDiv.removeEventListener('mousemove', dragMouseMove, false);
            dragInfo.dragMaskDiv.style.display = 'none';
            document.body.removeChild(dragInfo.dragMaskDiv);
            dragInfo = null;
        }
    }

    return {
        show: show,
        close: close
    };

})();

wpd.busyNote = (function () {
    var noteDiv, isVisible = false;
    
    function show() {
        if(isVisible) {
            return;
        }
        if(noteDiv == null) {
            noteDiv = document.createElement('div');
            noteDiv.id = 'wait';
            noteDiv.innerHTML = '<p align="center">Processing...</p>';
        }
        document.body.appendChild(noteDiv);
        isVisible = true;
    }

    function close() {
        if (noteDiv != null && isVisible === true) {
            document.body.removeChild(noteDiv);
            isVisible = false;
        }
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

wpd.okCancelPopup = (function () {
    var okCallback, cancelCallback;

    function show(title, msg, ok_callback, cancel_callback) {
        wpd.popup.show('okCancelPopup');
        document.getElementById('ok-cancel-popup-heading').innerHTML = title;
        document.getElementById('ok-cancel-popup-text').innerHTML = msg;
        okCallback = ok_callback;
        cancelCallback = cancel_callback;
    }

    function ok() {
        wpd.popup.close('okCancelPopup');
        okCallback();
    }

    function cancel() {
        wpd.popup.close('okCancelPopup');
        cancelCallback();
    }

    return {
        show: show,
        ok: ok,
        cancel: cancel
    };
})();

wpd.unsupported = function () {
    wpd.messagePopup.show("Unsupported Feature!", "This feature has not been implemented in the current version. This may be available in a future release.");
};

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
        sb.style.display = "inline-block";
        sb.style.height = parseInt(document.body.offsetHeight,10) - 280 + 'px';
    }

    function clear() { // Clears all open sidebars
        var sidebarList = document.getElementsByClassName('sidebar'),
            ii;

        for (ii = 0; ii < sidebarList.length; ii++) {
            sidebarList[ii].style.display="none";

        }
    }

    function resize() {
        var sidebarList = document.getElementsByClassName('sidebar'),
            ii;

        for (ii = 0; ii < sidebarList.length; ii++) {
            if (sidebarList[ii].style.display === "inline-block") {
                sidebarList[ii].style.height = parseInt(document.body.offsetHeight,10) - 280 + 'px';
            }
        }
    }

    return {
        show: show,
        clear: clear,
        resize: resize
    };

})();


/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

    function show(tbid) { // Shows a specific toolbar
        clear();
        var tb = document.getElementById(tbid);
        tb.style.visibility = "visible";
    }

    function clear() { // Clears all open toolbars
        var toolbarList = document.getElementsByClassName('toolbar'),
            ii;

        for (ii = 0; ii < toolbarList.length; ii++) {
             toolbarList[ii].style.visibility="hidden";
        }        
    }

    return {
        show: show,
        clear: clear
    };
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.transformationEquations = (function () {
    function show() {
        if(wpd.appData.isAligned() === false) {
            wpd.messagePopup.show("Transformation Equations","Transformation equations are available only after axes have been calibrated.");
            return;
        }
        wpd.popup.show('axes-transformation-equations-window');
        var $list = document.getElementById('axes-transformation-equation-list'),
            listHTML = '',
            axes = wpd.appData.getPlotData().axes,
            eqns = axes.getTransformationEquations(),
            i,
            axesType;

        listHTML += '<p><b>Axes Type</b>: ';
        if(axes instanceof wpd.XYAxes) {
            listHTML += 'XY</p>';
        } else if(axes instanceof wpd.PolarAxes) {
            listHTML += 'Polar</p>';
        } else if(axes instanceof wpd.TernaryAxes) {
            listHTML += 'Ternary</p>';
        } else if(axes instanceof wpd.MapAxes) {
            listHTML += 'Map</p>';
        } else if(axes instanceof wpd.ImageAxes) {
            listHTML += 'Image</p>';
        }

        if(eqns.pixelToData != null) {
            listHTML += '<p><b>Pixel to Data</b></p><ol>';
            for(i = 0; i < eqns.pixelToData.length; i++) {
                listHTML += '<li><p class="footnote">'+eqns.pixelToData[i]+"</p></li>";
            }
            listHTML += '</ol>';
        }
        
        listHTML += '<p>&nbsp;</p>';

        if(eqns.dataToPixel != null) {
            listHTML += '<p><b>Data to Pixel</b></p><ol>';
            for(i = 0; i < eqns.dataToPixel.length; i++) {
                listHTML += '<li><p class="footnote">'+eqns.dataToPixel[i]+"</p></li>";
            }
            listHTML += '</ol>';
        }
        
        $list.innerHTML = listHTML;
    }
    return {
        show: show
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

    pix[0] = [];

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
            $mPosn.innerHTML = plotData.axes.pixelToLiveString(imageX, imageY);
        } else {
            $mPosn.innerHTML = imageX.toFixed(2) + ', ' + imageY.toFixed(2);
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
	        xlog = document.getElementById('xlog').checked,
	        ylog = document.getElementById('ylog').checked,
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
        plot.calibration = calib;
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

wpd.barCalibration = (function () {

    function start() {
        wpd.popup.show('barAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('barAxesInfo');
        var tool = new wpd.AxesCornersTool(2, 2, ['P1', 'P2']);
        wpd.graphicsWidget.setTool(tool);
    }

    function getCornerValues() {
        wpd.popup.show('barAlignment');
    }

    function align() {
        var p1 = document.getElementById('bar-axes-p1').value,
	        p2 = document.getElementById('bar-axes-p2').value,
	        isLogScale = document.getElementById('bar-axes-log-scale').checked,
            axes = new wpd.BarAxes(),
            plot,
            calib = wpd.alignAxes.getActiveCalib();

        calib.setDataAt(0, 0, p1);
        calib.setDataAt(1, 0, p2);
        if(!axes.calibrate(calib, isLogScale)) {
            wpd.popup.close('barAlignment');
            wpd.messagePopup.show('Invalid Inputs', 'Please enter valid values for calibration.', getCornerValues);
            return false;
        }
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        plot.calibration = calib;
        wpd.popup.close('barAlignment');
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
        plot.calibration = calib;
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
        plot.calibration = calib;
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
            scaleUnits = document.getElementById('scaleUnits').value,
            axes = new wpd.MapAxes(),
            plot,
            calib = wpd.alignAxes.getActiveCalib();

        axes.calibrate(calib, scaleLength, scaleUnits);
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        plot.calibration = calib;
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

        this.painterName = 'AlignmentCornersReptainer';

        this.onForcedRedraw = function () {
            wpd.graphicsWidget.resetData();
            this.onRedraw();
        };

        this.onRedraw = function () {
            var cal = wpd.alignAxes.getActiveCalib();
            if (cal == null) { return; }

            var i, imagePos, imagePx, fillStyle;

            for(i = 0; i < cal.getCount(); i++) {
                imagePos = cal.getPoint(i);
                imagePx = { x: imagePos.px, y: imagePos.py };

                if(cal.isPointSelected(i)) {
                    fillStyle = "rgba(0,200,0,1)";
                } else {
        		    fillStyle = "rgba(200,0,0,1)";
                }

                wpd.graphicsHelper.drawPoint(imagePx, fillStyle, cal.labels[i]);
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
        barEl = document.getElementById('r_bar');

        wpd.popup.close('axesList');

        if (xyEl.checked === true) {
            calibrator = wpd.xyCalibration;
        } else if(barEl.checked === true) {
            calibrator = wpd.barCalibration;
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
        updateDatasetControl();
        wpd.colorPicker.init();
        wpd.algoManager.updateAlgoList();
    }

    function updateDatasetControl() {
        var plotData = wpd.appData.getPlotData(),
            currentDataset = plotData.getActiveDataSeries(), // just to create a dataset if there is none.
            currentIndex = plotData.getActiveDataSeriesIndex(),
            $datasetList = document.getElementById('automatic-sidebar-dataset-list'),
            listHTML = '',
            i;
        for(i = 0; i < plotData.dataSeriesColl.length; i++) {
            listHTML += '<option>'+plotData.dataSeriesColl[i].name+'</option>';
        }
        $datasetList.innerHTML = listHTML;
        $datasetList.selectedIndex = currentIndex;
    }

    function changeDataset() {
        var $datasetList = document.getElementById('automatic-sidebar-dataset-list'),
            index = $datasetList.selectedIndex;
        wpd.appData.getPlotData().setActiveDataSeriesIndex(index);
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount();
    }
          
    return {
        start: start,
        updateDatasetControl: updateDatasetControl,
        changeDataset: changeDataset
    };
})();


// Manage auto extract algorithms
wpd.algoManager = (function() {

    var axesPtr;

    function updateAlgoList() {
        
        var innerHTML = '',
            axes = wpd.appData.getPlotData().axes,
            $algoOptions = document.getElementById('auto-extract-algo-name');

        if(axes === axesPtr) {
            return; // don't re-render if already done for this axes object.
        } else {
            axesPtr = axes;
        }

        // Averaging Window
        if(!(axes instanceof wpd.BarAxes)) {
            innerHTML += '<option value="averagingWindow">Averaging Window</option>';
        }

        // X Step w/ Interpolation and X Step
        if((axes instanceof wpd.XYAxes) && (!axes.isLogX()) && (!axes.isLogY())) {
            innerHTML += '<option value="XStepWithInterpolation">X Step w/ Interpolation</option>';
            innerHTML += '<option value="XStep">X Step</option>';
        }

        // Blob Detector
        if(!(axes instanceof wpd.BarAxes)) {
            innerHTML += '<option value="blobDetector">Blob Detector</option>';
        }

        // Bar Extraction
        if(axes instanceof wpd.BarAxes) {
            innerHTML += '<option value="barExtraction">Bar Extraction</option>';
        }

        // Histogram
        if(axes instanceof wpd.XYAxes) {
            innerHTML += '<option value="histogram">Histogram</option>';
        }

        $algoOptions.innerHTML = innerHTML;

        applyAlgoSelection();
    }

    function applyAlgoSelection() {
        var $algoOptions = document.getElementById('auto-extract-algo-name'),
            selectedValue = $algoOptions.value,
            autoDetector = wpd.appData.getPlotData().getAutoDetector();

        if (selectedValue === 'averagingWindow') {
            autoDetector.algorithm = new wpd.AveragingWindowAlgo();
        } else if (selectedValue === 'XStepWithInterpolation') {
            autoDetector.algorithm = new wpd.XStepWithInterpolationAlgo();
        } else if (selectedValue === 'XStep') {
            autoDetector.algorithm = new wpd.AveragingWindowWithStepSizeAlgo();
        } else if (selectedValue === 'blobDetector') {
            autoDetector.algorithm = new wpd.BlobDetectorAlgo();
        } else if (selectedValue === 'barExtraction' || selectedValue === 'histogram') {
            autoDetector.algorithm = new wpd.BarExtractionAlgo();
        } else {
            autoDetector.algorithm = new wpd.AveragingWindowAlgo();
        }

        renderParameters(autoDetector.algorithm);
    }

    function renderParameters(algo) {
        var $paramContainer = document.getElementById('algo-parameter-container'),
            algoParams = algo.getParamList(),
            pi,
            tableString = "<table>";

        
        for(pi = 0; pi < algoParams.length; pi++) {
            tableString += '<tr><td>' + algoParams[pi][0] + 
                '</td><td><input type="text" size=3 id="algo-param-' + pi + 
                '" class="algo-params" value="'+ algoParams[pi][2] + '"/></td><td>' 
                + algoParams[pi][1] + '</td></tr>';
        }

        tableString += "</table>";
        $paramContainer.innerHTML = tableString;
    }

    function run() {
        wpd.busyNote.show();
        var fn = function () {
            var autoDetector = wpd.appData.getPlotData().getAutoDetector(),
                algo = autoDetector.algorithm,
                repainter = new wpd.DataPointsRepainter(),
                $paramFields = document.getElementsByClassName('algo-params'),
                pi,
                paramId, paramIndex,
                ctx = wpd.graphicsWidget.getAllContexts(),
                imageSize = wpd.graphicsWidget.getImageSize();

            for(pi = 0; pi < $paramFields.length; pi++) {
                paramId = $paramFields[pi].id;
                paramIndex = parseInt(paramId.replace('algo-param-', ''), 10);
                algo.setParam(paramIndex, parseFloat($paramFields[pi].value));
            }

            wpd.graphicsWidget.removeTool();

            autoDetector.imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
            autoDetector.generateBinaryData();
            wpd.graphicsWidget.setRepainter(repainter);
            algo.run(wpd.appData.getPlotData());
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.dataPointCounter.setCount();
            wpd.busyNote.close();
            return true;
        };
        setTimeout(fn, 10); // This is required for the busy note to work!
    }

    return {
        updateAlgoList: updateAlgoList,
        applyAlgoSelection: applyAlgoSelection,
        run: run
    };
})();


/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.colorSelectionWidget = (function () {

    var color,
        triggerElementId,
        title,
        setColorDelegate;
    
    function setParams(params) {
        color = params.color;
        triggerElementId = params.triggerElementId;
        title = params.title;
        setColorDelegate = params.setColorDelegate;

        var $widgetTitle = document.getElementById('color-selection-title');
        $widgetTitle.innerHTML = title;
    }

    function apply() {
        var $triggerBtn = document.getElementById(triggerElementId);
        $triggerBtn.style.backgroundColor = 'rgb('+color[0]+','+color[1]+','+color[2]+')';
    }

    function startPicker() {
        var $selectedColor = document.getElementById('color-selection-selected-color-box');
        
        $selectedColor.style.backgroundColor = 'rgb('+color[0]+','+color[1]+','+color[2]+')';
        document.getElementById('color-selection-red').value = color[0];
        document.getElementById('color-selection-green').value = color[1];
        document.getElementById('color-selection-blue').value = color[2];
        renderColorOptions();
        wpd.popup.show('color-selection-widget');
    }

    function renderColorOptions() {
        var $container = document.getElementById('color-selection-options'),
            topColors = wpd.appData.getPlotData().topColors,
            colorCount = topColors.length > 10 ? 10 : topColors.length,
            colori,
            containerHtml = "",
            perc,
            colorString;

        for (colori = 0; colori < colorCount; colori++) {            
            colorString = 'rgb(' + topColors[colori].r + ',' + topColors[colori].g + ',' + topColors[colori].b + ');';
            perc = topColors[colori].percentage.toFixed(3) + "%";
            containerHtml += '<div class="colorOptionBox" style="background-color: ' + colorString + '\" title=\"' + perc +  '" onclick="wpd.colorSelectionWidget.selectTopColor('+ colori +');"></div>';
        }

        $container.innerHTML = containerHtml;
    }

    function pickColor() {
        wpd.popup.close('color-selection-widget');
        var tool = new wpd.ColorPickerTool();
        tool.onComplete = function (col) {
            color = col;
            setColorDelegate(col);
            wpd.graphicsWidget.removeTool();
            startPicker();
        };
        wpd.graphicsWidget.setTool(tool);
    }

    function setColor() {
        var gui_color = [];
        gui_color[0] = parseInt(document.getElementById('color-selection-red').value, 10);
        gui_color[1] = parseInt(document.getElementById('color-selection-green').value, 10);
        gui_color[2] = parseInt(document.getElementById('color-selection-blue').value, 10);
        color = gui_color;
        setColorDelegate(gui_color);
        wpd.popup.close('color-selection-widget');
        apply();
    }

    function selectTopColor(colorIndex) {
        var gui_color = [],
            topColors = wpd.appData.getPlotData().topColors;

        gui_color[0] = topColors[colorIndex].r;
        gui_color[1] = topColors[colorIndex].g;
        gui_color[2] = topColors[colorIndex].b;

        color = gui_color;
        setColorDelegate(gui_color);
        startPicker();
    }

    function paintFilteredColor(binaryData, maskPixels) {
         var ctx = wpd.graphicsWidget.getAllContexts(),
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            imageSize = wpd.graphicsWidget.getImageSize(),
            maski,
            img_index,
            imgx, imgy,
            dataLayer;

        dataLayer = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);

        if(maskPixels == null || maskPixels.length === 0) {
            return;
        }

        for(maski = 0; maski < maskPixels.length; maski++) {
            img_index = maskPixels[maski];
            if(binaryData[img_index] === true) {
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

    return {
        setParams: setParams,
        startPicker: startPicker,
        pickColor: pickColor,
        setColor: setColor,
        selectTopColor: selectTopColor,
        paintFilteredColor: paintFilteredColor
    };

})();

wpd.colorPicker = (function () {

    function getFGPickerParams() {
        return {
            color: wpd.appData.getPlotData().getAutoDetector().fgColor,
            triggerElementId: 'color-button',
            title: 'Specify Plot (Foreground) Color',
            setColorDelegate: function(col) {
                wpd.appData.getPlotData().getAutoDetector().fgColor = col;
            }
        };
    }

    function getBGPickerParams() {
        return {
            color: wpd.appData.getPlotData().getAutoDetector().bgColor,
            triggerElementId: 'color-button',
            title: 'Specify Background Color',
            setColorDelegate: function(col) {
                wpd.appData.getPlotData().getAutoDetector().bgColor = col;
            }
        };
    }
    
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

    function changeColorDistance() {
        var color_distance = parseFloat(document.getElementById('color-distance-value').value);
        wpd.appData.getPlotData().getAutoDetector().colorDistance = color_distance;
    }

    function testColorDetection() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.setRepainter(new wpd.ColorFilterRepainter());

        var ctx = wpd.graphicsWidget.getAllContexts(),
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            imageSize = wpd.graphicsWidget.getImageSize();

        autoDetector.imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        autoDetector.generateBinaryData();
        wpd.colorSelectionWidget.paintFilteredColor(autoDetector.binaryData, autoDetector.mask); 
    }
    
    function startPicker() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();
        if(wpd.appData.getPlotData().getAutoDetector().colorDetectionMode === 'fg') {
            wpd.colorSelectionWidget.setParams(getFGPickerParams());
        } else {
            wpd.colorSelectionWidget.setParams(getBGPickerParams());
        }
        wpd.colorSelectionWidget.startPicker();
    }

    function changeDetectionMode() {
        var $modeSelector = document.getElementById('color-detection-mode-select');
        wpd.appData.getPlotData().getAutoDetector().colorDetectionMode = $modeSelector.value;
        init();
    }

    return {
        startPicker: startPicker,
        changeDetectionMode: changeDetectionMode,
        changeColorDistance: changeColorDistance,
        init: init,
        testColorDetection: testColorDetection
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
            var autoDetector = wpd.appData.getPlotData().getAutoDetector();
            wpd.colorSelectionWidget.paintFilteredColor(autoDetector.binaryData, autoDetector.mask);
        };
    };
    return Painter;
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.plotDataProvider = (function() {

    function getDatasetNames() {
        var plotData = wpd.appData.getPlotData(),
            datasetNames = [],
            di;
        for(di = 0; di < plotData.dataSeriesColl.length; di++) {
            datasetNames[di] = plotData.dataSeriesColl[di].name;
        }
        return datasetNames;
    }

    function getDatasetIndex() {
        return wpd.appData.getPlotData().getActiveDataSeriesIndex();
    }

    function setDatasetIndex(index) {
        wpd.appData.getPlotData().setActiveDataSeriesIndex(index);
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount();
    }

    function getData() {
        var axes = wpd.appData.getPlotData().axes;

        if(axes instanceof wpd.BarAxes) {
            return getBarAxesData();
        } else {
            return getGeneralAxesData();
        }
    }

    function getBarAxesData() {
        var fields = [],
            fieldDateFormat = [],
            rawData = [],
            isFieldSortable = [],
            plotData = wpd.appData.getPlotData(),
            dataSeries = plotData.getActiveDataSeries(),
            axes = plotData.axes,
            rowi, coli,
            dataPt,
            transformedDataPt,
            lab;

        for (rowi = 0; rowi < dataSeries.getCount(); rowi++) {
            
            dataPt = dataSeries.getPixel(rowi);
            transformedDataPt = axes.pixelToData(dataPt.x, dataPt.y);
            
            rawData[rowi] = [];
            
            // metaData[0] should be the label:
            if(dataPt.metadata == null) {
                lab = "Bar" + rowi;
            } else {
                lab = dataPt.metadata[0];
            }
            rawData[rowi][0] = lab;
            // transformed value
            rawData[rowi][1] = transformedDataPt[0];
            // other metadata if present can go here in the future.
        }

        fields = ['Label', 'Value'];
        isFieldSortable = [false, true];

        return {
            fields: fields,
            fieldDateFormat: fieldDateFormat,
            rawData: rawData,
            allowConnectivity: false,
            connectivityFieldIndices: [],
            isFieldSortable: isFieldSortable
        };
    }

    function getGeneralAxesData() {
        // 2D XY, Polar, Ternary, Image, Map

        var plotData = wpd.appData.getPlotData(),
            dataSeries = plotData.getActiveDataSeries(),
            axes = plotData.axes,
            fields = [],
            fieldDateFormat = [],
            connectivityFieldIndices = [],
            rawData = [],
            isFieldSortable = [],
            rowi,
            coli,
            pt,
            ptData,
            metadi,
            hasMetadata = dataSeries.hasMetadata(),
            metaKeys = dataSeries.getMetadataKeys(),
            metaKeyCount = hasMetadata === true ? metaKeys.length : 0,
            ptmetadata;
        
        for(rowi = 0; rowi < dataSeries.getCount(); rowi++) {

            pt = dataSeries.getPixel(rowi);
            ptData = axes.pixelToData(pt.x, pt.y);
            rawData[rowi] = [];
            
            // transformed coordinates
            for (coli = 0; coli < ptData.length; coli++) {
                rawData[rowi][coli] = ptData[coli];
            }

            // metadata
            for (metadi = 0; metadi < metaKeyCount; metadi++) {
                if (pt.metadata == null || pt.metadata[metadi] == null) {
                    ptmetadata = 0;
                } else {
                    ptmetadata = pt.metadata[metadi];
                }
                rawData[rowi][ptData.length + metadi] = ptmetadata;
            }
        }

        fields = axes.getAxesLabels();
        if(hasMetadata) {
            fields = fields.concat(metaKeys);
        }

        for(coli = 0; coli < fields.length; coli++) {
            if(coli < axes.getDimensions()) {
                connectivityFieldIndices[coli] = coli;
                if(axes.isDate != null && axes.isDate(coli)) {
                    fieldDateFormat[coli] = axes.getInitialDateFormat(coli);
                }
            }
            
            isFieldSortable[coli] = true; // all fields are sortable
        }

        return {
            fields: fields,
            fieldDateFormat: fieldDateFormat,
            rawData: rawData,
            allowConnectivity: true,
            connectivityFieldIndices: connectivityFieldIndices,
            isFieldSortable: isFieldSortable
        };
    }

    return {
        getDatasetNames: getDatasetNames,
        getDatasetIndex: getDatasetIndex,
        setDatasetIndex: setDatasetIndex,
        getData: getData
    };
})();

wpd.measurementDataProvider = (function() {

    var dataSource = 'distance';

    function setDataSource(source) {
        dataSource = source;
    }

    function getDatasetNames() {
        if(dataSource === 'angle') {
            return ['Angle Measurements'];
        } else if (dataSource === 'distance') {
            return ['Distance Measurements'];
        }
    }

    function getDatasetIndex() {
        return 0;
    }

    function setDatasetIndex(index) {
        // ignore
    }

    function getData() {
        var fields = [],
            fieldDateFormat = [],
            rawData = [],
            isFieldSortable = [],
            plotData = wpd.appData.getPlotData(),
            axes = plotData.axes,
            isMap = wpd.appData.isAligned() && (axes instanceof wpd.MapAxes),
            conni,
            mData;
        
        if (dataSource === 'distance') {

            mData = plotData.distanceMeasurementData;
            for(conni = 0; conni < mData.connectionCount(); conni++) {
                rawData[conni] = [];
                rawData[conni][0] = 'Dist' + conni;
                if(isMap) {
                    rawData[conni][1] = axes.pixelToDataDistance(mData.getDistance(conni));
                } else {
                    rawData[conni][1] = mData.getDistance(conni);
                }
            }
            
            fields = ['Label', 'Distance'];
            isFieldSortable = [false, true];

        } else if (dataSource === 'angle') {

            mData = plotData.angleMeasurementData;
            for(conni = 0; conni < mData.connectionCount(); conni++) {
                rawData[conni] = [];
                rawData[conni][0] = 'Theta'+ conni;
                rawData[conni][1] = mData.getAngle(conni);
            }

            fields = ['Label', 'Angle'];
            isFieldSortable = [false, true];
        }

        return {
            fields: fields,
            fieldDateFormat: fieldDateFormat,
            rawData: rawData,
            allowConnectivity: false,
            connectivityFieldIndices: [],
            isFieldSortable: isFieldSortable
        };
    }

    return {
        getDatasetNames: getDatasetNames,
        getDatasetIndex: getDatasetIndex,
        setDatasetIndex: setDatasetIndex,
        setDataSource: setDataSource,
        getData: getData
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.graphicsHelper = (function () {

    // imagePx - relative to original image
    // fillStyle - e.g. "rgb(200,0,0)"
    // label - e.g. "Bar 0"
    function drawPoint(imagePx, fillStyle, label) {
        var screenPx = wpd.graphicsWidget.screenPx(imagePx.x, imagePx.y),
            ctx = wpd.graphicsWidget.getAllContexts(),
            labelWidth;

        // Display Data Canvas Layer
        if(label != null) {
            ctx.dataCtx.font = "15px sans-serif";
            labelWidth = ctx.dataCtx.measureText(label).width;
            ctx.dataCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.dataCtx.fillRect(screenPx.x - 13, screenPx.y - 8, labelWidth + 5, 35);
            ctx.dataCtx.fillStyle = fillStyle;
            ctx.dataCtx.fillText(label, screenPx.x - 10, screenPx.y + 18);
        }

        ctx.dataCtx.beginPath();
        ctx.dataCtx.fillStyle = fillStyle;
        ctx.dataCtx.arc(screenPx.x, screenPx.y, 3, 0, 2.0*Math.PI, true);
        ctx.dataCtx.fill();

        // Original Image Data Canvas Layer
        if(label != null) {
            // No translucent background for text here.
            ctx.oriDataCtx.font = "15px sans-serif";
            ctx.oriDataCtx.fillStyle = fillStyle;
            ctx.oriDataCtx.fillText(label, imagePx.x - 10, imagePx.y + 18);
        }

        ctx.oriDataCtx.beginPath();
        ctx.oriDataCtx.fillStyle = fillStyle;
        ctx.oriDataCtx.arc(imagePx.x, imagePx.y, 3, 0, 2.0*Math.PI, true);
        ctx.oriDataCtx.fill();
    }

    return {
        drawPoint : drawPoint
    };

})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd = wpd || {};

wpd.gridDetection = (function () {
    
    function start() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();
        wpd.sidebar.show('grid-detection-sidebar');
    }

    function markBox() {
        var tool = new wpd.GridBoxTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function viewMask() {
        var tool = new wpd.GridViewMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function clearMask() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.appData.getPlotData().getAutoDetector().gridMask = {
                xmin: null,
                xmax: null,
                ymin: null,
                ymax: null,
                pixels: []
            };
        wpd.graphicsWidget.resetData();
    }

    function grabMask() {
        // Mask is just a list of pixels with the yellow color in the data layer
        var ctx = wpd.graphicsWidget.getAllContexts(),
            imageSize = wpd.graphicsWidget.getImageSize(),
            maskDataPx = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height),
            maskData = [],
            i,
            mi = 0,
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            x, y;
        for(i = 0; i < maskDataPx.data.length; i+=4) {
            if (maskDataPx.data[i] === 255 && maskDataPx.data[i+1] === 255 && maskDataPx.data[i+2] === 0) {
                
                maskData[mi] = i/4; mi++;

                x = parseInt((i/4)%imageSize.width, 10);
                y = parseInt((i/4)/imageSize.width, 10);

                if (mi === 1) {
                    autoDetector.gridMask.xmin = x;
                    autoDetector.gridMask.xmax = x;
                    autoDetector.gridMask.ymin = y;
                    autoDetector.gridMask.ymax = y;
                } else {
                    if (x < autoDetector.gridMask.xmin) {
                        autoDetector.gridMask.xmin = x;
                    }
                    if (x > autoDetector.gridMask.xmax) {
                        autoDetector.gridMask.xmax = x;
                    }
                    if (y < autoDetector.gridMask.ymin) {
                        autoDetector.gridMask.ymin = y;
                    }
                    if (y > autoDetector.gridMask.ymax) {
                        autoDetector.gridMask.ymax = y;
                    }
                }
            }
        }
        autoDetector.gridMask.pixels = maskData;
    }

    function run() {

        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();

        var autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            ctx = wpd.graphicsWidget.getAllContexts(),
            imageSize = wpd.graphicsWidget.getImageSize();
        
        autoDetector.imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);

        autoDetector.generateGridBinaryData();

        // gather detection parameters from GUI
        wpd.gridDetectionCore.setHorizontalParameters(true, 5, 5);
        wpd.gridDetectionCore.setVerticalParameters(true, 5, 5);

        wpd.gridDetectionCore.run();
    }

    function clear() {
        wpd.graphicsWidget.removeTool();
        wpd.appData.getPlotData().gridData = null;
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();
    }

    function startColorPicker() {
        wpd.colorSelectionWidget.setParams({
            color: wpd.appData.getPlotData().getAutoDetector().gridLineColor,
            triggerElementId: 'grid-color-picker-button',
            title: 'Specify Grid Line Color',
            setColorDelegate: function(col) {
                wpd.appData.getPlotData().getAutoDetector().gridLineColor = col;
            }
        });
        wpd.colorSelectionWidget.startPicker();
    }

    function testColor() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.setRepainter(new wpd.GridColorFilterRepainter());

        var ctx = wpd.graphicsWidget.getAllContexts(),
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            imageSize = wpd.graphicsWidget.getImageSize();

        autoDetector.imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        autoDetector.generateGridBinaryData();
        wpd.colorSelectionWidget.paintFilteredColor(autoDetector.gridBinaryData, autoDetector.gridMask.pixels);
    }

    function changeColorDistance() {
        var color_distance = parseFloat(document.getElementById('grid-color-distance').value);
        wpd.appData.getPlotData().getAutoDetector().gridColorDistance = color_distance;
    }
     
    return {
        start: start,
        markBox: markBox,
        clearMask: clearMask,
        viewMask: viewMask,
        grabMask: grabMask,
        startColorPicker: startColorPicker,
        changeColorDistance: changeColorDistance,
        testColor: testColor,
        run: run,
        clear: clear
    };
})();


wpd.GridColorFilterRepainter = (function () {
    var Painter = function () {
        this.painterName = 'gridColorFilterRepainter';

        this.onRedraw = function () {
            var autoDetector = wpd.appData.getPlotData().getAutoDetector();
            wpd.colorSelectionWidget.paintFilteredColor(autoDetector.gridBinaryData, autoDetector.gridMask.pixels);
        };
    }
    return Painter;
})();


// TODO: Think of reusing mask.js code here
wpd.GridBoxTool = (function () {
    var Tool = function () {
        var isDrawing = false,
            topImageCorner,
            topScreenCorner,
            ctx = wpd.graphicsWidget.getAllContexts(),
            moveTimer,
            screen_pos,

            mouseMoveHandler = function () {
                wpd.graphicsWidget.resetHover();
                ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
    		    ctx.hoverCtx.strokeRect(topScreenCorner.x, topScreenCorner.y, screen_pos.x - topScreenCorner.x, screen_pos.y - topScreenCorner.y);
            },

            mouseUpHandler = function (ev, pos, imagePos) {
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
            },

            mouseOutPos = null,
            mouseOutImagePos = null;

        this.onAttach = function () {
            wpd.graphicsWidget.setRepainter(new wpd.GridMaskPainter());
            document.getElementById('grid-mask-box').classList.add('pressed-button');
            document.getElementById('grid-mask-view').classList.add('pressed-button');
        };

        this.onMouseDown = function (ev, pos, imagePos) {
            if(isDrawing === true) return;
            isDrawing = true;
            topImageCorner = imagePos;
            topScreenCorner = pos;
        };

        this.onMouseMove = function (ev, pos, imagePos) {
            if(isDrawing === false) return;
            screen_pos = pos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 2);
        };

        this.onMouseOut = function (ev, pos, imagePos) {
            if(isDrawing === true) {
                clearTimeout(moveTimer);
                mouseOutPos = pos;
                mouseOutImagePos = imagePos;
            }
        };

        this.onDocumentMouseUp = function (ev, pos, imagePos) {
            if (mouseOutPos != null && mouseOutImagePos != null) {
                mouseUpHandler(ev, mouseOutPos, mouseOutImagePos);
            } else {
                mouseUpHandler(ev, pos, imagePos);
            }
            mouseOutPos = null;
            mouseOutImagePos = null;
        };

        this.onMouseUp = function (ev, pos, imagePos) {
            mouseUpHandler(ev, pos, imagePos);
        };

        this.onRemove = function () {
            document.getElementById('grid-mask-box').classList.remove('pressed-button');
            document.getElementById('grid-mask-view').classList.remove('pressed-button');
            wpd.gridDetection.grabMask();
        };
    };
    return Tool;
})();


wpd.GridViewMaskTool = (function () {
    var Tool = function() {

        this.onAttach = function () {
            wpd.graphicsWidget.setRepainter(new wpd.GridMaskPainter());
            document.getElementById('grid-mask-view').classList.add('pressed-button');
        };

        this.onRemove = function () {
            document.getElementById('grid-mask-view').classList.remove('pressed-button');
            wpd.gridDetection.grabMask();
        };
    };

    return Tool;
})();


wpd.GridMaskPainter = (function () {
    var Painter = function () {

        var ctx = wpd.graphicsWidget.getAllContexts(),
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            painter = function () {
                if(autoDetector.gridMask.pixels == null || autoDetector.gridMask.pixels.length === 0) {
                    return;
                }
                var maski, img_index,
                    imageSize = wpd.graphicsWidget.getImageSize();
                    imgData = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);

                for(maski = 0; maski < autoDetector.gridMask.pixels.length; maski++) {
                    img_index = autoDetector.gridMask.pixels[maski];
                    imgData.data[img_index*4] = 255;
                    imgData.data[img_index*4+1] = 255;
                    imgData.data[img_index*4+2] = 0;
                    imgData.data[img_index*4+3] = 200;
                }

                ctx.oriDataCtx.putImageData(imgData, 0, 0);
                wpd.graphicsWidget.copyImageDataLayerToScreen();
            };

        this.painterName = 'gridMaskPainter';

        this.onRedraw = function () {
            wpd.gridDetection.grabMask();
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
wpd = wpd || {};

wpd.imageOps = (function () {

    function hflipOp(idata, iwidth, iheight) {
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

    function vflipOp(idata, iwidth, iheight) {
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

    function hflip() {
        wpd.graphicsWidget.runImageOp(hflipOp);
    }

    function vflip() {
        wpd.graphicsWidget.runImageOp(vflipOp);
    }

    return {
        hflip: hflip,
        vflip: vflip
    };
})();

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
        isTab: function(code) {
            return code === 9;
        },
        isDel: function(code) {
            return code === 46;
        },
        isBackspace: function(code) {
            return code === 8;
        },
        isAlphabet: function(code, alpha) {
            if (code > 90 || code < 65) {
                return false;
            }
            return String.fromCharCode(code).toLowerCase() === alpha;
        },
        isEnter: function(code) {
            return code === 13;
        },
        isEsc: function(code) {
            return code === 27;
        }
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
            showSidebar();
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

    function confirmedClearAll() {
        wpd.appData.getPlotData().getActiveDataSeries().clearAll();
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.dataPointCounter.setCount();
        wpd.graphicsWidget.removeRepainter();
    }

    function clearAll() {
        if(wpd.appData.getPlotData().getActiveDataSeries().getCount() <= 0) {
            return;
        }
        wpd.okCancelPopup.show("Clear data points?", "This will delete all data points from this dataset", confirmedClearAll, function() {});
    }

    function undo() {
        wpd.appData.getPlotData().getActiveDataSeries().removeLastPixel();
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount();
    }
 
    function showSidebar() {
        wpd.sidebar.show('acquireDataSidebar');
        updateDatasetControl();
        updateControlVisibility();
        wpd.dataPointCounter.setCount();
    }

    function updateControlVisibility() {
        var axes = wpd.appData.getPlotData().axes,
            $editLabelsBtn = document.getElementById('edit-data-labels');
        if(axes instanceof wpd.BarAxes) {
            $editLabelsBtn.style.display = 'inline-block';
        } else {
            $editLabelsBtn.style.display = 'none';
        }
    }

    function updateDatasetControl() {
        var plotData = wpd.appData.getPlotData(),
            currentDataset = plotData.getActiveDataSeries(), // just to create a dataset if there is none.
            currentIndex = plotData.getActiveDataSeriesIndex(),
            $datasetList = document.getElementById('manual-sidebar-dataset-list'),
            listHTML = '',
            i;
        for(i = 0; i < plotData.dataSeriesColl.length; i++) {
            listHTML += '<option>'+plotData.dataSeriesColl[i].name+'</option>';
        }
        $datasetList.innerHTML = listHTML;
        $datasetList.selectedIndex = currentIndex;
    }

    function changeDataset($datasetList) {
        var index = $datasetList.selectedIndex;
        wpd.appData.getPlotData().setActiveDataSeriesIndex(index);
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount();
    }

    function adjustPoints() {
        wpd.graphicsWidget.setTool(new wpd.AdjustDataPointTool());
    }

    function editLabels() {
        wpd.graphicsWidget.setTool(new wpd.EditLabelsTool());
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
            case 'e':
                editLabels();
                break;
            default: 
                break;
        }
    }

    function isToolSwitchKey(keyCode) {
        if(wpd.keyCodes.isAlphabet(keyCode, 'a')
            || wpd.keyCodes.isAlphabet(keyCode, 's')
            || wpd.keyCodes.isAlphabet(keyCode, 'd')
            || wpd.keyCodes.isAlphabet(keyCode, 'e')) {
            return true;
        }
        return false;
    }

    return {
        load: load,
        manualSelection: manualSelection,
        adjustPoints: adjustPoints,
        deletePoint: deletePoint,
        clearAll: clearAll,
        undo: undo,
        showSidebar: showSidebar,
        switchToolOnKeyPress: switchToolOnKeyPress,
        isToolSwitchKey: isToolSwitchKey,
        updateDatasetControl: updateDatasetControl,
        changeDataset: changeDataset,
        editLabels: editLabels
    };
})();

wpd.dataPointLabelEditor = (function() {

    var ds, ptIndex, tool;
    
    function show(dataSeries, pointIndex, initTool) {
        var pixel = dataSeries.getPixel(pointIndex),
            originalLabel = pixel.metadata[0],
            $labelField;
        
        ds = dataSeries;
        ptIndex = pointIndex;
        tool = initTool;

        wpd.graphicsWidget.removeTool();

        // show popup window with originalLabel in the input field.
        wpd.popup.show('data-point-label-editor');
        $labelField = document.getElementById('data-point-label-field');
        $labelField.value = originalLabel;
        $labelField.focus();
    }

    function ok() {
        var newLabel = document.getElementById('data-point-label-field').value;

        if(newLabel != null && newLabel.length > 0) {
            // set label 
            ds.setMetadataAt(ptIndex, [newLabel]);
            // refresh graphics
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.forceHandlerRepaint();
        }

        wpd.popup.close('data-point-label-editor');
        wpd.graphicsWidget.setTool(tool);
    }

    function cancel() {
        // just close the popup
        wpd.popup.close('data-point-label-editor');
        wpd.graphicsWidget.setTool(tool);
    }

    function keydown(ev) {
        if(wpd.keyCodes.isEnter(ev.keyCode)) {
            ok();
        } else if(wpd.keyCodes.isEsc(ev.keyCode)) {
            cancel();
        }
        ev.stopPropagation();
    }

    return {
        show: show,
        ok: ok,
        cancel: cancel,
        keydown: keydown
    };
})();

wpd.ManualSelectionTool = (function () {
    var Tool = function () {
        var plotData = wpd.appData.getPlotData();

        this.onAttach = function () {
            document.getElementById('manual-select-button').classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter());
        };

       
        this.onMouseClick = function (ev, pos, imagePos) {
            var activeDataSeries = plotData.getActiveDataSeries(),
                pointLabel,
                mkeys;
            
            if(plotData.axes.dataPointsHaveLabels) { // e.g. Bar charts

                // This isn't the cleanest approach, but should do for now:
                mkeys = activeDataSeries.getMetadataKeys();
                if(mkeys == null || mkeys[0] !== 'Label') {
                    activeDataSeries.setMetadataKeys(['Label']);
                }
                pointLabel = plotData.axes.dataPointsLabelPrefix + activeDataSeries.getCount();
                activeDataSeries.addPixel(imagePos.x, imagePos.y, [pointLabel]);
                wpd.graphicsHelper.drawPoint(imagePos, "rgb(200,0,0)", pointLabel);

            } else {

                activeDataSeries.addPixel(imagePos.x, imagePos.y);
                wpd.graphicsHelper.drawPoint(imagePos, "rgb(200,0,0)");

            }

            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointCounter.setCount();

            // If shiftkey was pressed while clicking on a point that has a label (e.g. bar charts),
            // then show a popup to edit the label
            if(plotData.axes.dataPointsHaveLabels && ev.shiftKey) {
                wpd.dataPointLabelEditor.show(activeDataSeries, activeDataSeries.getCount() - 1, this);
            }
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
            } else if(wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
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
            if(wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
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
            var plotData = wpd.appData.getPlotData(),
                activeDataSeries = plotData.getActiveDataSeries(),
                dindex,
                imagePos,
                fillStyle,
                isSelected,
                mkeys = activeDataSeries.getMetadataKeys(),
                hasLabels = false,
                pointLabel;

            if(plotData.axes.dataPointsHaveLabels && mkeys != null && mkeys[0] === 'Label') {
                hasLabels = true;
            }

            for(dindex = 0; dindex < activeDataSeries.getCount(); dindex++) {
                imagePos = activeDataSeries.getPixel(dindex);
                isSelected = activeDataSeries.getSelectedPixels().indexOf(dindex) >= 0;

                if(isSelected) {
                    fillStyle = "rgb(0,200,0)";
                } else {
                    fillStyle = "rgb(200,0,0)";
                }

                if (hasLabels) {
                    pointLabel = imagePos.metadata[0];
                    if(pointLabel == null) {
                        pointLabel = plotData.axes.dataPointsLabelPrefix + dindex;
                    }
                    wpd.graphicsHelper.drawPoint(imagePos, fillStyle, pointLabel);
                } else {
                    wpd.graphicsHelper.drawPoint(imagePos, fillStyle);
                }
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
            wpd.toolbar.show('adjustDataPointsToolbar');
        }; 
        
        this.onRemove = function () {
            var dataSeries = wpd.appData.getPlotData().getActiveDataSeries();
            dataSeries.unselectAll();
            wpd.graphicsWidget.forceHandlerRepaint();
            document.getElementById('manual-adjust-button').classList.remove('pressed-button');
            wpd.toolbar.clear();
        };

        this.onMouseClick = function (ev, pos, imagePos) {
            var dataSeries = wpd.appData.getPlotData().getActiveDataSeries();
            dataSeries.unselectAll();
            dataSeries.selectNearestPixel(imagePos.x, imagePos.y);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
        };

        this.onKeyDown = function (ev) {

            if (wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
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
            } else if(wpd.keyCodes.isAlphabet(ev.keyCode, 'q')) {
                activeDataSeries.selectPreviousPixel();
                selIndex = activeDataSeries.getSelectedPixels()[0];
                selPoint = activeDataSeries.getPixel(selIndex);
                pointPx = selPoint.x;
                pointPy = selPoint.y;
            } else if(wpd.keyCodes.isAlphabet(ev.keyCode, 'w')) {
                activeDataSeries.selectNextPixel();
                selIndex = activeDataSeries.getSelectedPixels()[0];
                selPoint = activeDataSeries.getPixel(selIndex);
                pointPx = selPoint.x;
                pointPy = selPoint.y;
            } else if(wpd.keyCodes.isAlphabet(ev.keyCode, 'e')) {
                if(wpd.appData.getPlotData().axes.dataPointsHaveLabels) {
                    selIndex = activeDataSeries.getSelectedPixels()[0];
                    ev.preventDefault();
                    ev.stopPropagation();
                    wpd.dataPointLabelEditor.show(activeDataSeries, selIndex, this);
                    return;
                }
            } else if(wpd.keyCodes.isDel(ev.keyCode) || wpd.keyCodes.isBackspace(ev.keyCode)) {
                activeDataSeries.removePixelAtIndex(selIndex);
                activeDataSeries.unselectAll();
                if(activeDataSeries.findNearestPixel(pointPx, pointPy) >= 0) {
                    activeDataSeries.selectNearestPixel(pointPx, pointPy);
                    selIndex = activeDataSeries.getSelectedPixels()[0];
                    selPoint = activeDataSeries.getPixel(selIndex);
                    pointPx = selPoint.x;
                    pointPy = selPoint.y;
                }
                wpd.graphicsWidget.resetData();
                wpd.graphicsWidget.forceHandlerRepaint();
                wpd.graphicsWidget.updateZoomToImagePosn(pointPx, pointPy);
                wpd.dataPointCounter.setCount();
                ev.preventDefault();
                ev.stopPropagation();
                return;
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

wpd.EditLabelsTool = function() {

    this.onAttach = function () {
        document.getElementById('edit-data-labels').classList.add('pressed-button');
        wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter());
    };

    this.onRemove = function () {
        document.getElementById('edit-data-labels').classList.remove('pressed-button');
        wpd.appData.getPlotData().getActiveDataSeries().unselectAll();
    };

    this.onMouseClick = function (ev, pos, imagePos) {
        var dataSeries = wpd.appData.getPlotData().getActiveDataSeries(),
            pixelIndex;
        dataSeries.unselectAll();
        pixelIndex = dataSeries.selectNearestPixel(imagePos.x, imagePos.y);
        if(pixelIndex >= 0) { 
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointLabelEditor.show(dataSeries, pixelIndex, this);
        }
    };

    this.onKeyDown = function (ev) {
        if(wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
            wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
        }
    };
};

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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

    function grabMask() {
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

    function clearMask() {
        wpd.graphicsWidget.resetData();
        grabMask();
    }

    return {
        grabMask: grabMask,
        markBox: markBox,
        markPen: markPen,
        eraseMarks: eraseMarks,
        viewMask: viewMask,
        clearMask: clearMask
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
            },
            
            mouseUpHandler = function (ev, pos, imagePos) {
                if(isDrawing === false) {
                    return;
                }
                clearTimeout(moveTimer);
                isDrawing = false;
                wpd.graphicsWidget.resetHover();
                ctx.dataCtx.fillStyle = "rgba(255,255,0,1)";
                ctx.dataCtx.fillRect(topScreenCorner.x, topScreenCorner.y, pos.x-topScreenCorner.x, pos.y-topScreenCorner.y);
                ctx.oriDataCtx.fillStyle = "rgba(255,255,0,1)";
                ctx.oriDataCtx.fillRect(topImageCorner.x, topImageCorner.y, imagePos.x - topImageCorner.x, imagePos.y - topImageCorner.y);
            },
            
            mouseOutPos = null,
            mouseOutImagePos = null;

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
            moveTimer = setTimeout(mouseMoveHandler, 2);
        };

        this.onMouseOut = function (ev, pos, imagePos) {
            if(isDrawing === true) {
                clearTimeout(moveTimer);
                mouseOutPos = pos;
                mouseOutImagePos = imagePos;
            }
        };

        this.onDocumentMouseUp = function(ev, pos, imagePos) {
            if (mouseOutPos != null && mouseOutImagePos != null) {
                mouseUpHandler(ev, mouseOutPos, mouseOutImagePos);
            } else {
                mouseUpHandler(ev, pos, imagePos);
            }
            mouseOutPos = null;
            mouseOutImagePos = null;
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            mouseUpHandler(ev, pos, imagePos);
        };

        this.onRemove = function () {
            document.getElementById('box-mask').classList.remove('pressed-button');
            document.getElementById('view-mask').classList.remove('pressed-button');
            wpd.dataMask.grabMask();
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
                ctx.dataCtx.strokeStyle = "rgba(255,255,0,1)";
        	ctx.dataCtx.lineTo(screen_pos.x,screen_pos.y);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,1)";
        	ctx.oriDataCtx.lineTo(image_pos.x,image_pos.y);
                ctx.oriDataCtx.stroke();
            };

        this.onAttach = function () {
            wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
            document.getElementById('pen-mask').classList.add('pressed-button');
            document.getElementById('view-mask').classList.add('pressed-button');
            wpd.toolbar.show('paintToolbar');
        };

        this.onMouseDown = function(ev, pos, imagePos) {
            if(isDrawing === true) return;
            var lwidth = parseInt(document.getElementById('paintThickness').value, 10);
            isDrawing = true;
            ctx.dataCtx.strokeStyle = "rgba(255,255,0,1)";
            ctx.dataCtx.lineWidth = lwidth*wpd.graphicsWidget.getZoomRatio();
	    ctx.dataCtx.beginPath();
            ctx.dataCtx.moveTo(pos.x,pos.y);

            ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,1)";
            ctx.oriDataCtx.lineWidth = lwidth;
	    ctx.oriDataCtx.beginPath();
            ctx.oriDataCtx.moveTo(imagePos.x,imagePos.y);
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if(isDrawing === false) return;
            screen_pos = pos;
            image_pos = imagePos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 2);
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
            wpd.dataMask.grabMask();
            wpd.toolbar.clear();
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
             wpd.toolbar.show('eraseToolbar');
        };

        this.onMouseDown = function(ev, pos, imagePos) {
            if(isDrawing === true) return;
            var lwidth = parseInt(document.getElementById('eraseThickness').value, 10);
            isDrawing = true;
            ctx.dataCtx.globalCompositeOperation = "destination-out";
            ctx.oriDataCtx.globalCompositeOperation = "destination-out";

            ctx.dataCtx.strokeStyle = "rgba(0,0,0,1)";
            ctx.dataCtx.lineWidth = lwidth*wpd.graphicsWidget.getZoomRatio();
            ctx.dataCtx.beginPath();
            ctx.dataCtx.moveTo(pos.x,pos.y);

            ctx.oriDataCtx.strokeStyle = "rgba(0,0,0,1)";
            ctx.oriDataCtx.lineWidth = lwidth;
            ctx.oriDataCtx.beginPath();
            ctx.oriDataCtx.moveTo(imagePos.x,imagePos.y);
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if(isDrawing === false) return;
            screen_pos = pos;
            image_pos = imagePos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 2);
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
            wpd.dataMask.grabMask();
            wpd.toolbar.clear();
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
            wpd.dataMask.grabMask();
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
                    imgData.data[img_index*4+3] = 255;
                }

                ctx.oriDataCtx.putImageData(imgData, 0, 0);
                wpd.graphicsWidget.copyImageDataLayerToScreen();
            };

        this.painterName = 'dataMaskPainter';

        this.onRedraw = function () {
            wpd.dataMask.grabMask();
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
        wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool('distance'));
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
        wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool('angle'));
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

        this.onKeyDown = function (ev) {
            // move the selected point or switch tools
            if(wpd.keyCodes.isAlphabet(ev.keyCode, 'a')) {
                wpd.graphicsWidget.resetHover();
                wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(mode));
                return;
            } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'd')) {
                wpd.graphicsWidget.resetHover();
                wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool(mode));
                return;
            }
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
                    return;
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
        
        this.onKeyDown = function (ev) {
            // move the selected point or switch tools
            if(wpd.keyCodes.isAlphabet(ev.keyCode, 'a')) {
                wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(mode));
                return;
            } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'd')) {
                wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool(mode));
                return;
            }
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
                var labelWidth;
                
                sx = parseInt(sx, 10);
                sy = parseInt(sy, 10);
                ix = parseInt(ix, 10);
                iy = parseInt(iy, 10);

                ctx.dataCtx.font="14px sans-serif";
                labelWidth = ctx.dataCtx.measureText(lab).width;
                ctx.dataCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
                ctx.dataCtx.fillRect(sx - 5, sy - 15, labelWidth + 10, 25);
                ctx.dataCtx.fillStyle = "rgb(200, 0, 0)";
                ctx.dataCtx.fillText(lab, sx, sy);

                ctx.oriDataCtx.font="14px sans-serif";
                labelWidth = ctx.oriDataCtx.measureText(lab).width;
                ctx.oriDataCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
                ctx.oriDataCtx.fillRect(ix - 5, iy - 15, labelWidth + 10, 25);
                ctx.oriDataCtx.fillStyle = "rgb(200, 0, 0)";
                ctx.oriDataCtx.fillText(lab, ix, iy);
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
                    isSelected0, isSelected1,
                    axes = wpd.appData.getPlotData().axes;

                for(conni = 0; conni < conn_count; conni++) {
                    plist = distData.getConnectionAt(conni);
                    x0 = plist[0]; y0 = plist[1]; x1 = plist[2]; y1 = plist[3];
                    isSelected0 = distData.isPointSelected(conni, 0);
                    isSelected1 = distData.isPointSelected(conni, 1);
                    if(wpd.appData.isAligned() === true && axes instanceof wpd.MapAxes) {
                        dist = 'Dist' + conni.toString() + ': ' + axes.pixelToDataDistance(distData.getDistance(conni)).toFixed(2) + ' ' + axes.getUnits();
                    } else {
                        dist = 'Dist' + conni.toString() + ': ' + distData.getDistance(conni).toFixed(2) + ' px';
                    }
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
                    theta = 'Theta' + conni.toString() + ': ' + angleData.getAngle(conni).toFixed(2) + '°';
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.download = (function() {
    
    function textFile(data, filename, format) {
        var formContainer,
            formElement,
            formData,
            formFilename,
            jsonData = data;
        
        // Create a hidden form and submit
        formContainer = document.createElement('div');
        formElement = document.createElement('form');
        formData = document.createElement('textarea');
        formFilename = document.createElement('input');
        formFilename.type = 'hidden';

        formElement.setAttribute('method', 'post');

        if(format === 'json') {
            formElement.setAttribute('action', 'php/json.php');
        } else if (format === 'csv') {
            formElement.setAttribute('action', 'php/csvexport.php');
        }

        formData.setAttribute('name', "data");
        formData.setAttribute('id', "data");
        formFilename.setAttribute('name', 'filename');
        formFilename.setAttribute('id', 'filename');
        formFilename.value = stripIllegalCharacters(filename);

        formElement.appendChild(formData);
        formElement.appendChild(formFilename);
        formContainer.appendChild(formElement);
        document.body.appendChild(formContainer);
        formContainer.style.display = 'none';

        formData.innerHTML = jsonData;
        formElement.submit();
        document.body.removeChild(formContainer);
    }

    function json(jsonData, filename) {
        if(filename == null) {
            filename = 'wpd_plot_data';
        }
        textFile(jsonData, filename, 'json');
    }

    function csv(csvData, filename) {
        if(filename == null) {
            filename = 'data';
        }
        textFile(csvData, filename, 'csv');
    }

    function stripIllegalCharacters(filename) {
        return filename.replace(/[^a-zA-Z\d+\.\-_\s]/g,"_");
    }

    return {
        json: json,
        csv: csv
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.plotly = (function() {
    
    function send(dataObject) {
        var formContainer = document.createElement('div'),
            formElement = document.createElement('form'),
            formData = document.createElement('textarea'),
            jsonString;

        formElement.setAttribute('method', 'post');
        formElement.setAttribute('action', 'https://plot.ly/external');
        formElement.setAttribute('target', '_blank');
        
        formData.setAttribute('name', 'data');
        formData.setAttribute('id', 'data');

        formElement.appendChild(formData);
        formContainer.appendChild(formElement);
        document.body.appendChild(formContainer);
        formContainer.style.display = 'none';

        jsonString = JSON.stringify(dataObject);
        
        formData.innerHTML = jsonString;
        formElement.submit();
        document.body.removeChild(formContainer);
    }

    return {
        send: send
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
        wpd.popup.show('export-json-window');
    }

    function load() {
        wpd.popup.show('import-json-window');
    }

    function resumeFromJSON(json_data) {
       var plotData = wpd.appData.getPlotData(),
           rdata = json_data.wpd,
           calib,
           i, j, ds, currDataset;

       plotData.reset();
       wpd.appData.isAligned(false);
        
       if(rdata.axesType == null) {
           return;
       }

       if(rdata.axesType !== 'ImageAxes' 
           && (rdata.calibration == null || rdata.axesParameters == null)) {
           return;
       }

       if(rdata.axesType !== 'ImageAxes') {
           if(rdata.axesType === 'TernaryAxes') {
               calib = new wpd.Calibration(3);
           } else {
               calib = new wpd.Calibration(2);
           }
           for(i = 0; i < rdata.calibration.length; i++) {
               calib.addPoint(rdata.calibration[i].px,
                              rdata.calibration[i].py,
                              rdata.calibration[i].dx,
                              rdata.calibration[i].dy,
                              rdata.calibration[i].dz);

           }
           plotData.calibration = calib;
       }

       if(rdata.axesType === 'XYAxes') {
           plotData.axes = new wpd.XYAxes();
           if(!plotData.axes.calibrate(plotData.calibration, 
                                       rdata.axesParameters.isLogX,
                                       rdata.axesParameters.isLogY)) {
               return;
           }
       } else if (rdata.axesType === 'BarAxes') {
           plotData.axes = new wpd.BarAxes();
           if(!plotData.axes.calibrate(plotData.calibration, rdata.axesParameters.isLog)) {
               return;
           }
       } else if (rdata.axesType === 'PolarAxes') {
           plotData.axes = new wpd.PolarAxes();
           if(!plotData.axes.calibrate(plotData.calibration,
                                      rdata.axesParameters.isDegrees,
                                      rdata.axesParameters.isClockwise)) {
               return;
           }
       } else if(rdata.axesType === 'TernaryAxes') {
           plotData.axes = new wpd.TernaryAxes();
           if(!plotData.axes.calibrate(plotData.calibration,
                                      rdata.axesParameters.isRange100,
                                      rdata.axesParameters.isNormalOrientation)) {
               return;
           }
       } else if(rdata.axesType === 'MapAxes') {
           plotData.axes = new wpd.MapAxes();
           if(!plotData.axes.calibrate(plotData.calibration,
                                      rdata.axesParameters.scaleLength,
                                      rdata.axesParameters.unitString)) {
               return;
           }
       } else if(rdata.axesType === 'ImageAxes') {
           plotData.axes = new wpd.ImageAxes();
       }

       wpd.appData.isAligned(true);
       
       if(rdata.dataSeries == null) {
           return;
       }

       for(i = 0; i < rdata.dataSeries.length; i++) {
           ds = rdata.dataSeries[i];
           plotData.dataSeriesColl[i] = new wpd.DataSeries();
           currDataset = plotData.dataSeriesColl[i];
           currDataset.name = ds.name;
           if(ds.metadataKeys != null) {
               currDataset.setMetadataKeys(ds.metadataKeys);
           }
           for(j = 0; j < ds.data.length; j++) {
               currDataset.addPixel(ds.data[j].x, ds.data[j].y, ds.data[j].metadata);
           }
       }

       if(rdata.distanceMeasurementData != null) {
           plotData.distanceMeasurementData = new wpd.ConnectedPoints(2);
           for(i = 0; i < rdata.distanceMeasurementData.length; i++) {
               plotData.distanceMeasurementData.addConnection(rdata.distanceMeasurementData[i]);
           }
       }

       if(rdata.angleMeasurementData != null) {
           plotData.angleMeasurementData = new wpd.ConnectedPoints(3);
           for(i = 0; i < rdata.angleMeasurementData.length; i++) {
               plotData.angleMeasurementData.addConnection(rdata.angleMeasurementData[i]);
           }
       }


    }

    function generateJSON() {
        var plotData = wpd.appData.getPlotData(),
            calibration = plotData.calibration,
            outData = {
                    wpd: {
                        version: [3, 8], // [major, minor, subminor,...]
                        axesType: null,
                        axesParameters: null,
                        calibration: null,
                        dataSeries: [],
                        distanceMeasurementData: null,
                        angleMeasurementData: null
                    }
                },
            json_string = '',
            i,j,
            ds,
            pixel,
            mkeys;
        
        if(calibration != null) {
            outData.wpd.calibration = [];
            for(i = 0; i < calibration.getCount(); i++) {
                outData.wpd.calibration[i] = calibration.getPoint(i);
            }
        }

        if(plotData.axes != null) {
            if(plotData.axes instanceof wpd.XYAxes) {
                outData.wpd.axesType = 'XYAxes';
                outData.wpd.axesParameters = {
                    isLogX: plotData.axes.isLogX(),
                    isLogY: plotData.axes.isLogY()
                };
            } else if(plotData.axes instanceof wpd.BarAxes) {
                outData.wpd.axesType = 'BarAxes';
                outData.wpd.axesParameters = {
                    isLog: plotData.axes.isLog()
                };
            } else if(plotData.axes instanceof wpd.PolarAxes) {
                outData.wpd.axesType = 'PolarAxes';
                outData.wpd.axesParameters = {
                    isDegrees: plotData.axes.isThetaDegrees(),
                    isClockwise: plotData.axes.isThetaClockwise()
                };
            } else if(plotData.axes instanceof wpd.TernaryAxes) {
                outData.wpd.axesType = 'TernaryAxes';
                outData.wpd.axesParameters = {
                    isRange100: plotData.axes.isRange100(),
                    isNormalOrientation: plotData.axes.isNormalOrientation()
                };
            } else if(plotData.axes instanceof wpd.MapAxes) {
                outData.wpd.axesType = 'MapAxes';
                outData.wpd.axesParameters = {
                    scaleLength: plotData.axes.getScaleLength(),
                    unitString: plotData.axes.getUnits() 
                };
            } else if(plotData.axes instanceof wpd.ImageAxes) {
                outData.wpd.axesType = 'ImageAxes';
            }
        }

        for(i = 0; i < plotData.dataSeriesColl.length; i++) {
            ds = plotData.dataSeriesColl[i];
            outData.wpd.dataSeries[i] = {
                name: ds.name,
                data: []
            };
            mkeys = ds.getMetadataKeys();
            if(mkeys != null) {
                outData.wpd.dataSeries[i].metadataKeys = mkeys;
            }
            for(j = 0; j < ds.getCount(); j++) {
                pixel = ds.getPixel(j);
                outData.wpd.dataSeries[i].data[j] = pixel;
                outData.wpd.dataSeries[i].data[j].value = plotData.axes.pixelToData(pixel.x, pixel.y);
            }
        }

        if (plotData.distanceMeasurementData != null) {
            outData.wpd.distanceMeasurementData = [];
            for(i = 0; i < plotData.distanceMeasurementData.connectionCount(); i++) {
                outData.wpd.distanceMeasurementData[i] = plotData.distanceMeasurementData.getConnectionAt(i);
            }
        }
        if(plotData.angleMeasurementData != null) {
            outData.wpd.angleMeasurementData = [];
            for(i = 0; i < plotData.angleMeasurementData.connectionCount(); i++) {
                outData.wpd.angleMeasurementData[i] = plotData.angleMeasurementData.getConnectionAt(i);
            }
        }

        json_string = JSON.stringify(outData);
        return json_string;
    }

    function download() {
        wpd.download.json(generateJSON()); 
        wpd.popup.close('export-json-window');
    }

    function read() {
        var $fileInput = document.getElementById('import-json-file');
        wpd.popup.close('import-json-window');
        if($fileInput.files.length === 1) {
            var fileReader = new FileReader();
            fileReader.onload = function () {
                var json_data = JSON.parse(fileReader.result);
                resumeFromJSON(json_data); 
                
                wpd.graphicsWidget.resetData();
                wpd.graphicsWidget.removeTool();
                wpd.graphicsWidget.removeRepainter();
                if(wpd.appData.isAligned()) {
                    wpd.acquireData.load();
                }
                wpd.messagePopup.show("Import JSON","JSON data has been loaded!");
            };
            fileReader.readAsText($fileInput.files[0]);
        }
    }

    return {
        save: save,
        load: load,
        download: download,
        read: read
    };
})();
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
                if(typeof wpdscript !== "undefined") {
                    delete wpdscript;
                }
                eval(fileReader.result);
                if(typeof wpdscript !== "wpdscript") {
                    window["wpdscript"] = wpdscript;
                    wpdscript.run();
                }
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

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
