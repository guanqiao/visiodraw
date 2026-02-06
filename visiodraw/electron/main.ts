import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'VisioDraw',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  })

  // 开发环境加载Vite开发服务器
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 设置应用菜单
function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'Ctrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-new-file')
          },
        },
        {
          label: '打开',
          accelerator: 'Ctrl+O',
          click: () => {
            mainWindow?.webContents.send('menu-open-file')
          },
        },
        {
          label: '保存',
          accelerator: 'Ctrl+S',
          click: () => {
            mainWindow?.webContents.send('menu-save-file')
          },
        },
        { type: 'separator' },
        {
          label: '导出为PDF',
          click: () => {
            mainWindow?.webContents.send('menu-export-pdf')
          },
        },
        {
          label: '导出为PNG',
          click: () => {
            mainWindow?.webContents.send('menu-export-png')
          },
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'Alt+F4',
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'Ctrl+Z',
          click: () => {
            mainWindow?.webContents.send('menu-undo')
          },
        },
        {
          label: '重做',
          accelerator: 'Ctrl+Y',
          click: () => {
            mainWindow?.webContents.send('menu-redo')
          },
        },
        { type: 'separator' },
        {
          label: '复制',
          accelerator: 'Ctrl+C',
          click: () => {
            mainWindow?.webContents.send('menu-copy')
          },
        },
        {
          label: '粘贴',
          accelerator: 'Ctrl+V',
          click: () => {
            mainWindow?.webContents.send('menu-paste')
          },
        },
        {
          label: '删除',
          accelerator: 'Delete',
          click: () => {
            mainWindow?.webContents.send('menu-delete')
          },
        },
      ],
    },
    {
      label: '视图',
      submenu: [
        {
          label: '放大',
          accelerator: 'Ctrl+=',
          click: () => {
            mainWindow?.webContents.send('menu-zoom-in')
          },
        },
        {
          label: '缩小',
          accelerator: 'Ctrl+-',
          click: () => {
            mainWindow?.webContents.send('menu-zoom-out')
          },
        },
        {
          label: '适应窗口',
          accelerator: 'Ctrl+0',
          click: () => {
            mainWindow?.webContents.send('menu-zoom-fit')
          },
        },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: '关于 VisioDraw',
              message: 'VisioDraw v1.0.0',
              detail: '一款兼容Visio格式的专业绘图应用',
            })
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC 处理程序
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: '所有支持的格式', extensions: ['vsdx', 'vsd', 'vdx', 'json'] },
      { name: 'Visio文件', extensions: ['vsdx', 'vsd', 'vdx'] },
      { name: 'VisioDraw项目', extensions: ['json'] },
      { name: '所有文件', extensions: ['*'] },
    ],
  })
  return result
})

ipcMain.handle('dialog:saveFile', async (_, options) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: options?.defaultPath,
    filters: options?.filters || [
      { name: 'VisioDraw项目', extensions: ['json'] },
      { name: 'Visio文件', extensions: ['vsdx'] },
    ],
  })
  return result
})

ipcMain.handle('dialog:exportFile', async (_, options) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: options?.defaultPath,
    filters: options?.filters || [
      { name: 'PNG图片', extensions: ['png'] },
      { name: 'PDF文档', extensions: ['pdf'] },
      { name: 'SVG矢量图', extensions: ['svg'] },
    ],
  })
  return result
})

app.whenReady().then(() => {
  createWindow()
  createMenu()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
