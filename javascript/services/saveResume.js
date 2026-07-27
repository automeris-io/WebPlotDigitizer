/*
    WebPlotDigitizer - web based chart data extraction software (and more)
    
    Copyright (C) 2026 Ankit Rohatgi

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

wpd.saveResume = (function() {

    let gcloudProject = null;

    function save() {
        wpd.popup.show('export-json-window');
    }

    function load() {
        wpd.popup.show('import-json-window');
    }

    function resumeFromJSON(json_data) {
        const plotData = wpd.appData.getPlotData();
        const metadata = plotData.deserialize(json_data);
        _loadMetadata(metadata);
        wpd.tree.refresh();
    }

    function generateJSON() {
        const plotData = wpd.appData.getPlotData();
        const metadata = wpd.appData.getFileManager().getMetadata();
        return JSON.stringify(plotData.serialize(metadata));
    }

    function _loadMetadata(metadata) {
        let data = {};
        if (metadata && Object.keys(metadata).length !== 0) {
            data = metadata;
        }
        wpd.appData.getFileManager().loadMetadata(data);
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

    async function _writeAndDownloadTar(projectName, json, imageFiles, imageFileNames) {
        // projectInfo
        let projectInfo =
            JSON.stringify({
                'version': [4, 0],
                'json': 'wpd.json',
                'images': imageFileNames
            });

        // generate project file
        let tarWriter = new tarball.TarWriter();
        tarWriter.addFolder(projectName + '/');
        tarWriter.addTextFile(projectName + '/info.json', projectInfo);
        tarWriter.addTextFile(projectName + '/wpd.json', json);
        for (let i = 0; i < imageFiles.length; i++) {
            tarWriter.addFile(projectName + '/' + imageFileNames[i], imageFiles[i]);
        }
        const tarBytes = await tarWriter.write();

        if (wpd.compression.supportsGzip()) {
            const gzBytes = await wpd.compression.gzip(tarBytes);
            wpd.download.file(gzBytes, projectName + '.tar.gz', 'application/gzip');
        } else {
            // Older browsers without the Compression Streams API: fall
            // back to an uncompressed .tar, which readProjectFile() also
            // still accepts.
            wpd.download.file(tarBytes, projectName + '.tar', 'application/x-tar');
        }
    }

    async function downloadProject() {
        // get project name
        const projectName =
            stripIllegalCharacters(document.getElementById('project-name-input').value);

        // get JSON
        const json = generateJSON();

        // get images, write everything to a tar(.gz), and initiate download
        wpd.busyNote.show();
        wpd.popup.close('export-json-window');
        try {
            const imageFiles = await wpd.graphicsWidget.getImageFiles();
            const imageFileNames = imageFiles.map(file => file.name);
            await _writeAndDownloadTar(projectName, json, imageFiles, imageFileNames);
        } finally {
            wpd.busyNote.close();
        }
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

    function _readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = () => reject(fileReader.error);
            fileReader.readAsArrayBuffer(file);
        });
    }

    async function readProjectFile(file) {
        wpd.busyNote.show();
        let fileInfo, tarReader;
        try {
            let bytes = new Uint8Array(await _readFileAsArrayBuffer(file));

            // Accept both a plain .tar (older exports, or browsers without
            // the Compression Streams API) and a gzip-compressed .tar.gz,
            // sniffed by magic number rather than trusting file.name/type.
            if (wpd.compression.isGzip(bytes)) {
                if (!wpd.compression.supportsGzip()) {
                    wpd.messagePopup.show(wpd.gettext('invalid-project'),
                        wpd.gettext('invalid-project-msg'));
                    return;
                }
                bytes = await wpd.compression.gunzip(bytes);
            }

            tarReader = new tarball.TarReader();
            fileInfo = tarReader.readArrayBuffer(bytes.buffer);
        } catch (err) {
            console.log(err);
            return;
        } finally {
            wpd.busyNote.close();
        }

        const infoIndex = fileInfo.findIndex(info => info.name.endsWith('/info.json'));
        if (infoIndex >= 0) {
            const projectName = fileInfo[infoIndex].name.replace('/info.json', '');

            let wpdimages = [];
            fileInfo.filter((info) => {
                return info.type === 'file' && !info.name.endsWith('.json');
            }).forEach((info) => {
                let mimeType = '';
                if (info.name.endsWith('.pdf')) {
                    mimeType = 'application/pdf';
                } else {
                    mimeType = 'image/png';
                }
                const nameRegexp = new RegExp(projectName + '/', 'i');
                const wpdimage = tarReader.getFileBlob(info.name, mimeType);
                wpdimage.name = info.name.replace(nameRegexp, '');
                wpdimages.push(wpdimage);
            });

            let wpdjson = JSON.parse(tarReader.getTextFile(projectName + '/wpd.json'));

            wpd.imageManager.initializeFileManager(wpdimages);
            wpd.imageManager.loadFromFile(wpdimages[0], true).then(() => {
                resumeFromJSON(wpdjson);
                wpd.tree.refresh();
                wpd.messagePopup.show(wpd.gettext('import-json'),
                    wpd.gettext('json-data-loaded'));
                afterProjectLoaded();
            });
        }
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
            // Browsers report inconsistent (or empty) MIME types for
            // .tar/.tar.gz/.tgz uploads, so route by extension instead;
            // readProjectFile() itself sniffs the gzip magic number to
            // decide whether decompression is needed.
            const name = file.name.toLowerCase();
            if (name.endsWith(".json")) {
                readJSONFileOnly(file);
            } else if (name.endsWith(".tar") || name.endsWith(".tar.gz") || name.endsWith(
                    ".tgz")) {
                readProjectFile(file);
            } else {
                wpd.messagePopup.show(wpd.gettext("invalid-project"),
                    wpd.gettext("invalid-project-msg"));
            }
        }
    }

    function loadCloudProject(projectId) {
        let cloudProject = new wpd.CloudProject(projectId);
        cloudProject.download().then(
            (projectFiles) => {
                let wpdimages = cloudProject.getAllProjectImages();
                wpd.imageManager.initializeFileManager(wpdimages);
                return wpd.imageManager.loadFromFile(wpdimages[0], true);
            },
            (err) => {
                wpd.messagePopup.show(wpd.gettext("invalid-project"), err);
                wpd.loadDefaultImage();
            }
        ).then(() => cloudProject.getProjectJSON()).then((wpdjson) => {
            resumeFromJSON(wpdjson);
            wpd.tree.refresh();
            afterProjectLoaded();
        }).catch((err) => {
            console.log(err)
        });
    }

    function updateCloudProject() {
        // existing project
        if (gcloudProject != null) {
            gcloudProject.upload();
        }

        // new project

    }

    return {
        save: save,
        load: load,
        downloadJSON: downloadJSON,
        downloadProject: downloadProject,
        read: read,
        readProjectFile: readProjectFile,
        loadCloudProject: loadCloudProject,
        updateCloudProject: updateCloudProject
    };
})();
