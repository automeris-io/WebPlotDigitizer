/*
    WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

    Version 2.1

    Copyright 2011 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

/* This file contains image processing functions */

/**
 * @fileoverview Image Processing functions.
 * @version 2.1
 * @author Ankit Rohatgi ankitrohatgi@hotmail.com
 */

/** 
 * Finds differences between two sets of ImageData and returns a difference matrix. 'true' where unmatched, 'false' where pixels match.
 * @params {ImageData} d1 first ImageData
 * @params {ImageData} d2 second ImageData
 */
function findDifference(d1,d2)
{
    var dw = canvasWidth;
    var dh = canvasHeight;
    var diff = new Array();
    
    for (var rowi = 0; rowi < dh; rowi++)
    {
	diff[rowi] = new Array();
	for(var coli = 0; coli < dw; coli++)
	{
	    var index = rowi*4*dw + coli*4;
	    diff[rowi][coli] = false;
	    
	    for(var p = 0; p < 4; p++)
	    {
		if (d1.data[index+p] != d2.data[index+p])
		{
		    diff[rowi][coli] = true;
		}
	    }
	    
	}
    }
    
    return diff;
}

/**
 * Copies pixels based on the difference matrix. 
 */
function copyUsingDifference(copyTo, copyFrom, diff)
{
    var dw = canvasWidth;
    var dh = canvasHeight;
    
    for (var rowi = 0; rowi < dh; rowi++)
    {
	for(var coli = 0; coli < dw; coli++)
	{
	    var index = rowi*4*dw + coli*4;
		    
	    if (diff[rowi][coli] == true)
	   	for(var p = 0; p < 4; p++)
		    copyTo.data[index+p] = copyFrom.data[index+p];
		       
	}
    }
    
    return copyTo;
}

/** 
 * create BW image based on the colors specified.
 */
function colorSelect(imgd, mode, colorRGB, tol)
{
    dw = canvasWidth;
    dh = canvasHeight;
    
    redv = colorRGB[0];
    greenv = colorRGB[1];
    bluev = colorRGB[2];
    
    var seldata = new Array();
    
    for (var rowi=0; rowi < dh; rowi++)
    {
	seldata[rowi] = new Array();
	for(var coli=0; coli < dw; coli++)
	{
	    index = rowi*4*dw + coli*4;
	    ir = imgd.data[index];
	    ig = imgd.data[index+1];
	    ib = imgd.data[index+2];
	    
	    dist = Math.sqrt((ir-redv)*(ir-redv) + (ig-greenv)*(ig-greenv) + (ib+bluev)*(ib+bluev));
	    
	    seldata[rowi][coli] = false;
	    
	    if (mode == 'fg')
	    {
		if (dist <= tol)
		{
		    seldata[rowi][coli] = true;
		}
	    }
	    else if (mode == 'bg')
	    {
		if (dist > tol)
		{
		    seldata[rowi][coli] = true;
		}
	    }
	}
    }
    
    return seldata;
}

/**
 * create BW image based on the colors but only in valid region of difference matrix.
 */
function colorSelectDiff(imgd, mode, colorRGB, tol, diff)
{
    dw = canvasWidth;
    dh = canvasHeight;
    
    redv = colorRGB[0];
    greenv = colorRGB[1];
    bluev = colorRGB[2];
    
    var seldata = new Array();
    
    for (var rowi=0; rowi < dh; rowi++)
    {
	seldata[rowi] = new Array();
	for(var coli=0; coli < dw; coli++)
	{
	    index = rowi*4*dw + coli*4;
	    ir = imgd.data[index];
	    ig = imgd.data[index+1];
	    ib = imgd.data[index+2];
	    
	    dist = Math.sqrt((ir-redv)*(ir-redv) + (ig-greenv)*(ig-greenv) + (ib-bluev)*(ib-bluev));
	    
	    seldata[rowi][coli] = false;
	    
	    if ((mode == 'fg') && (diff[rowi][coli] == 1))
	    {
		if (dist <= tol)
		{
		    seldata[rowi][coli] = true;
		}
	    }
	    else if ((mode == 'bg') && (diff[rowi][coli] == 1))
	    {
		if (dist > tol)
		{
		    seldata[rowi][coli] = true;
		}
	    }
	}
    }
    
    return seldata;
}

/**
 * Populate an ImageData array based on a binary data matrix.
 */
function binaryToImageData(bwdata,imgd)
{
    dw = canvasWidth;
    dh = canvasHeight;
         
    for(var rowi = 0; rowi < dh; rowi++)
    {
	for(var coli = 0; coli < dw; coli++)
	{
	    index = rowi*4*dw + coli*4;
	    if (bwdata[rowi][coli] == false)
	    {
		imgd.data[index] = 255; imgd.data[index+1] = 255; imgd.data[index+2] = 255; imgd.data[index+3] = 255;
	    }
	    else
	    {
		imgd.data[index] = 0; imgd.data[index+1] = 0; imgd.data[index+2] = 0; imgd.data[index+3] = 255;
	    }
	}
    }
    
    return imgd;
}

