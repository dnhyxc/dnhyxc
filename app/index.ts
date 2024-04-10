/*
 * 入口文件
 * @author: dnhyxc
 * @since: 2023-06-21
 * index.vue
 */
// @ts-ignore
import path from 'path';
import { app, ipcMain, Tray } from 'electron';
// @ts-ignore
import Store from 'electron-store';
import { registerShortcut, unRegisterShortcut } from './shortcut';
import { createContextMenu, getIconPath } from './tray';
import { createMessageWin, showMessage, checkTrayLeave, messageWinStatus } from './message';
import { createWindow } from './mainwin';
import { createOpenWindow } from './openwin';
import { globalInfo, isMac, DOMAIN_URL } from './constant';

// 注册electron-store
Store.initRenderer();

globalInfo.store = new Store();

// 屏蔽警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// 解决 http 下无法使用媒体api（navigator.mediaDevices.getUserMedia）的问题
app.commandLine.appendSwitch('unsafely-treat-insecure-origin-as-secure', DOMAIN_URL);

// 限制只能启动一个应用
const gotTheLock = app.requestSingleInstanceLock();

// 判断是否是 mac 和开发环境
if (!isMac && app.isPackaged) {
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (globalInfo.win) {
        if (globalInfo.win?.isMinimized()) globalInfo.win?.restore();
        globalInfo.win?.focus();
        globalInfo.win?.show();
      }
    });
  }
}

// 在Electron完成初始化时被触发
app
  .whenReady()
  .then(() => {
    // 创建主窗口
    // createWindow();
    createOpenWindow();
  })
  .then(() => registerShortcut(app))
  .then(() => {
    const store = new Store();
    globalInfo.tray = new Tray(path.join(__dirname, getIconPath()));
    // 设置鼠标悬浮 Tip 提示
    globalInfo.tray?.setToolTip('dnhyxc');
    if (!isMac) {
      // 设置托盘菜单
      globalInfo.tray?.setContextMenu(createContextMenu());
      globalInfo.tray?.on('click', () => {
        globalInfo.win?.show();
      });
      // 创建消息窗口
      // createMessageWin();
      // 监听鼠标是否进入托盘
      globalInfo.tray?.on('mouse-move', () => {
        // 判断是否开启了消息提醒
        if (store.get('MSG_STATUS') === 1 && globalInfo.msgStatus) {
          // 如果存在未读消息则显示消息窗口，否则不显示
          if (!messageWinStatus.hasUnreadMsg) return;
          // 判断鼠标是否进入托盘图标
          if (messageWinStatus.isLeave) {
            showMessage();
            messageWinStatus.isLeave = false;
            // 检测鼠标是否移除托盘图标
            checkTrayLeave();
          }
        }
      });
    } else {
      globalInfo.tray?.on('mouse-up', () => {
        globalInfo.win?.show();
      });
    }
  })
  .then(() => {
    // 监听渲染进程快捷键修改，重新注册快捷键
    ipcMain.on('restore-register-shortcut', (event) => {
      // 重新注册前先取消之前的注册，防止多次注册
      unRegisterShortcut();
      // 重新注册快捷键
      registerShortcut(app);
    });

    ipcMain.on('open-main-win', () => {
      globalInfo.openWin?.close();
      globalInfo.openWin = null;
      createWindow();
      // globalInfo.win?.show();
      createMessageWin();
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
  if (globalInfo.win === null && globalInfo.openWin === null) {
    createWindow();
  }
  if (globalInfo.openWin === null && globalInfo.win === null) {
    // createWindow();
    createOpenWindow();
  }
  // 点击拓展坞显示应用窗口
  if (globalInfo.win && globalInfo.openWin === null && isMac) {
    globalInfo.win?.show();
  }
  // 点击拓展坞显示应用窗口
  if (globalInfo.openWin && globalInfo.win === null && isMac) {
    globalInfo.openWin?.show();
  }
});

// 应用关闭时，注销所有快捷键
app.on('will-quit', () => {
  unRegisterShortcut();
});
