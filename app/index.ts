import path from 'path';
import { app, BrowserWindow, ipcMain, Tray, dialog } from 'electron';
import Store from 'electron-store';
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

// 注册electron-store
Store.initRenderer();

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
      partition: String(+new Date()), // 防止加载线上项目地址缓存在磁盘中
    },
    icon: path.join(__dirname, getIconPath({ isDev, isMac })),
  });

  // 设置mac扩展坞图标
  if (isMac) {
    app.dock.setIcon(path.join(__dirname, isDev ? '../public/mac/favicon.ico' : '../dist/mac/favicon.ico'));
  }

  if (!isDev) {
    // win?.loadFile(path.join(__dirname, '../dist/index.html'));
    win?.loadURL('http://43.143.114.71:80');
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

// 退出程序
ipcMain.on('window-out', () => {
  if (!isMac) {
    app.quit();
  }
});

// 窗口置顶
ipcMain.on('win-show', (_, status) => {
  win?.setAlwaysOnTop(status);
});

// 监听渲染进程发起的打开文件夹指令，properties: ['openDirectory']：用户执行只能选择文件夹
ipcMain.on('openDialog', (event) => {
  dialog.showOpenDialog({ properties: ['openDirectory'] }).then((result) => {
    if (result.filePaths.length > 0) {
      event.sender.send('selectedItem', result.filePaths);
    }
  });
});

// 监听渲染进程请求获取electron的用户目录
ipcMain.on('get-app-path', (event) => {
  event.sender.send('got-app-path', app.getAppPath());
});

// 在Electron完成初始化时被触发
app
  .whenReady()
  .then(createWindow)
  .then(() => registerShortcut({ isDev, win, isMac, app }))
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
  })
  .then(() => {
    // 监听渲染进程快捷键修改，重新注册快捷键
    ipcMain.on('restore-register-shortcut', (event) => {
      // 重新注册前先取消之前的注册，防止多次注册
      unRegisterShortcut();
      // 重新注册快捷键
      registerShortcut({ isDev, win, isMac, app });
    });
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
