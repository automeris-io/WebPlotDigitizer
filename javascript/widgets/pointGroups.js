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

wpd.pointGroups = (function() {
    const settingsPopupID = "point-group-settings-popup";
    const deleteTuplePopupID = "point-tuple-delete-popup";

    const tableSelector = "#point-group-table";
    const controlsSelector = "#point-groups-controls";
    const displayGroupSelector = "#current-point-group-name";
    const displayTupleSelector = "#current-point-tuple-index";
    const defaultGroupSelector = "#point-group-0";
    const editPointGroupsButtonSelector = "#dataset-edit-point-groups-button";

    let deletedGroupIndexes = [];
    let currentTupleIndex = null;
    let currentGroupIndex = 0;

    let datasetSelectHandler = null;
    window.onload = () => {
        // attach listener on dataset select
        datasetSelectHandler = wpd.events.addListener("wpd.dataset.select", payload => {
            // hide edit point groups button if dataset is associated with a map axes
            const $editPointGroupsButton = document.querySelector(editPointGroupsButtonSelector);
            let axes = wpd.appData.getPlotData().getAxesForDataset(payload.dataset);
            if (axes != null) {
                $editPointGroupsButton.hidden = (axes instanceof wpd.MapAxes);
            }
        });
    };

    function showSettingsPopup() {
        // populate UI with existing point groups
        const dataset = wpd.tree.getActiveDataset();
        const pointGroups = dataset.getPointGroups();
        pointGroups.forEach((name, index) => {
            if (index > 0) {
                // add a row for each except default group
                wpd.pointGroups.addSettingsRow(false, name);
            } else {
                // set input value on default group
                document.querySelector(defaultGroupSelector).value = name;
            }
        });

        wpd.popup.show(settingsPopupID);
    }

    function closeSettingsPopup() {
        wpd.popup.close(settingsPopupID);

        // reset UI
        const $rows = document.querySelector(tableSelector).children;
        // spread the htmlCollection to an array to iterate
        [...$rows].forEach($row => {
            // note: the htmlCollection is live, therefore rowIndex will
            // update on each remove() call
            if ($row.rowIndex > 0) {
                // remove the rest
                $row.remove();
            } else {
                // clear input on default group
                document.querySelector(defaultGroupSelector).value = "";
            }
        });

        // clear deleted indexes
        deletedGroupIndexes = [];
    }

    function showDeleteTuplePopup(yesCallback, noCallback) {
        wpd.okCancelPopup.show(
            wpd.gettext("tuple-delete-title"), wpd.gettext("tuple-delete-text"),
            yesCallback, noCallback,
            wpd.gettext("yes"), wpd.gettext("no")
        );
    }

    function showDeleteGroupPopup(yesCallback, noCallback) {
        wpd.okCancelPopup.show(
            wpd.gettext("group-delete-title"), wpd.gettext("group-delete-text"),
            yesCallback, noCallback,
            wpd.gettext("yes"), wpd.gettext("no")
        );
    }

    function _getRowHTML(index, name) {
        const value = name || "";
        const groupText = wpd.gettext("point-group-group");
        const deleteGroupText = wpd.gettext("point-group-delete-group");

        // html templates
        const labelHTML = `${groupText} <span>${index}</span>: `;
        const inputHTML = `<input id="point-group-${index}" type="text" value="${value}" />`;
        const actionsHTML = `<input type="button" value="${deleteGroupText}" onclick="wpd.pointGroups.deleteSettingsRow(this)" />`;

        return `<tr><td>${labelHTML}</td><td>${inputHTML}</td><td>${actionsHTML}</td></tr>`;
    }

    function addSettingsRow(focus, name) {
        const $table = document.querySelector(tableSelector);
        const nextIndex = $table.lastElementChild.rowIndex + 1;

        // create new input "row"
        const $template = document.createElement("template");
        $template.innerHTML = _getRowHTML(nextIndex, name);

        // append new row
        $table.appendChild($template.content.firstChild);

        // focus on new input
        if (focus) {
            document.querySelector(`#point-group-${nextIndex}`).focus();
        }
    }

    function deleteSettingsRow($el) {
        const $targetRow = $el.closest("tr");

        deletedGroupIndexes.push($targetRow.rowIndex);

        // delete the target row
        $targetRow.remove();

        // re-index all rows
        const $rows = document.querySelector(tableSelector).children;
        // spread the htmlCollection to an array to iterate
        [...$rows].forEach($row => {
            const $cells = $row.children;
            const index = $row.rowIndex;

            $cells[0].querySelector("span").innerText = index;
            $cells[1].querySelector("input").setAttribute("id", `point-group-${index}`);
        });
    }

    function saveSettings() {
        if (deletedGroupIndexes.length > 0) {
            wpd.pointGroups.showDeleteGroupPopup(
                _saveSettings.bind(null, true),
                _saveSettings.bind(null, false)
            );
        } else {
            _saveSettings();
        }
    }

    function _saveSettings(deletePoints) {
        // get existing point groups
        const dataset = wpd.tree.getActiveDataset();
        const pointGroups = dataset.getPointGroups();

        // get new point groups
        const $rows = document.querySelector(tableSelector).children;
        // spread the htmlCollection to an array to iterate
        let newPointGroups = [...$rows].map($row => {
            return $row.querySelector(`#point-group-${$row.rowIndex}`).value;
        });

        // only primary group collected, check for custom name
        if (newPointGroups.length === 1) {
            // no custom name, empty out array
            if (!newPointGroups[0]) {
                newPointGroups = [];
            }

            // hide point group controls
            wpd.pointGroups.hideControls();
        } else if (newPointGroups.length > 1) {
            // display point group controls
            wpd.pointGroups.showControls();
        }

        // handle deleted groups in tuples
        if (deletedGroupIndexes.length > 0) {
            const axes = wpd.tree.getActiveAxes();

            // sort delete group indexes in descending order
            deletedGroupIndexes.sort((a, b) => b - a).forEach(groupIndex => {
                if (deletePoints) {
                    // find all pixel indexes in the group
                    const pixelIndexes = dataset.getPixelIndexesInGroup(groupIndex).sort((a, b) => b - a);

                    // remove all pixels
                    pixelIndexes.forEach(pixelIndex => {
                        if (pixelIndex !== null) {
                            dataset.removePixelAtIndex(pixelIndex);
                            dataset.refreshTuplesAfterPixelRemoval(pixelIndex);
                        }
                    });

                    // refresh UI
                    wpd.graphicsWidget.resetData();
                    wpd.graphicsWidget.forceHandlerRepaint();
                    wpd.dataPointCounter.setCount(dataset.getCount());

                    // dispatch point delete event
                    pixelIndexes.forEach(pixelIndex => {
                        wpd.events.dispatch("wpd.dataset.point.delete", {
                            axes: axes,
                            dataset: dataset,
                            index: pixelIndex
                        });
                    });
                }

                // remove the group from the tuples
                dataset.removePointGroupFromTuples(groupIndex);
            });
        }

        // handle added groups in tuples
        const addedCount = newPointGroups.length + deletedGroupIndexes.length - pointGroups.length;
        if (addedCount > 0) {
            dataset.refreshTuplesAfterGroupAdd(addedCount);
        }

        // set new point group
        dataset.setPointGroups(newPointGroups);

        // clear indexes if settings have just been added
        if (pointGroups.length === 0) {
            currentTupleIndex = null;
            currentGroupIndex = 0;
        }

        // refresh control display
        wpd.pointGroups.refreshControls();

        // close popup
        wpd.pointGroups.closeSettingsPopup();
    }

    function showControls() {
        document.querySelector(controlsSelector).hidden = false;
    }

    function hideControls() {
        document.querySelector(controlsSelector).hidden = true;
    }

    function refreshControls() {
        let name = wpd.tree.getActiveDataset().getPointGroups()[currentGroupIndex];

        if (!name) {
            name = currentGroupIndex === 0 ?
                wpd.gettext("point-group-primary-group") :
                `${wpd.gettext("point-group-group")} ${currentGroupIndex}`;
        }

        let tuple = currentTupleIndex;
        if (currentTupleIndex === null) {
            tuple = `(${wpd.gettext("point-group-new-tuple")})`
        }

        document.querySelector(displayGroupSelector).innerText = name;
        document.querySelector(displayTupleSelector).innerText = tuple;
    }

    function previousGroup() {
        const dataset = wpd.tree.getActiveDataset();

        // do nothing if already at the first group of the first tuple
        if (currentTupleIndex !== 0 || currentGroupIndex !== 0) {
            let previousTupleIndex = -1;
            let previousGroupIndex = -1;

            const tuples = dataset.getAllTuples();
            const startTupleIndex = currentTupleIndex === null ? tuples.length - 1 : currentTupleIndex;
            for (let tupleIndex = startTupleIndex; tupleIndex >= 0; tupleIndex--) {
                const tuple = tuples[tupleIndex];

                // if tuple is ever undefined, assume it has been deleted
                // set pointer to new entry
                if (tuple === undefined) {
                    previousTupleIndex = null;
                    previousGroupIndex = 0;
                    break;
                }

                // start group index search at the end
                let startGroupIndex = tuple.length - 1;
                if (tupleIndex === currentTupleIndex) {
                    // at where tuple search began, exclude current group index
                    startGroupIndex = currentGroupIndex - 1;
                }

                // if start group index is negative, skip to the previous tuple
                if (startGroupIndex > -1) {
                    const groupIndex = tuple.lastIndexOf(null, startGroupIndex);

                    if (groupIndex > -1) {
                        // tuple and group with empty slot identified
                        // set as current tuple and group
                        previousTupleIndex = tupleIndex;
                        previousGroupIndex = groupIndex;
                        break;
                    }
                }
            }

            // stay put if no open slot found
            if (previousTupleIndex !== -1 && previousGroupIndex !== -1) {
                currentTupleIndex = previousTupleIndex;
                currentGroupIndex = previousGroupIndex;
            }
        }

        wpd.pointGroups.refreshControls();
    }

    function nextGroup() {
        const dataset = wpd.tree.getActiveDataset();

        // do nothing if already at a new entry
        if (currentTupleIndex !== null) {
            let nextTupleIndex = -1;
            let nextGroupIndex = -1;

            const tuples = dataset.getAllTuples();
            for (let tupleIndex = currentTupleIndex; tupleIndex < tuples.length; tupleIndex++) {
                const tuple = tuples[tupleIndex];

                // exclude current tuple and group from search
                let startGroupIndex = 0;
                if (tupleIndex === currentTupleIndex) {
                    startGroupIndex = currentGroupIndex + 1;
                }

                const groupIndex = tuple.indexOf(null, startGroupIndex);

                if (groupIndex > -1) {
                    // tuple and group with empty slot identified
                    // set as current tuple and group
                    nextTupleIndex = tupleIndex;
                    nextGroupIndex = groupIndex;
                    break;
                }
            }

            if (nextTupleIndex === -1 && nextGroupIndex === -1) {
                // no open slots, go to new tuple at first group
                currentTupleIndex = null;
                currentGroupIndex = 0;
            } else {
                // open slot found
                currentTupleIndex = nextTupleIndex;
                currentGroupIndex = nextGroupIndex;
            }
        }

        wpd.pointGroups.refreshControls();
    }

    function getCurrentGroupIndex() {
        return currentGroupIndex;
    }

    function setCurrentGroupIndex(groupIndex) {
        currentGroupIndex = groupIndex;
    }

    function getCurrentTupleIndex() {
        return currentTupleIndex;
    }

    function setCurrentTupleIndex(tupleIndex) {
        currentTupleIndex = tupleIndex;
    }

    return {
        showSettingsPopup: showSettingsPopup,
        closeSettingsPopup: closeSettingsPopup,
        addSettingsRow: addSettingsRow,
        deleteSettingsRow: deleteSettingsRow,
        saveSettings: saveSettings,
        previousGroup: previousGroup,
        nextGroup: nextGroup,
        getCurrentGroupIndex: getCurrentGroupIndex,
        setCurrentGroupIndex: setCurrentGroupIndex,
        getCurrentTupleIndex: getCurrentTupleIndex,
        setCurrentTupleIndex: setCurrentTupleIndex,
        showControls: showControls,
        hideControls: hideControls,
        refreshControls: refreshControls,
        showDeleteTuplePopup: showDeleteTuplePopup,
        showDeleteGroupPopup: showDeleteGroupPopup
    };
})();
