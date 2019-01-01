/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

    This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
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

wpd.UndoManager = class {
    constructor() {
        this._actions = [];
        this._actionIndex = 0;
    }

    canUndo() {
        return this._actionIndex > 0 && this._actions.length >= this._actionIndex;
    }

    undo() {
        if (!this.canUndo()) {
            return;
        }
        this._actionIndex--;
        let action = this._actions[this._actionIndex];
        action.undo();
        this.updateUI();
    }

    canRedo() {
        return this._actions.length > this._actionIndex;
    }

    redo() {
        if (!this.canRedo()) {
            return;
        }
        let action = this._actions[this._actionIndex];
        action.execute();
        this._actionIndex++;
        this.updateUI();
    }

    insertAction(action) {
        if (!(action instanceof wpd.ReversibleAction)) {
            console.error("action must be a wpd.ReversibleAction!");
            return;
        }
        if (this.canRedo()) {
            // drop all possible future actions
            this._actions.length = this._actionIndex;
        }
        this._actions.push(action);
        this._actionIndex++;
        this.updateUI();
    }

    clear() {
        this._actions = [];
        this._actionIndex = 0;
        this.updateUI();
    }

    updateUI() {
        // enable/disable undo and redo buttons
        const $undo = document.getElementById("image-editing-undo");
        const $redo = document.getElementById("image-editing-redo");

        if (this.canUndo()) {
            $undo.disabled = false;
        } else {
            $undo.disabled = true;
        }

        if (this.canRedo()) {
            $redo.disabled = false;
        } else {
            $redo.disabled = true;
        }
    }
};