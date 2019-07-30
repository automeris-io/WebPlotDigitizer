/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.saveResume = (function() {
    function save() {
        wpd.popup.show('export-json-window');
    }

    function load() {
        wpd.popup.show('import-json-window');
    }

    function resumeFromJSON(json_data) {
        const plotData = wpd.appData.getPlotData();
        plotData.deserialize(json_data);
        wpd.tree.refresh();
    }

    function generateJSON() {
        const plotData = wpd.appData.getPlotData();
        return JSON.stringify(plotData.serialize());
    }

    function stripIllegalCharacters(filename) {
        return filename.replace(/[^a-zA-Z\d+\.\-_\s]/g, "_");
    }

    function downloadJSON() {
        // get project name
        let projectName =
            stripIllegalCharacters(document.getElementById("project-name-input").value) + ".json";

        wpd.download.json(generateJSON(), projectName);
        wpd.popup.close('export-json-window');
    }

    function downloadProject() {
        // get project name
        let projectName =
            stripIllegalCharacters(document.getElementById("project-name-input").value);

        // get JSON
        let json = generateJSON();

        // get Image
        let imageFile = wpd.graphicsWidget.getImagePNG();

        // projectInfo
        let projectInfo =
            JSON.stringify({
                "version": [4, 0],
                "json": "wpd.json",
                "image": "image.png"
            });

        // generate project file
        let tarWriter = new tarball.TarWriter();
        tarWriter.addFolder(projectName + "/");
        tarWriter.addTextFile(projectName + "/info.json", projectInfo);
        tarWriter.addTextFile(projectName + "/wpd.json", json);
        tarWriter.addFile(projectName + "/image.png", imageFile);
        tarWriter.download(projectName + ".tar");
        wpd.popup.close('export-json-window');
    }

    function readJSONFileOnly(jsonFile) {
        var fileReader = new FileReader();
        fileReader.onload = function() {
            var json_data = JSON.parse(fileReader.result);
            resumeFromJSON(json_data);

            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.removeTool();
            wpd.graphicsWidget.removeRepainter();
            wpd.tree.refresh();
            wpd.messagePopup.show(wpd.gettext('import-json'), wpd.gettext("json-data-loaded"));
            afterProjectLoaded();
        };
        fileReader.readAsText(jsonFile);
    }

    function readProjectFile(file) {
        wpd.busyNote.show();
        var tarReader = new tarball.TarReader();
        tarReader.readFile(file).then(
            function(fileInfo) {
                wpd.busyNote.close();
                let infoIndex = fileInfo.findIndex(info => info.name.endsWith("/info.json"));
                if (infoIndex >= 0) {
                    let projectName = fileInfo[infoIndex].name.replace("/info.json", "");
                    let wpdimage = tarReader.getFileBlob(projectName + "/image.png", "image/png");
                    wpdimage.name = "image.png";
                    let wpdjson = JSON.parse(tarReader.getTextFile(projectName + "/wpd.json"));
                    wpd.imageManager.loadFromFile(wpdimage, true).then(() => {
                        resumeFromJSON(wpdjson);
                        wpd.tree.refresh();
                        wpd.messagePopup.show(wpd.gettext('import-json'),
                            wpd.gettext("json-data-loaded"));
                        afterProjectLoaded();
                    });
                }
            },
            function(err) {
                console.log(err);
            });
    }

    function afterProjectLoaded() {
        const plotData = wpd.appData.getPlotData();
        // if we have a bunch of datasets, then select the dataset group
        if (plotData.getDatasetCount() > 0) {
            wpd.tree.selectPath("/" + wpd.gettext("datasets"));
        }
    }

    function read() {
        const $fileInput = document.getElementById('import-json-file');
        wpd.popup.close('import-json-window');
        if ($fileInput.files.length === 1) {
            let file = $fileInput.files[0];
            let fileType = file.type;
            if (fileType == "" || fileType == null) {
                // Chrome on Windows
                if (file.name.endsWith(".json")) {
                    fileType = "application/json";
                } else if (file.name.endsWith(".tar")) {
                    fileType = "application/x-tar";
                }
            }
            if (fileType == "application/json") {
                readJSONFileOnly(file);
            } else if (fileType == "application/x-tar") {
                readProjectFile(file);
            } else {
                wpd.messagePopup.show(wpd.gettext("invalid-project"),
                    wpd.gettext("invalid-project-msg"));
            }
        }
    }

    return {
        save: save,
        load: load,
        downloadJSON: downloadJSON,
        downloadProject: downloadProject,
        read: read,
        readProjectFile: readProjectFile
    };
})();