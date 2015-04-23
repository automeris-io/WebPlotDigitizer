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
