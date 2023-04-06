import path from 'path';
import { app, BrowserWindow, ipcMain, Tray, dialog } from 'electron';
import Store from 'electron-store';
import { registerShortcut, unRegisterShortcut } from './shortcut';
import { createContextMenu, getIconPath } from './tray';

let win: BrowserWindow | null = null;
let newWin: BrowserWindow | null = null;
let newWins: {
  id: string;
  win: BrowserWindow | null;
}[] = [];

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
    win?.loadURL('http://43.143.27.249:80');
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
    const store = new Store();
    // 退出时，清除用户信息
    store.delete('token');
    store.delete('userInfo');
    // 退出时，清除保存的上下页搜索条件
    store.delete('paramList');
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

  // 监听页面是否刷新，页面刷新时，取消窗口置顶
  win?.webContents.addListener('did-start-loading', () => {
    win?.setAlwaysOnTop(false);
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
  // 当主窗口关闭时，关闭所有的子窗口
  if (newWins?.length) {
    newWins.forEach((i) => {
      i?.win?.close();
    });
    newWins = [];
  }
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

// 监听渲染进程发出的download事件
ipcMain.on('download', (event, url) => {
  win?.webContents.downloadURL(url); // 触发 will-download 事件
  win?.webContents.session.on('will-download', (event, item, webContents) => {
    item.once('done', (event, state) => {
      if (state === 'completed') {
        win?.webContents.send('download-file', true);
      } else {
        win?.webContents.send('download-file', false);
      }
    });
  });
});

// 监听最大化事件
const newWinMax = (win) => {
  win?.webContents.send('newWin-max', true);
};

// 监听最小化事件
const newWinMin = (win) => {
  win?.webContents.send('newWin-max', false);
};

// 监听渲染进程请求获取electron的用户目录
ipcMain.on('new-win', (event, pathname, id, prevId) => {
  // 查询当前id窗口是否存在，如果存在则不重新创建
  const findWin = newWins.find((i) => i.id === id);
  if (findWin) {
    findWin?.win?.focus(); // 存在则直接聚焦，不重新创建
    return;
  }

  newWin = new BrowserWindow({
    width: 1000,
    height: 690,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      partition: String(+new Date()), // 防止加载线上项目地址缓存在磁盘中
    },
    icon: path.join(__dirname, getIconPath({ isDev, isMac })),
  });

  // 如果传入了上一篇文章的id、则说明是点击详情上下页切换的id，则需要关闭上一个文章的窗口
  if (prevId) {
    const findIndex = newWins.findIndex((i) => i.id === prevId);
    newWins[findIndex]?.win?.close();
    newWins.splice(findIndex, 1);
  }

  // 存储每个newWin
  newWins.push({
    id,
    win: newWin,
  });

  if (!isDev) {
    newWin?.loadURL(`http://43.143.27.249/${pathname}`);
  } else {
    // newWin?.webContents.openDevTools();
    newWin?.loadURL(`${process.env.VITE_DEV_SERVER_URL!}${pathname}`);
  }

  newWins.forEach((i, index) => {
    // 关闭按钮处理 - Mac是点击最小化
    i?.win?.on('closed', () => {
      i.win = null;
    });

    i?.win?.on('close', (event) => {
      i.win = null;
    });

    // 监听窗口最大化事件
    i?.win?.on('maximize', () => newWinMax(i.win));

    // 监听窗口最小化事件
    i?.win?.on('unmaximize', () => newWinMin(i.win));

    // 监听页面是否刷新，页面刷新时，取消窗口置顶
    i?.win?.webContents?.addListener('did-start-loading', () => {
      i?.win?.setAlwaysOnTop(false);
    });
  });
});

// 监听子窗口关闭
ipcMain.on('new-win-out', (event, id) => {
  const index = newWins.findIndex((i) => i.id === id);
  newWins[index]?.win?.close();
  newWins.splice(index, 1);
});

// 监听子窗口最大/最小化
ipcMain.on('new-win-max', (event, id) => {
  newWins.forEach((i) => {
    if (i.id === id) {
      if (i?.win?.isMaximized()) {
        i?.win?.restore();
      } else {
        i?.win?.maximize();
      }
    }
  });
});

// 监听子窗口最小化
ipcMain.on('new-win-min', (e, id) => {
  newWins.forEach((i) => {
    if (i.id === id) {
      i?.win?.minimize();
    }
  });
});

// 窗口置顶
ipcMain.on('new-win-show', (_, status, id) => {
  const index = newWins.findIndex((i) => i.id === id);
  newWins[index]?.win?.setAlwaysOnTop(status);
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
