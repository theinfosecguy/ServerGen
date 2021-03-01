const path = require('path');
const fs_helper = require('../lib/build_helper');
const fs = require('fs-extra');

const generateMVC = function(folderDir){
    // todo: Create Function for Views & View Engine
    // fs_helper.createDir(folderDir, "views");
    fs_helper.createDir(folderDir, "model");
    fs_helper.createDir(folderDir, "controllers");
    fs_helper.createDir(folderDir, "routes");
}

const generatePackage4Express = function(templatesDir, folderDir){
    let basePath = path.join(templatesDir, "package.json");
    fs_helper.buildFilewithContents(basePath, folderDir, "package.json");
}

const generatePackage4Node = function(){

}

const createExpressApp= function(templatesDir, folderDir){
    let basePath = path.join(templatesDir, "index.js");
    fs_helper.buildFilewithContents(basePath, folderDir, "index.js");
    generateMVC(folderDir);
    generatePackage4Express(templatesDir, folderDir);
    console.log("Express App in making");
}


const createNodeApp = function(templatesDir, folderDir){
    let basePath = path.join(templatesDir, "index.js");
    fs_helper.buildFilewithContents(basePath, folderDir, "index.js");
    generateMVC(folderDir);
    console.log("Node App in making");
}

exports.createExpressApp = createExpressApp;
exports.createNodeApp = createNodeApp;
exports.generateMVC = generateMVC;