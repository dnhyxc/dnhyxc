import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

const createWindow = () => {
  let win: BrowserWindow | null = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
    titleBarStyle: 'hidden',
  });

  if (process.env.NODE_ENV !== 'development') {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    win.webContents.openDevTools();
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
};

// 在Electron完成初始化时被触发
app.whenReady().then(createWindow);
