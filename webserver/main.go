/*
   WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

   Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
	"log"
	"net/http"
)

func main() {
	// read server settings
	settings, err := ReadServerSettings("settings.json")
	if err != nil {
		log.Fatal("Error reading setting.json")
	}

	// host the ui frontend
	fs := WPDFileSystem{http.Dir("../app")}
	http.Handle("/", http.FileServer(fs))

	// logging
	logging, err := InitLogging(settings)
	if err != nil {
		log.Fatal("Error enabling logging: ", err)
	}
	http.Handle("/log", logging)

	// data storage
	storage, err := InitStorage(settings)
	if err != nil {
		log.Fatal(err)
	}
	http.Handle("/storage/", storage)

	// start the server
	addr := settings.Hostname + ":" + settings.HTTPPort
	log.Println("Starting server on: ", addr)
	err = http.ListenAndServe(addr, nil)
	if err != nil {
		log.Fatal("Error starting server, exiting!")
	}
}
