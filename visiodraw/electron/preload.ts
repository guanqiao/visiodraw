import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 对话框
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (options?: { defaultPath?: string; filters?: any[] }) =>
    ipcRenderer.invoke('dialog:saveFile', options),
  exportFile: (options?: { defaultPath?: string; filters?: any[] }) =>
    ipcRenderer.invoke('dialog:exportFile', options),

  // 菜单事件监听
  onMenuNewFile: (callback: () => void) =>
    ipcRenderer.on('menu-new-file', callback),
  onMenuOpenFile: (callback: () => void) =>
    ipcRenderer.on('menu-open-file', callback),
  onMenuSaveFile: (callback: () => void) =>
    ipcRenderer.on('menu-save-file', callback),
  onMenuExportPdf: (callback: () => void) =>
    ipcRenderer.on('menu-export-pdf', callback),
  onMenuExportPng: (callback: () => void) =>
    ipcRenderer.on('menu-export-png', callback),
  onMenuUndo: (callback: () => void) => ipcRenderer.on('menu-undo', callback),
  onMenuRedo: (callback: () => void) => ipcRenderer.on('menu-redo', callback),
  onMenuCopy: (callback: () => void) => ipcRenderer.on('menu-copy', callback),
  onMenuPaste: (callback: () => void) =>
    ipcRenderer.on('menu-paste', callback),
  onMenuDelete: (callback: () => void) =>
    ipcRenderer.on('menu-delete', callback),
  onMenuZoomIn: (callback: () => void) =>
    ipcRenderer.on('menu-zoom-in', callback),
  onMenuZoomOut: (callback: () => void) =>
    ipcRenderer.on('menu-zoom-out', callback),
  onMenuZoomFit: (callback: () => void) =>
    ipcRenderer.on('menu-zoom-fit', callback),

  // 移除监听器
  removeAllListeners: (channel: string) =>
    ipcRenderer.removeAllListeners(channel),
})

// 类型声明
declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<any>
      saveFile: (options?: { defaultPath?: string; filters?: any[] }) => Promise<any>
      exportFile: (options?: { defaultPath?: string; filters?: any[] }) => Promise<any>
      onMenuNewFile: (callback: () => void) => void
      onMenuOpenFile: (callback: () => void) => void
      onMenuSaveFile: (callback: () => void) => void
      onMenuExportPdf: (callback: () => void) => void
      onMenuExportPng: (callback: () => void) => void
      onMenuUndo: (callback: () => void) => void
      onMenuRedo: (callback: () => void) => void
      onMenuCopy: (callback: () => void) => void
      onMenuPaste: (callback: () => void) => void
      onMenuDelete: (callback: () => void) => void
      onMenuZoomIn: (callback: () => void) => void
      onMenuZoomOut: (callback: () => void) => void
      onMenuZoomFit: (callback: () => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
}
