/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.initApp = function() {// This is run when the page loads.

    wpd.browserInfo.checkBrowser();
    wpd.layoutManager.initialLayout();
    wpd.graphicsWidget.loadImageFromURL('start.png');
    document.getElementById('loadingCurtain').style.display = 'none';

    //wpd.messagePopup.show('Unstable Version Warning!', 'You are using a beta version of WebPlotDigitizer. There may be some issues with the software that are expected.');
    wpd.loadRemoteData();
};

wpd.loadRemoteData = function() {
    if(typeof wpdremote === "undefined") { 
        return; 
    }
    if(wpdremote.imageData != null && wpdremote.imageData.length > 0) {
        wpd.messagePopup.show("Remote Data", wpdremote.imageData);
    }
};

document.addEventListener("DOMContentLoaded", wpd.initApp, true);

