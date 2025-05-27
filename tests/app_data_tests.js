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

QUnit.module(
    "App data tests", {
        afterEach: () => {
            // restore mocks and fakes
            sinon.restore();
        }
    }
);

QUnit.test("Get plot data", (assert) => {
    // reset
    wpd.appData.reset();

    // put a spy in plot data
    const plotDataSpy = sinon.spy(wpd, "PlotData");

    // new instance case
    wpd.appData.getPlotData();
    assert.true(plotDataSpy.calledOnce, "New instance created");

    // existing instance case
    wpd.appData.getPlotData();
    assert.true(plotDataSpy.calledOnce, "Existing instance returned");

    // reset
    wpd.appData.reset();
});

QUnit.test("Get file manager", (assert) => {
    // put a spy in file manager
    const fileManagerSpy = sinon.spy(wpd, "FileManager");

    // stub out file manager init, we don't need it
    sinon.stub(wpd.FileManager.prototype, "_init");

    // new instance case
    wpd.appData.getFileManager();
    assert.true(fileManagerSpy.calledOnce, "New instance created");

    // existing instance case
    wpd.appData.getFileManager();
    assert.true(fileManagerSpy.calledOnce, "Existing instance returned");
});

QUnit.test("Get undo manager", (assert) => {
    // make sure undo manager is null
    wpd.appData.reset();

    // stub out file manager functions, we don't need them
    sinon.stub(wpd.FileManager.prototype, "_init");
    sinon.stub(wpd.FileManager.prototype, "refreshPageInfo");

    // create a stub page manager instance to control behavior
    const pageManagerStub = sinon.createStubInstance(wpd.PageManager);
    wpd.appData.setPageManager(pageManagerStub);

    // put a spy in undo manager
    const undoManagerSpy = sinon.spy(wpd, "UndoManager");

    // single page image cases
    pageManagerStub.pageCount.returns(1);

    // new undo manager case
    wpd.appData.getUndoManager();
    assert.true(undoManagerSpy.calledOnce, "Single page image new instance");

    // existing undo manager case
    wpd.appData.getUndoManager();
    assert.true(undoManagerSpy.calledOnce, "Single page image existing instance");

    // reset undo manager
    wpd.appData.reset();

    // multiple page image cases
    pageManagerStub.pageCount.returns(2);

    // new undo manager case 1
    pageManagerStub.currentPage.returns(1);
    wpd.appData.getUndoManager();
    assert.true(undoManagerSpy.calledTwice, "Multiple page image new instance 1");

    // new undo manager case 2
    pageManagerStub.currentPage.returns(2);
    wpd.appData.getUndoManager();
    assert.true(undoManagerSpy.calledThrice, "Multiple page image new instance 2");

    // existing undo manager case
    pageManagerStub.currentPage.returns(1);
    wpd.appData.getUndoManager();
    assert.true(undoManagerSpy.calledThrice, "Multiple page image existing instance");

    // clear page manager
    wpd.appData.setPageManager(null);
});

QUnit.test("Axes aligned checker", (assert) => {
    // create a stub to control behavior
    const getAxesCountStub = sinon.stub(wpd.PlotData.prototype, "getAxesCount");

    // > 0 case
    getAxesCountStub.returns(1);
    assert.true(wpd.appData.isAligned(), "> 0 test");

    // 0 case
    getAxesCountStub.returns(0);
    assert.true(!wpd.appData.isAligned(), "0 test");

    // < 0 case
    getAxesCountStub.returns(-1);
    assert.true(!wpd.appData.isAligned(), "< 0 test");

    // null case
    getAxesCountStub.returns(null);
    assert.true(!wpd.appData.isAligned(), "null test");

    // undefined case
    getAxesCountStub.returns(undefined);
    assert.true(!wpd.appData.isAligned(), "undefined test");
});

QUnit.test("Multipage image checker", (assert) => {
    // stub out file manager functions, we don't need them
    sinon.stub(wpd.FileManager.prototype, "_init");
    sinon.stub(wpd.FileManager.prototype, "refreshPageInfo");

    // create a stub page manager instance to control behavior
    const pageManagerStub = sinon.createStubInstance(wpd.PageManager);

    // page manager is null case
    wpd.appData.setPageManager(null);
    assert.true(!wpd.appData.isMultipage(), "No page manager");

    // page manager is non-null case w/ 0 page count
    pageManagerStub.pageCount.returns(0);
    wpd.appData.setPageManager(pageManagerStub);
    assert.true(!wpd.appData.isMultipage(), "Page count 0");

    // page manager is non-null case w/ 1 page count
    pageManagerStub.pageCount.returns(1);
    wpd.appData.setPageManager(pageManagerStub);
    assert.true(!wpd.appData.isMultipage(), "Page count 1");

    // page manager is non-null case w/ 2 page count
    pageManagerStub.pageCount.returns(2);
    wpd.appData.setPageManager(pageManagerStub);
    assert.true(wpd.appData.isMultipage(), "Page count 2");

    // clear page manager
    wpd.appData.setPageManager(null);
});
