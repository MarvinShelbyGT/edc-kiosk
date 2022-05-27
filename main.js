const {app, BrowserWindow, Menu} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
const dotenv = require('dotenv')
const env = dotenv.config()

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

const name = app.getName();
const version = app.getVersion()

log.info('Démarrage de l\'application ' + name + ' en version ' + version);
//log.info(env.parsed.DATABASE_HOST);

let win;

function createDefaultWindow() {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: true
    }
  });
  win.on('closed', () => {
    win = null;
  });
  win.loadFile(`src/index.html`);
  return win;
}
autoUpdater.on('checking-for-update', () => {
  log.info('Recherche de mise à jour...');
})
autoUpdater.on('update-available', (info) => {
  log.info('Une mise à jour est disponible.');
})
autoUpdater.on('update-not-available', (info) => {
  log.info('Pas de mise à jour disponible.');
})
autoUpdater.on('error', (err) => {
  log.error('Erreur : ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Vitesse de téléchargement: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Téléchargé ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  log.info('Mise à jour téléchargée');
  autoUpdater.quitAndInstall(true, true)
});
app.on('ready', function() {
  // Create the Menu
  createDefaultWindow();
  setInterval(checkUpdate, 60 * 60 * 1000)
});
app.on('window-all-closed', () => {
  app.quit();
});

function checkUpdate() {
  autoUpdater.checkForUpdatesAndNotify()
}
