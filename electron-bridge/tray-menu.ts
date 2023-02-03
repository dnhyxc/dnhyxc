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
