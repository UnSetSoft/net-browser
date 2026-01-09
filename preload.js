const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  CloseBrowser: () => ipcRenderer.send("close-browser"),
  MaximizeBrowser: () => ipcRenderer.send("maximize-browser"),
  MinimizeBrowser: () => ipcRenderer.send("minimize-browser"),
  openContextMenu: (webContentsId) => ipcRenderer.send("open-context-menu", webContentsId),
  clearCache: () => ipcRenderer.invoke("clear-cache"),
  clearCookies: () => ipcRenderer.invoke("clear-cookies"),
  selectDownloadFolder: () => ipcRenderer.invoke("select-download-folder"),
  setDownloadPath: (path) => ipcRenderer.send("set-download-path", path),
  setAdBlockEnabled: (enabled) => ipcRenderer.send("set-adblock-enabled", enabled),
  setDntEnabled: (enabled) => ipcRenderer.send("set-dnt-enabled", enabled),
  getAppInfo: () => ipcRenderer.invoke("get-app-info"),
  onWindowDragChange: (callback) => ipcRenderer.on("window-drag-state", (event, isDragging) => callback(isDragging)),

  // Downloads
  onDownloadUpdate: (callback) => ipcRenderer.on('download-update', (event, data) => callback(data)),
  openPath: (path) => ipcRenderer.send('open-path', path),
  showInFolder: (path) => ipcRenderer.send('show-in-folder', path),
});
