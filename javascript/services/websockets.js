/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2016 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

// Handle WebSocket Communication
wpd.websocket = (function () {

    var ws,
        isConnected,
        requestCallbacks = {};

    function connect(address) {
        ws = new WebSocket(address);
        ws.onopen = onOpen;
        ws.onmessage = onMessage;
        ws.onclose = onClose;
    }

    function onOpen() {
        isConnected = true;
    }

    function onClose() {
        isConnected = false;
        requestCallbacks = {};
    }

    function onMessage(evt) {
        if (evt.data != null) {
            console.log(evt.data); // just for debugging
            var messageObject = JSON.parse(evt.data);
            if (messageObject != null) {
                // TODO: handle notifications and requests from the server.
                var callbackData = requestCallbacks[messageObject.timestamp];
                if (callbackData != null && callbackData.requestId === messageObject.id) {
                    callbackData.callback(messageObject.message);
                    delete requestCallbacks[messageObject.timestamp];
                }
            } else {
                // Unknown message
                alert("Server announcement: " + messageObject);
                console.log(messageObject);
            }
        }
    }

    function sendMessage(msg) {
        if (isConnected) {
            console.log(msg);
            ws.send(msg);
        }
    }

    function registerRequest(requestId, callback) {
    }

    function registerNotification(notificationId, callback) {
    }

    function request(requestId, messageObject, callback) {
        var timestamp = Date.now(),
            jsonString = JSON.stringify({"type": "request",
                                         "timestamp": timestamp,
                                         "id": requestId,
                                         "message": messageObject});
        requestCallbacks[timestamp] = {
            "requestId": requestId,
            "callback": callback
        };

        sendMessage(jsonString);
    }

    function notify(notificationId, messageObject) {
        var timestamp = Date.now(),
            jsonString = JSON.stringify({"type": "notification",
                                         "timestamp": timestamp,
                                         "id": notificationId,
                                         "message": messageObject});
        sendMessage(jsonString);
    }

    return {
        connect: connect,
        registerRequest: registerRequest,
        registerNotification: registerNotification,
        request: request,
        notify: notify
    };

})();
