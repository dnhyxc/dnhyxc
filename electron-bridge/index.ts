import { app, BrowserWindow, ipcMain, Tray } from 'electron';
import path from 'path';
import { createContextMenu } from './tray-menu';
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
    icon: path.join(__dirname, '../public/icon@2.png'),
  });

  // 载入vue项目地址
  win.loadURL(isDev ? 'http://127.0.0.1:9216/' : path.join(__dirname, '../dist/index.html'));

  if (isDev) {
    win.webContents.openDevTools();
  }

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

  // 设置托盘图标
  tray = new Tray(path.join(__dirname, isDev ? '../public/icon@2.png' : '../dist/icon@2.png'));

  // 托盘名称
  tray?.setToolTip('dnhyxc');

  // 载入托盘菜单
  tray?.setContextMenu(createContextMenu(win));

  tray?.on('click', () => {
    // 双击通知区图标实现应用的显示或隐藏
    win?.isVisible() ? win?.hide() : win?.show();
    // 让窗口不在任务栏中显示.
    win?.isVisible() ? win?.setSkipTaskbar(false) : win?.setSkipTaskbar(true);
  });

  win.on('closed', () => {
    win = null;
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
  .then(createWindow)
  .then(() => setShortcutKeys({ isDev, win }));

// 退出
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
  // 兼容mac点击拓展坞图标无法显示的问题
  if (win && isMac) {
    win?.show();
  }
});
