const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Control de Asistencia y Trabajos QR - Planificador Docente',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  let distPath = path.join(__dirname, '..', 'dist', 'index.html');
  if (!fs.existsSync(distPath)) {
    distPath = path.join(app.getAppPath(), 'dist', 'index.html');
  }

  win.loadFile(distPath).catch(err => {
    console.error("Error loading HTML in Electron:", err);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
