const fs = require("fs");

const path = require('path');
const { app } = require('electron');
const userDataPath = app.getPath('userData');

const MAPS_JSON_FILE = userDataPath + "/nodesData.json";

let nodesMap = {};

function addNodeInfo(data) {
    let payload = data.payload;
    let from = data.from;
    nodesMap[from] = data;

    console.log("addNodeInfo");

    fs.writeFileSync(MAPS_JSON_FILE, JSON.stringify(nodesMap));
}

function getSenderName(from) {
    if (nodesMap.hasOwnProperty(from)) {
        let info = nodesMap[from];
        return info.payload.shortname + ' (' + info.payload.longname + ') !' + from.toString(16);
    }
    return '!' + from.toString(16);
}


if (fs.existsSync(MAPS_JSON_FILE)) {
    nodesMap = JSON.parse(fs.readFileSync(MAPS_JSON_FILE));
}

console.log(MAPS_JSON_FILE);

module.exports = { addNodeInfo, getSenderName }