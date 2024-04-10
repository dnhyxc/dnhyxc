/*
 * 主窗口
 * @author: dnhyxc
 * @since: 2023-06-21
 * index.vue
 */
// @ts-ignore
import path from 'path';
import { app, BrowserWindow, ipcMain, dialog, desktopCapturer } from 'electron';
import { getIconPath } from './tray';
import { DOMAIN_URL, globalInfo, isDev, isMac, globalChildWins, CATCHS } from './constant';
import { createChildWin } from './childwin';
import { createMessageWin } from './message';
// 控制是否退出
let willQuitApp = false;

// 屏蔽警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

export const createOpenWindow = () => {
  globalInfo.openWin = new BrowserWindow({
    width: 500,
    height: 350,
    minWidth: 500,
    minHeight: 350,
    titleBarStyle: 'hidden',
    backgroundColor: '#111',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      // 注意：配置了这个属性后，会影响 iframe pdf 的加载
      // partition: String(+new Date()), // 防止加载线上项目地址缓存在磁盘中
    },
    icon: path.join(__dirname, getIconPath()),
    show: false,
  });

  // 当页面的 DOM 已经完全加载并且 window 对象可以使用时触发
  // globalInfo.openWin?.webContents.once('dom-ready', () => {
  //   console.log('dom-ready');
  //   // 显示窗口
  //   globalInfo.openWin?.show();
  // });

  // 监听是否加载完成，等加载完成再显示窗口
  globalInfo.openWin?.on('ready-to-show', () => {
    console.log('ready-to-show');
    globalInfo.openWin?.show();
    globalInfo.openWin?.setAlwaysOnTop(true); // 将窗口设置为总是在顶部
  });

  // 程序启动前，先清空之前的缓存信息
  globalInfo.openWin?.webContents.session.clearStorageData({
    storages: CATCHS,
  });

  // 设置mac扩展坞图标
  if (isMac) {
    app.dock.setIcon(path.join(__dirname, isDev ? '../public/mac/favicon.ico' : '../dist/mac/favicon.ico'));
  }

  if (!isDev) {
    globalInfo.openWin?.loadURL(`${DOMAIN_URL}/open`);
  } else {
    globalInfo.openWin?.webContents.openDevTools();
    globalInfo.openWin?.loadURL(`${process.env.VITE_DEV_SERVER_URL!}open`);
  }

  // 关闭按钮处理 - Mac是点击最小化
  globalInfo.openWin?.on('closed', () => {
    globalInfo.openWin = null;
    globalInfo.tray = null;
  });

  globalInfo.openWin?.on('close', (event) => {
    if (!willQuitApp) {
      event.preventDefault();
      globalInfo.openWin?.hide();
      globalInfo.openWin?.setSkipTaskbar(true);
    }
  });

  // 监听窗口显示
  globalInfo.openWin?.on('show', () => {
    globalInfo.openWin?.webContents.send('win-show-status', true);
  });

  // 监听窗口隐藏
  globalInfo.openWin?.on('hide', () => {
    globalInfo.openWin?.webContents.send('win-show-status', false);
  });

  // 只有显式调用quit才退出系统，区分MAC系统程序坞退出和点击X关闭退出
  app.on('before-quit', () => {
    // 清空用户信息
    globalInfo.userInfo = '';
    willQuitApp = true;
  });

  // 监听窗口最大化事件
  globalInfo.openWin?.on('maximize', () => {
    globalInfo.openWin?.webContents.send('mainWin-max', true);
  });

  // 监听窗口最小化事件
  globalInfo.openWin?.on('unmaximize', () => {
    globalInfo.openWin?.webContents.send('mainWin-max', false);
  });
};

// 窗口最小化
ipcMain.on('window-min', () => {
  console.log('window-min');
  globalInfo.openWin?.minimize();
});

// 窗口最大化
ipcMain.on('window-max', () => {
  console.log('window-max');

  if (globalInfo.openWin?.isMaximized()) {
    globalInfo.openWin.restore();
  } else {
    globalInfo.openWin?.maximize();
  }
});

// 退出程序
ipcMain.on('window-out', () => {
  console.log('window-out------');
  if (!isMac) {
    app.quit();
  }
});
