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

QUnit.module(
    "Graphics widget tests", {
        beforeEach: () => {
            // create graphics container + canvas elements, mirroring the
            // production DOM nesting (#graphicsContainer > #canvasDiv >
            // canvases) so that scroll/CSS-transform-dependent behavior
            // (zoom anchoring, wheel-zoom preview) can be exercised for real
            const graphicsContainer = document.createElement("div");
            graphicsContainer.setAttribute("id", "graphicsContainer");
            graphicsContainer.style.width = "400px";
            graphicsContainer.style.height = "300px";
            graphicsContainer.style.overflow = "auto";
            document.body.appendChild(graphicsContainer);

            const canvasDiv = document.createElement("div");
            canvasDiv.setAttribute("id", "canvasDiv");
            graphicsContainer.appendChild(canvasDiv);

            canvasIDs.forEach((id, index) => {
                canvasDiv.insertAdjacentHTML(
                    "beforeend",
                    `<canvas id="${id}" class="canvasLayers" style="z-index:${index + 1};"></canvas>`
                );
            });

            // default rotation 0
            wpd.graphicsWidget.setRotation(0);

            // stub functions
            sinon
                .stub(wpd.layoutManager, "getGraphicsViewportSize")
                .returns({
                    width: 800,
                    height: 600
                });
        },
        afterEach: () => {
            // remove canvas elements
            canvasIDs.forEach((id) => {
                document.getElementById(id).remove();
            });

            document.getElementById("canvasDiv").remove();
            document.getElementById("graphicsContainer").remove();

            // restore mocks and fakes
            sinon.restore();
        }
    }
);

// consts are also hoisted, defined here for organizational reasons
const canvasIDs = [
    "mainCanvas",
    "dataCanvas",
    "drawCanvas",
    "hoverCanvas",
    "topCanvas",
    "zoomCanvas",
    "zoomCrossHair"
];

// define image for use with testing
const image = new Image();
image.src = "../start.png";

// builds a ctrl/cmd-modified wheel event positioned at the given point,
// expressed in wpd.graphicsWidget.posn()'s coordinate space (CSS px
// relative to #mainCanvas's current on-screen top-left)
function wheelEventAt(pos, deltaY, modifiers = {}) {
    const rect = document.getElementById("mainCanvas").getBoundingClientRect();
    return new WheelEvent("wheel", {
        deltaY,
        clientX: rect.left + pos.x,
        clientY: rect.top + pos.y,
        bubbles: true,
        cancelable: true,
        ctrlKey: !!modifiers.ctrlKey,
        metaKey: !!modifiers.metaKey
    });
}

function dispatchWheel(pos, deltaY, modifiers) {
    const ev = wheelEventAt(pos, deltaY, modifiers);
    document.getElementById("graphicsContainer").dispatchEvent(ev);
    return ev;
}

function assertClose(assert, actual, expected, tolerance, message) {
    assert.ok(
        Math.abs(actual - expected) <= tolerance,
        `${message} (expected ${actual} to be within ${tolerance} of ${expected})`
    );
}

QUnit.test("Load image", (assert) => {
    // load image
    const result = wpd.graphicsWidget.loadImage(image);

    // page info elements hide check
    assert.ok(result, "Image loaded");
});

QUnit.test("Get image pixel coordinates", (assert) => {
    // load image
    wpd.graphicsWidget.loadImage(image);

    const pixel = [0, 0];

    // without rotation
    const results0 = wpd.graphicsWidget.screenToImagePx(...pixel);
    const expected0 = {
        x: 0,
        y: 0
    };
    assert.deepEqual(results0, expected0, "Without rotation");

    // with rotation
    wpd.graphicsWidget.setRotation(90);
    const results1 = wpd.graphicsWidget.screenToImagePx(...pixel);
    const expected1 = {
        x: 0,
        y: 600
    };
    assert.deepEqual(results1, expected1, "With rotation");
});

