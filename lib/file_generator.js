const path = require('path');
const fs_helper = require('../lib/build_helper');
const fs = require('fs-extra');

const createExpressApp= function(templatesDir, folderDir){
    let basePath = path.join(templatesDir, "index.js");
    fs_helper.buildFilewithContents(basePath, folderDir, "index.js");
}


const createNodeApp = function(templatesDir, folderDir){
    let basePath = path.join(templatesDir, "index.js");
    fs_helper.buildFilewithContents(basePath, folderDir, "index.js");
}

const generateMVC = function(folderDir){
    // todo: Create Function for Views & View Engine
    // fs_helper.createDir(folderDir, "views");
    fs_helper.createDir(folderDir, "model");
    fs_helper.createDir(folderDir, "controllers");
    fs_helper.createDir(folderDir, "routes");
}

exports.createExpressApp = createExpressApp;
exports.createNodeApp = createNodeApp;
exports.generateMVC = generateMVC;