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
        return [['ΔX', 'Px', 10], ['ΔVal', 'Px', 10]];
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
            barValueColl = [],
            px, py,
            width = autoDetector.imageWidth,
            height = autoDetector.imageHeight,
            pixelAdded,
            barValuei,
            bv,
            dataVal,
            pxVal,
            mkeys;

        dataSeries.clearAll();

        // Initial attempt: assume vertical and linear scale:
        for (px = 0; px < width; px++) {
            for(py = 0; py < height; py++) {
                if(autoDetector.binaryData[py*width + px]) {

                    pixelAdded = false;
                    barValuei = 0;
                    dataVal = [px, py];
                    
                    for(barValuei = 0; barValuei < barValueColl.length; barValuei++) {
                        bv = barValueColl[barValuei];
                        if(bv.isPointInGroup(dataVal[0], dataVal[1], delX, delVal)) {
                            bv.append(dataVal[0], dataVal[1]);
                            pixelAdded = true;
                            break;
                        }
                    }
                    if(!pixelAdded) {
                        barValueColl.push(new wpd.BarValue())
                        barValueColl[barValueColl.length-1].append(dataVal[0], dataVal[1]);
                        pixelAdded = true;
                    }
                    break;
                }
            }
        }

        mkeys = dataSeries.getMetadataKeys();
        if(mkeys == null || mkeys[0] !== 'Label') {
            dataSeries.setMetadataKeys(['Label']);
        }

        for(barValuei = 0; barValuei < barValueColl.length; barValuei++) {
            bv = barValueColl[barValuei];
            dataSeries.addPixel(bv.avgX, bv.avgVal, ["Bar" + barValuei]);
        }
    };
};
