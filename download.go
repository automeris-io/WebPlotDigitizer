/*
   WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

   Copyright 2010-2017 Ankit Rohatgi <ankitrohatgi@hotmail.com>

   This file is part of WebPlotDigitizer.

   WebPlotDIgitizer is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   WebPlotDigitizer is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.
*/

package main

import (
	"fmt"
	"log"
	"net/http"
)

// HandleDownload - Handle CSV/JSON downloads
func HandleDownload(w http.ResponseWriter, r *http.Request, fileExt string) {
	if r.Method == "POST" {
		ipAddr := GetIP(r)
		r.ParseForm()
		filename := r.Form.Get("filename")
		log.Printf("Download [%v] from IP [%v]\n", fileExt, ipAddr)

		w.Header().Set("Content-Disposition", "attachment; filename=\""+filename+"."+fileExt+"\"")
		w.Header().Set("Content-Type", r.Header.Get("Content-Type"))
		fmt.Fprintf(w, r.Form.Get("data"))
	}
}
