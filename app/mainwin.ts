/*
 * 主窗口
 * @author: dnhyxc
 * @since: 2023-06-21
 * index.vue
 */
import path from 'path';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import Store from 'electron-store';
import { getIconPath } from './tray';
import { DOMAIN_URL, globalInfo, isDev, isMac, globalChildWins } from './constant';
import { createChildWin } from './childwin';

// 控制是否退出
let willQuitApp = false;

// 屏蔽警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// 注册electron-store
Store.initRenderer();

export const createWindow = () => {
  globalInfo.win = new BrowserWindow({
    width: 1080,
    height: 750,
    minWidth: 1080,
    minHeight: 750,
    titleBarStyle: 'hidden',
    backgroundColor: '#D7FFFE',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      partition: String(+new Date()), // 防止加载线上项目地址缓存在磁盘中
    },
    icon: path.join(__dirname, getIconPath()),
    // show: false,
  });

  // 设置mac扩展坞图标
  if (isMac) {
    app.dock.setIcon(path.join(__dirname, isDev ? '../public/mac/favicon.ico' : '../dist/mac/favicon.ico'));
  }

  if (!isDev) {
    // win?.loadFile(path.join(__dirname, '../dist/index.html'));
    globalInfo.win?.loadURL(DOMAIN_URL);
  } else {
    globalInfo.win?.webContents.openDevTools();
    globalInfo.win?.loadURL(process.env.VITE_DEV_SERVER_URL!);
  }

  // 关闭按钮处理 - Mac是点击最小化
  globalInfo.win?.on('closed', () => {
    globalInfo.win = null;
    globalInfo.tray = null;
  });

  globalInfo.win?.on('close', (event) => {
    if (!willQuitApp) {
      event.preventDefault();
      globalInfo.win?.hide();
      globalInfo.win?.setSkipTaskbar(true);
    }
  });

  // 只有显式调用quit才退出系统，区分MAC系统程序坞退出和点击X关闭退出
  app.on('before-quit', () => {
    // 清空用户信息
    globalInfo.userInfo = '';
    willQuitApp = true;
  });

  // 监听窗口最大化事件
  globalInfo.win?.on('maximize', () => {
    globalInfo.win?.webContents.send('mainWin-max', true);
  });

  // 监听窗口最小化事件
  globalInfo.win?.on('unmaximize', () => {
    globalInfo.win?.webContents.send('mainWin-max', false);
  });

  // 监听页面是否刷新，页面刷新时，取消窗口置顶
  globalInfo.win?.webContents.addListener('did-start-loading', () => {
    globalInfo.win?.setAlwaysOnTop(false);
  });

  // 监听是否加载完成，等加载完成再显示窗口
  // globalInfo.win?.on('ready-to-show', () => {
  //   globalInfo.win?.show();
  // });
};

// 窗口最小化
ipcMain.on('window-min', () => {
  globalInfo.win?.minimize();
});

// 窗口最大化
ipcMain.on('window-max', () => {
  if (globalInfo.win?.isMaximized()) {
    globalInfo.win.restore();
  } else {
    globalInfo.win?.maximize();
  }
});

// 关闭窗口
ipcMain.on('window-close', () => {
  globalInfo.win?.hide();
  // 当主窗口关闭时，关闭所有的子窗口
  globalChildWins.newWins.forEach((value, key) => {
    globalChildWins['independentWindow-' + value].close('restore');
    globalChildWins['independentWindow-' + value] = null;
    delete globalChildWins['independentWindow-' + value];
  });
  // 所有子窗口关闭之后，删除存储的全部 wins id
  globalChildWins.newWins.clear();
  globalInfo.userInfo = '';
});

// 退出程序
ipcMain.on('window-out', () => {
  if (!isMac) {
    app.quit();
  }
});

// 窗口置顶
ipcMain.on('win-show', (_, status) => {
  globalInfo.win?.setAlwaysOnTop(status);
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
  globalInfo.win?.webContents.downloadURL(url); // 触发 will-download 事件
  globalInfo.win?.webContents.session.on('will-download', (event, item, webContents) => {
    item.once('done', (event, state) => {
      if (state === 'completed') {
        globalInfo.win?.webContents.send('download-file', true);
      } else {
        globalInfo.win?.webContents.send('download-file', false);
      }
    });
  });
});

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
        globalInfo.userInfo = info;
        // 监听页面是否刷新，页面刷新时，取消窗口置顶
        const winId = globalChildWins.newWins.get(id);
        globalChildWins['independentWindow-' + winId]?.webContents?.addListener('did-start-loading', () => {
          globalChildWins['independentWindow-' + winId]?.setAlwaysOnTop(false);
        });
      });
  }
});

// 监听开机自启设置
ipcMain.on('open-at-login', (event, status) => {
  // 开机自启
  app.setLoginItemSettings({ openAtLogin: status !== 1 });
});

// 设置消息提醒设置
ipcMain.on('msg-status', (event, status) => {
  // status = 1：开启消息提醒
  if (status === 1) {
    globalInfo.msgStatus = true;
  } else {
    globalInfo.msgStatus = false;
  }
});
