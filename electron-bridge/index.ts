import path from 'path';
import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron';
import { setShortcutKeys } from './shortcut-keys';

let win: BrowserWindow | null = null;

let tray: Tray | null = null;

const isDev: boolean = process.env.NODE_ENV === 'development';

const isMac: boolean = process.platform === 'darwin';

const createWindow = () => {
  win = new BrowserWindow({
    width: 1080,
    height: 750,
    minWidth: 1080,
    minHeight: 750,
    titleBarStyle: 'hidden',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
    icon: path.join(__dirname, isMac ? '../public/Template.png' : '../public/icon@2.png'),
  });

  // 设置mac扩展坞图标
  if (isMac) {
    app.dock.setIcon(path.join(__dirname, '../public/mac/Template.png'));
  }

  if (!isDev) {
    win?.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    win?.webContents.openDevTools();
    win?.loadURL(process.env.VITE_DEV_SERVER_URL!);
  }

  // 关闭按钮处理 - Mac是点击最小化
  win?.on('closed', () => {
    win = null;
    tray = null;
  });

  win?.on('close', (event) => {
    // 回收BrowserWindow对象
    if (win?.isMinimized()) {
      win = null;
    } else {
      if (isMac) {
        // 回收BrowserWindow对象
        event.preventDefault();
        win?.hide();
      } else {
        win?.hide();
        // 让窗口不在任务栏中显示.
        win?.setSkipTaskbar(true);
        event.preventDefault();
      }
    }
  });

  // 监听窗口最大化事件
  win?.on('maximize', () => {
    win?.webContents.send('mainWin-max', true);
  });

  // 监听窗口最小化事件
  win?.on('unmaximize', () => {
    win?.webContents.send('mainWin-max', false);
  });
};

// 窗口最小化
ipcMain.on('window-min', () => {
  win?.minimize();
});

// 窗口最大化
ipcMain.on('window-max', () => {
  if (win?.isMaximized()) {
    win.restore();
  } else {
    win?.maximize();
  }
});

// 关闭窗口
ipcMain.on('window-close', () => {
  win?.hide();
});

// 窗口置顶
ipcMain.on('win-show', (_, status) => {
  win?.setAlwaysOnTop(status);
});

// 在Electron完成初始化时被触发
app
  .whenReady()
  .then(createWindow)
  .then(() => setShortcutKeys({ isDev, win }))
  .then(() => {
    tray = new Tray(path.join(__dirname, '../public/Template.png'));
    if (!isMac) {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: '显示',
          click: () => {
            win?.show();
          },
        },
        {
          label: '退出',
          click: () => {
            win?.destroy();
          },
        },
      ]);
      tray?.setContextMenu(contextMenu);
    } else {
      tray?.on('mouse-up', () => {
        win?.show();
      });
    }
  });

// 退出
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

// 当窗口开始活动时触发
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
  // 点击拓展坞显示应用窗口
  if (win && isMac) {
    win?.show();
  }
});
