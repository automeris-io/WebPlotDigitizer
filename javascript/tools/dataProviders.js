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
        var axes = wpd.appData.getPlotData().axes;

        if(axes instanceof wpd.BarAxes) {
            return getBarAxesData();
        } else {
            return getGeneralAxesData();
        }
    }

    function getBarAxesData() {
        var fields = [],
            fieldDateFormat = [],
            rawData = [],
            isFieldSortable = [],
            plotData = wpd.appData.getPlotData(),
            dataSeries = plotData.getActiveDataSeries(),
            axes = plotData.axes,
            rowi, coli,
            dataPt,
            transformedDataPt,
            lab;

        for (rowi = 0; rowi < dataSeries.getCount(); rowi++) {
            
            dataPt = dataSeries.getPixel(rowi);
            transformedDataPt = axes.pixelToData(dataPt.x, dataPt.y);
            
            rawData[rowi] = [];
            
            // metaData[0] should be the label:
            if(dataPt.metadata == null) {
                lab = "Bar" + rowi;
            } else {
                lab = dataPt.metadata[0];
            }
            rawData[rowi][0] = lab;
            // transformed value
            rawData[rowi][1] = transformedDataPt[0];
            // other metadata if present can go here in the future.
        }

        fields = ['Label', 'Value'];
        isFieldSortable = [false, true];

        return {
            fields: fields,
            fieldDateFormat: fieldDateFormat,
            rawData: rawData,
            allowConnectivity: false,
            connectivityFieldIndices: [],
            isFieldSortable: isFieldSortable
        };
    }

    function getGeneralAxesData() {
        // 2D XY, Polar, Ternary, Image, Map

        var plotData = wpd.appData.getPlotData(),
            dataSeries = plotData.getActiveDataSeries(),
            axes = plotData.axes,
            fields = [],
            fieldDateFormat = [],
            connectivityFieldIndices = [],
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

        for(coli = 0; coli < fields.length; coli++) {
            if(coli < axes.getDimensions()) {
                connectivityFieldIndices[coli] = coli;
                if(axes.isDate != null && axes.isDate(coli)) {
                    fieldDateFormat[coli] = axes.getInitialDateFormat(coli);
                }
            }
            
            isFieldSortable[coli] = true; // all fields are sortable
        }

        return {
            fields: fields,
            fieldDateFormat: fieldDateFormat,
            rawData: rawData,
            allowConnectivity: true,
            connectivityFieldIndices: connectivityFieldIndices,
            isFieldSortable: isFieldSortable
        };
    }

    return {
        getDatasetNames: getDatasetNames,
        getDatasetIndex: getDatasetIndex,
        setDatasetIndex: setDatasetIndex,
        getData: getData
    };
})();

wpd.measurementDataProvider = (function() {

    var dataSource = 'distance';

    function setDataSource(source) {
        dataSource = source;
    }

    function getDatasetNames() {
        if(dataSource === 'angle') {
            return ['Angle Measurements'];
        } else if (dataSource === 'distance') {
            return ['Distance Measurements'];
        }
    }

    function getDatasetIndex() {
        return 0;
    }

    function setDatasetIndex(index) {
        // ignore
    }

    function getData() {
        var fields = [],
            fieldDateFormat = [],
            rawData = [],
            isFieldSortable = [],
            plotData = wpd.appData.getPlotData(),
            axes = plotData.axes,
            isMap = wpd.appData.isAligned() && (axes instanceof wpd.MapAxes),
            conni,
            mData;
        
        if (dataSource === 'distance') {

            mData = plotData.distanceMeasurementData;
            for(conni = 0; conni < mData.connectionCount(); conni++) {
                rawData[conni] = [];
                rawData[conni][0] = 'Dist' + conni;
                if(isMap) {
                    rawData[conni][1] = axes.pixelToDataDistance(mData.getDistance(conni));
                } else {
                    rawData[conni][1] = mData.getDistance(conni);
                }
            }
            
            fields = ['Label', 'Distance'];
            isFieldSortable = [false, true];

        } else if (dataSource === 'angle') {

            mData = plotData.angleMeasurementData;
            for(conni = 0; conni < mData.connectionCount(); conni++) {
                rawData[conni] = [];
                rawData[conni][0] = 'Theta'+ conni;
                rawData[conni][1] = mData.getAngle(conni);
            }

            fields = ['Label', 'Angle'];
            isFieldSortable = [false, true];
        }

        return {
            fields: fields,
            fieldDateFormat: fieldDateFormat,
            rawData: rawData,
            allowConnectivity: false,
            connectivityFieldIndices: [],
            isFieldSortable: isFieldSortable
        };
    }

    return {
        getDatasetNames: getDatasetNames,
        getDatasetIndex: getDatasetIndex,
        setDatasetIndex: setDatasetIndex,
        setDataSource: setDataSource,
        getData: getData
    };
})();
