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

wpd.Color = class {
    constructor(r = 0, g = 0, b = 0, a = 255) {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a;
    }

    toRGBString() {
        return `rgb(${this._r}, ${this._g}, ${this._b})`;
    }

    toRGBAString() {
        return `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a})`;
    }

    serialize() {
        return [this._r, this._g, this._b, this._a];
    }

    getRGB() {
        return [this._r, this._g, this._b];
    }

    deserialize(data) {
        this._r = data[0];
        this._g = data[1];
        this._b = data[2];
        this._a = data[3];
    }
};
