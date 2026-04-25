const fs = require('fs');
const path = require('path');
const os = require('os');

function createDesktopShortcuts() {
  const desktop = path.join(os.homedir(), 'Desktop');
  const projectDir = path.resolve(__dirname, '..');
  
  // Dev Batch Script (shows console)
  const batchDev = path.join(desktop, 'Hermes AI (Dev Mode).bat');
  const batchContent = `@echo off\ncd /d "${projectDir}"\nnpm run electron:dev\n`;
  fs.writeFileSync(batchDev, batchContent);
  console.log(`[OK] Created: ${batchDev}`);

  // VBScript Launcher (hides console window)
  const vbsLauncher = path.join(desktop, 'Hermes AI.vbs');
  const vbsContent = `Set WshShell = CreateObject("WScript.Shell")\nWshShell.CurrentDirectory = "${projectDir}"\nWshShell.Run "cmd /c npm run electron:dev", 0, false\n`;
  fs.writeFileSync(vbsLauncher, vbsContent);
  console.log(`[OK] Created: ${vbsLauncher}`);

  // Clean up old web-based shortcuts if they exist
  const oldUrl = path.join(desktop, 'HermesAIDesktop.url');
  const oldBat1 = path.join(desktop, 'HermesAIDesktop - Dev.bat');
  const oldBat2 = path.join(desktop, 'HermesAIDesktop.bat');
  
  [oldUrl, oldBat1, oldBat2].forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`[Cleaned] Removed old web shortcut: ${file}`);
    }
  });

  console.log(`\nShortcuts created on Desktop:`);
  console.log(`- Hermes AI.vbs (Double-click to open Hermes silently)`);
  console.log(`- Hermes AI (Dev Mode).bat (Use this if you want to see the logs)`);
}

createDesktopShortcuts();

module.exports = { createDesktopShortcuts };