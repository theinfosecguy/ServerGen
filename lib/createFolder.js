var path = require('path');
var mkdirp = require('mkdirp');

var createDir = function(appDir, folderName){
    let dName = path.join(appDir, folderName);
    mkdirp.sync(dName);
}

exports.createDir = createDir;