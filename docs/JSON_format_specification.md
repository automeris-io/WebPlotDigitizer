# WebPlotDigitizer JSON Format Documentation

The JSON format for WebPlotDigitizer (WPD) is based around a single object

# Version 4 JSON Format

The minimum valid JSON for WPD version 4 is below.

```json
{
  "version":[4,2],
  "axesColl":[],
  "datasetColl:[],
  "measurementColl":[]
}
```

## "version"

Version specifies the major and minor version of the file format as a JSON number array.  The current value as of the writing of this document is  `[4,2]`.

## "axesColl"

"axesColl" is an array of objects defining each axis in the file.  Generally, each axis in the file is defined by the following names and values:

* "name" is the string name for the axis as provided by the user.
* "page" is the integer page number within the file.
* "type" is the string type of axis (further details are below).
* "calibrationPoints" are the points used to calibrate the axis.
    * "px" and "py" are the x and y points for calibration in pixel units as a number.
    * "dx", "dy", and "dz" are the calibration values as strings or `null`.
        * Query: I believe that the string must be interpretable as a number or a date, but I'm not certain.
        * Query: For "BarAxes", "dx" values are numbers, not strings.  Is that intentional?
        * Query: For "PolarAxes", "dx" and "dy" are numbers, not strings.  Is that intentional?

Additional names and values are defined within each of the types below.

### "XYAxes" Type

When "type" is "XYAxes", the following additional names are defined:

* "isLogX" and "isLogY" are boolean values indicating if the x and y axis is log-scale or not, respectively.

### "BarAxes" Type

When "type" is "BarAxes", the following additional names are defined:

* "isLog" is a boolean value indicating if the bar is log scale or not.
* "isRotated" is a boolean value indicating if the bar is in the a cardinal (`false`, left/right or up/down) direction or at an angle (`true`).

### "PolarAxes" Type

When "type" is "PolarAxes", the following additional names are defined:

* "isDegrees" is a boolean value indicating if the axes measure degrees (`true`) or radians (`false`).
* "isClockwise" is a boolean value indicating if the axes measure radians in the clockwise (`true`) or counter-clockwise (`false`) direction.
* "isLog" is a boolean value indicating if the R dimension is log scale or not.
* "dx" and "dy" are interpreted as R and theta, respectively.

### "TernaryAxes" Type

When "type" is "TernaryAxes", the following additional name is defined:

* "isRange100" indicating if the range for each side is 0 to 100 (`true`) or 0 to 1 (`false`).
* "dx" and "dy" are numeric zero.
    * Query: "dx" and "dy" appear to be ignored.  Is that correct?

Query: How is an axis being reversed handled?  I do not see it as a flag in the JSON data.

### "MapAxes" type

When "type" is "MapAxes", the following additional names are defined:

* "scaleLength" is the length of the scale between the calibration points.
* "unitString" is the name of the units for the "scaleLength" (e.g. "km", "cm", etc. but it can be any string and it is not limited to valid units)
* "dx" and "dy" are numeric zero and are ignored.

### "ImageAxes" type

When "type" is "ImageAxes", only "name" and "type" are defined and no calibration or other definition exists.

## "datasetColl"

"datasetColl" is a collection of datasets.  Each dataset is associated with an axis.

The dataset objects are made of the following name/value pairs:

* "name" is the string name for the axis as provided by the user.
* "page" is the integer page number within the file.
* "axesName" is the name of the axes associated with the dataset.  It must be a name given in the "name" field for one of the axes defined in "axesColl".
* "metadataKeys" is an empty array or it gives information on the use of the "metadata" in each data point object.
* "data" are a vector of data point objects in the dataset.
    * "x" and "y" are the x and y pixel locations (as numbers) clicked to generate a point.
    * "metadata" is specific to some axis types.  If "metadataKeys" is empty, then "metadata" will not be present.
    * "value" is the value as calculated from the axes.  It is interpreted differently for each axis type.
* "autoDetectionData" is either `null` if no autodetection occurred or information on the auto-detection.
    * Query/Note: I need to fill this in.

### Interpretation of "data"

How to interpret the "data" array is shown below for each axis type.

* "XYAxes"
    * In "value", the first number is the x-value and the second is the y-value.
    * "metadataKeys" are emtpy and "metadata" is not present.
* "BarAxes":
    * In "value", the only number is the size of the bar.
    * "metadataKeys" are `["Label"]` and "metadata" is the label for a bar.
    * Query: For rotated axes, the "value" appears to always be `null`.
* "PolarAxes":
    * In "value", the first number is the R-value and the second is the theta-value.
    * "metadataKeys" are emtpy and "metadata" is not present.
* "TernaryAxes":
    * In "value", the three numbers are the values on the first, second, and third axes.
    * "metadataKeys" are emtpy and "metadata" is not present.
* "MapAxes":
    * In "value", the first number is the horizontal distance in scaled units from the bottom left of the image and the second is vertical distance from the bottom left.
        * Query: Can you confirm that the origin is the bottom left instead of some other location?
    * "metadataKeys" are emtpy and "metadata" is not present.
* "ImageAxes":
    * In "value", the first number is the horizontal distance in pixels from the bottom left of the image and the second is vertical distance from the bottom left.
    * "metadataKeys" are emtpy and "metadata" is not present.

## "measurementColl"

"measurementColl" defines any of the three types of measurement ("Distance", "Angle", or "Area").

Query: Data appears to be handled differently here than in other parts.  Can you please describe the data for each of the types?
