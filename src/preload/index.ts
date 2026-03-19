import { contextBridge, ipcRenderer } from 'electron'

export interface DaedalusAPI {
  // Window controls
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  windowIsMaximized: () => Promise<boolean>
  getVersion: () => Promise<string>

  // Shell
  openFolder: (path: string) => Promise<void>
  openExternal: (url: string) => Promise<void>
  shellExec: (command: string, timeoutMs?: number) => Promise<{ success: boolean; output?: string; error?: string }>

  // TYPHON integration
  typhonSend: (message: object) => Promise<{ success: boolean; error?: string }>
}

const api: DaedalusAPI = {
  windowMinimize: () => ipcRenderer.send('window:minimize'),
  windowMaximize: () => ipcRenderer.send('window:maximize'),
  windowClose: () => ipcRenderer.send('window:close'),
  windowIsMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  openFolder: (path) => ipcRenderer.invoke('shell:openFolder', path),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  shellExec: (command, timeoutMs) => ipcRenderer.invoke('shell:exec', command, timeoutMs),

  typhonSend: (message) => ipcRenderer.invoke('typhon:send', message),
}

contextBridge.exposeInMainWorld('daedalus', api)

// Extend window type declaration
declare global {
  interface Window {
    daedalus: DaedalusAPI
  }
}
