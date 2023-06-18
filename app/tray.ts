import path from 'path';
import { Menu, BrowserWindow } from 'electron';

export const createContextMenu = (win: BrowserWindow | null) => {
  // 托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示墨客',
      click: () => {
        win?.show();
      },
    },
    {
      label: '退出墨客',
      click: () => {
        win?.destroy();
      },
    },
  ]);

  return contextMenu;
};

export const getIconPath = ({ isDev, isMac }) => {
  if (isDev) {
    return isMac ? '../public/Template.png' : '../public/icon@2.png';
  } else {
    return isMac ? '../dist/Template.png' : '../dist/icon@2.png';
  }
};

// 获取闪动图标颜色
export const getFlashIconPath = ({ isDev, isMac }) => {
  if (isDev) {
    return isMac ? '../public/w-icon@16.png' : '../public/w-icon@32.png';
  } else {
    return isMac ? '../dist/w-icon@16.png' : '../dist/w-icon@32.png';
  }
};

// 托盘图标闪烁
let isFlashing = false;
let flashInterval: ReturnType<typeof setTimeout> | null = null;

export const startFlash = ({ tray, isDev, isMac }) => {
  const flashImg = getFlashIconPath({ isDev, isMac });
  const img = getIconPath({ isDev, isMac });
  if (!isFlashing) {
    isFlashing = true;
    flashInterval = setInterval(() => {
      tray.setImage(path.join(__dirname, flashImg));
      setTimeout(() => {
        tray.setImage(path.join(__dirname, img));
      }, 500);
    }, 1000);
  }
};

// 停止闪动
export const stopFlash = ({ tray, isDev, isMac }) => {
  const img = getIconPath({ isDev, isMac });
  if (isFlashing) {
    isFlashing = false;
    if (flashInterval) {
      clearInterval(flashInterval);
      flashInterval = null;
    }
    tray.setImage(path.join(__dirname, img));
  }
};
