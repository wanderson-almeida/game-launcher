import { app, BrowserWindow } from 'electron'
// app: controla o ciclo de vida da aplicação
// BrowserWindow: cria e gerencia janelas do aplicativo

const createWindow = () => {
// carrega a página (html) em uma nova instance do BrowserWindow
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})