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

wpd.dataTable = (function() {
    var dataProvider, dataCache, sortedData, tableText, selectedDataset, selectedMeasurement;

    var decSeparator = 1.1.toLocaleString().replace(/\d/g, '');

    function showPlotData() {
        dataProvider = wpd.plotDataProvider;
        selectedDataset = wpd.tree.getActiveDataset();
        selectedMeasurement = null;
        dataProvider.setDataSource(selectedDataset);
        show();
    }

    function showAngleData() {
        dataProvider = wpd.measurementDataProvider;
        selectedMeasurement = wpd.measurementModes.angle.getData();
        selectedDataset = null;
        dataProvider.setDataSource(selectedMeasurement);
        show();
    }

    function showDistanceData() {
        dataProvider = wpd.measurementDataProvider;
        selectedMeasurement = wpd.measurementModes.distance.getData();
        selectedDataset = null;
        dataProvider.setDataSource(selectedMeasurement);
        show();
    }

    function showAreaData() {
        dataProvider = wpd.measurementDataProvider;
        selectedMeasurement = wpd.measurementModes.area.getData();
        selectedDataset = null;
        dataProvider.setDataSource(selectedMeasurement);
        show();
    }

    function show() {
        wpd.graphicsWidget.removeTool();
        wpd.popup.show('csvWindow');
        initializeColSeparator();
        refresh();
    }

    function initializeColSeparator() {
        // avoid colSeparator === decSeparator
        if (document.getElementById('data-number-format-separator').value.trim() === decSeparator) {
            document.getElementById('data-number-format-separator').value =
                decSeparator === "," ? "; " : ", ";
        }
    }

    function refresh() {
        dataCache = dataProvider.getData();
        setupControls();
        sortRawData();
        makeTable();
    }

    function setupControls() {

        let $datasetList = document.getElementById('data-table-dataset-list');
        let $sortingVariables = document.getElementById('data-sort-variables');
        let $variableNames = document.getElementById('dataVariables');
        let $dateFormattingContainer = document.getElementById('data-date-formatting-container');
        let $dateFormatting = document.getElementById('data-date-formatting');
        let datasetHTML = '';
        let sortingHTML = '';
        let dateFormattingHTML = '';
        let isAnyVariableDate = false;
        let showDatasets = selectedDataset != null;
        let showMeasurements = selectedMeasurement != null;

        // gather names
        if (showDatasets) {
            let datasetNames = wpd.appData.getPlotData().getDatasetNames();
            datasetNames.forEach((name) => {
                datasetHTML += "<option value=\"" + name + "\">" + name + "</option>";
            });
            $datasetList.innerHTML = datasetHTML;
            $datasetList.value = selectedDataset.name;
        } else if (showMeasurements) {
            if (wpd.appData.getPlotData().getMeasurementsByType(wpd.AreaMeasurement).length > 0) {
                datasetHTML +=
                    "<option value=\"area\">" + wpd.gettext("area-measurements") + "</option>";
            }
            if (wpd.appData.getPlotData().getMeasurementsByType(wpd.AngleMeasurement).length > 0) {
                datasetHTML +=
                    "<option value=\"angle\">" + wpd.gettext("angle-measurements") + "</option>";
            }
            if (wpd.appData.getPlotData().getMeasurementsByType(wpd.DistanceMeasurement).length >
                0) {
                datasetHTML += "<option value=\"distance\">" +
                    wpd.gettext("distance-measurements") + "</option>";
            }
            $datasetList.innerHTML = datasetHTML;
            if (selectedMeasurement instanceof wpd.AngleMeasurement) {
                $datasetList.value = "angle";
            } else if (selectedMeasurement instanceof wpd.DistanceMeasurement) {
                $datasetList.value = "distance";
            } else if (selectedMeasurement instanceof wpd.AreaMeasurement) {
                $datasetList.value = "area";
            }
        }

        // Variable Names
        $variableNames.innerHTML = dataCache.fields.join(', ');

        $dateFormattingContainer.style.display = 'none';
        sortingHTML += '<option value="raw">' + wpd.gettext('raw') + '</option>';
        for (let i = 0; i < dataCache.fields.length; i++) {

            // Sorting
            if (dataCache.isFieldSortable[i]) {
                sortingHTML += '<option value="' + dataCache.fields[i] + '">' +
                    dataCache.fields[i] + '</option>';
            }

            // Date formatting
            if (dataCache.fieldDateFormat[i] != null) {
                dateFormattingHTML +=
                    '<p>' + dataCache.fields[i] + ' <input type="text" length="15" value="' +
                    dataCache.fieldDateFormat[i] + '" id="data-format-string-' + i + '"/></p>';
                isAnyVariableDate = true;
            }
        }
        if (dataCache.allowConnectivity) {
            sortingHTML +=
                '<option value="NearestNeighbor">' + wpd.gettext('nearest-neighbor') + '</option>';
        }
        $sortingVariables.innerHTML = sortingHTML;
        updateSortingControls();

        if (isAnyVariableDate) {
            $dateFormattingContainer.style.display = 'inline-block';
            $dateFormatting.innerHTML = dateFormattingHTML;
        } else {
            $dateFormattingContainer.style.display = 'hidden';
        }
    }

    function changeDataset() {
        var $datasetList = document.getElementById('data-table-dataset-list');
        if (selectedDataset != null) {
            selectedDataset = wpd.appData.getPlotData().getDatasets()[$datasetList.selectedIndex];
            dataProvider.setDataSource(selectedDataset);
        } else if (selectedMeasurement != null) {
            if ($datasetList.value === "angle") {
                selectedMeasurement =
                    wpd.appData.getPlotData().getMeasurementsByType(wpd.AngleMeasurement)[0];
            } else if ($datasetList.value === "distance") {
                selectedMeasurement =
                    wpd.appData.getPlotData().getMeasurementsByType(wpd.DistanceMeasurement)[0];
            } else if ($datasetList.value === "area") {
                selectedMeasurement =
                    wpd.appData.getPlotData().getMeasurementsByType(wpd.AreaMeasurement)[0];
            }
            dataProvider.setDataSource(selectedMeasurement);
        }
        refresh();
    }

    function updateSortingControls() {
        var sortingKey = document.getElementById('data-sort-variables').value,
            $sortingOrder = document.getElementById('data-sort-order'),
            isConnectivity = sortingKey === 'NearestNeighbor',
            isRaw = sortingKey === 'raw';

        if (isConnectivity || isRaw) {
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

        if (dataCache == null || dataCache.rawData == null) {
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

        if (isRaw) {
            return;
        }

        if (!isConnectivity) {
            dataIndex = dataCache.fields.indexOf(sortingKey);
            if (dataIndex < 0) {
                return;
            }
            sortedData.sort(function(a, b) {
                if (a[dataIndex] > b[dataIndex]) {
                    return isAscending ? 1 : -1;
                } else if (a[dataIndex] < b[dataIndex]) {
                    return isAscending ? -1 : 1;
                }
                return 0;
            });
            return;
        }

        if (isConnectivity) {
            var mindist, compdist, minindex, rowi, rowcompi,
                rowCount = sortedData.length,
                connFieldIndices = dataCache.connectivityFieldIndices,
                fi, cfi, swp;

            for (rowi = 0; rowi < rowCount - 1; rowi++) {
                minindex = -1;

                // loop through all other points and find the nearest next neighbor
                for (rowcompi = rowi + 1; rowcompi < rowCount; rowcompi++) {
                    compdist = 0;
                    for (fi = 0; fi < connFieldIndices.length; fi++) {
                        cfi = connFieldIndices[fi];
                        compdist += (sortedData[rowi][cfi] - sortedData[rowcompi][cfi]) *
                            (sortedData[rowi][cfi] - sortedData[rowcompi][cfi]);
                    }

                    if ((compdist < mindist) || (minindex === -1)) {
                        mindist = compdist;
                        minindex = rowcompi;
                    }
                }

                // swap (minindex) and (rowi+1) rows
                for (fi = 0; fi < dataCache.fields.length; fi++) {
                    swp = sortedData[minindex][fi];
                    sortedData[minindex][fi] = sortedData[rowi + 1][fi];
                    sortedData[rowi + 1][fi] = swp;
                }
            }
        }
    }

    function makeTable() {
        if (sortedData == null) {
            return;
        }

        var $digitizedDataTable = document.getElementById('digitizedDataTable'),
            numFormattingDigits =
            parseInt(document.getElementById('data-number-format-digits').value, 10),
            numFormattingStyle = document.getElementById('data-number-format-style').value,
            colSeparator = document.getElementById('data-number-format-separator').value,
            rowi,
            coli, rowValues, dateFormattingStrings = [];

        // "\t" in the column separator should translate to a tab:
        colSeparator = colSeparator.replace(/[^\\]\\t/, "\t").replace(/^\\t/, "\t");

        tableText = '';
        for (rowi = 0; rowi < sortedData.length; rowi++) {
            rowValues = [];
            for (coli = 0; coli < dataCache.fields.length; coli++) {
                if (dataCache.fieldDateFormat[coli] != null) { // Date
                    if (dateFormattingStrings[coli] === undefined) {
                        dateFormattingStrings[coli] =
                            document.getElementById('data-format-string-' + coli).value;
                    }
                    rowValues[coli] = wpd.dateConverter.formatDateNumber(
                        sortedData[rowi][coli], dateFormattingStrings[coli]);
                } else { // Non-date values
                    if (typeof sortedData[rowi][coli] === 'string') {
                        rowValues[coli] = sortedData[rowi][coli];
                    } else {
                        let columnValue = sortedData[rowi][coli];
                        if (columnValue == null) {
                            rowValues[coli] = null;
                        } else {
                            if (numFormattingStyle === 'fixed' && numFormattingDigits >= 0) {
                                rowValues[coli] = columnValue.toFixed(numFormattingDigits);
                            } else if (numFormattingStyle === 'precision' && numFormattingDigits >= 0) {
                                rowValues[coli] = columnValue.toPrecision(numFormattingDigits);
                            } else if (numFormattingStyle === 'exponential' &&
                                numFormattingDigits >= 0) {
                                rowValues[coli] = columnValue.toExponential(numFormattingDigits);
                            } else {
                                rowValues[coli] = columnValue;
                            }
                        }
                    }
                    if (rowValues[coli] === null) {
                        rowValues[coli] = '';
                    } else {
                        rowValues[coli] = rowValues[coli].toString().replace('.', decSeparator);
                    }
                }
            }
            tableText += rowValues.join(colSeparator);
            tableText += '\n';
        }
        $digitizedDataTable.value = tableText;
    }

    function copyToClipboard() {
        var $digitizedDataTable = document.getElementById('digitizedDataTable');
        $digitizedDataTable.focus();
        $digitizedDataTable.select();
        try {
            document.execCommand('copy');
        } catch (ex) {
            console.log('copyToClipboard', ex.message);
        }
    }

    function generateCSV() {
        var datasetName =
            selectedDataset != null ?
            selectedDataset.name :
            ((selectedMeasurement instanceof wpd.AngleMeasurement) ? "angles" : "distances");
        wpd.download.csv(tableText, datasetName + ".csv");
    }

    function exportToPlotly() {
        if (sortedData == null) {
            return;
        }
        var plotlyData = {
                "data": []
            },
            rowi, coli, fieldName;

        plotlyData.data[0] = {};

        for (rowi = 0; rowi < sortedData.length; rowi++) {
            for (coli = 0; coli < dataCache.fields.length; coli++) {

                fieldName = dataCache.fields[coli];
                // Replace first two to keep plotly happy:
                if (coli === 0) {
                    fieldName = 'x';
                } else if (coli === 1) {
                    fieldName = 'y';
                }

                if (rowi === 0) {
                    plotlyData.data[0][fieldName] = [];
                }

                if (dataCache.fieldDateFormat[coli] != null) {
                    plotlyData.data[0][fieldName][rowi] = wpd.dateConverter.formatDateNumber(
                        sortedData[rowi][coli], 'yyyy-mm-dd hh:ii:ss');
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
        showAreaData: showAreaData,
        showDistanceData: showDistanceData,
        updateSortingControls: updateSortingControls,
        reSort: reSort,
        copyToClipboard: copyToClipboard,
        generateCSV: generateCSV,
        exportToPlotly: exportToPlotly,
        changeDataset: changeDataset
    };
})();
