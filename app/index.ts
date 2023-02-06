import path from 'path';
import { app, BrowserWindow, ipcMain, Tray } from 'electron';
import { registerShortcut, unRegisterShortcut } from './shortcut';
import { createContextMenu, getIconPath } from './tray';

let win: BrowserWindow | null = null;

let tray: Tray | null = null;

// 控制是否退出
let willQuitApp = false;

const isDev: boolean = process.env.NODE_ENV === 'development';

const isMac: boolean = process.platform === 'darwin';

// 屏蔽警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

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
    icon: path.join(__dirname, getIconPath({ isDev, isMac })),
  });

  // 设置mac扩展坞图标
  if (isMac) {
    app.dock.setIcon(path.join(__dirname, isDev ? '../public/mac/favicon.ico' : '../dist/mac/favicon.ico'));
  }

  if (!isDev) {
    // win?.loadFile(path.join(__dirname, '../dist/index.html'));
    win?.loadURL('http://43.143.114.71');
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
    if (!willQuitApp) {
      event.preventDefault();
      win?.hide();
      win?.setSkipTaskbar(true);
    }
  });

  // 只有显式调用quit才退出系统，区分MAC系统程序坞退出和点击X关闭退出
  app.on('before-quit', () => {
    willQuitApp = true;
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
  .then(() => registerShortcut({ isDev, win, isMac }))
  .then(() => {
    tray = new Tray(path.join(__dirname, getIconPath({ isDev, isMac })));
    if (!isMac) {
      tray?.setContextMenu(createContextMenu(win));
      tray?.on('click', () => {
        win?.show();
      });
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

// 应用关闭时，注销所有快捷键
app.on('will-quit', () => {
  unRegisterShortcut();
});
