/*
    WebPlotDigitizer - web based chart data extraction software (and more)

    Copyright (C) 2026 Ankit Rohatgi

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

QUnit.module("UndoManager tests", {
    afterEach: () => {
        sinon.restore();
    }
});

function makeTestAction() {
    const action = new wpd.ReversibleAction();
    action.execute = sinon.stub();
    action.undo = sinon.stub();
    return action;
}

function makeManager() {
    const manager = new wpd.UndoManager();
    sinon.stub(manager, "updateUI"); // suppress DOM button manipulation
    return manager;
}

QUnit.test("Initial state: nothing to undo or redo", (assert) => {
    const manager = makeManager();
    assert.false(manager.canUndo(), "canUndo() is false initially");
    assert.false(manager.canRedo(), "canRedo() is false initially");
});

QUnit.test("After insertAction: can undo, cannot redo", (assert) => {
    const manager = makeManager();
    manager.insertAction(makeTestAction());
    assert.true(manager.canUndo(), "canUndo() is true after insert");
    assert.false(manager.canRedo(), "canRedo() is false after insert");
});

QUnit.test("After undo: cannot undo, can redo; action.undo() was called", (assert) => {
    const manager = makeManager();
    const action = makeTestAction();
    manager.insertAction(action);
    manager.undo();
    assert.false(manager.canUndo(), "canUndo() is false after undo");
    assert.true(manager.canRedo(), "canRedo() is true after undo");
    assert.true(action.undo.calledOnce, "action.undo() was called");
});

QUnit.test("After redo: can undo, cannot redo; action.execute() was called", (assert) => {
    const manager = makeManager();
    const action = makeTestAction();
    manager.insertAction(action);
    manager.undo();
    manager.redo();
    assert.true(manager.canUndo(), "canUndo() is true after redo");
    assert.false(manager.canRedo(), "canRedo() is false after redo");
    assert.true(action.execute.calledOnce, "action.execute() was called");
});

QUnit.test("insertAction during redo sequence drops forward history", (assert) => {
    const manager = makeManager();
    manager.insertAction(makeTestAction());
    manager.insertAction(makeTestAction());
    manager.undo(); // now one redo available
    assert.true(manager.canRedo(), "can redo before branch");
    manager.insertAction(makeTestAction()); // new branch
    assert.false(manager.canRedo(), "canRedo() is false after branching insert");
});

QUnit.test("clear() resets all state", (assert) => {
    const manager = makeManager();
    manager.insertAction(makeTestAction());
    manager.insertAction(makeTestAction());
    manager.clear();
    assert.false(manager.canUndo(), "canUndo() is false after clear");
    assert.false(manager.canRedo(), "canRedo() is false after clear");
});

QUnit.test("undo/redo on empty manager does nothing", (assert) => {
    const manager = makeManager();
    manager.undo(); // should not throw
    manager.redo(); // should not throw
    assert.false(manager.canUndo(), "canUndo() still false");
    assert.false(manager.canRedo(), "canRedo() still false");
});
