const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  window: {
    minimize: () => ipcRenderer.invoke('win:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('win:toggleMaximize'),
    close: () => ipcRenderer.invoke('win:close'),
  },
  secrets: {
    get: (account) => ipcRenderer.invoke('secrets:get', account),
    set: (account, value) => ipcRenderer.invoke('secrets:set', account, value),
    remove: (account) => ipcRenderer.invoke('secrets:delete', account),
    list: () => ipcRenderer.invoke('secrets:list'),
  }
})