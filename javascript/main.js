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

wpd.initApp = function() { // This is run when the page loads.
    wpd.browserInfo.checkBrowser();
    wpd.layoutManager.initialLayout();
    wpd.handleLaunchArgs();
    wpd.log();
    document.getElementById('loadingCurtain').style.display = 'none';
};

wpd.loadDefaultImage = function() {
    // Need to initialize file manager alongside loading image.
    // TODO: clean up file manager initialization!
    let loadImage = async function() {
        let response = await fetch("start.png");
        let data = await response.blob();
        let metadata = {
            type: "image/png"
        };
        let file = new File([data], "start.png", metadata);
        wpd.imageManager.initializeFileManager([file], true);
        await wpd.imageManager.loadFromFile(file);
        wpd.busyNote.close();
        if (!wpd.browserInfo.isElectronBrowser()) {
            wpd.popup.show('loadNewImage');
        }
    };
    loadImage();
}

wpd.handleLaunchArgs = function() {
    // fetch a project with specific ID from the backend if a projectid argument is provided:
    let projectId = wpd.args.getValue("projectId");
    if (projectId == null) {
        wpd.loadDefaultImage();
    } else {
        wpd.saveResume.loadCloudProject(projectId);
    }
};

document.addEventListener("DOMContentLoaded", wpd.initApp, true);

// Get user confirmation before navigating away
if (!wpd.browserInfo.isElectronBrowser()) {
    window.onbeforeunload = function() {
        return true;
    };
}

wpd.exit = function() {
    if (!wpd.browserInfo.isElectronBrowser()) {
        return;
    }
    const ipc = require('electron').ipcRenderer;
    ipc.send("app_exit");
}
