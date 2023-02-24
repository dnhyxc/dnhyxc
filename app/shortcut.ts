// 快捷键配置
import { globalShortcut, BrowserWindow, App } from 'electron';
import Store from 'electron-store';

interface IParams {
  isDev: boolean;
  isMac: boolean;
  win: BrowserWindow | null;
  app?: App;
}

export const registerShortcut = ({ isDev, win, isMac, app }: IParams) => {
  const store = new Store();

  // 生产模式禁止使用Shift+Ctrl+I唤起控制台
  if (!isDev) {
    globalShortcut.register('Shift+Ctrl+I', () => {});
    globalShortcut.register('Shift+Ctrl+D+N+H', () => {
      win?.webContents.openDevTools();
    });
  }

  if (isDev && isMac) {
    globalShortcut.register('Shift+Ctrl+I', () => {
      win?.webContents.openDevTools();
    });
  }

  globalShortcut.register('Alt+CommandOrControl+I', () => {
    console.log('alt + ctrl + I');
  });

  // 快捷键 Alt+Shift+Q 显示隐藏
  globalShortcut.register((store.get('OPEN_SHORTCUT') as string) || 'Alt+Shift+Q', () => {
    win?.isVisible() ? win?.hide() : win?.show();
    win?.isVisible() ? win?.setSkipTaskbar(false) : win?.setSkipTaskbar(true);
  });

  // 全屏/还原
  globalShortcut.register((store.get('FULL_SHORTCUT') as string) || 'Shift+Alt+F', () => {
    if (win?.isMaximized()) {
      win.restore();
    } else {
      win?.maximize();
    }
  });

  // 最小化
  globalShortcut.register((store.get('MINIMIZE_SHORTCUT') as string) || 'Shift+Alt+R', () => {
    win?.minimize();
  });

  // 退出
  globalShortcut.register((store.get('OUT_SHORTCUT') as string) || 'Shift+Alt+T', () => {
    if (!isMac) {
      app?.quit();
    }
  });
};

// 注销所有快捷键
export const unRegisterShortcut = () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll();
};
