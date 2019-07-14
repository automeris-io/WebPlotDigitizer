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
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// Logging - keep structured logs
type Logging struct {
	fileWriteMutex sync.Mutex
	enabled        bool
	path           string
}

// InitLogging - Initialize logging
func InitLogging(settings *ServerSettings) (*Logging, error) {
	logging := Logging{enabled: settings.Logging.Enabled, path: settings.Logging.Path}
	return &logging, nil
}

// GetIP - Get IP address from request
func (l *Logging) GetIP(r *http.Request) string {
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

func (l *Logging) writeJSONData(filePath string, jsonString string) {
	l.fileWriteMutex.Lock()
	defer l.fileWriteMutex.Unlock()

	fh, err := os.OpenFile(filePath, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		log.Panicln("Error opening file", filePath)
	}
	defer fh.Close()
	fh.WriteString(string(jsonString))
}

// ServeHTTP - Handle HTTP Requests
func (l *Logging) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	if r.Method == "POST" && l.enabled {
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
		userip := l.GetIP(r)
		res["IP"] = userip

		log.Println("Accessed by IP:", userip)

		// create directory if it does not exist:
		if _, err := os.Stat(l.path); os.IsNotExist(err) {
			err = os.MkdirAll(l.path, os.ModePerm)
			if err != nil {
				log.Panicln("Error creating folder", l.path)
				return
			}
		}

		// write json file with today's date, for example, data-20170721.json
		msgJSON, err := json.Marshal(res)
		if err != nil {
			return
		}
		fileName := "data-" + currentTime.Format("20060102") + ".json"
		filePath := filepath.Join(l.path, fileName)
		go l.writeJSONData(filePath, string(msgJSON)+"\n")
	} else if r.Method == "GET" {
		fmt.Fprintf(w, "%t", l.enabled)
	}
}
