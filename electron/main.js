import { app, BrowserWindow, shell, ipcMain, Menu, Tray, nativeImage, globalShortcut } from 'electron';
import updaterPkg from 'electron-updater';
const { autoUpdater } = updaterPkg;
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import fs from 'fs';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';
const isWindows = process.platform === 'win32';

const schema = {
  windowState: {
    type: 'object',
    properties: {
      width: { type: 'number' },
      height: { type: 'number' },
      x: { type: 'number' },
      y: { type: 'number' },
      isMaximized: { type: 'boolean' }
    }
  },
  settings: { type: 'object' },
  firstRun: { type: 'boolean', default: true }
};

const store = new Store({ schema });

let mainWindow = null;
let tray = null;
let updateChecker = null;

const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args)
};

function createWindow() {
  logger.info('Creating main window...');
  const savedState = store.get('windowState', {});
  const defaultWidth = 1400;
  const defaultHeight = 900;
  
  const windowOptions = {
    width: savedState.width || defaultWidth,
    height: savedState.height || defaultHeight,
    x: savedState.x,
    y: savedState.y,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0d1117',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 12 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    frame: false,
    show: false
  };

  if (savedState.isMaximized) {
    windowOptions.maximized = true;
  }

  mainWindow = new BrowserWindow(windowOptions);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (savedState.isMaximized) {
      mainWindow.maximize();
    }
  });

  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowState', {
      ...savedState,
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: mainWindow.isMaximized()
    });
  });

  mainWindow.on('close', (e) => {
    if (store.get('trayOnClose', true)) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  createMenu();
  createTray();
  registerShortcuts();

  if (!isDev) {
    setupAutoUpdate();
  }

  logger.info('Main window created successfully');
}

function createMenu() {
  const template = [
    {
      label: 'Hermes AI',
      submenu: [
        { label: 'About Hermes AI', role: 'about' },
        { type: 'separator' },
        { label: 'Preferences...', accelerator: 'CmdOrCtrl+,', click: () => {
          mainWindow.webContents.send('open-settings');
        }},
        { type: 'separator' },
        { label: 'Services', role: 'services' },
        { type: 'separator' },
        { label: 'Hide Hermes AI', accelerator: 'CmdOrCtrl+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'CmdOrCtrl+Shift+H', role: 'hideOthers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit Hermes AI', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'File',
      submenu: [
        { label: 'New Chat', accelerator: 'CmdOrCtrl+N', click: () => {
          mainWindow.webContents.send('new-chat');
        }},
        { label: 'New Window', accelerator: 'CmdOrCtrl+Shift+N', click: () => createWindow() },
        { type: 'separator' },
        { label: 'Save Chat...', accelerator: 'CmdOrCtrl+S' },
        { label: 'Export Chat...' },
        { type: 'separator' },
        { label: 'Close Window', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', click: () => mainWindow.webContents.reload() },
        { label: 'Toggle Developer Tools', accelerator: isWindows ? 'Ctrl+Shift+I' : 'CmdOrCtrl+Alt+I' },
        { type: 'separator' },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => mainWindow.webContents.setZoomLevel(0) },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: () => mainWindow.webContents.zoomLevel += 0.5 },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => mainWindow.webContents.zoomLevel -= 0.5 },
        { type: 'separator' },
        { label: 'Toggle Full Screen', accelerator: isWindows ? 'F11' : 'Ctrl+Cmd+F' },
        { label: 'Always on Top', type: 'checkbox', checked: store.get('settings.alwaysOnTop', false), click: (item) => {
          mainWindow.setAlwaysOnTop(item.checked);
          store.set('settings.alwaysOnTop', item.checked);
        }}
      ]
    },
    {
      label: 'Agent',
      submenu: [
        { label: 'General Hermes', accelerator: 'CmdOrCtrl+1', click: () => {
          mainWindow.webContents.send('set-agent', 'general');
        }},
        { label: 'Coding Hermes', accelerator: 'CmdOrCtrl+2', click: () => {
          mainWindow.webContents.send('set-agent', 'coding');
        }},
        { label: 'Legal Hermes', accelerator: 'CmdOrCtrl+3', click: () => {
          mainWindow.webContents.send('set-agent', 'legal');
        }},
        { label: 'Accounting Hermes', accelerator: 'CmdOrCtrl+4', click: () => {
          mainWindow.webContents.send('set-agent', 'accounting');
        }},
        { label: 'Web Hermes', accelerator: 'CmdOrCtrl+5', click: () => {
          mainWindow.webContents.send('set-agent', 'web');
        }},
        { type: 'separator' },
        { label: 'New Chat', accelerator: 'CmdOrCtrl+N', click: () => {
          mainWindow.webContents.send('new-chat');
        }}
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Zoom', role: 'zoom' },
        { type: 'separator' },
        { label: 'Bring All to Front', role: 'front' }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        { label: 'Documentation', click: () => shell.openExternal('https://hermes-ai.dev/docs') },
        { label: 'GitHub Repository', click: () => shell.openExternal('https://github.com/hermes-ai/desktop') },
        { label: 'Report Issue', click: () => shell.openExternal('https://github.com/hermes-ai/desktop/issues') },
        { type: 'separator' },
        { label: 'Check for Updates...', click: () => autoUpdater.checkForUpdates() }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createTray() {
  const iconPath = path.join(__dirname, '../build/icon.png');
  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Hermes AI', click: () => mainWindow.show() },
    { label: 'New Chat', click: () => {
      mainWindow.show();
      mainWindow.webContents.send('new-chat');
    }},
    { type: 'separator' },
    { label: 'Quick Note', click: () => {
      mainWindow.show();
      mainWindow.webContents.send('quick-note');
    }},
    { type: 'separator' },
    { label: 'Quit Hermes AI', click: () => {
      updateChecker && clearInterval(updateChecker);
      app.quit();
    }}
  ]);

  tray.setToolTip('Hermes AI Desktop');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow.show();
  });
}

function registerShortcuts() {
  const hotkey = store.get('settings.globalHotkey', 'Ctrl+Shift+H');
  globalShortcut.register(hotkey, () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.focus();
    }
  });
  globalShortcut.register('CmdOrCtrl+Shift+A', () => {
    mainWindow.webContents.send('toggle-popup');
  });
}

