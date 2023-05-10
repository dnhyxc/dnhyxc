import path from 'path';
import { app, BrowserWindow, ipcMain, Tray, dialog } from 'electron';
import Store from 'electron-store';
import { registerShortcut, unRegisterShortcut } from './shortcut';
import { createContextMenu, getIconPath } from './tray';
import { DOMAIN_URL } from './constant';
import { globalChildWins } from './global';

let win: BrowserWindow | null = null;
let newWin: BrowserWindow | null = null;
let tray: Tray | null = null;
// 保存用户信息
let userInfo = '';

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
    win?.loadURL(DOMAIN_URL);
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
    // 清空用户信息
    userInfo = '';
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
  globalChildWins.newWins.forEach((value, key) => {
    globalChildWins['independentWindow-' + value].close('restore');
    globalChildWins['independentWindow-' + value] = null;
    delete globalChildWins['independentWindow-' + value];
  });
  // 所有子窗口关闭之后，删除存储的全部 wins id
  globalChildWins.newWins.clear();
  userInfo = '';
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

// 创建子窗口的方法
const createChildWin = (pathname, id) => {
  // 判断当前窗口是否已经存在， 存在的话 直接唤起
  newWin = new BrowserWindow({
    width: 1028,
    height: 700,
    minWidth: 1028,
    minHeight: 700,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      partition: String(+new Date()), // 防止加载线上项目地址缓存在磁盘中
    },
    icon: path.join(__dirname, getIconPath({ isDev, isMac })),
  });

  // 存储每个newWin
  globalChildWins.newWins.set(id, newWin?.webContents.id);
  globalChildWins['independentWindow-' + newWin.webContents.id] = newWin;

  if (!isDev) {
    newWin.loadURL(`${DOMAIN_URL}/${pathname}`);
  } else {
    newWin.webContents.openDevTools();
    newWin.loadURL(`${process.env.VITE_DEV_SERVER_URL!}${pathname}`);
  }

  const winId = globalChildWins.newWins.get(id);

  globalChildWins['independentWindow-' + winId]?.on('closed', () => {
    globalChildWins.newWins.delete(id);
    globalChildWins['independentWindow-' + winId] = null;
    delete globalChildWins['independentWindow-' + winId];
  });

  globalChildWins['independentWindow-' + winId]?.on('close', (event) => {
    globalChildWins.newWins.delete(id);
    globalChildWins['independentWindow-' + winId] = null;
    delete globalChildWins['independentWindow-' + winId];
  });

  // 监听窗口最大化事件
  globalChildWins['independentWindow-' + winId]?.on('maximize', () =>
    newWinMax(globalChildWins['independentWindow-' + winId]),
  );

  // 监听窗口最小化事件
  globalChildWins['independentWindow-' + winId]?.on('unmaximize', () =>
    newWinMin(globalChildWins['independentWindow-' + winId]),
  );

  // 监听窗口是否获取焦点，如果获取焦点则让获取焦点的子窗口触发立即重新连接ws的消息
  // globalChildWins['independentWindow-' + winId]?.on('focus', (event) => {
  //   event.sender.send('connect-ws', id);
  // });
};

// 监听主窗口推送新建窗口的消息，pathname：路由路径、id：文章id、info：用户信息、prevId：详情点击上下篇时传入的上一篇的文章id
ipcMain.on('new-win', (event, pathname, id, info, prevId) => {
  // 如果传入了上一篇文章的id、则说明是点击详情中上下页切换的id，则需要关闭上一个文章的窗口
  if (prevId) {
    const winId = globalChildWins.newWins.get(prevId);
    if (winId) {
      globalChildWins['independentWindow-' + winId]?.close();
      globalChildWins['independentWindow-' + winId] = null;
      delete globalChildWins['independentWindow-' + winId];
    }
  }

  // 判断窗口是否存在，如果存在则直接显示，不再重新创建
  if (globalChildWins.newWins.has(id)) {
    const winId = globalChildWins.newWins.get(id);
    globalChildWins['independentWindow-' + winId]?.show();
  } else {
    // 创建之前先判断是否超过三个子窗口，如果超过三个，则删除最早创建的那个子窗口
    const childWinKeys = globalChildWins.newWins.keys();
    const keys = Array.from(childWinKeys);
    // 如果子窗口超过3个，则删除最早创建的那个子窗口
    if (keys?.length > 2) {
      const winId = globalChildWins.newWins.get(keys?.[0]);
      globalChildWins['independentWindow-' + winId]?.close();
      globalChildWins['independentWindow-' + winId] = null;
      delete globalChildWins['independentWindow-' + winId];
      globalChildWins.newWins.delete(keys?.[0]);
    }
    // 如果没有超过三个子窗口，则创建子窗口
    app
      .whenReady()
      .then(() => createChildWin(pathname, id))
      .then(() => {
        userInfo = info;
        // 监听页面是否刷新，页面刷新时，取消窗口置顶
        const winId = globalChildWins.newWins.get(id);
        globalChildWins['independentWindow-' + winId]?.webContents?.addListener('did-start-loading', () => {
          globalChildWins['independentWindow-' + winId]?.setAlwaysOnTop(false);
        });
      });
  }
});

