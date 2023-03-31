import type { Ref } from 'vue';
import { defineStore } from 'pinia';
import { MENULIST } from '@/constant';
import { CrumbsInfo, TocTitlesParams } from '@/typings/common';

interface IProps {
  crumbsInfo: CrumbsInfo; // 头部展示面包屑
  activePath: string; // 路由当前路径
  backPath: string; // 路由返回路径
  tocTitles: TocTitlesParams[]; // 文章目录
  previewRef: Ref<HTMLDivElement> | null; // 详情预览组件DOM
  detailScrollRef: any; // 详情滚动DOM
  showSearch: boolean; // 控制页面头部搜索框的显隐
  keyword?: string; // 列表文章搜索关键词
  reelScrollScale?: number; // 卷轴滚动宽度
  reelScrollRef: HTMLDivElement | null; // Reel 滚动容器
}

// 公共store
export const useCommonStore = defineStore('common', {
  state: (): IProps => ({
    crumbsInfo: {
      crumbsName: MENULIST[0].name,
      crumbsPath: MENULIST[0].path,
    },
    activePath: '',
    backPath: '/',
    tocTitles: [],
    previewRef: null,
    detailScrollRef: null,
    showSearch: false,
    keyword: '',
    reelScrollScale: 0,
    reelScrollRef: null,
  }),

  actions: {
    // 设置面包屑
    setCrumbsInfo(info: CrumbsInfo) {
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
