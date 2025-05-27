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

QUnit.module(
    "Data providers tests", {
        afterEach: () => {
            // restore mocks and fakes
            sinon.restore();
        }
    }
);

QUnit.test("Plot data providers", (assert) => {
    // bar axes data tests
    // create bar axes and add to plotdata
    const barAxes = new wpd.BarAxes();
    // set fake calibration
    const calibration = {
        getPoint: (index) => {
            const points = [{
                    px: 0,
                    py: 0,
                    dy: 0
                },
                {
                    px: 10,
                    py: 10,
                    dy: 10
                }
            ];
            return points[index];
        }
    };
    barAxes.calibrate(calibration, false, false);
    const plotData = wpd.appData.getPlotData();
    plotData.addAxes(barAxes, false);

    // create dataset and add to plotdata
    const dataset = new wpd.Dataset();
    plotData.addDataset(dataset);
    plotData.setAxesForDataset(dataset, barAxes);

    // set dataset as data source
    wpd.plotDataProvider.setDataSource(dataset);

    // No other metadata case
    dataset.setMetadataKeys(["label"]);
    dataset.addPixel(0, 0, {
        label: "Bar0"
    });
    let expected = {
        fields: ["Label", "Value"],
        fieldDateFormat: [],
        rawData: [
            ["Bar0", 0]
        ],
        allowConnectivity: false,
        connectivityFieldIndices: [],
        isFieldSortable: [false, true]
    };
    assert.deepEqual(wpd.plotDataProvider.getData(), expected, "Bar axes: No point groups or other metadata");
    dataset.clearAll();

    // Point groups case
    dataset.setMetadataKeys([]);
    dataset.setPointGroups(["Obi-wan", "General grievous"]);
    dataset.addPixel(0, 0);
    dataset.addPixel(0, 1);
    dataset.addPixel(1, 0);
    dataset.addPixel(1, 1);
    dataset.addTuple(0);
    dataset.addToTupleAt(0, 1, 1);
    dataset.addTuple(2);
    dataset.addToTupleAt(1, 1, 3);
    expected = {
        fields: ["Label", "Value", "Tuple", "Group"],
        fieldDateFormat: [],
        rawData: [
            ["Bar0", 0, 0, "Obi-wan"],
            ["Bar0", 1, 0, "General grievous"],
            ["Bar1", 0, 1, "Obi-wan"],
            ["Bar1", 1, 1, "General grievous"]
        ],
        allowConnectivity: false,
        connectivityFieldIndices: [],
        isFieldSortable: [false, true, true, true]
    };
    assert.deepEqual(wpd.plotDataProvider.getData(), expected, "Bar axes: Point groups");
    dataset.clearAll();

    // Other metadata case
    dataset.setMetadataKeys(["label", "obi-wan", "general grievous"]);
    dataset.addPixel(0, 0, {
        label: "Bar0"
    });
    dataset.addPixel(0, 0, {
        label: "Bar1",
        "obi-wan": "hello there",
        "general grievous": "general kenobi, you are a bold one!"
    });
    expected = {
        fields: ["Label", "Value", "Obi-wan", "General grievous"],
        fieldDateFormat: [],
        rawData: [
            ["Bar0", 0, null, null],
            ["Bar1", 0, "hello there", "general kenobi, you are a bold one!"]
        ],
        allowConnectivity: false,
        connectivityFieldIndices: [],
        isFieldSortable: [false, true, true, true]
    };
    assert.deepEqual(wpd.plotDataProvider.getData(), expected, "Bar axes: Other metadata");
    dataset.clearAll();

    // Overrides case
    dataset.setMetadataKeys(["label", "overrides"]);
    dataset.addPixel(0, 0, {
        label: "Bar0"
    });
    dataset.addPixel(0, 0, {
        label: "Bar1",
        overrides: {
            y: 1
        }
    });
    expected = {
        fields: ["Label", "Value", "Value-Override"],
        fieldDateFormat: [],
        rawData: [
            ["Bar0", 0, null],
            ["Bar1", 0, 1]
        ],
        allowConnectivity: false,
        connectivityFieldIndices: [],
        isFieldSortable: [false, true, true]
    };
    assert.deepEqual(wpd.plotDataProvider.getData(), expected, "Bar axes: Overrides");
    dataset.clearAll();

    // Other metadata and overrides case
    dataset.setMetadataKeys(["label", "obi-wan", "general grievous", "overrides"]);
    dataset.addPixel(0, 0, {
        label: "Bar0"
    });
    dataset.addPixel(0, 0, {
        label: "Bar1",
        "obi-wan": "hello there",
        "general grievous": "general kenobi, you are a bold one!",
        overrides: {
            y: 1
        }
    });
    expected = {
        fields: ["Label", "Value", "Obi-wan", "General grievous", "Value-Override"],
        fieldDateFormat: [],
        rawData: [
            ["Bar0", 0, null, null, null],
            ["Bar1", 0, "hello there", "general kenobi, you are a bold one!", 1]
        ],
        allowConnectivity: false,
        connectivityFieldIndices: [],
        isFieldSortable: [false, true, true, true, true]
    };
    assert.deepEqual(wpd.plotDataProvider.getData(), expected, "Bar axes: Other metadata and overrides");
    dataset.clearAll();

    // clean up
    plotData.deleteAxes(barAxes);
    plotData.deleteDataset(dataset);
});
