const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("launcherAPI", {
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  selectDirectoryDialog: () => ipcRenderer.invoke("select-directory-dialog"),
  installExe: (caminho) => ipcRenderer.invoke("install-exe", caminho),
  downloadTorrent: (magnetLink) => ipcRenderer.invoke("download-torrent", magnetLink),
  
  // receber o progresso do donwload do torrent
  onDownloadProgress: (callback) => {
    const subscription = (event, progress) => callback(progress);
    ipcRenderer.on("download-progress", subscription);
    return () => ipcRenderer.removeListener("download-progress", subscription);
  }
});