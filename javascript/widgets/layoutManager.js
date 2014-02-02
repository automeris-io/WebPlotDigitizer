/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

// layoutManager.js - manage layout of main sections on the screen.

var layoutManager = (function () {
    var layoutTimer,
        $graphicsContainer,
        $sidebarContainer,
        $mainContainer;

    // Redo layout when window is resized
    function adjustLayout() {
        var windowWidth = parseInt(document.body.offsetWidth,10),
            windowHeight = parseInt(document.body.offsetHeight,10);

        $sidebarContainer.style.height = windowHeight + 'px';
        $mainContainer.style.width = windowWidth - $sidebarContainer.offsetWidth + 'px';
        $mainContainer.style.height = windowHeight + 'px';
        $graphicsContainer.style.height = windowHeight - 60 + 'px';
    }

    // event handler
    function adjustLayoutOnResize(ev) {
        clearTimeout(layoutTimer);
        layoutTimer = setTimeout(adjustLayout, 200);
    }
 
    // Set initial layout. Called right when the app is loaded.
    function initialLayout() {
        // do initial layout and also bind to the window resize event
        $graphicsContainer = document.getElementById('graphicsContainer');
        $sidebarContainer = document.getElementById('sidebarContainer');
        $mainContainer = document.getElementById('mainContainer');

        var windowWidth = parseInt(document.body.offsetWidth,10),
            windowHeight = parseInt(document.body.offsetHeight,10);

        $sidebarContainer.style.height = windowHeight + 'px';
        $mainContainer.style.width = windowWidth - $sidebarContainer.offsetWidth + 'px';
        $mainContainer.style.height = windowHeight + 'px';
        $graphicsContainer.style.height = windowHeight - 60 + 'px';

        window.addEventListener('resize', adjustLayoutOnResize, false);
    }

    return {
        initialLayout: initialLayout
    };

})();
