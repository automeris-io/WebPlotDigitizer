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

// Handle popup windows
var wpd = wpd || {};
wpd.popup = (function() {
    let dragInfo = null;
    let $activeWindow = null;

    function show(popupid) {

        // Dim lights to make it obvious that these are modal dialog boxes.
        let shadowDiv = document.getElementById('shadow');
        shadowDiv.style.visibility = "visible";

        // Display the popup
        let pWindow = document.getElementById(popupid);
        let screenWidth = parseInt(window.innerWidth, 10);
        let screenHeight = parseInt(window.innerHeight, 10);
        let pWidth = parseInt(pWindow.offsetWidth, 10);
        let pHeight = parseInt(pWindow.offsetHeight, 10);
        let xPos = (screenWidth - pWidth) / 2;
        let yPos = (screenHeight - pHeight) / 2;
        yPos = yPos > 60 ? 60 : yPos;
        pWindow.style.left = xPos + 'px';
        pWindow.style.top = yPos + 'px';
        pWindow.style.visibility = "visible";

        // Attach drag events to the header
        for (let i = 0; i < pWindow.childNodes.length; i++) {
            if (pWindow.childNodes[i].className === 'popupheading') {
                pWindow.childNodes[i].addEventListener("mousedown", startDragging, false);
                break;
            }
        }

        window.addEventListener("keydown", handleKeydown, false);

        $activeWindow = pWindow;

        // set focus to first input field
        let inputs = pWindow.getElementsByTagName("input");
        if (inputs.length > 0) {
            inputs[0].focus();
        }
    }

    function close(popupid) {

        let shadowDiv = document.getElementById('shadow');
        shadowDiv.style.visibility = "hidden";

        let pWindow = document.getElementById(popupid);
        pWindow.style.visibility = "hidden";

        removeDragMask();

        window.removeEventListener("keydown", handleKeydown, false);
        $activeWindow = null;
    }

    function startDragging(ev) {
        // Create a drag mask that will react to mouse action after this point
        let $dragMask = document.createElement('div');
        $dragMask.className = 'popup-drag-mask';
        $dragMask.style.display = 'inline-block';
        $dragMask.addEventListener('mousemove', dragMouseMove, false);
        $dragMask.addEventListener('mouseup', dragMouseUp, false);
        $dragMask.addEventListener('mouseout', dragMouseOut, false);
        document.body.appendChild($dragMask);

        dragInfo = {
            dragMaskDiv: $dragMask,
            initialMouseX: ev.pageX,
            initialMouseY: ev.pageY,
            initialWindowX: $activeWindow.offsetLeft,
            initialWindowY: $activeWindow.offsetTop
        };

        ev.preventDefault();
        ev.stopPropagation();
    }

    function dragMouseMove(ev) {
        moveWindow(ev);
        ev.stopPropagation();
        ev.preventDefault();
    }

    function dragMouseUp(ev) {
        moveWindow(ev);
        removeDragMask();
        ev.stopPropagation();
        ev.preventDefault();
    }

    function moveWindow(ev) {
        let newWindowX = (dragInfo.initialWindowX + ev.pageX - dragInfo.initialMouseX);
        let newWindowY = (dragInfo.initialWindowY + ev.pageY - dragInfo.initialMouseY);
        let appWidth = parseInt(document.body.offsetWidth, 10);
        let appHeight = parseInt(document.body.offsetHeight, 10);
        let windowWidth = parseInt($activeWindow.offsetWidth, 10);
        let windowHeight = parseInt($activeWindow.offsetHeight, 10);

        // move only up to a reasonable bound:
        if (newWindowX + 0.7 * windowWidth < appWidth && newWindowX > 0 && newWindowY > 0 &&
            newWindowY + 0.5 * windowHeight < appHeight) {
            $activeWindow.style.top = newWindowY + 'px';
            $activeWindow.style.left = newWindowX + 'px';
        }
    }

    function dragMouseOut(ev) {
        removeDragMask();
    }

    function removeDragMask() {
        if (dragInfo != null && dragInfo.dragMaskDiv != null) {
            dragInfo.dragMaskDiv.removeEventListener('mouseout', dragMouseOut, false);
            dragInfo.dragMaskDiv.removeEventListener('mouseup', dragMouseUp, false);
            dragInfo.dragMaskDiv.removeEventListener('mousemove', dragMouseMove, false);
            dragInfo.dragMaskDiv.style.display = 'none';
            document.body.removeChild(dragInfo.dragMaskDiv);
            dragInfo = null;
        }
    }

    function handleKeydown(e) {
        if (wpd.keyCodes.isEsc(e.keyCode)) {
            close($activeWindow.id);
        }
    }

    return {
        show: show,
        close: close
    };
})();

wpd.busyNote = (function() {
    let $elem = null;
    let isVisible = false;

    function getElem() {
        $elem = document.getElementById('wait');
    }

    function show() {
        if (isVisible) {
            return;
        }
        if ($elem == null) {
            getElem();
        }
        $elem.style.visibility = "visible";
        isVisible = true;
    }

    function close() {
        if (!isVisible) {
            return;
        }
        if ($elem == null) {
            getElem();
        }
        $elem.style.visibility = "hidden";
        isVisible = false;
    }

    return {
        show: show,
        close: close
    };
})();

wpd.messagePopup = (function() {
    var close_callback;

    function show(title, msg, callback) {
        wpd.popup.show('messagePopup');
        document.getElementById('message-popup-heading').innerHTML = title;
        document.getElementById('message-popup-text').innerHTML = msg;
        close_callback = callback;
    }

    function close() {
        wpd.popup.close('messagePopup');
        if (close_callback != null) {
            close_callback();
        }
    }

    return {
        show: show,
        close: close
    };
})();

wpd.okCancelPopup = (function() {
    var okCallback, cancelCallback;

    function show(title, msg, ok_callback, cancel_callback, ok_text, cancel_text) {
        wpd.popup.show("okCancelPopup");
        document.getElementById("ok-cancel-popup-heading").innerHTML = title;
        document.getElementById("ok-cancel-popup-text").innerHTML = msg;
        document.getElementById("ok-cancel-popup-ok-button").value = ok_text || wpd.gettext("ok");
        document.getElementById("ok-cancel-popup-cancel-button").value = cancel_text || wpd.gettext("cancel");
        okCallback = ok_callback;
        cancelCallback = cancel_callback;
    }

    function ok() {
        wpd.popup.close("okCancelPopup");
        if (okCallback != null) {
            okCallback();
        }
    }

    function cancel() {
        wpd.popup.close("okCancelPopup");
        if (cancelCallback != null) {
            cancelCallback();
        }
    }

    return {
        show: show,
        ok: ok,
        cancel: cancel
    };
})();

wpd.unsupported = function() {
    wpd.messagePopup.show(wpd.gettext('unsupported'), wpd.gettext('unsupported-text'));
};
