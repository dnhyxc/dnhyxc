/*
 * 子窗口
 * @author: dnhyxc
 * @since: 2023-06-21
 * index.vue
 */
// @ts-ignore
import path from 'path';
import { BrowserWindow, ipcMain } from 'electron';
import { getIconPath } from './tray';
import { DOMAIN_URL, globalInfo, globalChildWins, TOOLS_KEYS } from './constant';

let newWin: BrowserWindow | null = null;

const isDev: boolean = process.env.NODE_ENV === 'development';

// 创建子窗口的方法
export const createChildWin = (pathname: string, id: string) => {
  // 判断当前窗口是否已经存在， 存在的话 直接唤起
  newWin = new BrowserWindow({
    width: 1028,
    height: 700,
    minWidth: 1028,
    minHeight: 700,
    titleBarStyle: 'hidden',
    // backgroundColor: '#d7fffe',
    backgroundColor: '#111',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      // partition: String(+new Date()), // 防止加载线上项目地址缓存在磁盘中
    },
    icon: path.join(__dirname, getIconPath()),
  });
  // 根据子窗口传递过来的文章id存储每个子窗口的id
  globalChildWins.newWins.set(id, newWin?.webContents.id);
  // 根据创建的子窗口的id存储对应的子窗口实例
  globalChildWins['independentWindow-' + newWin.webContents.id] = newWin;

  if (!isDev) {
    newWin.loadURL(`${DOMAIN_URL}/${pathname}`);
  } else {
    newWin.webContents.openDevTools();
    newWin.loadURL(`${process.env.VITE_DEV_SERVER_URL!}${pathname}`);
  }

  // 根据渲染进程传递的文章id获取对应子串口的id
  const winId = globalChildWins.newWins.get(id);
  // 通过子窗口id获取子窗口实例，并监听 closed 事件
  globalChildWins['independentWindow-' + winId]?.on('closed', () => {
    globalChildWins.newWins.delete(id);
    globalChildWins['independentWindow-' + winId] = null;
    delete globalChildWins['independentWindow-' + winId];
  });

  globalChildWins['independentWindow-' + winId]?.on('close', () => {
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

// 监听最大化事件
const newWinMax = (win: BrowserWindow) => {
  win?.webContents.send('newWin-max', true);
};

// 监听最小化事件
const newWinMin = (win: BrowserWindow) => {
  win?.webContents.send('newWin-max', false);
};

// 关闭窗口并删除wins中的id
const closeAndDelWin = (id: string, _winId?: string) => {
  const winId = _winId || globalChildWins.newWins.get(id);
  globalChildWins['independentWindow-' + winId]?.close();
  globalChildWins['independentWindow-' + winId] = null;
  delete globalChildWins['independentWindow-' + winId];
  globalChildWins.newWins.delete(id);
};

// 监听文章下架消息，实时关闭窗口
ipcMain.on('remove', (event, id: string) => {
  closeAndDelWin(id);
});

// 监听子窗口关闭
ipcMain.on('new-win-out', (event, id: string) => {
  closeAndDelWin(id);
});

// 监听子窗口最大/最小化
ipcMain.on('new-win-max', (event, id: string) => {
  const winId = globalChildWins.newWins.get(id);
  const findWin = globalChildWins['independentWindow-' + winId];
  if (findWin?.isMaximized()) {
    findWin?.restore();
  } else {
    findWin?.maximize();
  }
});

// 监听子窗口最小化
ipcMain.on('new-win-min', (e, id: string) => {
  const winId = globalChildWins.newWins.get(id);
  const findWin = globalChildWins['independentWindow-' + winId];
  findWin?.minimize();
});

// 窗口置顶
ipcMain.on('new-win-show', (_, status, id: string) => {
  const winId = globalChildWins.newWins.get(id);
  const findWin = globalChildWins['independentWindow-' + winId];
  findWin?.setAlwaysOnTop(status);
});

// 监听子窗口点赞，刷新主窗口文章列表
ipcMain.on('refresh', (event, params) => {
  const { id, pageType, isLike } = params;
  const winId = globalChildWins.newWins.get(id);
  const findWin = globalChildWins['independentWindow-' + winId];
  switch (pageType) {
    case 'article':
      globalInfo.win?.webContents.send('refresh', { id, pageType, isLike, isTop: findWin.isAlwaysOnTop() });
      break;
    case 'detail':
      findWin?.webContents.send('refresh', { id, pageType, isLike, isTop: findWin.isAlwaysOnTop() });
      break;
    case 'list':
      findWin?.webContents.send('refresh', { id, pageType, isLike, isTop: findWin.isAlwaysOnTop() });
      break;

    default:
      break;
  }
});

// 监听子窗口获取用户信息
ipcMain.handle('userInfo', (event, id) => {
  const winId = globalChildWins.newWins.get(id);
  globalChildWins['independentWindow-' + winId]?.webContents.send('userInfo', globalInfo.userInfo);
});

// 监听登录状态，info：用户信息
ipcMain.on('restore', (event, info) => {
  globalChildWins.newWins.forEach((value, key) => {
    if (info) {
      globalChildWins['independentWindow-' + value]?.webContents.send('restore', info, key);
    } else {
      globalInfo.userInfo = '';
      if (TOOLS_KEYS.includes(key)) {
        // 如果退出登录则关闭所有工具子窗口
        closeAndDelWin(key, value);
      } else {
        globalChildWins['independentWindow-' + value]?.webContents.send(
          'restore',
          JSON.stringify({ userInfo: {}, token: '' }),
          key,
        );
      }
    }
  });
});

// 监听主题变化
ipcMain.on('set-theme', (event, theme) => {
  globalChildWins.newWins.forEach((value, key) => {
    globalChildWins['independentWindow-' + value]?.webContents.send('set-theme', theme);
  });
});
