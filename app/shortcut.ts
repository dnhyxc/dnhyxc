/*
 * 快捷键配置
 * @author: dnhyxc
 * @since: 2023-06-21
 * index.vue
 */
import { globalShortcut, App } from 'electron';
import Store from 'electron-store';
import { isDev, isMac, globalInfo, clearGlobalInfo } from './constant';

export const registerShortcut = (app: App) => {
  const store = new Store();

  // 生产模式禁止使用Shift+Ctrl+I唤起控制台
  if (!isDev) {
    globalShortcut.register('Shift+Ctrl+I', () => {});
    globalShortcut.register('Shift+Ctrl+D+N+H', () => {
      globalInfo.win?.webContents.openDevTools();
    });
  }

  if (isDev && isMac) {
    globalShortcut.register('Shift+Ctrl+I', () => {
      globalInfo.win?.webContents.openDevTools();
    });
  }

  globalShortcut.register('Alt+CommandOrControl+I', () => {
    console.log('alt + ctrl + I');
  });

  // 快捷键 Alt+Shift+Q 显示隐藏
  globalShortcut.register((store.get('OPEN_SHORTCUT') as string) || 'Shift+Alt+Q', () => {
    // 判断窗口是否失去焦点，如果失去了焦点，则不触发hide，直接显示窗口
    if (!globalInfo.win?.isFocused()) {
      globalInfo.win?.show();
      // 恢复图标在任务栏显示
      globalInfo.win?.setSkipTaskbar(false);
      return;
    }
    globalInfo.win?.isVisible() ? globalInfo.win?.hide() : globalInfo.win?.show();
    globalInfo.win?.isVisible() ? globalInfo.win?.setSkipTaskbar(false) : globalInfo.win?.setSkipTaskbar(true);
  });

  // 全屏/还原
  globalShortcut.register((store.get('FULL_SHORTCUT') as string) || 'Shift+Alt+F', () => {
    if (globalInfo.win?.isMaximized()) {
      globalInfo.win.restore();
    } else {
      globalInfo.win?.maximize();
    }
  });

  // 最小化
  globalShortcut.register((store.get('MINIMIZE_SHORTCUT') as string) || 'Shift+Alt+R', () => {
    globalInfo.win?.minimize();
  });

  // 退出
  globalShortcut.register((store.get('OUT_SHORTCUT') as string) || 'Shift+Alt+T', () => {
    if (!isMac) {
      clearGlobalInfo();
      app?.quit();
    }
  });
};

// 注销所有快捷键
export const unRegisterShortcut = () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll();
};
