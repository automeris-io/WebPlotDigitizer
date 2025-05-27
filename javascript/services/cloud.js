/*
    WebPlotDigitizer - web based chart data extraction software (and more)
    
    Copyright (C) 2025 Ankit Rohatgi

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>
*/

var wpd = wpd || {};

wpd.isOffline = function() {
    return wpd.browserInfo.isElectronBrowser();
};

wpd.isLocalhost = function() {
    return (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "[::1]"
    );
};

wpd.isUserLoggedIn = function() {
    return new Promise((resolve, reject) => {
        fetch("/api/user", {
            method: 'get',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then((response) => {
            if (!response.ok) {
                reject("error fetching user info");
            }
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}

// check if user is logged in on-load
if (!wpd.isOffline() && !wpd.isLocalhost()) {
    wpd.isUserLoggedIn().then(() => {
        console.log("logged in");
    }, (err) => {
        console.log(err);
        window.location = "/login";
    });
}

wpd.getQuotaLimits = function() {
    return new Promise((resolve, reject) => {
        fetch("/api/quota", {
            method: "get",
            credentials: "include",
        }).then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                reject();
            }
        }).then((json) => {
            console.log(json);
            resolve(json);
        }).catch((err) => {
            reject(err);
        });
    });
};

wpd.cloudNewImage = function() {
    return new Promise((resolve, reject) => {
        if (wpd.isOffline()) {
            resolve();
            return;
        }
        fetch("/api/vision/image", {
            method: "post",
            credentials: "include",
        }).then((response) => {
            if (response.ok) {
                resolve();
            } else {
                reject();
            }
        }).catch((err) => {
            reject(err);
        });
    });
};

wpd.CloudProject = class {
    constructor(projectId) {
        this.projectId = projectId;
        this.projectFileList = [];
    }

    setProjectName(projectName) {}

    setSerializedProject(projectData) {}

    addFile(fileName, fileData) {}

    upload() {
        // if there's no projectId, then upload everything
        // if there's a projectId, but no file id for some file, then upload new fileId else update existing file on the cloud
    }

    _fetchProjectFileList() {
        return new Promise((resolve, reject) => {
            fetch("/api/files?projectId=" + this.projectId, {
                method: "get",
                credentials: "include"
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Can not fetch project with ID " + this.projectId);
                }
            }).then((projectFileList) => {
                resolve(projectFileList);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    _downloadFileByPath(filePath) {
        return new Promise((resolve, reject) => {
            fetch("/download/" + filePath, {
                credentials: "include"
            }).then(
                (res) => res.blob()
            ).then(
                (blob) => resolve(blob)
            ).catch(err => reject(err));
        });
    }

    _processFileList(fileList) {
        return new Promise((resolve, reject) => {
            if (fileList == null) {
                reject("This project is empty!");
            } else {
                let downloadedCount = 0;
                for (let fileItem of fileList) {
                    this._downloadFileByPath(fileItem.filePath).then((blob) => {
                        blob.name = fileItem.fileName;
                        this.projectFileList.push({
                            "fileName": fileItem.fileName,
                            "fileId": fileItem.fileId,
                            "filePath": fileItem.filePath,
                            "fileData": blob
                        });
                        downloadedCount++;
                        console.log(fileList);
                        if (downloadedCount == fileList.length) {
                            console.log(downloadedCount);
                            resolve(fileList);
                        }
                    }, (err) => reject(err));
                }
            }
        });
    }

    download() {
        return new Promise((resolve, reject) => {
            this._fetchProjectFileList(this.projectId).then(
                (fileList) => this._processFileList(fileList),
                (err) => reject(err)
            ).then((fileList) => {
                resolve(fileList);
            }, (err) => reject(err));

        });
    }

    getAllProjectImages() {
        let res = [];
        for (let item of this.projectFileList) {
            if (!item.fileName.includes("json")) {
                res.push(item.fileData);
            }
        }
        return res;
    }

    getProjectJSON() {
        return new Promise((resolve, reject) => {
            let found = false;
            for (let item of this.projectFileList) {
                if (item.fileName.includes("wpd.json")) {
                    found = true;
                    item.fileData.text().then((data) => {
                        let parsedData = JSON.parse(data);
                        resolve(parsedData);
                    }).catch(err => reject(err));
                }
            }
            if (!found) {
                reject("project json not found");
            }
        });
    }
};

wpd.CloudPreferences = class {};
