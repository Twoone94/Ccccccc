import { app, BrowserWindow, ipcMain, nativeImage, shell } from 'electron'
import fs from 'fs'
import path from 'path'
import secrets from './keyStore.cjs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createWindow() {
  const icoPath = path.join(__dirname, '..', 'public', 'image', 'app.ico')
  const pngPath = path.join(__dirname, '..', 'public', 'image', '3247d642-eade-434d-891a-75e0e0a1cc1d.png')
  let iconImg = undefined
  try {
    if (fs.existsSync(icoPath)) iconImg = nativeImage.createFromPath(icoPath)
    else if (fs.existsSync(pngPath)) iconImg = nativeImage.createFromPath(pngPath)
  } catch { void 0 }

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    frame: false,
    backgroundColor: '#121212',
    icon: iconImg,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })

  win.setMinimumSize(1280, 800)
  win.setMenuBarVisibility(false)

  const devPort = process.env.DEV_SERVER_PORT ? String(process.env.DEV_SERVER_PORT) : '5174'
  const devUrl = `http://localhost:${devPort}/`
  win.loadURL(devUrl).catch(() => {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    const isAppUrl = url.startsWith(devUrl) || url.startsWith('file://')
    if (!isAppUrl) { shell.openExternal(url); return { action: 'deny' } }
    return { action: 'allow' }
  })
  win.webContents.on('will-navigate', (event, url) => {
    const isAppUrl = url.startsWith(devUrl) || url.startsWith('file://')
    if (!isAppUrl) { event.preventDefault(); shell.openExternal(url) }
  })

  ipcMain.handle('secrets:get', async (_e, account) => secrets.getSecret(String(account || '')))
  ipcMain.handle('secrets:set', async (_e, account, value) => { await secrets.setSecret(String(account || ''), String(value || '')); return true })
  ipcMain.handle('secrets:delete', async (_e, account) => { await secrets.deleteSecret(String(account || '')); return true })
  ipcMain.handle('secrets:list', async () => secrets.listAccounts())
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

ipcMain.handle('win:minimize', () => { const w = BrowserWindow.getFocusedWindow(); if (w) w.minimize() })
ipcMain.handle('win:toggleMaximize', () => { const w = BrowserWindow.getFocusedWindow(); if (!w) return; if (w.isMaximized()) w.unmaximize(); else w.maximize() })
ipcMain.handle('win:close', () => { const w = BrowserWindow.getFocusedWindow(); if (w) w.close() })

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })