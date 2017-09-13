/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2017 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.imageManager = (function () {

    let _firstLoad = true;

    function saveImage() {
        wpd.graphicsWidget.saveImage();
    }

    function load() {
        let $input = document.getElementById('fileLoadBox');
        if($input.files.length == 1) {
            var imageFile = $input.files[0];
            loadFromFile(imageFile);
        }
        wpd.popup.close('loadNewImage');
    }

    function loadFromFile(imageFile) {
        if(imageFile.type.match("image.*")) {
            wpd.busyNote.show();
            let reader = new FileReader();
            reader.onload = function() {
                let url = reader.result;
                loadFromURL(url);
            };
            reader.readAsDataURL(imageFile);
        } else {
            wpd.messagePopup.show(wpd.gettext('invalid-file'), wpd.gettext('invalid-file-text'));            
        }
    }

    function loadFromURL(url) {        
        let image = new Image();
        image.onload = function() {
            _setImage(image);
        };
        image.src = url;
    }

    function _setImage(image) {
        wpd.appData.reset();
        wpd.sidebar.clear();
        let imageData = wpd.graphicsWidget.loadImage(image);
        wpd.appData.plotLoaded(imageData);
        wpd.busyNote.close();
        wpd.tree.refresh();

        if (_firstLoad) {
            wpd.sidebar.show('start-sidebar');
        } else {
            wpd.popup.show('axesList');
        }
        _firstLoad = false;
    }

    return {
        saveImage: saveImage,
        loadFromURL: loadFromURL,
        loadFromFile: loadFromFile,
        load: load
    };
})();
