var clickHandler = function(e) {
    if(e.mediaType === "image") {
        console.log(encodeURI(e.srcUrl));
        chrome.tabs.create({
            "url" : "http://arohatgi.info/WebPlotDigitizer/app"
        });
    }
};

chrome.contextMenus.create({
    "title":"Send to WebPlotDigitizer",
    "contexts": ["page","image"],
    "onclick": clickHandler
});

