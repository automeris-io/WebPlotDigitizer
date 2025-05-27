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

var wpd = wpd || {};

wpd.TemplateMatcherBoxTool = class extends wpd.BoundingBoxTool {
    constructor(algo, autoDetector) {
        super();
        this._algo = algo;
        this._autoDetector = autoDetector;
        this._showCenterPoint = true;
    }

    onAttach() {
        super.onAttach();
        document.getElementById('template-selection-box-btn').classList.add('pressed-button');
        const tmpl = this._algo.getLastTemplate();
        if (tmpl != null) {
            this.initBbox(tmpl.originalBoundingBox);
            super._drawCropBox();
        }
    }

    onRemove() {
        this.boundingBoxCompleted();
        super.onRemove();
        document.getElementById('template-selection-box-btn').classList.remove('pressed-button');
    }

    boundingBoxCompleted() {
        if (this._topImageCorner == null) {
            return;
        }
        let bbox = {
            xmin: this._topImageCorner.x,
            ymin: this._topImageCorner.y,
            xmax: this._imagePos.x,
            ymax: this._imagePos.y
        };
        let tmpl = this._algo.extractTemplateFromBBox(this._autoDetector, bbox);
        console.log(tmpl);
    }
};

wpd.TemplateMatcherPointTool = class {
    constructor(algo, autoDetector) {
        this._algo = algo;
        this._autoDetector = autoDetector;
    }

    onMouseClick(ev, pos, imagePos) {
        console.log(imagePos);
        this._algo.setSeedPixel(imagePos);
        // force algo to find a template?
        wpd.graphicsWidget.clearData();
        const tmpl = this._algo.extractTemplate(this._autoDetector);
        console.log(tmpl);
        if (tmpl != null) {
            wpd.graphicsHelper.drawBox(tmpl.boundingBox, "rgb(0,255,0)");
            wpd.graphicsWidget.updateZoomToImagePosn(imagePos.x, imagePos.y);
        }
    }

    onAttach() {
        document.getElementById('template-selection-point-btn').classList.add('pressed-button');
        wpd.graphicsWidget.setRepainter(new wpd.TemplateMatcherRepainter(this._algo, this._mode));
    }

    onRemove() {
        document.getElementById('template-selection-point-btn').classList.remove('pressed-button');
    }
};

wpd.TemplateMatcherRepainter = class {
    constructor(algo, mode) {
        this.painterName = 'templateMatcherRepainter';
        this._algo = algo;
        this._mode = mode;
    }

    drawTemplate() {
        const templ = this._algo.getLastTemplate();
        if (templ != null) {
            wpd.graphicsHelper.drawBox(templ.boundingBox, "rgb(0,255,0)");
        }
    }

    onAttach() {
        wpd.graphicsWidget.resetData();
        this.drawTemplate();
    }

    onRedraw() {
        this.drawTemplate();
    }

    onForcedRedraw() {
        wpd.graphicsWidget.resetData();
        this.drawTemplate();
    }
};
