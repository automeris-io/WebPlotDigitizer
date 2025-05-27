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

wpd.showPrefs = function() {
    wpd.popup.show('user-prefs-dialog');

    // fetch prefs from the server
    fetch("/api/prefs").then(r => r.json()).then(body => {
        document.getElementById('user-prefs-language').value = body["language"];
    }).catch(e => {
        document.getElementById('user-prefs-language').value = "english";
    });
};

wpd.cancelPrefs = function() {
    wpd.popup.close('user-prefs-dialog');
};

wpd.savePrefs = function() {
    const data = {
        "language": document.getElementById('user-prefs-language').value
    };
    console.log(data);
    fetch("/api/prefs", {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    wpd.popup.close('user-prefs-dialog');
};
