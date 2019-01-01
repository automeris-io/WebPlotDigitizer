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

wpd.imageOps = (function() {
    function hflipOp(idata, iwidth, iheight) {
        var rowi, coli, index, mindex, tval, p;
        for (rowi = 0; rowi < iheight; rowi++) {
            for (coli = 0; coli < iwidth / 2; coli++) {
                index = 4 * (rowi * iwidth + coli);
                mindex = 4 * ((rowi + 1) * iwidth - (coli + 1));
                for (p = 0; p < 4; p++) {
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
        for (rowi = 0; rowi < iheight / 2; rowi++) {
            for (coli = 0; coli < iwidth; coli++) {
                index = 4 * (rowi * iwidth + coli);
                mindex = 4 * ((iheight - (rowi + 2)) * iwidth + coli);
                for (p = 0; p < 4; p++) {
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