import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { execSync } from 'child_process'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    backgroundColor: '#0a000f',
    titleBarStyle: 'hidden',
    backgroundMaterial: 'mica',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ── Window IPC ────────────────────────────────────────────────
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on('window:close', () => mainWindow?.close())
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false)
ipcMain.handle('app:getVersion', () => app.getVersion())

// ── Shell Utilities ───────────────────────────────────────────
ipcMain.handle('shell:openFolder', (_event, path: string) => shell.openPath(path))
ipcMain.handle('shell:openExternal', (_event, url: string) => shell.openExternal(url))

// ── Shell Command Execution ───────────────────────────────────
ipcMain.handle('shell:exec', (_event, command: string, timeoutMs?: number) => {
  try {
    const output = execSync(command, {
      timeout: timeoutMs || 10000,
      encoding: 'utf-8',
      windowsHide: true,
    })
    return { success: true, output: output.trim() }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

// ── TYPHON IPC Bridge (named pipe / socket) ───────────────────
// DAEDALUS registers with TYPHON on startup via stdout signal.
// TYPHON listens for JSON messages on the child process stdio.
ipcMain.handle('typhon:send', (_event, message: object) => {
  try {
    const msg = JSON.stringify({
      source: 'DAEDALUS',
      ...message,
      timestamp: new Date().toISOString(),
    })
    process.stdout.write(msg + '\n')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

// ── App Lifecycle ─────────────────────────────────────────────
app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())

// Signal ready for Typhoon integration
process.stdout.write('DAEDALUS ready\n')