// 监听子窗口获取用户信息
ipcMain.handle('userInfo', (event, id) => {
  const winId = globalChildWins.newWins.get(id);
  globalChildWins['independentWindow-' + winId]?.webContents.send('userInfo', userInfo);
});

// 监听文章下架消息，实时关闭窗口
ipcMain.on('remove', (event, id) => {
  const winId = globalChildWins.newWins.get(id);
  globalChildWins['independentWindow-' + winId]?.close();
  globalChildWins['independentWindow-' + winId] = null;
  delete globalChildWins['independentWindow-' + winId];
  globalChildWins.newWins.delete(id);
});

// 监听子窗口关闭
ipcMain.on('new-win-out', (event, id) => {
  const winId = globalChildWins.newWins.get(id);
  globalChildWins['independentWindow-' + winId]?.close();
  globalChildWins['independentWindow-' + winId] = null;
  delete globalChildWins['independentWindow-' + winId];
  globalChildWins.newWins.delete(id);
});

// 监听子窗口最大/最小化
ipcMain.on('new-win-max', (event, id) => {
  const winId = globalChildWins.newWins.get(id);
  const findWin = globalChildWins['independentWindow-' + winId];
  if (findWin?.isMaximized()) {
    findWin?.restore();
  } else {
    findWin?.maximize();
  }
});

// 监听子窗口最小化
ipcMain.on('new-win-min', (e, id) => {
  const winId = globalChildWins.newWins.get(id);
  const findWin = globalChildWins['independentWindow-' + winId];
  findWin?.minimize();
});

// 窗口置顶
ipcMain.on('new-win-show', (_, status, id) => {
  const winId = globalChildWins.newWins.get(id);
  const findWin = globalChildWins['independentWindow-' + winId];
  findWin?.setAlwaysOnTop(status);
});

// 监听子窗口点赞，刷新主窗口文章列表
ipcMain.on('refresh', (event, id, pageType, isLike) => {
  const winId = globalChildWins.newWins.get(id);
  const findWin = globalChildWins['independentWindow-' + winId];
  switch (pageType) {
    case 'article':
      win?.webContents.send('refresh', id, pageType, isLike);
      break;
    case 'detail':
      findWin?.webContents.send('refresh', id, pageType, isLike);
      break;
    case 'list':
      findWin?.webContents.send('refresh', id, pageType, isLike);
      break;

    default:
      break;
  }
});

// 监听子窗口点赞，刷新主窗口文章列表，info：用户信息
ipcMain.on('restore', (event, info) => {
  globalChildWins.newWins.forEach((value, key) => {
    if (info) {
      globalChildWins['independentWindow-' + value]?.webContents.send('restore', info, key);
    } else {
      userInfo = '';
      globalChildWins['independentWindow-' + value]?.webContents.send(
        'restore',
        JSON.stringify({ userInfo: {}, token: '' }),
        key,
      );
    }
  });
});

// 监听开机自启设置
ipcMain.on('open-at-login', (event, status) => {
  // 开机自启
  app.setLoginItemSettings({ openAtLogin: status !== 1 });
});

// 限制只能启动一个应用
const gotTheLock = app.requestSingleInstanceLock();

if (!isMac) {
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
        win.show();
      }
    });
  }
}

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
