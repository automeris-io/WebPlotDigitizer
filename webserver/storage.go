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
