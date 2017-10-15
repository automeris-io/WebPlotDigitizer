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
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

// ServerSettings - global server settings
type ServerSettings struct {
	Hostname string
	HTTPPort string
	LogUsage bool
	LogDir   string
}

func main() {
	// read server settings
	file, err := ioutil.ReadFile("settings.json")
	if err != nil {
		log.Fatal("Error reading setting.json")
	}
	var settings ServerSettings
	json.Unmarshal(file, &settings)

	// host the ui frontend
	fs := WPDFileSystem{http.Dir("../app")}
	http.Handle("/", http.FileServer(fs))

	// internal backend API
	http.HandleFunc("/download/text", func(w http.ResponseWriter, r *http.Request) {
		HandleDownload(w, r)
	})

	// log
	http.HandleFunc("/log", func(w http.ResponseWriter, r *http.Request) {
		// collect posted json data
		if r.Method == "POST" {
			CollectLogDataFunc(w, r, settings)
		} else if r.Method == "GET" {
			fmt.Fprintf(w, "%t", settings.LogUsage)
		}
	})

	// start the server
	addr := settings.Hostname + ":" + settings.HTTPPort
	log.Println("Starting server on: ", addr)
	err = http.ListenAndServe(addr, nil)
	if err != nil {
		log.Fatal("Error starting server, exiting!")
	}
}
