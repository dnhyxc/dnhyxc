import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { ArticleListResult, ArticleItem } from '@/typings/common';

interface IProps {
  loading: boolean;
  pageNo: number;
  pageSize: number;
  articleList: ArticleItem[];
  total: number;
}

export const useArticleStore = defineStore('article', {
  state: (): IProps => ({
    // 首页、标签列表、分类列表文章列表数据
    loading: false,
    pageNo: 0,
    pageSize: 20,
    articleList: [],
    total: 0,
  }),

  actions: {
    // 获取文章列表
    async getArticleList() {
      if (this.articleList.length !== 0 && this.articleList.length > this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<ArticleListResult>(
        await Service.getArticleList({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        }),
      );
      this.loading = false;
      if (res.success) {
        this.articleList = [...this.articleList, ...res.data.list];
        this.total = res.data.total;
      } else {
        ElMessage.error(res.message);
      }
    },
  },
});
