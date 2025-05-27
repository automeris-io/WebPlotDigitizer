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

function inBounds(x, y, imageWidth, imageHeight) {
    if (x >= 0 && x < imageWidth && y >= 0 && y < imageHeight) {
        return true;
    }
    return false;
}

function getBBoxData(bbox, binaryData, imageWidth, imageHeight) {
    let data = new Set();
    let w = bbox.xmax - bbox.xmin;
    for (let y = bbox.ymin; y < bbox.ymax; y++) {
        for (let x = bbox.xmin; x < bbox.xmax; x++) {
            if (inBounds(x, y, imageWidth, imageHeight)) {
                let i = y * imageWidth + x;
                if (binaryData.has(i)) {
                    let bi = (y - bbox.ymin) * w + (x - bbox.xmin);
                    data.add(bi);
                }
            }
        }
    }
    return data;
}

function getMatchScore(templData, sampleData, w, h, stride) {
    /* 
        Implement TM_SQDIFF_NORMED from OpenCV                
            R = t1/sqrt(t2*t3)
            t1 = sum(T_ij*I_ij)
            t2 = sum(T_ij^2)
            t3 = sum(I_ij^2)
    */
    let t1 = 0.0;
    let t2 = 0.0;
    let t3 = 0.0;
    for (let x = 0; x < w; x += stride) {
        for (let y = 0; y < h; y += stride) {
            let idx = y * w + x;
            let Tij = templData.has(idx) ? 1.0 : 0.0;
            let Iij = sampleData.has(idx) ? 1.0 : 0.0;

            t1 += Tij * Iij;
            t2 += Tij ** 2;
            t3 += Iij ** 2;
        }
    }
    let score = (t2 == 0.0 || t3 == 0.0) ? 0.0 : t1 / Math.sqrt(t2 * t3);
    return score;
}

function matchTemplate(templ, matchThreshold, binaryData, imageWidth, imageHeight) {
    const templData = templ.data;
    if (templData == null) {
        return null;
    }
    let w = templ.boundingBox.xmax - templ.boundingBox.xmin;
    let h = templ.boundingBox.ymax - templ.boundingBox.ymin;
    if (w <= 0 || h <= 0) {
        console.log("matchTemplate: invalid bounding box for template", templ);
        return null;
    }

    let matches = [];

    let matchStride = 1;
    let imageStride = 1;
    if (w > 50 && h > 50) {
        matchStride = 2;
    }
    if (w > 100 && h > 100) {
        matchStride = 4;
    }
    if (imageWidth > 1000 && imageHeight > 1000) {
        imageStride = 2;
    }
    if (imageWidth > 2000 && imageHeight > 2000) {
        imageStride = 4;
    }
    console.log("match stride = ", matchStride);
    console.log("image stride = ", imageStride);

    for (let x = 0; x < imageWidth; x += imageStride) {
        for (let y = 0; y < imageHeight; y += imageStride) {
            let sampleBbox = {
                xmin: x,
                ymin: y,
                xmax: x + w,
                ymax: y + h
            };
            let sampleData = getBBoxData(sampleBbox, binaryData, imageWidth, imageHeight);
            if (sampleData.size === 0 || sampleData.size < templData.size / 2) {
                continue;
            }
            let score = getMatchScore(templData, sampleData, w, h, matchStride);
            if (score > matchThreshold) {
                matches.push([x + w / 2, y + h / 2, score, false]);
            }
        }
    }

    // filter matches - find the largest score in (w,h)
    let filteredMatches = [];
    let filteredSet = new Set();
    for (let m of matches) {
        if (m[3] === true) { // point was already considered
            continue;
        }
        let x = m[0];
        let y = m[1];
        let maxScore = m[2];
        m[3] = true;
        let xf = x;
        let yf = y;
        for (let mtest of matches) {
            let xt = mtest[0];
            let yt = mtest[1];
            let scoret = mtest[2];
            if (Math.abs(x - xt) < w / 2 && (Math.abs(y - yt) < h / 2)) {
                if (scoret > maxScore) {
                    maxScore = scoret;
                    xf = xt;
                    yf = yt;
                }
                mtest[3] = true;
            }
        }
        // add to filtered list only if it's never been added
        let i = yf * imageWidth + xf;
        if (!filteredSet.has(i)) {
            filteredSet.add(i);
            filteredMatches.push([xf, yf, maxScore]);
        }
    }
    return filteredMatches;
}

onmessage = function(m) {
    const data = m.data;
    console.log("processing...");
    postMessage(matchTemplate(
        data.templ,
        data.matchThreshold,
        data.binaryData,
        data.imageWidth,
        data.imageHeight
    ));
}