QUnit.test("Get rotation matrix for canvas", (assert) => {
    // load image
    wpd.graphicsWidget.loadImage(image);

    const degreesToRadians = (d) => d * Math.PI / 180;

    // 0° rotation
    const degrees0 = 0;
    const radians0 = degreesToRadians(degrees0);
    const results0 = wpd.graphicsWidget.getRotationMatrix(degrees0, 800, 600);
    const expected0 = new DOMMatrix([
        Math.cos(radians0),
        Math.sin(radians0),
        -Math.sin(radians0),
        Math.cos(radians0),
        0,
        0,
    ]);
    assert.deepEqual(results0, expected0, "0° rotation");

    // 90° rotation
    const degrees1 = 90;
    const radians1 = degreesToRadians(degrees1);
    const results1 = wpd.graphicsWidget.getRotationMatrix(degrees1, 600, 800);
    const expected1 = new DOMMatrix([
        Math.cos(radians1),
        Math.sin(radians1),
        -Math.sin(radians1),
        Math.cos(radians1),
        800,
        0,
    ]);
    assert.deepEqual(results1, expected1, "90° rotation");

    // 180° rotation
    const degrees2 = 180;
    const radians2 = degreesToRadians(degrees2);
    const results2 = wpd.graphicsWidget.getRotationMatrix(degrees2, 800, 600);
    const expected2 = new DOMMatrix([
        Math.cos(radians2),
        Math.sin(radians2),
        -Math.sin(radians2),
        Math.cos(radians2),
        800,
        600,
    ]);
    assert.deepEqual(results2, expected2, "180° rotation");

    // 270° rotation
    const degrees3 = 270;
    const radians3 = degreesToRadians(degrees3);
    const results3 = wpd.graphicsWidget.getRotationMatrix(degrees3, 600, 800);
    const expected3 = new DOMMatrix([
        Math.cos(radians3),
        Math.sin(radians3),
        -Math.sin(radians3),
        Math.cos(radians3),
        0,
        600,
    ]);
    assert.deepEqual(results3, expected3, "270° rotation");
});

QUnit.test("Get rotated coordinates", (assert) => {
    // load image
    wpd.graphicsWidget.loadImage(image);

    const pixel = [10, 20];

    // 0° rotation
    const results0 = wpd.graphicsWidget.getRotatedCoordinates(0, 0, ...pixel);
    const expected0 = {
        x: 10,
        y: 20
    };
    assert.deepEqual(results0, expected0, "0° rotation");

    // 90° rotation
    const results1 = wpd.graphicsWidget.getRotatedCoordinates(0, 90, ...pixel);
    const expected1 = {
        x: 580,
        y: 10
    };
    assert.deepEqual(results1, expected1, "90° rotation");

    // 180° rotation
    const results2 = wpd.graphicsWidget.getRotatedCoordinates(0, 180, ...pixel);
    const expected2 = {
        x: 790,
        y: 580
    };
    assert.deepEqual(results2, expected2, "180° rotation");

    // 270° rotation
    const results3 = wpd.graphicsWidget.getRotatedCoordinates(0, 270, ...pixel);
    const expected3 = {
        x: 20,
        y: 790
    };
    assert.deepEqual(results3, expected3, "270° rotation");

    // -90° rotation
    const results4 = wpd.graphicsWidget.getRotatedCoordinates(180, 90, ...pixel);
    const expected4 = {
        x: 20,
        y: 790
    };
    assert.deepEqual(results4, expected4, "-90° rotation");

    // -180° rotation
    const results5 = wpd.graphicsWidget.getRotatedCoordinates(270, 90, ...pixel);
    const expected5 = {
        x: 590,
        y: 780
    };
    assert.deepEqual(results5, expected5, "-180° rotation");

    // with counter-clockwise rotation
    const results6 = wpd.graphicsWidget.getRotatedCoordinates(0, 90, ...pixel);
    const expected6 = {
        x: 580,
        y: 10
    };
    assert.deepEqual(results6, expected6, "270° rotation");
});

QUnit.test("Zoom keeps the same image point under a given screen anchor", (assert) => {
    wpd.graphicsWidget.loadImage(image);

    const graphicsContainer = document.getElementById("graphicsContainer");

    // scroll away from the origin first so this can't pass by coincidence
    graphicsContainer.scrollLeft = 100;
    graphicsContainer.scrollTop = 50;

    const anchorPos = {
        x: 150,
        y: 120
    };
    const anchorOffsetX = anchorPos.x - graphicsContainer.scrollLeft;
    const anchorOffsetY = anchorPos.y - graphicsContainer.scrollTop;
    const imageAnchorBefore = wpd.graphicsWidget.screenToImagePx(anchorPos.x, anchorPos.y);

    wpd.graphicsWidget.setZoomRatio(1.5, anchorPos);

    assert.equal(wpd.graphicsWidget.getZoomRatio(), 1.5, "zoom ratio updated");

    // if the anchor point is still under the same spot in the viewport, it
    // should now be at the same (scrollLeft/Top + offset) position
    const postAnchorScreenX = graphicsContainer.scrollLeft + anchorOffsetX;
    const postAnchorScreenY = graphicsContainer.scrollTop + anchorOffsetY;
    const imageAnchorAfter = wpd.graphicsWidget.screenToImagePx(postAnchorScreenX, postAnchorScreenY);

    assertClose(assert, imageAnchorAfter.x, imageAnchorBefore.x, 1, "anchor image x unchanged");
    assertClose(assert, imageAnchorAfter.y, imageAnchorBefore.y, 1, "anchor image y unchanged");
});

