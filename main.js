const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");




function createWindow() {
const win = new BrowserWindow({
  width: 1440,
  height: 960,
  webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    contextIsolation: true,
    nodeIntegration: false,
    webviewTag: true
  }
});




win.loadFile(path.join(__dirname, "index.html"));




win.webContents.on("did-attach-webview", (_event, guest) => {
  guest.setWindowOpenHandler(({ url }) => {
    win.webContents.send("create-tab-from-popup", url);
    return { action: "deny" };
  });
});
}




app.whenReady().then(() => {
createWindow();




app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
});




app.on("window-all-closed", () => {
if (process.platform !== "darwin") {
  app.quit();
}
});




ipcMain.handle("open-slack-app", async () => {
try {
  await shell.openExternal("slack://open");
  return { success: true };
} catch (error) {
  return { success: false, error: error.message };
}
});




ipcMain.handle("open-external-url", async (_event, url) => {
try {
  await shell.openExternal(url);
  return { success: true };
} catch (error) {
  return { success: false, error: error.message };
}
});





