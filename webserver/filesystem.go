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
	"net/http"
	"os"
)

// WPDFileSystem - custom file system for WPD
type WPDFileSystem struct {
	fs http.FileSystem
}

// Open - open files
func (fs WPDFileSystem) Open(name string) (http.File, error) {
	file, err := fs.fs.Open(name)
	if err != nil {
		return nil, err
	}

	// prevent listing out directory contents
	stat, err := file.Stat()
	if stat.IsDir() && name != "/" && name != "/tests" {
		return nil, os.ErrNotExist
	}

	return file, nil
}
