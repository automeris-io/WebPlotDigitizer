/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

wpd.plotDataProvider = (function() {

    function getDatasetNames() {
        var plotData = wpd.appData.getPlotData(),
            datasetNames = [],
            di;
        for(di = 0; di < plotData.dataSeriesColl.length; di++) {
            datasetNames[di] = plotData.dataSeriesColl[di].name;
        }
        return datasetNames;
    }

    function getDatasetIndex() {
        return wpd.appData.getPlotData().getActiveDataSeriesIndex();
    }

    function setDatasetIndex(index) {
        wpd.appData.getPlotData().setActiveDataSeriesIndex(index);
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount();
    }

    function getData() {
        var plotData = wpd.appData.getPlotData(),
            dataSeries = plotData.getActiveDataSeries(),
            axes = plotData.axes,
            fields = [],
            fieldDateFormat = [],
            rawData = [],
            isFieldSortable = [],
            rowi,
            coli,
            pt,
            ptData,
            metadi,
            hasMetadata = dataSeries.hasMetadata(),
            metaKeys = dataSeries.getMetadataKeys(),
            metaKeyCount = hasMetadata === true ? metaKeys.length : 0,
            ptmetadata;
        
        for(rowi = 0; rowi < dataSeries.getCount(); rowi++) {

            pt = dataSeries.getPixel(rowi);
            ptData = axes.pixelToData(pt.x, pt.y);
            rawData[rowi] = [];
            
            // transformed coordinates
            for (coli = 0; coli < ptData.length; coli++) {
                rawData[rowi][coli] = ptData[coli];
            }

            // metadata
            for (metadi = 0; metadi < metaKeyCount; metadi++) {
                if (pt.metadata == null || pt.metadata[metadi] == null) {
                    ptmetadata = 0;
                } else {
                    ptmetadata = pt.metadata[metadi];
                }
                rawData[rowi][ptData.length + metadi] = ptmetadata;
            }
        }

        fields = axes.getAxesLabels();
        if(hasMetadata) {
            fields = fields.concat(metaKeys);
        }

        return {
            fields: fields,
            fieldDateFormat: [null, null],
            rawData: rawData,
            allowConnectivity: true,
            connectivityFieldIndices: [0, 1],
            isFieldSortable: [true, true, true, true]
        };
    };

    return {
        getDatasetNames: getDatasetNames,
        getDatasetIndex: getDatasetIndex,
        setDatasetIndex: setDatasetIndex,
        getData: getData
    };
})();

wpd.connectedPointsDataProvider = (function() {

})();
