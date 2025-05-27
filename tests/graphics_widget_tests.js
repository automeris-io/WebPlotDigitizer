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
    "Graphics widget tests", {
        beforeEach: () => {
            // create canvas elements
            const canvasDiv = document.createElement("div");
            canvasDiv.setAttribute("id", "canvasDiv");
            document.body.appendChild(canvasDiv);

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
