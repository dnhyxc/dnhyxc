import { defineStore } from 'pinia';
import { ArticleItem, ArticleListResult } from '@/typings/common';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { PAGESIZE } from '@/constant';

interface IProps {
  loading: boolean;
  pageNo: number;
  pageSize: number;
  articleList: ArticleItem[]; // 文章列表数据
  total: number; // 文章列表总数
  keyword: string;
  filterList: string[];
}

export const useSearchStore = defineStore('search', {
  state: (): IProps => ({
    loading: false,
    pageNo: 0,
    pageSize: PAGESIZE,
    articleList: [],
    total: 0,
    keyword: '',
    filterList: ['all'],
  }),

  actions: {
    // 高级搜索
    async advancedSearch() {
      // 当如果清空搜索关键字时，清空缓存的搜索相关信息
      if (!this.keyword) return;
      if (this.articleList.length !== 0 && this.articleList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<ArticleListResult>(
        await Service.advancedSearch({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          keyword: this.keyword,
          filterList: this.filterList,
        }),
      );
      this.loading = false;
      if (res.success) {
        const { total, list } = res.data;
        // 使用ref暂存list，防止滚动加载时，list添加错乱问题
        this.articleList = [...this.articleList, ...list];
        this.total = total;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 清除文章列表数据
    clearArticleList() {
      this.articleList = [];
      this.total = 0;
      this.pageNo = 0;
    },

    // 清空搜索条件
    clearFilters() {
      this.keyword = '';
      this.filterList = ['all'];
    },
  },
});
