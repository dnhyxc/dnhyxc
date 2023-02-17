import { Menu, BrowserWindow } from 'electron';

export const createContextMenu = (win: BrowserWindow | null) => {
  // 托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示',
      click: () => {
        win?.show();
      },
    },
    {
      label: '退出',
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
