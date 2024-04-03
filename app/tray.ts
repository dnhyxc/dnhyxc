/*
 * 托盘设置
 * @author: dnhyxc
 * @since: 2023-06-21
 * index.vue
 */
// @ts-ignore
import path from 'path';
import { Menu, app } from 'electron';
import { globalInfo, isDev, isMac, clearGlobalInfo } from './constant';

export const createContextMenu = () => {
  // 托盘菜单
  return Menu.buildFromTemplate([
    {
      label: '显示墨客',
      click: () => {
        globalInfo.win?.show();
      },
    },
    {
      label: '退出墨客',
      click: () => {
        clearGlobalInfo();
        app.quit();
      },
    },
  ]);
};

export const getIconPath = () => {
  if (isDev) {
    return isMac ? '../public/Template.png' : '../public/icon@2.png';
  } else {
    return isMac ? '../dist/Template.png' : '../dist/icon@2.png';
  }
};

// 获取闪动图标颜色
export const getFlashIconPath = () => {
  if (isDev) {
    return isMac ? '../public/TemplateEmpty.png' : '../public/empty.png';
  } else {
    return isMac ? '../dist/TemplateEmpty.png' : '../dist/empty.png';
  }
};

// 托盘图标闪烁
let isFlashing = false;
let flashInterval: ReturnType<typeof setInterval> | null = null;

export const startFlash = () => {
  if (isMac) return;
  const flashImg = getFlashIconPath();
  const img = getIconPath();
  if (!isFlashing) {
    isFlashing = true;
    flashInterval = setInterval(() => {
      globalInfo.tray?.setImage(path.join(__dirname, flashImg as string));
      setTimeout(() => {
        globalInfo.tray?.setImage(path.join(__dirname, img));
      }, 500);
    }, 1000);
  }
};

// 停止闪动
export const stopFlash = () => {
  if (isMac) return;
  const img = getIconPath();
  if (isFlashing) {
    isFlashing = false;
    if (flashInterval) {
      clearInterval(flashInterval as unknown as number);
      flashInterval = null;
    }
    globalInfo.tray?.setImage(path.join(__dirname, img));
  }
};
