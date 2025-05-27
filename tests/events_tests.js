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
    "Events tests", {
        afterEach: () => {
            // restore mocks and fakes
            sinon.restore();
        }
    }
);

QUnit.test("Dispatch event, add and remove listener", (assert) => {
    const type = "test";
    const listener = sinon.spy();
    const payload = {
        test: "ing"
    };

    // listen for test event type
    const handler = wpd.events.addListener(type, listener);

    // dispatched event triggered listener, no payload
    wpd.events.dispatch(type);
    assert.true(listener.called, "Listener triggered without payload");

    // dispatched event triggered listener, with payload
    wpd.events.dispatch(type, payload);
    assert.true(listener.calledWith(payload), "Listener triggered with payload");

    // listener removed
    wpd.events.removeListener(type, handler);
    wpd.events.dispatch(type);
    assert.true(listener.calledTwice, "Removed listener not triggered");
});

QUnit.test("Remove multiple listeners", (assert) => {
    const type1 = "test-1";
    const type2 = "test-2";
    const type3 = "test-3";
    const listener1a = sinon.stub();
    const listener1b = sinon.stub();
    const listener2a = sinon.stub();
    const listener2b = sinon.stub();
    const listener3a = sinon.stub();
    const listener3b = sinon.stub();

    // remove all listeners before proceeding
    wpd.events.removeAllListeners();

    // listen for test event type
    wpd.events.addListener(type1, listener1a);
    wpd.events.addListener(type1, listener1b);
    wpd.events.addListener(type2, listener2a);
    wpd.events.addListener(type2, listener2b);
    wpd.events.addListener(type3, listener3a);
    wpd.events.addListener(type3, listener3b);

    // remove all listeners of single event type
    wpd.events.removeAllListeners(type1);
    const expected1 = ["test-2", "test-3"];
    assert.deepEqual(Object.keys(wpd.events.getRegisteredEvents()), expected1, "Listeners removed: Single event type");

    // remove all listeners
    wpd.events.removeAllListeners();
    const expected2 = [];
    assert.deepEqual(Object.keys(wpd.events.getRegisteredEvents()), expected2, "Listeners removed: All");
});
