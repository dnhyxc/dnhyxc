// 快捷键配置
import { globalShortcut, BrowserWindow } from 'electron';
import Store from 'electron-store';

interface IParams {
  isDev: boolean;
  isMac: boolean;
  win: BrowserWindow | null;
}

// // 快捷键key值
// const SHORTCUT_KEYS = {
//   1: 'OPEN_SHORTCUT',
//   2: 'FULL_SHORTCUT',
//   3: 'MINIMIZE_SHORTCUT',
//   4: 'OUT_SHORTCUT',
// };

export const registerShortcut = ({ isDev, win, isMac }: IParams) => {
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
};

// 注销所有快捷键
export const unRegisterShortcut = () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll();
};
