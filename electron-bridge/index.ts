import { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut } from 'electron';
import path from 'path';

let win: BrowserWindow | null = null;

let tray: Tray | null = null;

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
    icon: path.join(__dirname, '../dist/favicon.ico') || path.join(__dirname, '../public/favicon.ico'),
  });

  // if (process.platform === 'darwin') {
  //   app.dock.setIcon(path.join(__dirname, '../dist/favicon.jpg'));
  // }

  if (process.env.NODE_ENV !== 'development') {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
    // 新建托盘
    tray = new Tray(path.join(__dirname, '../dist/favicon.ico'));
  } else {
    win.webContents.openDevTools();
    // 新建托盘
    tray = new Tray(path.join(__dirname, '../public/favicon.ico'));
    win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  }

  win.on('closed', () => {
    win = null;
  });

  // 登录窗口最小化
  ipcMain.on('window-min', function () {
    win?.minimize();
  });

  // 登录窗口最大化
  ipcMain.on('window-max', function () {
    if (win?.isMaximized()) {
      win.restore();
    } else {
      win?.maximize();
    }
  });

  // 关闭窗口
  ipcMain.on('window-close', function () {
    win?.hide();
  });

  // 托盘名称
  tray?.setToolTip('dnhyxc');

  // 托盘菜单
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

  // 载入托盘菜单
  tray?.setContextMenu(contextMenu);

  // 点击触发
  tray?.on('click', () => {
    // 双击通知区图标实现应用的显示或隐藏
    win?.isVisible() ? win?.hide() : win?.show();
    win?.isVisible() ? win?.setSkipTaskbar(false) : win?.setSkipTaskbar(true);
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

// 在Electron完成初始化时被触发
app
  .whenReady()
  .then(() => {
    globalShortcut.register('Alt+CommandOrControl+I', () => {
      console.log('alt + ctrl + I');
    });

    // 快捷键 Alt+Shift+Q 显示隐藏
    globalShortcut.register('Alt+Shift+Q', () => {
      win?.isVisible() ? win?.hide() : win?.show();
      win?.isVisible() ? win?.setSkipTaskbar(false) : win?.setSkipTaskbar(true);
    });

    if (process.env.NODE_ENV !== 'development') {
      // 快捷键 Alt+Shift+Q 显示隐藏
      globalShortcut.register('Shift+Ctrl+I', () => {
        return null;
      });
    }
  })
  .then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 当窗口开始活动时触发
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
