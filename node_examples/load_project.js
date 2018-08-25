// 
// Need to install npm package called "jimp" first:
// npm install jimp (you may need to install other dependent libs)
//
const jimp = require("jimp")
const wpd = require("../app/wpd_node.js").wpd

jimp.read('../app/start.png').then(img => {
	console.log(img.bitmap.height);
	console.log(img.bitmap.width);

	let plotData = new wpd.PlotData();
	console.log(plotData.serialize());
});

