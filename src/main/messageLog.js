const fs = require("fs");

const path = require('path');
const { app } = require('electron');
const userDataPath = app.getPath('userData');

const MESSAGE_LOG_JSON_FILE = userDataPath + "/messages.json";

let messages = [];


function addMessage(data) {
    messages.push(data);

    fs.writeFileSync(MESSAGE_LOG_JSON_FILE, JSON.stringify(messages));
}

function getLastMessages(count) {
    let result = [];

    let startIndex = messages.length - count;
    startIndex = startIndex < 0 ? 0 : startIndex;


    for (let i = startIndex; i < messages.length; i++) {
        result.push(messages[i]);
    }

    return result;
}

if (fs.existsSync(MESSAGE_LOG_JSON_FILE)) {
    messages = JSON.parse(fs.readFileSync(MESSAGE_LOG_JSON_FILE));
}

module.exports = { addMessage, getLastMessages }