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

var wpdtest = {};

wpdtest.fetchBlob = function(filename) {
    return new Promise((resolve, reject) => {
        fetch(filename).then(resp => resp.blob()).then((blob) => {
            resolve(blob);
        });
    });
};

wpdtest.fetchJSON = function(filename) {
    return new Promise((resolve, reject) => {
        fetch(filename).then(resp => resp.json()).then(data => {
            resolve(data);
        });
    });
};

wpdtest.loadPlotData = function(filename) {
    return new Promise((resolve, reject) => {
        fetch(filename).then(resp => resp.json()).then(data => {
            // First, just deserialize JSON data from the file
            let plotData = new wpd.PlotData();
            if (!plotData.deserialize(data)) {
                reject("error deserializing data!");
            }

            // Second, serialize then deserialize the same data. This helps testing if we're serializing the same information we're deserializing.
            let plotData2 = new wpd.PlotData();
            if (plotData2.deserialize(plotData.serialize())) {
                resolve({
                    plotData: plotData,
                    plotData2: plotData2
                });
            } else {
                reject("error deserializing data!");
            }
        });
    });
};

wpdtest.matCompare = function(mat1, mat2, eps) {
    if (mat1 == null || mat2 == null) {
        return false;
    }
    if (mat1.length != mat2.length) {
        return false;
    }
    let rows = mat1.length;
    let cols = mat2.length;
    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {

        if (mat1[rowIdx].length != mat2[rowIdx].length) {
            return false;
        }

        for (let colIdx = 0; colIdx < cols; colIdx++) {
            if (Math.abs(mat1[rowIdx][colIdx] - mat2[rowIdx][colIdx]) > eps) {
                return false;
            }
        }
    }
    return true;
};

wpdtest.vecCompare = function(vec1, vec2, eps) {
    if (vec1 == null || vec2 == null) {
        return false;
    }
    if (vec1.length != vec2.length) {
        return false;
    }
    for (let vIdx = 0; vIdx < vec1.length; vIdx++) {
        if (Math.abs(vec1[vIdx] - vec2[vIdx]) > eps) {
            return false;
        }
    }
    return true;
};
