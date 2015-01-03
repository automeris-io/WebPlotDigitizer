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

wpd.dataSeriesManagement = (function () {

    var nameIndex = 1;
    
    function updateSeriesList() {
    }

    function manage() {
        if(!wpd.appData.isAligned()) {
            wpd.messagePopup.show("Manage Datasets", "Please calibrate the axes before managing datasets.");
        } else {
            var $nameField = document.getElementById('manage-data-series-name'),
                $pointCount = document.getElementById('manage-data-series-point-count'),
                $datasetList = document.getElementById('manage-data-series-list'),
                plotData = wpd.appData.getPlotData(),
                activeDataSeries = plotData.getActiveDataSeries(),
                seriesList = plotData.getDataSeriesNames(),
                activeSeriesIndex = plotData.getActiveDataSeriesIndex(),
                listHtml = '',
                i;

            $nameField.value = activeDataSeries.name;
            $pointCount.innerHTML = activeDataSeries.getCount();
            for(i = 0; i < seriesList.length; i++) {
                listHtml += '<option value="'+ i + '">' + seriesList[i] + '</option>';
            }
            $datasetList.innerHTML = listHtml;
            $datasetList.selectedIndex = activeSeriesIndex;

            // TODO: disable delete button if only one series is present
            wpd.popup.show('manage-data-series-window');
        }
    }

    function addSeries() {
        var plotData = wpd.appData.getPlotData(),
            seriesName = 'Dataset ' + nameIndex,
            index = plotData.dataSeriesColl.length;
        
        close();
        plotData.dataSeriesColl[index] = new wpd.DataSeries();
        plotData.dataSeriesColl[index].name = seriesName;
        plotData.setActiveDataSeriesIndex(index);
        updateApp();
        nameIndex++;
        manage();
    }

    function deleteSeries() {
        // if this is the only dataset, then disallow delete!
        close();

        if(wpd.appData.getPlotData().dataSeriesColl.length === 1) {
            wpd.messagePopup.show("Can Not Delete!", "You can not delete this dataset as at least one dataset is required.", manage);
            return;
        }

        wpd.okCancelPopup.show("Delete Dataset", "Are you sure that you want to delete the dataset and all containing data points?", function() {
            // delete the dataset
            var plotData = wpd.appData.getPlotData(),
                index = plotData.getActiveDataSeriesIndex();
            plotData.dataSeriesColl.splice(index,1);
            plotData.setActiveDataSeriesIndex(0);
            manage();
        }, function() {
            // 'cancel'
            manage();
        });
    }

    function viewData() {
        close();
        wpd.dataTable.showTable();
    }

    function changeSelectedSeries() {
        var $list = document.getElementById('manage-data-series-list'),
            plotData = wpd.appData.getPlotData();

        close();
        plotData.setActiveDataSeriesIndex($list.selectedIndex);
        updateApp();
        manage();
    }

    function updateApp() {
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.autoExtraction.updateDatasetControl();
        wpd.acquireData.updateDatasetControl();
        wpd.dataPointCounter.setCount();
    }

    function editSeriesName() {
        var activeSeries = wpd.appData.getPlotData().getActiveDataSeries(),
            $name = document.getElementById('manage-data-series-name');
        close();
        activeSeries.name = $name.value;
        updateApp(); // overkill, but not too bad.
        manage();
    }

    function close() {
        wpd.popup.close('manage-data-series-window');
    }

    return {
        manage: manage,
        addSeries: addSeries,
        deleteSeries: deleteSeries,
        viewData: viewData,
        changeSelectedSeries: changeSelectedSeries,
        editSeriesName: editSeriesName
    };
})();
