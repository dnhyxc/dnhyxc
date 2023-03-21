import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { UserInfoParams, ArticleListResult, ArticleItem, TimelineResult } from '@/typings/common';
import * as Service from '@/server';
import { normalizeResult, locSetItem } from '@/utils';
import { loginStore } from '@/store';
import { AUTHOR_API_PATH, PAGESIZE } from '@/constant';

interface IProps {
  loading: boolean;
  userInfo: UserInfoParams;
  pageNo: number;
  pageSize: number;
  articleList: ArticleItem[];
  timelineList: TimelineResult[];
  total: number;
  currentTabKey: string;
}

export const useAuthorStore = defineStore('author', {
  state: (): IProps => ({
    loading: false,
    userInfo: {
      userId: '',
      username: '',
      job: '',
      motto: '',
      introduce: '',
      headUrl: '',
      mainCover: '',
      juejin: '',
      zhihu: '',
      github: '',
      blog: '',
    }, // 博主的用户信息
    pageNo: 0,
    pageSize: PAGESIZE,
    articleList: [],
    timelineList: [],
    total: 0,
    currentTabKey: '0',
  }),

  getters: {},

  actions: {
    // 获取用户信息
    async getUserInfo() {
      try {
        const res = normalizeResult<UserInfoParams>(await Service.getUserInfo({ auth: 1 }));
        if (res.success) {
          this.userInfo = res.data;
        } else {
          ElMessage({
            message: res.message,
            type: 'error',
            offset: 80,
          });
        }
      } catch (error) {
        throw error;
      }
    },

    // 获取博主的文章及点赞文章列表
    async getAuthorArticles() {
      if (this.articleList.length !== 0 && this.articleList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        accessUserId: loginStore.userInfo?.userId,
      };
      // 保存至storage用于根据不同页面进入详情时，针对性的进行上下篇文章的获取（如：分类页面上下篇、标签页面上下篇）
      locSetItem(
        'params',
        JSON.stringify({
          accessUserId: loginStore.userInfo?.userId,
          selectKey: this.currentTabKey,
          from: 'author',
        }),
      );
      const res = normalizeResult<ArticleListResult>(
        await Service.getAuthorArticleList(params, AUTHOR_API_PATH[this.currentTabKey]),
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

    // 获取时间轴列表
    async getAuthorTimeline(selectKey: string) {
      // 保存至storage用于根据不同页面进入详情时，针对性的进行上下篇文章的获取（如：分类页面上下篇、标签页面上下篇）
      locSetItem('params', JSON.stringify({ accessUserId: loginStore.userInfo?.userId, selectKey, from: 'author' }));
      this.loading = true;
      const res = normalizeResult<TimelineResult[]>(
        await Service.getAuthorTimeline({ accessUserId: loginStore.userInfo?.userId }),
      );
      this.loading = false;
      if (res.success) {
        this.timelineList = res.data;
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
