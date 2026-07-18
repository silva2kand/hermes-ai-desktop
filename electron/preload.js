import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getStoreData: (key) => ipcRenderer.invoke('get-store-data', key),
  setStoreData: (key, value) => ipcRenderer.invoke('set-store-data', key, value),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  detectLocalModels: () => ipcRenderer.invoke('detect-local-models'),
  executeTerminalCommand: (cmd) => ipcRenderer.invoke('execute-terminal-command', cmd),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  listDirectory: (dirPath) => ipcRenderer.invoke('list-directory', dirPath),
  getFirstRun: () => ipcRenderer.invoke('get-first-run'),
  setFirstRun: (value) => ipcRenderer.invoke('set-first-run', value),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  removeListener: (channel) => ipcRenderer.removeAllListeners(channel),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  db: {
    getChats: () => ipcRenderer.invoke('db-get-chats'),
    getChat: (id) => ipcRenderer.invoke('db-get-chat', id),
    createChat: (id, title, agent) => ipcRenderer.invoke('db-create-chat', id, title, agent),
    addMessage: (id, chatId, role, content, agent, model) => ipcRenderer.invoke('db-add-message', id, chatId, role, content, agent, model),
    getMemory: () => ipcRenderer.invoke('db-get-memory'),
    createMemory: (id, key, value, source, tags, pinned) => ipcRenderer.invoke('db-create-memory', id, key, value, source, tags, pinned),
    updateMemory: (id, data) => ipcRenderer.invoke('db-update-memory', id, data),
    deleteMemory: (id) => ipcRenderer.invoke('db-delete-memory', id),
    getTerminal: () => ipcRenderer.invoke('db-get-terminal'),
    addTerminal: (command, output) => ipcRenderer.invoke('db-add-terminal', command, output),
  }
});
