import { BrowserWindow, screen, ipcMain, Tray, Rectangle } from 'electron';
import { DOMAIN_URL } from './constant';
import { startFlash, stopFlash } from './tray';

const isDev: boolean = process.env.NODE_ENV === 'development';
const isMac: boolean = process.platform === 'darwin';

let messageWin: BrowserWindow | null = null;
let mainWin: BrowserWindow | undefined;
let tray: Tray | undefined;

export const messageWinStatus = {
  isLeave: true,
  // 鼠标是否进入消息窗口控制变量
  hasUnreadMsg: false,
};

let leaveInter: ReturnType<typeof setTimeout> | null = null;
let trayBounds: Rectangle;
let point = { x: 0, y: 0 };

export const createMessageWin = (params: { tray?: Tray | undefined; win?: BrowserWindow }) => {
  tray = params.tray;
  mainWin = params.win;
  messageWin = new BrowserWindow({
    // width: 800,
    // height: 500,
    width: 200,
    height: 120,
    show: false,
    y: 0,
    x: 0,
    frame: false, // 无边框
    skipTaskbar: true, // 使窗口不显示在任务栏中
    movable: false, // 禁止窗口被用户移动
    resizable: false, // 禁止窗口手动调整窗口大小
    fullscreenable: false, // 禁止窗口可以进入全屏状态
    alwaysOnTop: true, // 窗口是否永远在别的窗口的上面
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      partition: String(+new Date()), // 防止加载线上项目地址缓存在磁盘中
    },
  });

  if (!isDev) {
    messageWin.loadURL(`${DOMAIN_URL}/message`);
  } else {
    // messageWin.webContents.openDevTools();
    messageWin.loadURL(`${process.env.VITE_DEV_SERVER_URL!}message`);
  }

  // 定位到桌面右上角
  // const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const [cwidth, cheight] = messageWin.getContentSize();

  const cw = parseInt(`${cwidth / 2 - 11}`);

  const bounds = tray?.getBounds();

  messageWin.setPosition(bounds?.x! - cw, bounds?.y! - cheight);

  messageWin?.on('blur', () => {
    hideMessage();
  });
};

// 监听是否有未读消息
ipcMain.on('show-message', (event, status) => {
  messageWinStatus.hasUnreadMsg = true;
  startFlash({ tray, isDev, isMac });
  messageWin?.webContents.send('message-info', status);
});

// 监听消息是否已读
ipcMain.on('hide-message', (event, status) => {
  messageWinStatus.hasUnreadMsg = false;
  stopFlash({ tray, isDev, isMac });
  messageWin?.webContents.send('message-info', status);
});

// 监听渲染进程鼠标移出事件，隐藏窗口
ipcMain.on('close-message-win', (event, status) => {
  // stopFlash({ tray, isDev, isMac });
  hideMessage();
});

// 监听渲染进程鼠标移出事件，隐藏窗口
ipcMain.on('ignore-message-win', async (event, status) => {
  console.log('ignore-message-win', status);
  await mainWin?.webContents.send('clear-message', status);
  stopFlash({ tray, isDev, isMac });
  hideMessage();
});

// 监听渲染进程点击消息
ipcMain.on('show-message-modal', async (event, status) => {
  mainWin?.webContents.send('show-message-modal', true);
  // 显示主窗口
  await mainWin?.show();
  // 隐藏消息窗口
  hideMessage();
});

// 监听渲染进程点击消息上的用户名称
ipcMain.on('to-personal', async (event, userId) => {
  mainWin?.webContents.send('to-personal', userId);
  // 显示主窗口
  await mainWin?.show();
  // 隐藏消息窗口
  hideMessage();
});

// 监听渲染进程鼠标是否进入消息窗口
ipcMain.on('show-message-win', (event, status) => {
  // 显示消息窗口
  showMessage();
  // 将鼠标进入托盘的离开状态重置为初始化的true
  messageWinStatus.isLeave = true;
  // 清除定时器，阻止消息窗口隐藏
  leaveInter && clearInterval(leaveInter);
});

export const showMessage = () => {
  messageWin?.showInactive(); // 显示但不聚焦于窗口（建议做延时处理）
  // messageWin?.show();
};

export const hideMessage = () => {
  messageWin?.hide();
};

// 检测鼠标是否移出托盘图标
export const checkTrayLeave = (tray) => {
  leaveInter && clearInterval(leaveInter);
  leaveInter = setInterval(() => {
    trayBounds = tray?.getBounds()!;
    point = screen.getCursorScreenPoint();
    if (
      !(
        trayBounds.x < point.x &&
        trayBounds.y < point.y &&
        point.x < trayBounds.x + trayBounds.width &&
        point.y < trayBounds.y + trayBounds.height
      )
    ) {
      // 触发mouse-leave
      leaveInter && clearInterval(leaveInter);
      leaveInter = null;
      messageWinStatus.isLeave = true;
      hideMessage();
    }
  }, 300);
};
