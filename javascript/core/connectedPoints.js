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

wpd.ConnectedPoints = class {
    constructor(connectivity) {
        this._connections = [];
        this._selectedConnectionIndex = -1;
        this._selectedPointIndex = -1;
        this._connectivity = connectivity;

        if (wpd.appData.isMultipage()) {
            this.page = 1;
        }
    }

    addConnection(plist) {
        this._connections.push(plist);
    }

    clearAll() {
        this._connections = [];
    }

    getConnectionAt(index) {
        if (index < this._connections.length) {
            return this._connections[index];
        }
    }

    replaceConnectionAt(index, plist) {
        if (index < this._connections.length) {
            this._connections[index] = plist;
        }
    }

    deleteConnectionAt(index) {
        if (index < this._connections.length) {
            this._connections.splice(index, 1);
        }
    }

    connectionCount() {
        return this._connections.length;
    }

    findNearestPointAndConnection(x, y) {
        var minConnIndex = -1,
            minPointIndex = -1,
            minDist, dist, ci, pi;

        for (ci = 0; ci < this._connections.length; ci++) {
            for (pi = 0; pi < this._connections[ci].length; pi += 2) {
                dist = (this._connections[ci][pi] - x) * (this._connections[ci][pi] - x) +
                    (this._connections[ci][pi + 1] - y) * (this._connections[ci][pi + 1] - y);
                if (minPointIndex === -1 || dist < minDist) {
                    minConnIndex = ci;
                    minPointIndex = pi / 2;
                    minDist = dist;
                }
            }
        }

        return {
            connectionIndex: minConnIndex,
            pointIndex: minPointIndex
        };
    }

    selectNearestPoint(x, y) {
        var nearestPt = this.findNearestPointAndConnection(x, y);
        if (nearestPt.connectionIndex >= 0) {
            this._selectedConnectionIndex = nearestPt.connectionIndex;
            this._selectedPointIndex = nearestPt.pointIndex;
        }
    }

    deleteNearestConnection(x, y) {
        var nearestPt = this.findNearestPointAndConnection(x, y);
        if (nearestPt.connectionIndex >= 0) {
            this.deleteConnectionAt(nearestPt.connectionIndex);
        }
    }

    isPointSelected(connectionIndex, pointIndex) {
        if (this._selectedPointIndex === pointIndex &&
            this._selectedConnectionIndex === connectionIndex) {
            return true;
        }
        return false;
    }

    getSelectedConnectionAndPoint() {
        return {
            connectionIndex: this._selectedConnectionIndex,
            pointIndex: this._selectedPointIndex
        };
    }

    unselectConnectionAndPoint() {
        this._selectedConnectionIndex = -1;
        this._selectedPointIndex = -1;
    }

    setPointAt(connectionIndex, pointIndex, x, y) {
        this._connections[connectionIndex][pointIndex * 2] = x;
        this._connections[connectionIndex][pointIndex * 2 + 1] = y;
    }

    getPointAt(connectionIndex, pointIndex) {
        return {
            x: this._connections[connectionIndex][pointIndex * 2],
            y: this._connections[connectionIndex][pointIndex * 2 + 1]
        };
    }
};

wpd.DistanceMeasurement = class extends wpd.ConnectedPoints {
    constructor() {
        super(2);
    }

    getDistance(index) {
        if (index < this._connections.length && this._connectivity === 2) {
            var dist = Math.sqrt((this._connections[index][0] - this._connections[index][2]) *
                (this._connections[index][0] - this._connections[index][2]) +
                (this._connections[index][1] - this._connections[index][3]) *
                (this._connections[index][1] - this._connections[index][3]));
            return dist; // this is in pixels!
        }
    }
};

wpd.AngleMeasurement = class extends wpd.ConnectedPoints {
    constructor() {
        super(3);
    }

    getAngle(index) {
        if (index < this._connections.length && this._connectivity === 3) {

            var ang1 = wpd.taninverse(-(this._connections[index][5] - this._connections[index][3]),
                    this._connections[index][4] - this._connections[index][2]),
                ang2 = wpd.taninverse(-(this._connections[index][1] - this._connections[index][3]),
                    this._connections[index][0] - this._connections[index][2]),
                ang = ang1 - ang2;

            ang = 180.0 * ang / Math.PI;
            ang = ang < 0 ? ang + 360 : ang;
            return ang;
        }
    }
};

wpd.AreaMeasurement = class extends wpd.ConnectedPoints {
    constructor() {
        super(-1); // connectivity can vary here depending on number of points in the polygon
    }

    getArea(index) {
        // return pixel area of polygons
        if (index < this._connections.length) {
            if (this._connections[index].length >= 4) {
                let totalArea = 0.0;
                for (let pi = 0; pi < this._connections[index].length; pi += 2) {

                    let px1 = this._connections[index][pi];
                    let py1 = this._connections[index][pi + 1];

                    let px2 = 0.0;
                    let py2 = 0.0;
                    if (pi <= this._connections[index].length - 4) {
                        px2 = this._connections[index][pi + 2];
                        py2 = this._connections[index][pi + 3];
                    } else {
                        px2 = this._connections[index][0];
                        py2 = this._connections[index][1];
                    }
                    totalArea += (px1 * py2 - px2 * py1);
                }
                totalArea /= 2.0;
                return totalArea;
            }
        }
        return 0;
    }

    getPerimeter(index) {
        if (index < this._connections.length) {
            let totalDist = 0.0;
            let px_prev = 0.0;
            let py_prev = 0.0;
            for (let pi = 0; pi < this._connections[index].length; pi += 2) {
                let px = this._connections[index][pi];
                let py = this._connections[index][pi + 1];
                if (pi >= 2) {
                    totalDist += Math.sqrt((px - px_prev) * (px - px_prev) +
                        (py - py_prev) * (py - py_prev));
                }
                // include the connection between the last and first point in the set (only when >=
                // 2 sides in the polygon):
                if (pi == this._connections[index].length - 2 && pi >= 4) {
                    let px0 = this._connections[index][0];
                    let py0 = this._connections[index][1];
                    totalDist += Math.sqrt((px - px0) * (px - px0) + (py - py0) * (py - py0));
                }
                px_prev = px;
                py_prev = py;
            }
            return totalDist;
        }
    }
};
