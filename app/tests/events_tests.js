QUnit.module(
    "Events tests",
    {
        afterEach: () => {
            // restore mocks and fakes
            sinon.restore();
        }
    }
);

QUnit.test("Dispatch event, add and remove listener", (assert) => {
    const type = "test-event";
    const listener = sinon.spy();
    const payload = { test: "ing" };

    // listen for test event
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