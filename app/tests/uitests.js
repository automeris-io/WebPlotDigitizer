var wpdtests = wpdtests || {};

wpdtests.runTests = function() {
    wpd.popup.show("tests-popup");

    QUnit.module("Basic Test");
    QUnit.test("Basic Test", function(assert) {
        console.log(new Date());
        assert.ok(1 == "1", "ok");
    });
}