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

/* This file contains mouse event handling functions */

var mouseEventType = new Array();
var mouseEventFunction = new Array();
var mouseEventCapture = new Array();
var mouseEvents = 0;


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
}

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


