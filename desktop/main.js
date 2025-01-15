const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
import { sharedService } from '../src/sharedService';

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false  // Para permitir la comunicación entre renderizador y proceso principal
    }
  })

  // Cargar el archivo HTML de entrada
  mainWindow.loadFile('index.html')

  // Escuchar el mensaje desde el proceso de renderizado para cargar la vista de precios
  ipcMain.on('load-prices', () => {
    mainWindow.loadFile('src/index.html')  // Cargar el archivo de precios
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
