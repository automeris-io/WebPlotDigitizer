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
            plotData.deserialize(data);

            // Second, serialize then deserialize the same data. This helps testing if we're serializing the same information we're deserializing.
            let plotData2 = new wpd.PlotData();
            plotData2.deserialize(plotData.serialize());
            resolve({
                plotData: plotData,
                plotData2: plotData2
            });
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