QUnit.test("Wheel zoom requires a Ctrl/Cmd modifier", (assert) => {
    wpd.graphicsWidget.loadImage(image);

    const startingRatio = wpd.graphicsWidget.getZoomRatio();
    const ev = dispatchWheel({
        x: 100,
        y: 100
    }, -100, {});

    assert.equal(ev.defaultPrevented, false, "unmodified wheel scroll is not intercepted");
    assert.equal(wpd.graphicsWidget.getZoomRatio(), startingRatio, "zoom ratio unaffected");
    assert.equal(document.getElementById("canvasDiv").style.transform, "", "no preview transform applied");
});

QUnit.test("Ctrl+wheel zoom defers the real commit and coalesces rapid events", (assert) => {
    const clock = sinon.useFakeTimers({
        toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"]
    });

    wpd.graphicsWidget.loadImage(image);
    const startingRatio = wpd.graphicsWidget.getZoomRatio();

    const ev = dispatchWheel({
        x: 100,
        y: 100
    }, -100, {
        ctrlKey: true
    });

    assert.equal(ev.defaultPrevented, true, "page zoom/scroll is prevented");
    assert.equal(wpd.graphicsWidget.getZoomRatio(), startingRatio, "no commit happens synchronously");

    // a second event arriving before the gesture settles should reset the
    // idle timer rather than triggering its own commit
    clock.tick(50);
    dispatchWheel({
        x: 100,
        y: 100
    }, -100, {
        ctrlKey: true
    });
    assert.equal(wpd.graphicsWidget.getZoomRatio(), startingRatio, "still not committed while events keep arriving");

    // let the gesture go idle
    clock.tick(500);

    const expectedRatio = startingRatio * Math.pow(1.05, 1) * Math.pow(1.05, 1);
    assertClose(assert, wpd.graphicsWidget.getZoomRatio(), expectedRatio, 1e-9, "both wheel deltas were applied in one commit");
});

QUnit.test("Ctrl+wheel zoom shows a live CSS preview before committing", (assert) => {
    const clock = sinon.useFakeTimers({
        toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"]
    });

    wpd.graphicsWidget.loadImage(image);
    const startingRatio = wpd.graphicsWidget.getZoomRatio();

    dispatchWheel({
        x: 100,
        y: 100
    }, -100, {
        ctrlKey: true
    });

    // let the (rAF-batched) preview transform apply, but stay well under
    // the idle-commit delay
    clock.tick(20);
    const canvasDiv = document.getElementById("canvasDiv");
    assert.ok(canvasDiv.style.transform.indexOf("scale(") === 0, "a live scale preview is applied");
    assert.equal(wpd.graphicsWidget.getZoomRatio(), startingRatio, "not committed yet");

    // let the gesture settle
    clock.tick(500);
    assert.equal(canvasDiv.style.transform, "", "preview transform cleared after commit");
    assert.notEqual(wpd.graphicsWidget.getZoomRatio(), startingRatio, "zoom ratio committed");
});

QUnit.test("Ctrl+wheel zoom is clamped to the maximum zoom ratio", (assert) => {
    const clock = sinon.useFakeTimers({
        toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"]
    });

    wpd.graphicsWidget.loadImage(image);

    // an enormous delta should still only zoom in as far as the safe ceiling
    dispatchWheel({
        x: 100,
        y: 100
    }, -100000, {
        ctrlKey: true
    });
    clock.tick(500);

    assertClose(assert, wpd.graphicsWidget.getZoomRatio(), wpd.graphicsWidget.getMaxZoomRatio(), 1e-9, "zoom ratio clamped to the max");
});

QUnit.test("Ctrl+wheel zoom is clamped to the minimum zoom ratio", (assert) => {
    const clock = sinon.useFakeTimers({
        toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"]
    });

    wpd.graphicsWidget.loadImage(image);

    // an enormous positive delta (zoom out) should still only zoom out as
    // far as the safe floor, not to an empty/invisible image
    dispatchWheel({
        x: 100,
        y: 100
    }, 100000, {
        ctrlKey: true
    });
    clock.tick(500);

    assertClose(assert, wpd.graphicsWidget.getZoomRatio(), wpd.graphicsWidget.getMinZoomRatio(), 1e-9, "zoom ratio clamped to the min");
});

