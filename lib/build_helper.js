var path = require('path');
var mkdirp = require('mkdirp');
const fs = require('fs-extra');

var createDir = function(appDir, folderName){
    let dName = path.join(appDir, folderName);
    mkdirp.sync(dName);
}

var buildFilewithContents = function(readFrom, folderDir, fileName){
    // Read file content from the File ( from source dir)
    var fileContent = fs.readFileSync(readFrom, 'utf-8');
    // Write content to the file
    fs.writeFileSync(path.join(folderDir, fileName), fileContent);
}


exports.createDir = createDir;
exports.buildFilewithContents = buildFilewithContents;