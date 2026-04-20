const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const mqtt = require('mqtt');
const fs = require('fs');

const MessageLog = require('./messageLog');
const { addNodeInfo, getSenderName } = require("./nodesData");

app.disableHardwareAcceleration();
app.whenReady().then(createWindow);

let mainWindow;
let mqttClient = null;
let isConnected = false;
let settings = {};

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
    settings = {};
  }
  return settings;
}

function saveSettings(data) {
  try {
    settings = data;
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return false;
  }
}

function showMessage(data, notify = true) {
  const senderName = getSenderName(data.from);
  const text = data.payload.text || '';
  mainWindow?.webContents.send('mqtt-message', { senderId: data.from, sender: senderName, data: data, text: text });

  if (notify && !mainWindow?.isFocused() && Notification.isSupported()) {
    new Notification({
      title: senderName,
      body: text,
      silent: false
    }).show();
  }
}

function connectMQTT(config) {
  if (mqttClient) {
    mqttClient.end();
    mqttClient = null;
  }

  const brokerUrl = config.brokerUrl;
  if (!brokerUrl) {
    sendStatus('disconnected', 'No broker URL');
    return;
  }

  try {
    mqttClient = mqtt.connect(brokerUrl, {
      clientId: 'mqtt-messenger-' + Math.random().toString(16).substr(2, 8),
      reconnectPeriod: 5000,
      connectTimeout: 10000
    });

    mqttClient.on('connect', () => {
      isConnected = true;
      sendStatus('connected');

      if (config.subscribeTopic) {
        mqttClient.subscribe(config.subscribeTopic, (err) => {
          if (err) {
            console.error('Subscribe error:', err);
          }
        });
      }
    });

    mqttClient.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type == "nodeinfo") {
          addNodeInfo(data);
          return;
        }

        if (data.type == "telemetry" || data.type == "position") {
          console.log(data);
          return;
        }


        if (data.type == "text") {

          MessageLog.addMessage(data);
          showMessage(data);
          return;
        }

        console.log(data);
      } catch (e) {
        console.log(e);
      }
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT error:', err);
      isConnected = false;
      sendStatus('disconnected', err.message);
    });

    mqttClient.on('close', () => {
      isConnected = false;
      sendStatus('disconnected');
    });

    mqttClient.on('offline', () => {
      isConnected = false;
      sendStatus('reconnecting');
    });

  } catch (e) {
    console.error('Failed to connect:', e);
    sendStatus('disconnected', e.message);
  }
}

function sendMessage(text, sender, to = 0xFFFFFFFF) {
  if (!mqttClient || !isConnected) {
    return false;
  }

  senderNum = parseInt(sender.substr(1), 16);

  const message = {
    from: senderNum,
    to: to,
    type: "sendtext",
    payload: text,
    channel: 0
  }

  try {
    mqttClient.publish(settings.publishTopic, JSON.stringify(message));
    return true;
  } catch (e) {
    console.error('Failed to publish:', e);
    return false;
  }
}

function sendStatus(status, message = '') {
  mainWindow?.webContents.send('mqtt-status', { status, message });
}

function showMessagesLog() {
  for (let m of MessageLog.getLastMessages(20)) {
    showMessage(m, false);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 600,
    minHeight: 450,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#1a1a2e',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    const savedSettings = loadSettings();
    if (savedSettings.brokerUrl) {
      connectMQTT(savedSettings);
    }
    showMessagesLog();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('window-all-closed', () => {
  if (mqttClient) {
    mqttClient.end();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('get-settings', () => loadSettings());

ipcMain.handle('save-settings', (event, data) => {
  const result = saveSettings(data);
  settings = data;
  if (data.brokerUrl) {
    connectMQTT(data);
  }
  return result;
});

ipcMain.on('mqtt-connect', (event, config) => {
  connectMQTT(config);
});

ipcMain.on('mqtt-disconnect', () => {
  if (mqttClient) {
    mqttClient.end();
    mqttClient = null;
    isConnected = false;
  }
});

ipcMain.on('mqtt-publish', (event, { text, sender }) => {
  sendMessage(text, sender);
});