import { defineStore } from 'pinia';
import { Classifys, ArticleItem, ArticleListResult } from '@/typings/common';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult} from '@/utils';
import { commonStore } from '@/store';
import { PAGESIZE } from '@/constant';

interface IProps {
  classifys: Classifys[]; // 文章分类数
  loading: boolean | null;
  pageNo: number;
  pageSize: number;
  articleList: ArticleItem[]; // 文章列表数据
  total: number; // 文章列表总数
  currentClassify: string; // 当前选中的分类
}

export const useClassifyStore = defineStore('classify', {
  state: (): IProps => ({
    classifys: [],
    loading: null,
    pageNo: 0,
    pageSize: PAGESIZE,
    articleList: [],
    total: 0,
    currentClassify: '',
  }),

  actions: {
    // 获取文章分类数
    async getClassifys() {
      const res = normalizeResult<Classifys[]>(await Service.getTagList('classify'));
      if (res.success) {
        this.classifys = res.data;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取文章分类
    async getClassifyList(classify?: string) {
      if (this.articleList.length !== 0 && this.articleList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        classify: this.currentClassify || classify || this.classifys[0]?.name!,
        filter: commonStore.keyword, // 头部搜索关键词
      };

      const res = normalizeResult<ArticleListResult>(await Service.getClassifyList(params));
      this.loading = false;
      if (res.success) {
        this.articleList = [...this.articleList, ...res.data.list];
        this.total = res.data.total;
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
  },
});
