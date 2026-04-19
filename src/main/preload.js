const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onMessage: (callback) => ipcRenderer.on('mqtt-message', (event, message) => callback(message)),
  onStatusChange: (callback) => ipcRenderer.on('mqtt-status', (event, status) => callback(status)),
  sendMessage: (message) => ipcRenderer.send('mqtt-publish', message),
  connect: (config) => ipcRenderer.send('mqtt-connect', config),
  disconnect: () => ipcRenderer.send('mqtt-disconnect'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings)
});