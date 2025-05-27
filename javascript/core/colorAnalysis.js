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

wpd.ColorGroup = (function() {
    var CGroup = function(tolerance) {
        var totalPixelCount = 0,
            averageColor = {
                r: 0,
                g: 0,
                b: 0
            };

        tolerance = tolerance == null ? 100 : tolerance;

        this.getPixelCount = function() {
            return totalPixelCount;
        };

        this.getAverageColor = function() {
            return averageColor;
        };

        this.isColorInGroup = function(r, g, b) {
            if (totalPixelCount === 0) {
                return true;
            }

            var dist = (averageColor.r - r) * (averageColor.r - r) +
                (averageColor.g - g) * (averageColor.g - g) +
                (averageColor.b - b) * (averageColor.b - b);

            return (dist <= tolerance * tolerance);
        };

        this.addPixel = function(r, g, b) {
            averageColor.r = (averageColor.r * totalPixelCount + r) / (totalPixelCount + 1.0);
            averageColor.g = (averageColor.g * totalPixelCount + g) / (totalPixelCount + 1.0);
            averageColor.b = (averageColor.b * totalPixelCount + b) / (totalPixelCount + 1.0);
            totalPixelCount = totalPixelCount + 1;
        };
    };
    return CGroup;
})();

wpd.colorAnalyzer = (function() {
    function getTopColors(imageData) {

        var colorGroupColl = [], // collection of color groups
            pixi, r, g, b, a, groupi, groupMatched, rtnVal = [],
            avColor, tolerance = 120;

        colorGroupColl[0] = new wpd.ColorGroup(tolerance); // initial group

        for (pixi = 0; pixi < imageData.data.length; pixi += 4) {
            r = imageData.data[pixi];
            g = imageData.data[pixi + 1];
            b = imageData.data[pixi + 2];
            a = imageData.data[pixi + 3];
            if (a === 0) {
                r = 255;
                g = 255;
                b = 255;
            }

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
            if (a.getPixelCount() > b.getPixelCount()) {
                return -1;
            } else if (a.getPixelCount() < b.getPixelCount()) {
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
                percentage: 100.0 * colorGroupColl[groupi].getPixelCount() / (0.25 * imageData.data.length)
            };
        }

        return rtnVal;
    }

    return {
        getTopColors: getTopColors
    };
})();
