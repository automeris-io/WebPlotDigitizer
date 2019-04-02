const jimp = require("jimp")
const wpd = require("../app/wpd_node.js").wpd
const fs = require("fs")
const path = require("path")

// ---------- Parameters -----------------------

const imagesPath = "./batch_process_images";
const outputPath = "./batch_process_images/output";
const fileExtension = ".png";
const referenceProjectJSON = "./batch_process_images/reference_project.json";

// ---------------------------------------------

function digitizeImage(file, img) {
    console.log("Reading: " + file);

    // load base project
    let plotData = new wpd.PlotData();
    let serializedPlotData = JSON.parse(fs.readFileSync(referenceProjectJSON, 'utf8'));
    plotData.deserialize(serializedPlotData);
    
    // clear existing datasets and re-run auto-extraction
    for (let ds of plotData.getDatasets()) {
        ds.clearAll();
        let autoDetector = plotData.getAutoDetectionDataForDataset(ds);
        if (autoDetector == null) {
            console.err("missing autodetector for: " + ds.name);
            continue;
        }
        let axes = plotData.getAxesForDataset(ds);
        autoDetector.imageWidth = img.bitmap.width;
        autoDetector.imageHeight = img.bitmap.height;
        autoDetector.generateBinaryData(img.bitmap);
        autoDetector.algorithm.run(autoDetector, ds, axes);
        
        console.log("Points detected: " + ds.getCount());
        
        // export CSV
        let csv = "x,y\n";
        for(let ptIdx = 0; ptIdx < ds.getCount(); ptIdx++) {
            let pt = ds.getPixel(ptIdx);
            let data = axes.pixelToData(pt.x, pt.y);
            csv += data[0] + "," + data[1] + "\n";
        }

        csvfilename = path.join(outputPath, path.basename(file, fileExtension) + "_" + ds.name + ".csv");
        fs.writeFileSync(csvfilename, csv);

    }

    // export JSON specific to this image for later use
    let newSerializedPlotData = JSON.stringify(plotData.serialize());
    fs.writeFileSync(path.join(outputPath, path.basename(file, fileExtension) + "_project.json"), newSerializedPlotData);
}


function doAllImages() {
    // Loop over all files in directory
    fs.readdir(imagesPath, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        
        // loop over all files
        files.forEach(function (file) {
            if (path.extname(file) == fileExtension) {
                // read image
                jimp.read(path.join(imagesPath, file)).then(img => {digitizeImage(file, img)});
            }
        });
    });
}

// read base project, then digitize all images in imagesPath
if (!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath);
}

doAllImages();
