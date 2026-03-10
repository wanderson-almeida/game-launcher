const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("launcherAPI", {
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  installExe: (caminho) => ipcRenderer.invoke("install-exe", caminho),
});