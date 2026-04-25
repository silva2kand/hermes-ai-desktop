@echo off
title Hermes AI Desktop
echo Starting Hermes AI Desktop Environment...

:: Start the Vite frontend server in the background
start /B cmd /c "npm run dev"

:: Wait for Vite to compile and start
echo Waiting for frontend server to boot...
timeout /t 3 /nobreak >nul

:: Launch the native Electron app
echo Launching the desktop app...
npm run electron:dev

:: When Electron closes, kill the background Vite process
taskkill /F /IM node.exe /T >nul 2>&1
exit
