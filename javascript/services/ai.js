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

wpd.ai = (function() {

    let $status = null;
    let $runBtn = null;


    function showQuota() {
        const $quota = document.getElementById("ai-assist-quota");
        wpd.getQuotaLimits().then((limits) => {
            $quota.innerHTML = limits["vision"] + "/" + limits["max_vision"];
        }, (err) => {
            $quota.innerHTML = "error fetching quota limits";
        });
    }

    function assist() {
        showQuota();
        wpd.popup.show('ai-assist-dialog');
        if ($status == null) {
            $status = document.getElementById("ai-assist-status");
        }
        if ($runBtn == null) {
            $runBtn = document.getElementById("ai-assist-run-btn");
        }
        $status.innerHTML = "";
        $runBtn.disabled = false;
    }

    async function runQuery() {
        $status.innerHTML = "running...";
        $runBtn.disabled = true;
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.tree.refresh();
        wpd.tree.selectPath("/" + wpd.gettext("image"), false);
        // grab image
        const b64image = wpd.graphicsWidget.getBase64Image();

        // call server
        try {
            let response = await fetch("/api/vision/process", {
                method: "post",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "image": b64image
                })
            });
            if (response.ok) {
                let result = await response.json();
                createObjects(result);
                wpd.popup.close('ai-assist-dialog');
            } else {
                wpd.popup.close('ai-assist-dialog');
                $status.innerHTML = "Failed! Try again later or on a different image.";
                $runBtn.disabled = false;
            }
        } catch (err) {
            $status.innerHTML = "Failed! Try again later or on a different image.";
            $runBtn.disabled = false;
        }
    }

    function createObjects(vision_result) {
        const info = vision_result["info"];
        const calibration_info = vision_result["calibration"];
        const dataset_info = vision_result["datasets"];
        console.log(vision_result);
        try {
            const imageSize = wpd.graphicsWidget.getImageSize();
            const plotData = wpd.appData.getPlotData();
            const fileManager = wpd.appData.getFileManager();
            const pageManager = wpd.appData.getPageManager();
            const chartType = info["chart_type"];
            const chartSubType = info["chart_sub_type"];
            const xTickLabels = info["x_tick_labels"];
            const yTickLabels = info["y_tick_labels"];
            const chartOrientation = info["chart_orientation"];
            const xMin = xTickLabels.length > 0 ? xTickLabels[0].toString() : "0";
            const xMax = xTickLabels.length > 0 ? xTickLabels[xTickLabels.length - 1].toString() : "1";
            const yMin = yTickLabels.length > 0 ? yTickLabels[0].toString() : "0";
            const yMax = yTickLabels.length > 0 ? yTickLabels[yTickLabels.length - 1].toString() : "1";
            const xLog = (info["x_axis_scale"] === "log");
            const yLog = (info["y_axis_scale"] === "log");

            let axes = null;
            let isBarChart = false;
            let isHorizontal = false;
            let isLine = false;
            if (chartType.toLowerCase() === "xy") {
                if (chartSubType.toLowerCase() === "line") {
                    isLine = true;
                }
                const calib = new wpd.Calibration(2);
                calib.labels = ['X1', 'X2', 'Y1', 'Y2'];
                calib.labelPositions = ['N', 'N', 'E', 'E'];
                calib.maxPointCount = 4;
                if (calibration_info != undefined && calibration_info["x"] != undefined && calibration_info["y"] != undefined) {
                    const refCal = calibration_info;
                    const calibCoords = [
                        [refCal["x"][0]["tick_pos"][0], refCal["x"][0]["tick_pos"][1]],
                        [refCal["x"][1]["tick_pos"][0], refCal["x"][1]["tick_pos"][1]],
                        [refCal["y"][1]["tick_pos"][0], refCal["y"][1]["tick_pos"][1]],
                        [refCal["y"][0]["tick_pos"][0], refCal["y"][0]["tick_pos"][1]],
                    ];
                    let xaxis_mean_y = (calibCoords[0][1] + calibCoords[1][1]) / 2.0;
                    let yaxis_mean_x = (calibCoords[2][0] + calibCoords[3][0]) / 2.0;
                    calib.addPoint(calibCoords[0][0], xaxis_mean_y, refCal["x"][0]["text"], refCal["y"][1]["text"]);
                    calib.addPoint(calibCoords[1][0], xaxis_mean_y, refCal["x"][1]["text"], refCal["y"][1]["text"]);
                    calib.addPoint(yaxis_mean_x, calibCoords[2][1], refCal["x"][0]["text"], refCal["y"][1]["text"]);
                    calib.addPoint(yaxis_mean_x, calibCoords[3][1], refCal["x"][0]["text"], refCal["y"][0]["text"]);
                } else {
                    const calibCoords = [
                        [imageSize.width * 0.30, imageSize.height * 0.75],
                        [imageSize.width * 0.75, imageSize.height * 0.75],
                        [imageSize.width * 0.25, imageSize.height * 0.75],
                        [imageSize.width * 0.25, imageSize.height * 0.25],
                    ];
                    calib.addPoint(calibCoords[0][0], calibCoords[0][1], xMin, yMin);
                    calib.addPoint(calibCoords[1][0], calibCoords[1][1], xMax, yMin);
                    calib.addPoint(calibCoords[2][0], calibCoords[2][1], xMin, yMin);
                    calib.addPoint(calibCoords[3][0], calibCoords[3][1], xMin, yMax);
                }
                const xyAxes = new wpd.XYAxes();
                xyAxes.calibrate(calib, xLog, yLog, true);
                console.log("adding XY axes");
                axes = xyAxes;
            } else if (chartType.toLowerCase() === "bar") {
                isBarChart = true;
                const calib = new wpd.Calibration(2);
                calib.labels = ['P1', 'P2'];
                calib.labelPositions = ['S', 'S'];
                calib.maxPointCount = 2;
                let hasCalibInfo = false;
                if (calibration_info != undefined) {
                    if (chartOrientation != "horizontal") {
                        // vertical or unknown orientation
                        if (calibration_info["y"] != undefined) {
                            const refCal = calibration_info;
                            const calibCoords = [
                                [refCal["y"][1]["tick_pos"][0], refCal["y"][1]["tick_pos"][1]],
                                [refCal["y"][0]["tick_pos"][0], refCal["y"][0]["tick_pos"][1]],
                            ];
                            let yaxis_mean_x = (calibCoords[0][0] + calibCoords[1][0]) / 2.0;
                            calib.addPoint(yaxis_mean_x, calibCoords[0][1], xMin, refCal["y"][1]["text"]);
                            calib.addPoint(yaxis_mean_x, calibCoords[1][1], xMax, refCal["y"][0]["text"]);
                            hasCalibInfo = true;
                        }
                    } else {
                        // horizontal
                        isHorizontal = true;
                        if (calibration_info["x"] != undefined) {
                            const refCal = calibration_info;
                            const calibCoords = [
                                [refCal["x"][0]["tick_pos"][0], refCal["x"][0]["tick_pos"][1]],
                                [refCal["x"][1]["tick_pos"][0], refCal["x"][1]["tick_pos"][1]],
                            ];
                            let xaxis_mean_y = (calibCoords[0][1] + calibCoords[1][1]) / 2.0;
                            calib.addPoint(calibCoords[0][0], xaxis_mean_y, xMin, refCal["x"][0]["text"]);
                            calib.addPoint(calibCoords[1][0], xaxis_mean_y, xMax, refCal["x"][1]["text"]);
                            hasCalibInfo = true;
                        }
                    }
                }
                if (!hasCalibInfo) {
                    const calibCoords = [
                        [imageSize.width * 0.25, imageSize.height * 0.75],
                        [imageSize.width * 0.25, imageSize.height * 0.25],
                    ];

                    calib.addPoint(calibCoords[0][0], calibCoords[0][1], xMin, yMin);
                    calib.addPoint(calibCoords[1][0], calibCoords[1][1], xMax, yMax);
                }
                const barAxes = new wpd.BarAxes();
                barAxes.calibrate(calib, yLog, false);
                console.log("adding Bar axes");
                axes = barAxes;
            } else if (chartType === "polar") {
                const calib = new wpd.Calibration(2);
                calib.labels = ['Origin', 'P1', 'P2'];
                calib.labelPositions = ['E', 'S', 'S'];
                calib.maxPointCount = 3;
                const calibCoords = [
                    [imageSize.width * 0.5, imageSize.height * 0.5],
                    [imageSize.width * 0.65, imageSize.height * 0.5],
                    [imageSize.width * 0.75, imageSize.height * 0.45],
                ];
                calib.addPoint(calibCoords[0][0], calibCoords[0][1], "", "");
                calib.addPoint(calibCoords[1][0], calibCoords[1][1], yMin, xMin);
                calib.addPoint(calibCoords[2][0], calibCoords[2][1], yMax, xMax);
                const polarAxes = new wpd.PolarAxes();
                polarAxes.calibrate(calib, true, false, false);
                axes = polarAxes;
            } else {
                // show some error?
            }

            if (axes != null) {
                // avoid name collision
                let cnt = 0;
                for (let ax of plotData.getAxesColl()) {
                    if (ax.name.startsWith(axes.name)) {
                        cnt++;
                    }
                }
                if (cnt > 0) {
                    axes.name = axes.name + ' ' + (cnt + 1);
                }
                plotData.addAxes(axes);
                wpd.alignAxes.postProcessAxesAdd(axes, true);
            }

            for (let di = 0; di < dataset_info.length; di++) {
                let dataset = new wpd.Dataset();
                dataset.name = dataset_info[di]["name"];
                if (dataset.name === "" || dataset.name == null) {
                    dataset.name = "Dataset";
                }
                const count = wpd.dataSeriesManagement.getDatasetWithNameCount(dataset.name);
                if (count > 0) dataset.name += ' ' + (count + 1);
                plotData.addDataset(dataset);
                if (axes != null) {
                    plotData.setAxesForDataset(dataset, axes);
                }
                fileManager.addDatasetsToCurrentFile([dataset]);
                if (wpd.appData.isMultipage()) {
                    pageManager.addDatasetsToCurrentPage([dataset]);
                }

                if (isBarChart) {
                    assignBarDetections(dataset, axes, dataset_info[di]["detections"], isHorizontal);
                }

                if (isLine) {
                    assignLineDetections(dataset, axes, dataset_info[di]["detections"]);
                }

                // set up auto detection
                let ad = new wpd.AutoDetectionData();
                ad.fgColor = dataset_info[di]["color"];
                ad.imageWidth = info["width"];
                ad.imageHeight = info["height"];
                let uncompressedMask = wpd.rle.decode(dataset_info[di]["mask"]);
                ad.mask = new Set();
                for (let i of uncompressedMask) {
                    ad.mask.add(i);
                }
                plotData.setAutoDetectionDataForDataset(dataset, ad);
            }

            wpd.tree.refresh();
            wpd.tree.selectPath("/" + wpd.gettext("axes") + "/" + axes.name, false);
        } catch (err) {
            console.log(err);
            wpd.messagePopup.show(wpd.gettext('ai-assist-title'), wpd.gettext('ai-assist-failed'));
        }
    }

    function assignLineDetections(dataset, axes, detections) {
        for (let det of detections) {
            dataset.addPixel(det[0], det[1]);
        }
    }

    function assignBarDetections(dataset, axes, detections, isHorizontal) {
        dataset.setMetadataKeys(["label"]);
        for (let det of detections) {
            const bar = det["bar"]
            if (!isHorizontal) {
                let px = (bar[0] + bar[2]) / 2.0;
                let py_top = bar[1];
                let py_bot = bar[3];
                let valTop = axes.pixelToData(px, py_top)[0];
                let valBot = axes.pixelToData(px, py_bot)[0];
                let py = py_top;
                if (valTop + valBot < 0) { // TODO: probably not a very robust check
                    py = py_bot;
                }
                dataset.addPixel(px, py, {
                    "label": det["text"]
                });
            } else {
                let py = (bar[1] + bar[3]) / 2.0;
                let px = bar[2]; // right bar TODO: check if this is negative
                dataset.addPixel(px, py, {
                    "label": det["text"]
                });
            }
        }
    }

    return {
        assist: assist,
        runQuery: runQuery,
    }
})();
