const { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, net } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let widgetWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    show: false,
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Minimize to tray instead of closing
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

function createWidgetWindow() {
  widgetWindow = new BrowserWindow({
    width: 350,
    height: 500,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  widgetWindow.loadURL(
    isDev
      ? 'http://localhost:5173/?widget=true'
      : `file://${path.join(__dirname, '../dist/index.html')}?widget=true`
  );

  widgetWindow.on('blur', () => {
    widgetWindow.hide();
  });
}

function createTray() {
  const { nativeImage } = require('electron');
  const iconBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVDhPY/z//z8D0zAGxmoYAAB7bT7Qe2Oq6QAAAABJRU5ErkJggg==';
  const icon = nativeImage.createFromDataURL(iconBase64);
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Dashboard', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
        app.isQuiting = true;
        app.quit();
    } }
  ]);
  
  tray.setToolTip('Nexus System Monitor');
  tray.setContextMenu(contextMenu);

  tray.on('click', (event, bounds) => {
    if (widgetWindow.isVisible()) {
      widgetWindow.hide();
    } else {
      // Calculate position relative to tray
      const { x, y } = bounds;
      widgetWindow.setPosition(x - 175, y - 510);
      widgetWindow.show();
    }
  });
}

app.on('ready', () => {
  createWindow();
  createWidgetWindow();
  createTray();
  
  // Set auto-start on boot from settings
  const fs = require('fs');
  const settingsPath = path.join(__dirname, '../settings.json');
  let autoStartEnabled = true;
  try {
    if (fs.existsSync(settingsPath)) {
      const settingsData = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (settingsData.autoStart !== undefined) {
        autoStartEnabled = settingsData.autoStart;
      }
    }
  } catch (e) {
    console.error("Error reading settings for auto-start:", e);
  }

  app.setLoginItemSettings({
    openAtLogin: autoStartEnabled,
    path: app.getPath('exe')
  });

  // Global Keyboard Shortcuts
  globalShortcut.register('CommandOrControl+Shift+1', () => {
    // Launch workspace ID 1
    const request = net.request({
      method: 'POST',
      protocol: 'http:',
      hostname: 'localhost',
      port: 8000,
      path: '/api/workspaces/1/launch'
    });
    request.on('response', (response) => {
      console.log(`Shortcut executed, backend returned: ${response.statusCode}`);
    });
    request.on('error', (err) => console.error(err));
    request.end();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
