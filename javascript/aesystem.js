/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Version 2.6

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

/**
 * @fileoverview Automatic extraction system.
 * @version 2.5
 * @author Ankit Rohatgi ankitrohatgi@hotmail.com
 */

var loadScript;
/**
 * Loads an external JS file.
 */
function loadJS(jsfile)
{
  if(jsfile != '')
  {
    unloadJS();
    
    loadScript=document.createElement('script');
    loadScript.setAttribute("type","text/javascript");
    loadScript.setAttribute("src", jsfile);
    loadScript.setAttribute("Id","loadedJS");
    loadScript.setAttribute("onerror","alert('Error loading file!');");
    
    if (typeof loadScript!="undefined")
      document.getElementsByTagName("head")[0].appendChild(loadScript);
    else
      alert('Error loading script!');
     
  }
}

function unloadJS()
{
  var getJSelement = document.getElementById('loadedJS');
  if (getJSelement)
    getJSelement.parentNode.removeChild(getJSelement);
}

function AEObject()
{
  this.getParamList = function() {};
  this.run = function() {};
}

