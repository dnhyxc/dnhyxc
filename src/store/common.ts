import type { Ref } from 'vue';
import { defineStore } from 'pinia';
import { TocTitlesParams } from '@/typings/common';

interface IProps {
  backPath: string; // 路由返回路径
  tocTitles: TocTitlesParams[]; // 文章目录
  previewRef: Ref<HTMLDivElement> | null; // 详情预览组件DOM
  detailScrollRef: any; // 详情滚动DOM
  showSearch: boolean; // 控制页面头部搜索框的显隐
  keyword?: string; // 列表文章搜索关键词
  reelScrollScale?: number; // 卷轴滚动宽度
  reelScrollRef: HTMLDivElement | null; // Reel 滚动容器
  pageLoadStatus: boolean; // 判断页面是否加载完成
}

// 公共store
export const useCommonStore = defineStore('common', {
  state: (): IProps => ({
    backPath: '/',
    tocTitles: [],
    previewRef: null,
    detailScrollRef: null,
    showSearch: false,
    keyword: '',
    reelScrollScale: 0,
    reelScrollRef: null,
    pageLoadStatus: false,
  }),

  actions: {
    // 设置登录返回的路径
    setBackPath(path: string) {
      this.backPath = path;
    },

    // 清空返回路径
    clearBackPath() {
      this.backPath = '/';
    },

    // 修改页面加载状态
    updatePageLoadStatus() {
      this.pageLoadStatus = true;
    },
  },
});
