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

wpd.dataExport = (function() {
    function show() {
        // open dialog box explaining data format
    }

    function getValueAtPixel(ptIndex, axes, pixel) {
        var val = axes.pixelToData(pixel.x, pixel.y);
        if (axes instanceof wpd.XYAxes) {
            for (var i = 0; i <= 1; i++) {
                if (axes.isDate(i)) {
                    var dformat = axes.getInitialDateFormat(i);
                    val[i] = wpd.dateConverter.formatDateNumber(val[i], dformat);
                }
            }
        } else if (axes instanceof wpd.CircularChartRecorderAxes) {
            val[0] = wpd.dateConverter.formatDateNumber(val[0], axes.getTimeFormat());
        } else if (axes instanceof wpd.BarAxes) {
            val = ['', val[0]];
            if (pixel.metadata == null) {
                val[0] = "Bar" + ptIndex;
            } else {
                val[0] = pixel.metadata[0];
            }
        }
        return val;
    }

    function generateCSV() {
        wpd.popup.close('export-all-data-popup');
        // generate file and trigger download

        // loop over all datasets
        let plotData = wpd.appData.getPlotData();
        let dsColl = plotData.getDatasets();

        if (dsColl == null || dsColl.length === 0) {
            // axes is not aligned, show an error message?
            wpd.messagePopup.show(wpd.gettext('no-datasets-to-export-error'),
                wpd.gettext('no-datasets-to-export'));
            return;
        }

        let maxDatapts = 0;
        let header = [];
        let varheader = [];
        let valData = [];
        let numCols = 0;

        for (let i = 0; i < dsColl.length; i++) {
            let axes = plotData.getAxesForDataset(dsColl[i]);
            if (axes == null)
                continue;
            let axLab = axes.getAxesLabels();
            let axdims = axLab.length;
            numCols += axdims;
            let pts = dsColl[i].getCount();
            if (pts > maxDatapts) {
                maxDatapts = pts;
            }
            header.push(dsColl[i].name);
            for (let j = 0; j < axdims; j++) {
                if (j !== 0) {
                    header.push('');
                }
                varheader.push(axLab[j]);
            }
        }
        for (let i = 0; i < maxDatapts; i++) {
            var valRow = [];
            for (let j = 0; j < numCols; j++) {
                valRow.push('');
            }
            valData.push(valRow);
        }

        let colIdx = 0;
        for (let i = 0; i < dsColl.length; i++) {
            let axes = plotData.getAxesForDataset(dsColl[i]);
            if (axes == null)
                continue;
            let axLab = axes.getAxesLabels();
            let axdims = axLab.length;
            let pts = dsColl[i].getCount();
            for (let j = 0; j < pts; j++) {
                let px = dsColl[i].getPixel(j);
                let val = getValueAtPixel(j, axes, px);
                for (let di = 0; di < axdims; di++) {
                    valData[j][colIdx + di] = val[di];
                }
            }
            colIdx += axdims;
        }

        let csvText = header.join(',') + '\n' + varheader.join(',') + '\n';
        for (let i = 0; i < maxDatapts; i++) {
            csvText += valData[i].join(',') + '\n';
        }

        // download
        wpd.download.csv(csvText, "wpd_datasets.csv");
    }

    function exportToPlotly() {
        wpd.popup.close('export-all-data-popup');

        // loop over all datasets
        var plotData = wpd.appData.getPlotData(),
            dsColl = plotData.getDatasets(),
            i, coli, rowi,
            dataProvider = wpd.plotDataProvider,
            pdata, plotlyData = {
                "data": []
            },
            colName;

        if (dsColl == null || dsColl.length === 0) {
            // axes is not aligned, show an error message?
            wpd.messagePopup.show(wpd.gettext('no-datasets-to-export-error'),
                wpd.gettext('no-datasets-to-export'));
            return;
        }

        for (i = 0; i < dsColl.length; i++) {
            dataProvider.setDataSource(dsColl[i]);
            pdata = dataProvider.getData();
            plotlyData.data[i] = {};

            // loop over columns
            for (coli = 0; coli < 2; coli++) {
                colName = (coli === 0) ? 'x' : 'y';
                plotlyData.data[i][colName] = [];
                for (rowi = 0; rowi < pdata.rawData.length; rowi++) {
                    if (pdata.fieldDateFormat[coli] != null) {
                        plotlyData.data[i][colName][rowi] = wpd.dateConverter.formatDateNumber(
                            pdata.rawData[rowi][coli], "yyyy-mm-dd hh:ii:ss");
                    } else {
                        plotlyData.data[i][colName][rowi] = pdata.rawData[rowi][coli];
                    }
                }
            }
        }

        wpd.plotly.send(plotlyData);
    }

    return {
        show: show,
        generateCSV: generateCSV,
        exportToPlotly: exportToPlotly
    };
})();
