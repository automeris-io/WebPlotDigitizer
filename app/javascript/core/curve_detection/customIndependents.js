/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

    This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.
*/

var wpd = wpd || {};

// Simple curve extraction with interpolation, but at user provided independents (x, theta etc.)
wpd.CustomIndependents = class {
    constructor() {
        this._xvals = [];
        this._ymin = 0;
        this._ymax = 0;
        this._smoothing = 0;
        this._wasRun = false;
    }

    deserialize(obj) {
        this._xvals = obj.xvals;
        this._ymin = obj.ymin;
        this._ymax = obj.ymax;
        this._smoothing = obj.smoothing;
        this._wasRun = true;
    }

    getParam(index) {
        switch (index) {
            case 0:
                return this._xvals;
            case 1:
                return this._ymin;
            case 2:
                return this._ymax;
            case 3:
                return this._smoothing;
            default:
                return null;
        }
    }

    setParam(index, val) {
        if (index === 0) {
            this._xvals = val;
        } else if (index === 1) {
            this._ymin = val;
        } else if (index === 2) {
            this._ymax = val;
        } else if (index === 3) {
            this._smoothing = val;
        }
    }

    serialize() {
        return this._wasRun ? {
            algoType: "CustomIndependents",
            xvals: this._xvals,
            ymin: this._ymin,
            ymax: this._ymax,
            smoothing: this._smoothing
        } : null;
    }

    run(autoDetector, dataSeries, axes) {
        this._wasRun = true;
        dataSeries.clearAll();
        let isLogX = axes.isLogX();
        let isLogY = axes.isLogY();

        // TODO: Finish implementation
    }
};