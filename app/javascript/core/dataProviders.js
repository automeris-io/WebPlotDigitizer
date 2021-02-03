/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2021 Ankit Rohatgi <ankitrohatgi@hotmail.com>

    This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
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
        const fieldDateFormat = [],
            rawData = [],
            isFieldSortable = [false, true],
            hasMetadata = dataSeries.hasMetadata();

        let fields = ['Label', 'Value'],
            // remove label from metadata
            metaKeys = dataSeries.getMetadataKeys().filter(key => key !== 'label');

        const hasOverrides = metaKeys.indexOf('overrides') > -1;

        if (hasOverrides) {
            // remove label and overrides key
            metaKeys = metaKeys.filter(key => key !== 'overrides');
        }

        for (let rowi = 0; rowi < dataSeries.getCount(); rowi++) {
            const dataPt = dataSeries.getPixel(rowi);
            const transformedDataPt = axes.pixelToData(dataPt.x, dataPt.y);

            rawData[rowi] = [];

            let lab = "Bar" + rowi;

            if (dataPt.metadata != null) {
                lab = dataPt.metadata['label'];
            }
            rawData[rowi][0] = lab;
            // transformed value
            rawData[rowi][1] = transformedDataPt[0];

            // other metadata
            let metadi;
            for (metadi = 0; metadi < metaKeys.length; metadi++) {
                const key = metaKeys[metadi];
                let ptmetadata = null;
                if (dataPt.metadata != null && dataPt.metadata[key] != null) {
                    ptmetadata = dataPt.metadata[key];
                }
                rawData[rowi][2 + metadi] = ptmetadata;
            }

            // overrides
            if (hasOverrides) {
                const field = 'y';
                let ptoverride = null;
                if (
                    dataPt.metadata != null &&
                    dataPt.metadata.overrides != null &&
                    dataPt.metadata.overrides[field] != null
                ) {
                    ptoverride = dataPt.metadata.overrides[field];
                }
                rawData[rowi][rawData[rowi].length] = ptoverride;
            }
        }

        if (metaKeys.length) {
            // add metadata keys to fields
            fields = fields.concat(metaKeys.map(key => {
                isFieldSortable.push(true);
                return wpd.utils.toSentenceCase(key);
            }));
        }

        if (hasOverrides) {
            // add override field labels to fields
            fields = fields.concat(['Value-Override']);

            isFieldSortable.push(true);
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

    function getGeneralAxesData(dataSeries, axes) {
        // 2D XY, Polar, Ternary, Image, Map
        const rawData = [],
            isFieldSortable = [],
            hasMetadata = dataSeries.hasMetadata();

        let fields = axes.getAxesLabels(),
            fieldDateFormat = [],
            connectivityFieldIndices = [],
            metaKeys = dataSeries.getMetadataKeys(),
            metaKeyCount = hasMetadata === true ? metaKeys.length : 0;

        const hasOverrides = metaKeys.indexOf('overrides') > -1;

        if (hasOverrides) {
            // remove overrides key
            metaKeys = metaKeys.filter(key => key !== 'overrides');
            metaKeyCount -= 1;
        }

        for (let rowi = 0; rowi < dataSeries.getCount(); rowi++) {
            const pt = dataSeries.getPixel(rowi);
            const ptData = axes.pixelToData(pt.x, pt.y);
            rawData[rowi] = [];

            // transformed coordinates
            for (let coli = 0; coli < ptData.length; coli++) {
                rawData[rowi][coli] = ptData[coli];
            }

            // metadata
            let metadi;
            for (metadi = 0; metadi < metaKeyCount; metadi++) {
                const key = metaKeys[metadi];
                let ptmetadata = null;
                if (pt.metadata != null && pt.metadata[key] != null) {
                    ptmetadata = pt.metadata[key];
                }
                rawData[rowi][ptData.length + metadi] = ptmetadata;
            }

            // overrides
            if (hasOverrides) {
                for (let fieldi = 0; fieldi < fields.length; fieldi++) {
                    const field = fields[fieldi].toLowerCase();
                    let ptoverride = null;
                    if (
                        pt.metadata != null &&
                        pt.metadata.overrides != null &&
                        pt.metadata.overrides[field] != null
                    ) {
                        ptoverride = pt.metadata.overrides[field];
                    }
                    rawData[rowi][ptData.length + metadi + fieldi] = ptoverride;
                }
            }
        }

        if (hasMetadata) {
            fields = fields.concat(metaKeys.map(key => {
                return wpd.utils.toSentenceCase(key);
            }));

            if (hasOverrides) {
                // add override field labels to fields
                fields = fields.concat(fields.map(field => {
                    return wpd.utils.toSentenceCase(field) + '-Override';
                }));
            }
        }

        for (let coli = 0; coli < fields.length; coli++) {
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