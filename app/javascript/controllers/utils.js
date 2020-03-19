/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2020 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.utils = (function() {
    function toggleElementsDisplay(elements, hide) {
        for (const $el of elements) $el.hidden = hide;
    }

    function addToCollection(collection, key, objects) {
        if (!collection[key]) {
            collection[key] = [];
        }
        Array.prototype.push.apply(collection[key], objects);
    }

    function deleteFromCollection(collection, key, objects) {
        if (!collection[key]) return;
        objects.forEach(object => {
            const index = collection[key].indexOf(object);
            if (index > -1) {
                collection[key].splice(index, 1);
            }
        });
    }

    function invertObject(object) {
        let map = {};
        Object.entries(object).forEach(([index, collection]) => {
            collection.forEach(item => map[item.name] = parseInt(index, 10));
        });
        return map;
    }

    function filterCollection(collection, key, objects) {
        let filtered = [];
        if (collection[key]) {
            filtered = objects.filter(object => {
                return collection[key].indexOf(object) > -1;
            });
        }
        return filtered;
    }

    function findKey(collection, object) {
        for (const key in collection) {
            if (collection[key].indexOf(object) > -1) {
                return parseInt(key, 10);
            }
        }
    }

    return {
        addToCollection: addToCollection,
        deleteFromCollection: deleteFromCollection,
        filterCollection: filterCollection,
        findKey: findKey,
        invertObject: invertObject,
        toggleElementsDisplay: toggleElementsDisplay
    };
})();
