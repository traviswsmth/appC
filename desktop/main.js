const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
    }
  })

  mainWindow.loadFile('index.html')

  // Escuchar el mensaje desde el proceso de renderizado para cargar la vista de precios
  ipcMain.on('load-prices', () => {
    mainWindow.loadFile('src/index.html')
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
