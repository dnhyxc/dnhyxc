import { defineStore } from 'pinia';
import { Classifys, ArticleItem, ArticleListResult } from '@/typings/common';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult, locSetItem, setParamsToStore, getStoreUserInfo } from '@/utils';
import { commonStore, loginStore } from '@/store';
import { PAGESIZE } from '@/constant';

interface IProps {
  tags: Classifys[]; // 文章分类数
  loading: boolean | null;
  pageNo: number;
  pageSize: number;
  articleList: ArticleItem[]; // 文章列表数据
  total: number; // 文章列表总数
  currentTag: string; // 当前选中的分类
}

export const useTagStore = defineStore('tag', {
  state: (): IProps => ({
    tags: [],
    loading: null,
    pageNo: 0,
    pageSize: PAGESIZE,
    articleList: [],
    total: 0,
    currentTag: '',
  }),

  actions: {
    // 获取标签数
    async getTags() {
      const res = normalizeResult<Classifys[]>(await Service.getTagList('tag'));
      if (res.success) {
        this.tags = res.data;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取标签所对应的文章列表
    async getArticleByTagName(tagName?: string) {
      if (this.articleList.length !== 0 && this.articleList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        tagName: this.currentTag || tagName || this.tags[0]?.name!,
        keyword: commonStore.keyword, // 头部搜索关键词
      };

      if (this.pageNo === 1) {
        // 保存至storage用于根据不同页面进入详情时，针对性的进行上下篇文章的获取（如：分类页面上下篇、标签页面上下篇）
        locSetItem(
          'params',
          JSON.stringify({
            tagName: this.currentTag || this.tags[0]?.name,
            userId: loginStore.userInfo?.userId,
            from: 'tag',
          }),
        );

        const { userInfo } = getStoreUserInfo();

        const storeParams = {
          from: 'tagList',
          tagName: this.currentTag || this.tags[0]?.name,
          userId: loginStore.userInfo?.userId || userInfo?.userId,
        };

        // 将页面搜索信息保存到electron-store中
        setParamsToStore('tagList', storeParams);
      }

      const res = normalizeResult<ArticleListResult>(await Service.searchArticle(params));
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
