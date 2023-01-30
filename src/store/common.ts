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

    // 清空面包屑
    clearCrumbsInfo() {
      this.crumbsInfo = {
        crumbsName: '',
        crumbsPath: '',
      };
    },
  },
});
