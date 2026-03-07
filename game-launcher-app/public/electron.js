import { app, BrowserWindow } from 'electron'
// app: controla o ciclo de vida da aplicação
// BrowserWindow: cria e gerencia janelas do aplicativo

const createWindow = () => {
// carrega a página (html) em uma nova instance do BrowserWindow
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

//tenta carregar a página acessando a url do host do frontend,
//se não conseguir tenta denovo apos 1 segundo
  win.loadURL('http://localhost:5173/').catch(() => {
    setTimeout(() => win.loadURL('http://localhost:5173/'), 1000)
  })
}

app.whenReady().then(() => {
  createWindow()
})