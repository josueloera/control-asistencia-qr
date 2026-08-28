const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { WebSocketServer } = require('ws');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

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

  // Set up WebSocket server
  try {
    const wss = new WebSocketServer({ port: 3000 });
    wss.on('connection', function connection(ws) {
      ws.on('message', function message(data) {
        console.log('Recibido desde celular: %s', data);
        if (win && !win.isDestroyed()) {
          win.webContents.send('qr-scanned', data.toString());
        }
      });
    });
  } catch (err) {
    console.error("WebSocket server error:", err);
  }

  ipcMain.handle('get-local-ip', () => getLocalIp());

  // Determine path to dist/index.html
  const possiblePaths = [
    path.join(__dirname, '..', 'dist', 'index.html'),
    path.join(app.getAppPath(), 'dist', 'index.html')
  ];

  let targetPath = possiblePaths[0];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      targetPath = p;
      break;
    }
  }

  win.loadFile(targetPath).catch(err => {
    console.error("Error loading HTML in Electron:", err);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
