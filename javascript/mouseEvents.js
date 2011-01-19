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


/**
 * @fileoverview This file contains the mouse event handling methods.
 * @version 2.0
 * @author Ankit Rohatgi
 */

/**
 * List of mouse event types.
 */
var mouseEventType = new Array();

/**
 * List of mouse event functions.
 */
var mouseEventFunction = new Array();

/**
 * To capture or not.
 */
var mouseEventCapture = new Array();

/**
 * Total number of active mouse events.
 */
var mouseEvents = 0;


/**
 * Add a mouse event.
 * @param {String} mouseEv Type of mouse event.
 * @param {function} functionName Name of the method associated 
 * @param {boolean} tf Capture value.
 */
function addMouseEvent(mouseEv, functionName, tf)
{
	var eventExists = false;
	for(var ii = 0; ii < mouseEvents; ii++)
	{
		if ((mouseEv == mouseEventType[ii]) && (functionName == mouseEventFunction[ii]) && (tf == mouseEventCapture[ii]))
		eventExists = true;
	}

	if(eventExists == false)
	{
		canvas.addEventListener(mouseEv, functionName, tf);
		mouseEventType[mouseEvents] = mouseEv;
		mouseEventFunction[mouseEvents] = functionName;
		mouseEventCapture[mouseEvents] = tf;
		mouseEvents = mouseEvents + 1;
	}
}

/**
 * Clear the entire list of active mouse events.
 */
function removeAllMouseEvents()
{
	if(mouseEvents > 0)
	{
		for (var kk = 0; kk < mouseEvents; kk++)
		{
			canvas.removeEventListener(mouseEventType[kk],mouseEventFunction[kk],mouseEventCapture[kk]);
		}
		mouseEvents = 0;
		mouseEventType = [];
		moueEventFunction = [];
		mouseEventCapture = [];
	}
	clearToolbar();
}

/**
 * Remove a particular mouse event.
 * @param {String} mouseEv Type of mouse event.
 * @param {function} functionName Name of the method associated 
 * @param {boolean} tf Capture value.
 */
function removeMouseEvent(mouseEv, functionName, tf)
{
	var eventExists = false;
	var eventIndex = 0;

	for(var ii = 0; ii < mouseEvents; ii++)
	{
		if ((mouseEv == mouseEventType[ii]) && (functionName == mouseEventFunction[ii]) && (tf == mouseEventCapture[ii]))
		{
			eventExists = true;
			eventIndex = ii;
		}
	}
	if(eventExists == true)
	{
		canvas.removeEventListener(mouseEv, functionName, tf);
		mouseEvents = mouseEvents - 1;
		mouseEventType.splice(eventIndex,1);
		mouseEventFunction.splice(eventIndex,1);
		mouseEventCapture.splice(eventIndex,1);
	}
}