QUnit.test("setZoomRatio is clamped between the min and max zoom ratios", (assert) => {
    wpd.graphicsWidget.loadImage(image);

    wpd.graphicsWidget.setZoomRatio(0.0000001);
    assertClose(assert, wpd.graphicsWidget.getZoomRatio(), wpd.graphicsWidget.getMinZoomRatio(), 1e-9, "clamped up to the min");

    wpd.graphicsWidget.setZoomRatio(1e9);
    assertClose(assert, wpd.graphicsWidget.getZoomRatio(), wpd.graphicsWidget.getMaxZoomRatio(), 1e-9, "clamped down to the max");
});

QUnit.test("100% zoom is always reachable, even for images smaller than the minimum canvas size", async (assert) => {
    // synthesize an image smaller than MIN_CANVAS_DIMENSION (20px) on both sides
    const tinyCanvas = document.createElement("canvas");
    tinyCanvas.width = 16;
    tinyCanvas.height = 16;
    const tinyImage = new Image();
    await new Promise((resolve) => {
        tinyImage.onload = resolve;
        tinyImage.src = tinyCanvas.toDataURL();
    });

    wpd.graphicsWidget.loadImage(tinyImage);

    assert.equal(wpd.graphicsWidget.getMinZoomRatio(), 1, "the zoom-out floor never exceeds true size");

    wpd.graphicsWidget.zoom100perc();
    assert.equal(wpd.graphicsWidget.getZoomRatio(), 1, "100% is reachable, not clamped up to a larger minimum");
});

QUnit.test("screenToImagePx accounts for an in-progress wheel-zoom preview", (assert) => {
    const clock = sinon.useFakeTimers({
        toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"]
    });

    wpd.graphicsWidget.loadImage(image);

    const queryPos = {
        x: 50,
        y: 40
    };
    const baseline = wpd.graphicsWidget.screenToImagePx(queryPos.x, queryPos.y);

    const deltaY = -100;
    const expectedLivePreviewScale = Math.pow(1.05, 1);
    dispatchWheel({
        x: 100,
        y: 100
    }, deltaY, {
        ctrlKey: true
    });

    // the correction applies as soon as the gesture is registered - it
    // doesn't depend on the (rAF-deferred) CSS transform having painted yet
    const duringPreview = wpd.graphicsWidget.screenToImagePx(queryPos.x, queryPos.y);
    assertClose(assert, duringPreview.x, baseline.x / expectedLivePreviewScale, 1e-9, "x corrected for live preview scale");
    assertClose(assert, duringPreview.y, baseline.y / expectedLivePreviewScale, 1e-9, "y corrected for live preview scale");

    // once committed, the same query should match the newly-committed zoom
    // ratio directly (no further correction needed)
    clock.tick(500);
    const afterCommit = wpd.graphicsWidget.screenToImagePx(queryPos.x, queryPos.y);
    const expectedAfterCommit = {
        x: queryPos.x / wpd.graphicsWidget.getZoomRatio(),
        y: queryPos.y / wpd.graphicsWidget.getZoomRatio()
    };
    assertClose(assert, afterCommit.x, expectedAfterCommit.x, 1e-9, "x matches committed zoom ratio");
    assertClose(assert, afterCommit.y, expectedAfterCommit.y, 1e-9, "y matches committed zoom ratio");
});

QUnit.test("A real zoom mid-gesture cancels the pending wheel-zoom preview", (assert) => {
    const clock = sinon.useFakeTimers({
        toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"]
    });

    wpd.graphicsWidget.loadImage(image);

    dispatchWheel({
        x: 100,
        y: 100
    }, -100, {
        ctrlKey: true
    });
    clock.tick(20);
    assert.notEqual(document.getElementById("canvasDiv").style.transform, "", "preview is active");

    // a real zoom from another source (e.g. the 100% button) interrupts the gesture
    wpd.graphicsWidget.zoom100perc();
    assert.equal(document.getElementById("canvasDiv").style.transform, "", "preview transform cleared immediately");
    assert.equal(wpd.graphicsWidget.getZoomRatio(), 1, "zoom100perc's own ratio wins");

    // the wheel gesture's now-cancelled idle timer must not fire a stale commit later
    clock.tick(500);
    assert.equal(wpd.graphicsWidget.getZoomRatio(), 1, "no stale commit from the interrupted gesture");
});