function setupAutoUpdate() {
  logger.info('Setting up auto-update...');
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for updates...');
  });
  autoUpdater.on('update-available', (info) => {
    logger.info('Update available:', info);
    mainWindow.webContents.send('update-available', info);
  });
  autoUpdater.on('update-not-available', () => {
    logger.info('No updates available');
  });
  autoUpdater.on('error', (err) => {
    logger.error('Auto-update error:', err);
  });
  autoUpdater.on('download-progress', (progress) => {
    logger.info('Download progress:', progress);
    mainWindow.webContents.send('update-progress', progress);
  });
  autoUpdater.on('update-downloaded', (info) => {
    logger.info('Update downloaded:', info);
    mainWindow.webContents.send('update-downloaded', info);
  });

  updateChecker = setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 60 * 60 * 1000);
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 10000);
}

ipcMain.handle('get-store-data', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-data', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('get-settings', () => {
  return store.get('settings', {});
});

ipcMain.handle('update-settings', (event, settings) => {
  store.set('settings', { ...store.get('settings', {}), ...settings });
  return true;
});

ipcMain.handle('execute-terminal-command', (event, cmd) => {
  return new Promise((resolve) => {
    try {
      exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          resolve({ type: 'error', content: stderr || error.message });
        } else {
          resolve({ type: 'output', content: stdout });
        }
      });
    } catch (error) {
      resolve({ type: 'error', content: error.message });
    }
  });
});

ipcMain.handle('read-file', (event, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('write-file', (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('list-directory', (event, dirPath) => {
  try {
    return fs.readdirSync(dirPath);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-first-run', () => {
  return store.get('firstRun', true);
});

ipcMain.handle('set-first-run', (event, value) => {
  store.set('firstRun', value);
  return true;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (store.get('trayOnClose', true)) {
    } else {
      app.quit();
    }
  }
});

app.on('before-quit', () => {
  updateChecker && clearInterval(updateChecker);
  globalShortcut.unregisterAll();
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

ipcMain.handle('download-update', () => {
  autoUpdater.downloadUpdate();
  return true;
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

// Database IPC handlers
import * as db from './database.js';

ipcMain.handle('db-get-chats', async () => await db.getChats());
ipcMain.handle('db-get-chat', async (_, id) => await db.getChat(id));
ipcMain.handle('db-create-chat', async (_, id, title, agent) => await db.createChat(id, title, agent));
ipcMain.handle('db-add-message', async (_, id, chatId, role, content, agent, model) => await db.addMessage(id, chatId, role, content, agent, model));
ipcMain.handle('db-get-memory', async () => await db.getMemoryEntries());
ipcMain.handle('db-create-memory', async (_, id, key, value, source, tags, pinned) => await db.createMemoryEntry(id, key, value, source, tags, pinned));
ipcMain.handle('db-update-memory', async (_, id, data) => await db.updateMemoryEntry(id, data));
ipcMain.handle('db-delete-memory', async (_, id) => await db.deleteMemoryEntry(id));
ipcMain.handle('db-get-terminal', async () => await db.getTerminalHistory());
ipcMain.handle('db-add-terminal', async (_, command, output) => await db.addTerminalHistory(command, output));
