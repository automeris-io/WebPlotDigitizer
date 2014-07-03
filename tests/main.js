var wpd = require('./wpdcore.js');
var assert = require('assert');

var plotData = new wpd.PlotData();
var axes = new wpd.XYAxes();
var calibration = new wpd.Calibration();

calibration.addPoint(0,100,0,0);
calibration.addPoint(100,100,1,0);
calibration.addPoint(0,100,0,0);
calibration.addPoint(0,0,0,1);

var isCalibrated = axes.calibrate(calibration, false, false);

assert.equal(isCalibrated, true);

var data = axes.pixelToData(50,50);

assert.equal(data[0].toFixed(2), 0.5);
assert.equal(data[1].toFixed(2), 0.5);

console.log("done");

