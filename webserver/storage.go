/*
   WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

   Copyright 2010-2021 Ankit Rohatgi <ankitrohatgi@hotmail.com>

   This file is part of WebPlotDigitizer.

   WebPlotDigitizer is free software: you can redistribute it and/or modify
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
	"net/http"
	"path"
)

// Storage - handle data storage
type Storage struct {
	enabled bool
	path    string
}

// InitStorage - initialize storage
func InitStorage(settings *ServerSettings) (*Storage, error) {
	storage := Storage{path: settings.Storage.Path, enabled: settings.Storage.Enabled}
	return &storage, nil
}

// ServeHTTP - HTTP request handler
func (s *Storage) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// only proceed if enabled
	if !s.enabled {
		return
	}

	// only allow GET requests
	if r.Method != "GET" {
		return
	}

	// Path has to follow correct pattern
	cleanURL := path.Clean(r.URL.Path)
	matches, err := path.Match("/storage/project/*.tar", cleanURL)
	if err != nil {
		return
	}
	if !matches {
		return
	}
	_, file := path.Split(cleanURL)
	http.ServeFile(w, r, path.Join(s.path, file))
}
