const { app, BrowserWindow } = require('electron');
const path = require('node:path');

const remoteMain = require('@electron/remote/main'); 

remoteMain.initialize(); 
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 1500,
    webPreferences: {
      nodeIntegration:true,
      contextIsolation: false,  
      enableRemoteModule: true, 
    },
    
  });
  remoteMain.enable(mainWindow.webContents);
 
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

};

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
    app.quit();
  }
});

