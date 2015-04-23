/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.ConnectedPoints = (function () {
    var CPoints = function (connectivity) {

        var connections = [],
            selectedConnectionIndex = -1,
            selectedPointIndex = -1;

        this.addConnection = function (plist) {
            connections[connections.length] = plist;
        };

        this.clearAll = function () {
            connections = [];
        };

        this.getConnectionAt = function (index) {
            if(index < connections.length) {
                return connections[index];
            }   
        };

        this.replaceConnectionAt = function (index, plist) {
            if(index < connections.length) {
                connections[index] = plist;
            }
        };

        this.deleteConnectionAt = function (index) {
            if(index < connections.length) {
                connections.splice(index, 1);
            }
        };

        this.connectionCount = function () {
            return connections.length;
        };

        this.getDistance = function(index) {
            if(index < connections.length && connectivity === 2) {
                var dist = Math.sqrt((connections[index][0] - connections[index][2])*(connections[index][0] - connections[index][2])
                    + (connections[index][1] - connections[index][3])*(connections[index][1] - connections[index][3]));
                return dist; // this is in pixels!
            }
        };

        this.getAngle = function(index) {
            if(index < connections.length && connectivity === 3) {

                var ang1 = wpd.taninverse(-(connections[index][5] - connections[index][3]), connections[index][4] - connections[index][2]),
                    ang2 = wpd.taninverse(-(connections[index][1] - connections[index][3]), connections[index][0] - connections[index][2]),
                    ang = ang1 - ang2;

                ang = 180.0*ang/Math.PI;
                ang = ang < 0 ? ang + 360 : ang;
                return ang;
            }
        };

        this.findNearestPointAndConnection = function (x, y) {
            var minConnIndex = -1,
                minPointIndex = -1,
                minDist, dist,
                ci, pi;

            for (ci = 0; ci < connections.length; ci++) {
                for (pi = 0; pi < connectivity*2; pi+=2) {
                    dist = (connections[ci][pi] - x)*(connections[ci][pi] - x) + (connections[ci][pi+1] - y)*(connections[ci][pi+1] - y);
                    if (minPointIndex === -1 || dist < minDist) {
                        minConnIndex = ci;
                        minPointIndex = pi/2;
                        minDist = dist;
                    }
                }
            }

            return {
                connectionIndex: minConnIndex,
                pointIndex: minPointIndex
            };
        };

        this.selectNearestPoint = function (x, y) {
            var nearestPt = this.findNearestPointAndConnection(x, y);
            if (nearestPt.connectionIndex >= 0) {
                selectedConnectionIndex = nearestPt.connectionIndex;
                selectedPointIndex = nearestPt.pointIndex;
            }
        };

        this.deleteNearestConnection = function (x, y) {
            var nearestPt = this.findNearestPointAndConnection(x, y);
            if (nearestPt.connectionIndex >= 0) {
                this.deleteConnectionAt(nearestPt.connectionIndex);
            }
        };

        this.isPointSelected = function (connectionIndex, pointIndex) {
            if (selectedPointIndex === pointIndex && selectedConnectionIndex === connectionIndex) {
                return true;
            }
            return false;
        };

        this.getSelectedConnectionAndPoint = function () {
            return {
                connectionIndex: selectedConnectionIndex,
                pointIndex: selectedPointIndex
            };
        };

        this.unselectConnectionAndPoint = function () {
            selectedConnectionIndex = -1;
            selectedPointIndex = -1;
        };

        this.setPointAt = function (connectionIndex, pointIndex, x, y) {
            connections[connectionIndex][pointIndex*2] = x;
            connections[connectionIndex][pointIndex*2 + 1] = y;
        };

        this.getPointAt = function (connectionIndex, pointIndex) {
            return {
                x: connections[connectionIndex][pointIndex*2],
                y: connections[connectionIndex][pointIndex*2 + 1]
            };
        };
    };
    return CPoints;
})();
