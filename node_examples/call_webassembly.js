const wpd = require("../app/wpd_node.js").wpd

onWASMLoad = function() {
    wpd.wasmHelper.printVersion();
}
