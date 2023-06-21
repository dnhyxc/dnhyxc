import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { UserInfoParams, ArticleListResult, ArticleItem, TimelineResult } from '@/typings/common';
import * as Service from '@/server';
import { useCheckUserId } from '@/hooks';
import { normalizeResult, Message, ipcRenderers } from '@/utils';
import { loginStore } from '@/store';
import { AUTHOR_API_PATH, PAGESIZE } from '@/constant';

interface IProps {
  loading: boolean | null;
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
    loading: null,
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

      const res = normalizeResult<ArticleListResult>(
        await Service.getAuthorArticleList(params, AUTHOR_API_PATH[this.currentTabKey]),
      );
      this.loading = false;
      if (res.success) {
        const { total, list } = res.data;
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
    async getAuthorTimeline() {
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

    // 删除timeline文章hooks
    async deleteTimelineArticle(articleId: string) {
      if (!useCheckUserId(false)) return;
      Message('', '确定删除该文章吗？').then(async () => {
        const res = normalizeResult<{ id: string }>(await Service.deleteArticle({ articleId, type: 'timeline' }));
        if (res.success) {
          // 发送删除的文章的消息给主进程，通知主进程及时关闭对应子窗口
          ipcRenderers.sendRemove(articleId);
          const list = this.timelineList.map((i) => {
            if (i.articles.length) {
              const filterList = i.articles.filter((j) => j.id !== articleId);
              return {
                ...i,
                count: filterList.length,
                articles: filterList,
              };
            }
            return { ...i };
          });
          this.timelineList = list;
        } else {
          ElMessage({
            message: res.message,
            type: 'error',
            offset: 80,
          });
        }
      });
    },

    // 清除文章列表数据
    clearArticleList() {
      this.articleList = [];
      this.timelineList = [];
      this.total = 0;
      this.pageNo = 0;
      this.pageSize = PAGESIZE;
    },
  },
});
