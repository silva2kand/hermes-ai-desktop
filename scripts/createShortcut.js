import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEV_URL = 'http://localhost:5173';
const PRODUCTION_PORT = 4173;

function createShortcut(name, target, outputPath, icon = '') {
  const urlContent = `[InternetShortcut]
URL=${target}
`;

  const batchContent = `@echo off
title ${name}
start "" "${target}"
`;

  const vbsContent = `Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut("${outputPath}")
shortcut.TargetPath = "cmd.exe"
shortcut.Arguments = "/c start ${target}"
shortcut.WorkingDirectory = "${path.dirname(outputPath)}"
shortcut.Description = "${name}"
${icon ? `shortcut.IconLocation = "${icon}"` : ''}
shortcut.Save()
`;

  return { urlContent, batchContent, vbsContent };
}

function createDesktopShortcut() {
  const desktop = path.join(process.env.USERPROFILE || '', 'Desktop');
  const appName = 'Hermes AI Desktop';

  const urlPath = path.join(desktop, `${appName}.url`);
  fs.writeFileSync(urlPath, `[InternetShortcut]\nURL=${DEV_URL}\n`);
  console.log(`Created: ${urlPath}`);

  const batPath = path.join(desktop, `${appName} - Dev.bat`);
  fs.writeFileSync(batPath, `@echo off\nstart "" "http://localhost:5173"\n`);
  console.log(`Created: ${batPath}`);

  return { urlPath, batPath };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createDesktopShortcut();
}

export { createShortcut, createDesktopShortcut };