const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openSlackApp: () => ipcRenderer.invoke("open-slack-app"),
  openExternalUrl: (url) => ipcRenderer.invoke("open-external-url", url),
  onCreateTabFromPopup: (handler) => {
    ipcRenderer.on("create-tab-from-popup", (_event, url) => handler(url));
  }
});
