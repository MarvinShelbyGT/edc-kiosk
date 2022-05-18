const {app, BrowserWindow, Menu} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('Démarrage de l\'application...');

let template = []
if (process.platform === 'darwin') {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  })
}

let win;

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}
function createDefaultWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return win;
}
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Recherche de mise à jour...');
})
autoUpdater.on('update-available', (info) => {
  log.info(info)
  sendStatusToWindow('Une mise à jour est disponible.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('pas de mise à jour disponible.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Erreur. ' + err);
  log.error(err)
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Vitesse de téléchargement: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Téléchargé ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
  log.info(log_message)
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Mise à jour téléchargée');
  log.info('Mise à jour téléchargée')
  log.info(info)
  autoUpdater.quitAndInstall()
});
app.on('ready', function() {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createDefaultWindow();
});
app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});
