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

/* This file contains math functions */

function matrixInverse22(A) // Inverse of a 2x2 matrix
{
  a11 = parseFloat(A[0][0]);
  a12 = parseFloat(A[0][1]);
  a21 = parseFloat(A[1][0]);
  a22 = parseFloat(A[1][1]);
  
  var Ai = new Array();
  Ai[0] = new Array();
  Ai[0][0] = 0.0; Ai[0][1] = 0.0; Ai[1][0] = 0.0; Ai[1][1] = 0.0; 
  
  det = a11*a22 - a12*a21;
  
  if (det != 0)
  {
    Ai[0][0] = a22/det;
    Ai[0][1] = -a12/det;
    Ai[1][0] = -a21/det;
    Ai[1][1] = a22/det;
  }
  
  return Ai;
}

function multiplyAB(A,r1,c1,B,r2,c2) // Multiply two matrices
{
  var P = new Array();
  
  var sumrow = 0;
  
  if(c1 == r2)
  {
    for (var ii = 0; ii < r1; ii++)
    {
      P[ii] = new Array();
      for(var jj = 0; jj < c2; jj++)
      {
	 P[ii][jj] = 0.0;
	 for(var kk = 0; kk < c1; kk++)
	 {
	    P[ii][jj] = P[ii][jj] + parseFloat(A[ii][kk])*parseFloat(B[kk][jj]); // P_ij = A_ik.B_kj in index notation.
	 }
      }
    }
  }
  
  return P;
}

// :TODO: Array and Vector multiplication functions.

function sortMatrix(A,sc) // sort matrix A by column sc
{
}

function pixelToData(pxData)
{
}

function dataToPixel(pdata)
{
}
