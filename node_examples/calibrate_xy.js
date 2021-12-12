// Usage:
// node calibrate_xy input_image.png output_project.json output_csv.csv

const jimp = require("jimp")
const wpd = require("../app/wpd_node.js").wpd
const fs = require("fs")
const path = require("path")

async function main() {
    const arguments = process.argv
    const imageFile = arguments[2];
    const outputJSONFile = arguments[3];
    const outputCSVFile = arguments[4];
    console.log(`image file: ${imageFile}, output json: ${outputJSONFile}, output csv: ${outputCSVFile}`);

    // load image file
    let img = await jimp.read(imageFile);
    console.log(`image dimensions: (width: ${img.bitmap.width}, height: ${img.bitmap.height})`);

    // create PlotData object
    let plotData = new wpd.PlotData();

    // calibration
    let calibration = new wpd.Calibration(2);

    // parameter order: (pixel_x, pixel_y, "value_x", "value_y")
    // note: value_x and value_y are to be specified as strings
    calibration.addPoint(100.57, 540.69, "0", "-2"); // X1
    calibration.addPoint(692.42, 540.94, "6", "-2"); // X2
    calibration.addPoint(100.82, 540.44, "0", "-2");  // Y1
    calibration.addPoint(100.33, 60.54, "0", "2");   // Y2


    // XY axes
    let axes = new wpd.XYAxes();
    axes.calibrate(calibration, false, false, false); // calibration, isLogX, isLogY, noRotationCorrection

    // add dataset
    let ds = new wpd.Dataset(2);

    // autodetector setup
    let autoDetectionData = new wpd.AutoDetectionData();
    autoDetectionData.fgColor = [0, 0, 255];

    // to set a mask, specify the set of pixel indices from the image bitmap to consider here:
    // do not set to consider the entire image
    // autoDetectionData.mask = new Set();    

    autoDetectionData.imageWidth = img.bitmap.width;
    autoDetectionData.imageHeight = img.bitmap.height;
    autoDetectionData.generateBinaryData(img.bitmap);

    let algo = new wpd.AveragingWindowAlgo();
    algo.setParams({xStep: 10, yStep: 10});
    algo.run(autoDetectionData, ds, axes);
    autoDetectionData.algorithm = algo;
    console.log(`number of points detected = ${ds.getCount()}`);

    
    // add to plot data
    plotData.addAxes(axes);
    plotData.addDataset(ds);
    plotData.setAxesForDataset(ds, axes);
    plotData.setAutoDetectionDataForDataset(ds, autoDetectionData);

    // save project
    let serializedProject = JSON.stringify(plotData.serialize());
    fs.writeFileSync(outputJSONFile, serializedProject);

    // save csv
    let csv = "x,y\n";
    for (let pi = 0; pi < ds.getCount(); pi++) {
        let pt = ds.getPixel(pi);
        let data = axes.pixelToData(pt.x, pt.y);
        csv += data[0] + "," + data[1] + "\n";
    }
    fs.writeFileSync(outputCSVFile, csv);
}

main();