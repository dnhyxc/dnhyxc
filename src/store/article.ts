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
  articleDetail: ArticleItem;
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
    articleDetail: {
      id: '',
    },
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

    // 获取文章详情
    async getArticleDetail(id: string) {
      if (!id) {
        ElMessage.error('哎呀！文章不翼而飞了！');
        return;
      }
      this.loading = true;
      const res = normalizeResult<ArticleItem>(await Service.getArticleDetail(id));
      this.loading = false;
      if (res.success) {
        console.log(res, 'res');
        this.articleDetail = res.data;
        return res.data;
      } else {
        ElMessage.error(res.message);
      }
    },

    // 清楚文章列表数据
    clearArticleList() {
      this.articleList = [];
      this.total = 0;
      this.pageNo = 0;
    },
  },
});
