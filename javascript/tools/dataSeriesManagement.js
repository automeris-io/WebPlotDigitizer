/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
    
    function updateSeriesList() {
    }

    function manage() {
        if(!wpd.appData.isAligned()) {
            wpd.messagePopup.show("Manage Dataset", "Please calibrate the axes before managing datasets.");
        } else {
            wpd.popup.show('manage-data-series-window');
        }
    }

    function addSeries() {
    }

    function deleteSeries() {
        wpd.popup.close('manage-data-series-window');
        wpd.okCancelPopup.show("Delete Dataset", "Are you sure that you want to delete the dataset and all containing data points?", function() {
            // delete the dataset
            manage();
        }, function() {
            // 'cancel' was hit
            manage();
        });
    }

    function viewData() {
    }

    function changeSelectedSeries() {
    }

    function editSeriesName() {
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
