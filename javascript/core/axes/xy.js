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

var wpd = wpd || {};

wpd.XYAxes = (function() {
    var AxesObj = function() {
        var calibration, isCalibrated = false,
            isLogScaleX = false,
            isLogScaleY = false,
            isLogScaleXNegative = false,
            isLogScaleYNegative = false,

            isXDate = false,
            isYDate = false,
            noRotation = false,

            metadata = {},

            initialFormattingX, initialFormattingY,

            x1, x2, x3, x4, y1, y2, y3, y4, xmin, xmax, ymin, ymax,
            a_mat = [0, 0, 0, 0],
            a_inv_mat = [0, 0, 0, 0],
            c_vec = [0, 0],

            processCalibration = function(cal, isLogX, isLogY, noRotationCorrection) {
                if (cal.getCount() < 4) {
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
                if (!ip.isValid) {
                    return false;
                }
                isXDate = ip.isDate;
                xmax = ip.parse(xmax);
                if (!ip.isValid || (ip.isDate != isXDate)) {
                    return false;
                }
                initialFormattingX = ip.formatting;

                // Validate Y-Axes:
                ymin = ip.parse(ymin);
                if (!ip.isValid) {
                    return false;
                }
                isYDate = ip.isDate;
                ymax = ip.parse(ymax);
                if (!ip.isValid || (ip.isDate != isYDate)) {
                    return false;
                }
                initialFormattingY = ip.formatting;

                isLogScaleX = isLogX;
                isLogScaleY = isLogY;
                noRotation = noRotationCorrection;

                // If x-axis is log scale
                if (isLogScaleX === true) {
                    if (xmin < 0 && xmax < 0) {
                        isLogScaleXNegative = true;
                        xmin = Math.log(-xmin) / Math.log(10);
                        xmax = Math.log(-xmax) / Math.log(10);
                    } else {
                        xmin = Math.log(xmin) / Math.log(10);
                        xmax = Math.log(xmax) / Math.log(10);
                    }
                }

                // If y-axis is log scale
                if (isLogScaleY === true) {
                    if (ymin < 0 && ymax < 0) {
                        isLogScaleYNegative = true;
                        ymin = Math.log(-ymin) / Math.log(10);
                        ymax = Math.log(-ymax) / Math.log(10);
                    } else {
                        ymin = Math.log(ymin) / Math.log(10);
                        ymax = Math.log(ymax) / Math.log(10);
                    }
                }

                dat_mat = [xmin - xmax, 0, 0, ymin - ymax];
                pix_mat = [x1 - x2, x3 - x4, y1 - y2, y3 - y4];

                a_mat = wpd.mat.mult2x2(dat_mat, wpd.mat.inv2x2(pix_mat));

                if (noRotation) {
                    // avoid rotating the axes if this is selected.
                    if (Math.abs(a_mat[0] * a_mat[3]) > Math.abs(a_mat[1] * a_mat[2])) {
                        // snap to zero deg
                        a_mat[1] = 0;
                        a_mat[2] = 0;
                        a_mat[0] = (xmax - xmin) / (x2 - x1);
                        a_mat[3] = (ymax - ymin) / (y4 - y3);
                    } else {
                        // snap to +/- 90 deg since it appears x-axis is vertical and y is horizontal
                        a_mat[0] = 0;
                        a_mat[3] = 0;
                        a_mat[1] = (xmax - xmin) / (y2 - y1);
                        a_mat[2] = (ymax - ymin) / (x4 - x3);
                    }
                }

                a_inv_mat = wpd.mat.inv2x2(a_mat);
                c_vec[0] = xmin - a_mat[0] * x1 - a_mat[1] * y1;
                c_vec[1] = ymin - a_mat[2] * x3 - a_mat[3] * y3;

                calibration = cal;
                return true;
            };

        this.getBounds = function() {
            return {
                x1: isLogScaleX ? Math.pow(10, xmin) : xmin,
                x2: isLogScaleX ? Math.pow(10, xmax) : xmax,
                y3: isLogScaleY ? Math.pow(10, ymin) : ymin,
                y4: isLogScaleY ? Math.pow(10, ymax) : ymax
            };
        };

        this.isCalibrated = function() {
            return isCalibrated;
        };

        this.calibration = null;

        this.calibrate = function(calib, isLogX, isLogY, noRotationCorrection) {
            this.calibration = calib;
            isCalibrated = processCalibration(calib, isLogX, isLogY, noRotationCorrection);
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
            if (isLogScaleX === true) {
                xf = isLogScaleXNegative ? -Math.pow(10, xf) : Math.pow(10, xf);
            }

            // if y-axis is log scale
            if (isLogScaleY === true) {
                yf = isLogScaleYNegative ? -Math.pow(10, yf) : Math.pow(10, yf);
            }

            data[0] = xf;
            data[1] = yf;

            return data;
        };

        this.dataToPixel = function(x, y) {
            var xf, yf, dat_vec, rtnPix;

            if (isLogScaleX) {
                x = isLogScaleXNegative ? Math.log(-x) / Math.log(10) : Math.log(x) / Math.log(10);
            }
            if (isLogScaleY) {
                y = isLogScaleYNegative ? Math.log(-y) / Math.log(10) : Math.log(y) / Math.log(10);
            }

            dat_vec = [x - c_vec[0], y - c_vec[1]];
            rtnPix = wpd.mat.mult2x2Vec(a_inv_mat, dat_vec);

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
            if (isXDate) {
                rtnString += wpd.dateConverter.formatDateNumber(dataVal[0], initialFormattingX);
            } else {
                rtnString += dataVal[0].toExponential(4);
            }
            rtnString += ', ';

            if (isYDate) {
                rtnString += wpd.dateConverter.formatDateNumber(dataVal[1], initialFormattingY);
            } else {
                rtnString += dataVal[1].toExponential(4);
            }
            return rtnString;
        };

        this.isDate = function(varIndex) {
            if (varIndex === 0) {
                return isXDate;
            } else {
                return isYDate;
            }
        };

        this.getInitialDateFormat = function(varIndex) {
            if (varIndex === 0) {
                return initialFormattingX;
            } else {
                return initialFormattingY;
            }
        };

        this.isLogX = function() {
            return isLogScaleX;
        };

        this.isLogXNegative = function() {
            return isLogScaleXNegative;
        }

        this.isLogY = function() {
            return isLogScaleY;
        };

        this.isLogYNegative = function() {
            return isLogScaleYNegative;
        }

        this.noRotation = function() {
            return noRotation;
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

        this.getMetadata = function() {
            // deep clone
            return JSON.parse(JSON.stringify(metadata));
        };

        this.setMetadata = function(obj) {
            // deep clone
            metadata = JSON.parse(JSON.stringify(obj));
        };

        this.name = "XY";
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
