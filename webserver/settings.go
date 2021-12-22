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
	"encoding/json"
	"io/ioutil"
)

// ServerSettings - global server settings
type ServerSettings struct {
	Hostname string `json:"hostname"`
	HTTPPort string `json:"port"`
	Logging  struct {
		Enabled bool   `json:"enabled"`
		Path    string `json:"path"`
	} `json:"logging"`
	Storage struct {
		Enabled bool   `json:"enabled"`
		Path    string `json:"path"`
	} `json:"storage"`
}

// ReadServerSettings - Read server settings from a json file
func ReadServerSettings(jsonFile string) (*ServerSettings, error) {
	file, err := ioutil.ReadFile(jsonFile)
	if err != nil {
		return nil, err
	}
	var settings ServerSettings
	err = json.Unmarshal(file, &settings)
	if err != nil {
		return nil, err
	}
	return &settings, nil
}
