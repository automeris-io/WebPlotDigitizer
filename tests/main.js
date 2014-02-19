var wpd = require('./wpdcore.js');

var plotData = new wpd.PlotData();
var axes = new wpd.XYAxes();
var calibration = new wpd.Calibration();

calibration.addPoint(0,100,0,0);
calibration.addPoint(100,100,1,0);
calibration.addPoint(0,100,0,0);
calibration.addPoint(0,0,0,1);

var isCalibrated = axes.calibrate(calibration, false, false);

if(!isCalibrated) {
    console.error("Calibration failed!");
}

console.log(axes.pixelToData(50,50));
