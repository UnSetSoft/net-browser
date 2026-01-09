const { app, BrowserWindow, ipcMain, Menu, globalShortcut, webContents, dialog, session, protocol } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    minWidth: 1280,
    height: 800,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      sandbox: true,
    },
    titleBarStyle: "hidden", // macOS Safari style
  });

  //globalShortcut.register("Control+Shift+I", () => { });

  globalShortcut.register("Control+Shift+E", () => {
    win.webContents.openDevTools();
  });

  globalShortcut.register("F12", () => {
    console.log("F12 shortcut blocked for Electron DevTools.");
  });

  win.loadFile(path.join(__dirname, "www/index.html"));

  let moveTimeout;
  win.on('move', () => {
    win.webContents.send('window-drag-state', true);
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
      win.webContents.send('window-drag-state', false);
    }, 200); // 200ms debounce to detect stop
  });
}

app.whenReady().then(() => {
  createWindow();

});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("close-browser", () => {
  app.quit();
});

ipcMain.on("maximize-browser", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win.isMaximized()) {
    win.unmaximize()
    return;
  };
  win.maximize();
});

ipcMain.on("minimize-browser", () => {
  const win = BrowserWindow.getFocusedWindow();
  win.minimize();
})

ipcMain.handle("clear-cache", async () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    await win.webContents.session.clearCache();
    return true;
  }
  return false;
});

ipcMain.handle("clear-cookies", async () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    await win.webContents.session.clearStorageData({ storages: ['cookies'] });
    return true;
  }
  return false;
});


ipcMain.on("open-context-menu", (event, webContentsId) => {
  const menu = Menu.buildFromTemplate([
    {
      label: "DevTools",
      click: () => {
        try {
          const contents = webContents.fromId(webContentsId);
          if (contents) {
            contents.openDevTools();
          }
        } catch (error) {
          console.error("Error opening DevTools:", error);
        }
      }
    },
    {
      label: "Exit",
      click: () => {
        app.quit();
      }
    }
  ]);
  menu.popup();
});

// get errors
app.on("error", (error) => {
  console.error("Error:", error);
});
// Global settings state (in-memory, synced from renderer)
let adBlockEnabled = false;
let downloadPath = app.getPath('downloads');

ipcMain.handle('select-download-folder', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.on('set-download-path', (event, path) => {
  downloadPath = path;
});

ipcMain.on('set-adblock-enabled', (event, enabled) => {
  adBlockEnabled = enabled;
});

let dntEnabled = false;
ipcMain.on('set-dnt-enabled', (event, enabled) => {
  dntEnabled = enabled;
});

const { shell } = require('electron');
ipcMain.on('show-in-folder', (event, filePath) => {
  if (filePath) shell.showItemInFolder(filePath);
});
ipcMain.on('open-path', (event, filePath) => {
  if (filePath) shell.openPath(filePath);
});

ipcMain.handle('get-app-info', () => {
  const pkg = require(path.join(__dirname, 'package.json'));
  return {
    version: pkg.version,
    author: pkg.author,
    appName: pkg.AppName || pkg.productName || pkg.name, // Fallback chain
    chromiumVersion: process.versions.chrome
  };
});

// Configure Session (AdBlock & Downloads)
app.whenReady().then(() => {
  // Register protocol to prevent OS dialogs
  if (!protocol.isProtocolRegistered('browser')) {
    protocol.registerStringProtocol('browser', (request, callback) => {
      callback(''); // Respond with empty string, we handle rendering in React
    });
  }

  // Expanded Ad & Tracker Block List
  // Expanded Ad & Tracker Block List suitable for a "real" implementation
  const adUrls = [
    '*://*.doubleclick.net/*',
    '*://*.googlesyndication.com/*',
    '*://*.googleadservices.com/*',
    '*://*.adtago.s3.amazonaws.com/*',
    '*://*.adnxs.com/*',
    '*://*.ads.google.com/*',
    '*://*.google-analytics.com/*',
    '*://*.facebook.com/tr*',
    '*://*.hotjar.com/*',
    '*://*.criteo.com/*',
    '*://*.moatads.com/*',
    '*://*.taboola.com/*',
    '*://*.outbrain.com/*',
    '*://*.amazon-adsystem.com/*',
    '*://*.scorecardresearch.com/*',
    '*://*.zedo.com/*',
    '*://*.pubmatic.com/*',
    '*://*.openx.net/*',
    '*://*.adroll.com/*',
    '*://*.quantserve.com/*',
    '*://*.rubiconproject.com/*',
    '*://*.chartbeat.com/*',
    '*://*.clicktale.net/*',
    '*://*.clarity.ms/*',
    '*://*.adservice.google.com/*',
    '*://*.adsystem.com/*',
    '*://*.advertising.com/*',
    '*://*.carbonads.net/*',
    '*://*.adligature.com/*',
    '*://*.adcolony.com/*',
    '*://*.admob.com/*',
    '*://*.appsflyer.com/*',
    '*://*.unityads.unity3d.com/*',
    '*://*.applovin.com/*',
    '*://*.vungle.com/*',
    '*://*.ironsource.com/*'
  ];

  session.defaultSession.webRequest.onBeforeRequest({ urls: adUrls }, (details, callback) => {
    if (adBlockEnabled) {
      // console.log(`Blocked ad/tracker: ${details.url}`);
      callback({ cancel: true });
    } else {
      callback({ cancel: false });
    }
  });

  // Inject DNT & GPC Headers
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (dntEnabled) {
      details.requestHeaders['DNT'] = '1';
      details.requestHeaders['Sec-GPC'] = '1'; // Global Privacy Control
    }
    callback({ requestHeaders: details.requestHeaders });
  });

  session.defaultSession.on('will-download', (event, item, webContents) => {
    // If a custom path is set, use it. Otherwise, default behavior asks user or uses default.
    if (downloadPath) {
      item.setSavePath(path.join(downloadPath, item.getFilename()));
    }

    const downloadId = Date.now() + Math.random().toString(36).substr(2, 5);
    const win = BrowserWindow.getAllWindows()[0];

    // Notify renderer: Started
    win?.webContents.send('download-update', [{
      id: downloadId,
      filename: item.getFilename(),
      path: item.getSavePath(),
      totalBytes: item.getTotalBytes(),
      receivedBytes: item.getReceivedBytes(),
      state: 'progressing',
      startTime: Date.now()
    }]);

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        win?.webContents.send('download-update', [{
          id: downloadId,
          filename: item.getFilename(),
          totalBytes: item.getTotalBytes(),
          receivedBytes: item.getReceivedBytes(),
          state: 'interrupted'
        }]);
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          // handle paused
        } else {
          win?.webContents.send('download-update', [{
            id: downloadId,
            filename: item.getFilename(),
            totalBytes: item.getTotalBytes(),
            receivedBytes: item.getReceivedBytes(),
            state: 'progressing'
          }]);
        }
      }
    });

    item.once('done', (event, state) => {
      let finalState = state; // completed, cancelled, interrupted
      win?.webContents.send('download-update', [{
        id: downloadId,
        filename: item.getFilename(),
        path: item.getSavePath(), // path is only valid if completed
        totalBytes: item.getTotalBytes(),
        receivedBytes: item.getReceivedBytes(),
        state: finalState
      }]);
    });
  });
});
