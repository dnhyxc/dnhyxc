import { defineStore } from 'pinia';
import { MENULIST } from '@/constant';

interface crumbsInfo {
  crumbsName: string;
  crumbsPath: string;
}

// 公共store
export const useCommonStore = defineStore('common', {
  state: () => ({
    crumbsInfo: {
      crumbsName: MENULIST[0].name,
      crumbsPath: MENULIST[0].path,
    },
    activePath: '',
    backPath: '/',
  }),

  actions: {
    // 设置面包屑
    setCrumbsInfo(info: crumbsInfo) {
      this.crumbsInfo = { ...this.crumbsInfo, ...info };
    },

    // 设置当前路由
    setActivePath(path: string) {
      this.activePath = path;
    },

    // 设置登录返回的路径
    setBackPath(path: string) {
      this.backPath = path;
    },

    // 清空面包屑
    clearCrumbsInfo() {
      this.crumbsInfo = {
        crumbsName: '',
        crumbsPath: '',
      };
    },

    // 清空返回路径
    clearBackPath() {
      this.backPath = '/';
    },
  },
});
