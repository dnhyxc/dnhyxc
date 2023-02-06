// 快捷键配置
import { globalShortcut, BrowserWindow } from 'electron';

interface IParams {
  isDev: boolean;
  isMac: boolean;
  win: BrowserWindow | null;
}

export const registerShortcut = ({ isDev, win, isMac }: IParams) => {
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

  // 页面刷新
  globalShortcut.register('Shift+Alt+R', () => {
    window.location?.reload();
  });

  globalShortcut.register('Alt+CommandOrControl+I', () => {
    console.log('alt + ctrl + I');
  });

  // 快捷键 Alt+Shift+Q 显示隐藏
  globalShortcut.register('Alt+Shift+Q', () => {
    win?.isVisible() ? win?.hide() : win?.show();
    win?.isVisible() ? win?.setSkipTaskbar(false) : win?.setSkipTaskbar(true);
  });
};

// 注销所有快捷键
export const unRegisterShortcut = () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll();
  console.log('aaaa');
};
