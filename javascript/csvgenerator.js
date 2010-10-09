/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Version 2.0

	Copyright 2010 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

/* This file contains function to generate CSV */

function saveData() // generate the .CSV file
{
		// check if everything was specified
		// transform to proper numbers
		// save data as CSV.
		if(axesPicked ==1 && pointsPicked >= 1) 
		{
			showPopup('csvWindow');
			tarea = document.getElementById('tarea');
			tarea.value = '';
			
			// :TODO: Move data transformation to pickPoints() function so that it's done on the fly.
			
			x1 = xyAxes[1][0] - xyAxes[0][0];
			y1 = -(xyAxes[1][1] - xyAxes[0][1]) ;

			x3 = xyAxes[3][0] - xyAxes[0][0];
			y3 = -(xyAxes[3][1] - xyAxes[0][1]);

			xm = xmax - xmin;
			ym = ymax - ymin;
			
			det = x1*y3 - y1*x3;

			x0 = xmin;
			y0 = ymin;

			for(ii = 0; ii<pointsPicked; ii++)
			{
					xr = xyData[ii][0] - xyAxes[0][0];
					yr = - (xyData[ii][1] - xyAxes[0][1]);
					// find the transform
					xf = (-y1*xm*xr + x1*xm*yr)/det + x0;
					yf = (y3*ym*xr - x3*ym*yr)/det + y0;

					tarea.value = tarea.value + xf + ',' + yf + '\n';
			}
		}
}



