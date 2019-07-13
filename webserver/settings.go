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
