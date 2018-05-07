var wpdtest = {};

wpdtest.fetchBlob = function(filename) {
    return new Promise((resolve, reject) => {
        fetch(filename).then(resp => resp.blob()).then((blob) => {
            resolve(blob);
        });
    });
};

wpdtest.fetchJSON = function(filename) {
    return new Promise((resolve, reject) => {
        fetch(filename).then(resp => resp.json()).then(data => {
            resolve(data);
        });
    });
};
