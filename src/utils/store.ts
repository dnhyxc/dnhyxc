import Store from 'electron-store';
import { MSG_STATUS } from '@/constant';

const store = new Store();

// 返回 electron-store 的实例
export const eStore = store;

// 保存主题
export const setTheme = (type: string) => {
  store.set('theme', type);
};

// 获取主题
export const getTheme = (): string => {
  return (store.get('theme') as string) || '';
};

// 清除主题
export const removeTheme = () => {
  store.delete('theme');
};

// 获取消息提醒状态
export const getMsgStatus = () => {
  return store.get(MSG_STATUS);
};

// 保存左侧菜单设置
export const setMenuType = (type: boolean) => {
  return store.set('menuType', type);
};

// 获取左侧菜单设置
export const getMenuType = (): boolean => {
  return store.get('menuType') as boolean;
};
