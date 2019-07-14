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

wpd.initApp = function() { // This is run when the page loads.
    wpd.browserInfo.checkBrowser();
    wpd.layoutManager.initialLayout();
    wpd.handleLaunchArgs();
    wpd.log();
    document.getElementById('loadingCurtain').style.display = 'none';

};

wpd.handleLaunchArgs = function() {
    // fetch a project with specific ID from the backend if a projectid argument is provided:
    let projectid = wpd.args.getValue("projectid");
    if (projectid == null) {
        wpd.imageManager.loadFromURL('start.png');
    } else {
        fetch("storage/project/" + projectid + ".tar").then(function(response) {
            if (response.ok) {
                return response.blob();
            } else {
                throw new Error("Can not open project file with ID: " + projectid);
            }
        }).then(function(blob) {
            wpd.saveResume.readProjectFile(blob);
        }).catch((err) => {
            wpd.messagePopup.show(wpd.gettext("invalid-project"), err);
            wpd.imageManager.loadFromURL('start.png');
        });
    }
};

document.addEventListener("DOMContentLoaded", wpd.initApp, true);