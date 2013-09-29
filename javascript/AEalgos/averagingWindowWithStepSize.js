/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var averagingWindowWithStepSizeAlgo = {
	getParamList: function () {
			if (plotType === 'XY') {
				return [["X_min","Units",axesAlignmentData[0].toString()],["ΔX Step","Units","0.1"],["X_max","Units",axesAlignmentData[1].toString()],["Y_min","Units",axesAlignmentData[2].toString()],["Y_max","Units",axesAlignmentData[3].toString()],["Line width","Px","30"]];
			} else {
				showPopup('xyAxesOnly');
				return [["X_min","Units", "0"],["ΔX Step","Units","0.1"],["X_max","Units", "0"],["Y_min","Units", "0"],["Y_max","Units", "0"],["Line width","Px","30"]];
			}
		},

	run: function () {

				// NOTE: This only works for XY Plot

				if(plotType === 'XY') {

					var xPointsPicked = 0;
					xyData = [];
					pointsPicked = 0;

			resetLayers();

			var dw = canvasWidth;
			var dh = canvasHeight;

			// Get values from UI:
			var param_xmin_el = document.getElementById("pv0");
			var param_delx_el = document.getElementById("pv1");
			var param_xmax_el = document.getElementById("pv2");
			var param_linewidth_el = document.getElementById("pv5");
			var param_ymin_el = document.getElementById("pv3");
			var param_ymax_el = document.getElementById("pv4");

			var param_xmin = parseFloat(param_xmin_el.value);
			var param_delx = parseFloat(param_delx_el.value);
			var param_xmax = parseFloat(param_xmax_el.value);
			var param_linewidth = parseFloat(param_linewidth_el.value);
			var param_ymin = parseFloat(param_ymin_el.value);
			var param_ymax = parseFloat(param_ymax_el.value);

			var blobx = [];
			var bloby = [];


			// Get corresponding pixels:
			for(var xi = param_xmin; xi <= param_xmax; xi += param_delx) {
				var xmin_pix, xmax_pix, ymin_pix, ymax_pix, dpix, r_unit_per_pix, step_pix = 1;

				dataToPixel(xi, param_ymin, 'XY');
				xmin_pix = dataToPixelxy[0];
				ymin_pix = dataToPixelxy[1];

				dataToPixel(xi, param_ymax, 'XY');
				xmax_pix = dataToPixelxy[0];
				ymax_pix = dataToPixelxy[1];

				dpix = Math.sqrt((ymax_pix-ymin_pix)*(ymax_pix-ymin_pix) + (xmax_pix-xmin_pix)*(xmax_pix-xmin_pix));

				r_unit_per_pix = (param_ymax-param_ymin)/dpix;

				var blobActive = false;
				var blobEntry = 0;
				var blobExit = 0;
				var blobExitLocked = false;

				for(var ii = 0; ii <= dpix; ii++) {
					var yi = -ii*step_pix*r_unit_per_pix + param_ymax;
					dataToPixel(xi, yi, 'XY');

					xi_pix = dataToPixelxy[0];
					yi_pix = dataToPixelxy[1];

					if(xi_pix >= 0 && xi_pix < dw && yi_pix >=0 && yi_pix < dh)	{

						if(binaryData[parseInt(yi_pix, 10)][parseInt(xi_pix, 10)] === true)	{

							if(blobActive === false) {
								blobEntry = ii;
								blobExit = blobEntry;
								blobActive = true;
								blobExitLocked = false;
							}
						} else	{
							if(blobExitLocked === false) {
								blobExit = ii;
								blobExitLocked = true;
							}					
						}

						if(blobActive === true)	{

							if((ii >= blobEntry + param_linewidth) || ((ii <= dpix) && (ii > dpix))) {
								blobActive = false;

								if(blobEntry > blobExit) {
									blobExit = ii;							
								}

								var mean_ii = (blobEntry + blobExit)/2.0;
								var mean_yi = -mean_ii*step_pix*r_unit_per_pix + param_ymax;

								dataToPixel(xi, mean_yi, 'XY');
								xyData[pointsPicked] = new Array();
								xyData[pointsPicked][0] = parseFloat(dataToPixelxy[0]);
								xyData[pointsPicked][1] = parseFloat(dataToPixelxy[1]);
								pointsPicked = pointsPicked + 1;
							}
						}
					}

				}
			}
		} else {
			showPopup('xyAxesOnly');
		}
	}
};
