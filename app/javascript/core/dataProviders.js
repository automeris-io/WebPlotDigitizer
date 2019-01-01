/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

    This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.
*/

var wpd = wpd || {};

wpd.plotDataProvider = (function() {
    let _ds = null;

    function setDataSource(ds) {
        _ds = ds;
    }

    function getData() {
        var axes = wpd.appData.getPlotData().getAxesForDataset(_ds);

        if (axes instanceof wpd.BarAxes) {
            return getBarAxesData(_ds, axes);
        } else {
            return getGeneralAxesData(_ds, axes);
        }
    }

    function getBarAxesData(dataSeries, axes) {
        var fields = [],
            fieldDateFormat = [],
            rawData = [],
            isFieldSortable = [],
            rowi, coli,
            dataPt, transformedDataPt, lab;

        for (rowi = 0; rowi < dataSeries.getCount(); rowi++) {

            dataPt = dataSeries.getPixel(rowi);
            transformedDataPt = axes.pixelToData(dataPt.x, dataPt.y);

            rawData[rowi] = [];

            // metaData[0] should be the label:
            if (dataPt.metadata == null) {
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

    function getGeneralAxesData(dataSeries, axes) {
        // 2D XY, Polar, Ternary, Image, Map

        var fields = [],
            fieldDateFormat = [],
            connectivityFieldIndices = [],
            rawData = [],
            isFieldSortable = [],
            rowi, coli, pt, ptData, metadi,
            hasMetadata = dataSeries.hasMetadata(),
            metaKeys = dataSeries.getMetadataKeys(),
            metaKeyCount = hasMetadata === true ? metaKeys.length : 0,
            ptmetadata;

        for (rowi = 0; rowi < dataSeries.getCount(); rowi++) {

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
        if (hasMetadata) {
            fields = fields.concat(metaKeys);
        }

        for (coli = 0; coli < fields.length; coli++) {
            if (coli < axes.getDimensions()) {
                connectivityFieldIndices[coli] = coli;
                if (axes.isDate != null && axes.isDate(coli)) {
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
        setDataSource: setDataSource,
        getData: getData
    };
})();

wpd.measurementDataProvider = (function() {
    let _ms = null;

    function setDataSource(ms) {
        _ms = ms;
    }

    function getData() {
        var fields = [],
            fieldDateFormat = [],
            rawData = [],
            isFieldSortable = [],
            plotData = wpd.appData.getPlotData(),
            axes = plotData.getAxesForMeasurement(_ms),
            isMap = axes != null && (axes instanceof wpd.MapAxes),
            conni;

        if (_ms instanceof wpd.DistanceMeasurement) {
            for (conni = 0; conni < _ms.connectionCount(); conni++) {
                rawData[conni] = [];
                rawData[conni][0] = 'Dist' + conni;
                if (isMap) {
                    rawData[conni][1] = axes.pixelToDataDistance(_ms.getDistance(conni));
                } else {
                    rawData[conni][1] = _ms.getDistance(conni);
                }
            }

            fields = ['Label', 'Distance'];
            isFieldSortable = [false, true];

        } else if (_ms instanceof wpd.AngleMeasurement) {

            for (conni = 0; conni < _ms.connectionCount(); conni++) {
                rawData[conni] = [];
                rawData[conni][0] = 'Theta' + conni;
                rawData[conni][1] = _ms.getAngle(conni);
            }

            fields = ['Label', 'Angle'];
            isFieldSortable = [false, true];

        } else if (_ms instanceof wpd.AreaMeasurement) {

            for (conni = 0; conni < _ms.connectionCount(); conni++) {
                rawData[conni] = [];
                rawData[conni][0] = 'Poly' + conni;
                if (isMap) {
                    rawData[conni][1] = axes.pixelToDataArea(_ms.getArea(conni));
                    rawData[conni][2] = axes.pixelToDataDistance(_ms.getPerimeter(conni));
                } else {
                    rawData[conni][1] = _ms.getArea(conni);
                    rawData[conni][2] = _ms.getPerimeter(conni);
                }
            }

            fields = ['Label', 'Area', 'Perimeter'];
            isFieldSortable = [false, true, true];
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
        getData: getData,
        setDataSource: setDataSource
    };
})();