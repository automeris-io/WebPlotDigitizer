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
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// GetIP - Get IP address from request
func GetIP(r *http.Request) string {
	ipAddr := r.Header.Get("X-Forwarded-For")
	if ipAddr == "" {
		ip, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			return "Unknown"
		}
		return ip
	}
	return ipAddr
}

// Have a separate mutex for each open file
var fileWriteMutex sync.Mutex

func writeJSONData(filePath string, jsonString string) {
	fileWriteMutex.Lock()
	defer fileWriteMutex.Unlock()

	fh, err := os.OpenFile(filePath, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		log.Panicln("Error opening file", filePath)
	}
	defer fh.Close()
	fh.WriteString(string(jsonString))
}

// CollectLogDataFunc - collect JSON data from applications
func CollectLogDataFunc(w http.ResponseWriter, r *http.Request, s ServerSettings) {

	if !s.LogUsage {
		return // logging is disabled in server settings
	}

	// parse JSON
	decoder := json.NewDecoder(r.Body)
	var res map[string]interface{}
	err := decoder.Decode(&res)
	if err != nil {
		return
	}

	// add additional info
	currentTime := time.Now()
	res["Time"] = currentTime
	userip := GetIP(r)
	res["IP"] = userip

	log.Println("Accessed by IP:", userip)

	// create directory if it does not exist:
	if _, err := os.Stat(s.LogDir); os.IsNotExist(err) {
		err = os.MkdirAll(s.LogDir, os.ModePerm)
		if err != nil {
			log.Panicln("Error creating folder", s.LogDir)
			return
		}
	}

	// write json file with today's date, for example, data-20170721.json
	msgJSON, err := json.Marshal(res)
	if err != nil {
		return
	}
	fileName := "data-" + currentTime.Format("20060102") + ".json"
	filePath := filepath.Join(s.LogDir, fileName)
	go writeJSONData(filePath, string(msgJSON)+"\n")
}
