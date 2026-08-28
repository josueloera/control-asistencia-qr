const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getLocalIp: () => ipcRenderer.invoke('get-local-ip'),
  onQrScanned: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('qr-scanned', handler);
    return () => {
      ipcRenderer.removeListener('qr-scanned', handler);
    };
  }
});
