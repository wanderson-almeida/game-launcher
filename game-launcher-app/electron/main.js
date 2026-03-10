const { app, BrowserWindow } = require("electron");
const path = require("path");
const { registerGameHandlers } = require("./handlers/games");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL("http://localhost:5173").catch(() => {
    setTimeout(() => win.loadURL("http://localhost:5173"), 1000);
  });
}

app.whenReady().then(() => {
  registerGameHandlers();
  createWindow();
});