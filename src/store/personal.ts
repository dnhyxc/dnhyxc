import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { UserInfoParams, ArticleListResult, ArticleItem, TimelineResult, PerGetArticlesParams } from '@/typings/common';
import * as Service from '@/server';
import { normalizeResult, locSetItem, uniqueFunc, Message } from '@/utils';
import { loginStore } from '@/store';
import { AUTHOR_API_PATH, PAGESIZE, ABOUT_ME_API_PATH } from '@/constant';

interface IProps {
  loading: boolean;
  userInfo: UserInfoParams;
  pageNo: number;
  pageSize: number;
  articleList: ArticleItem[];
  timelineList: TimelineResult[];
  total: number;
  currentTabKey: string;
  collectTotal: number;
  collectedCount: number;
}

export const usePersonalStore = defineStore('personal', {
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
    collectTotal: 0,
    collectedCount: 0,
  }),

  getters: {
    // 返回当前选中的收藏集
    currentCollect: (state) => {
      return (id: string) => {
        return state.articleList.find((i) => i.id === id);
      };
    },
  },

  actions: {
    // 获取用户信息
    async getUserInfo(userId: string) {
      const res = normalizeResult<UserInfoParams>(await Service.getUserInfo({ userId }));
      if (res.success) {
        this.userInfo = res.data;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
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

    // 获取我的文章、点赞文章列表、我的收藏列表
    async getMyArticleList() {
      if (!this.userInfo.userId) return;
      if (this.articleList.length !== 0 && this.articleList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const params: PerGetArticlesParams = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        userId: this.userInfo?.userId!,
        accessUserId: loginStore.userInfo?.userId!, // accessUserId有值，说明是访问别人的主页，需要通过accessUserId去获取点赞状态
      };

      // 访问他人主页时，增加isVisitor参数
      if (this.userInfo.userId !== loginStore.userInfo?.userId) {
        params.isVisitor = true;
      }

      // 保存至storage用于根据不同页面进入详情时，针对性的进行上下篇文章的获取（如：分类页面上下篇、标签页面上下篇）
      locSetItem(
        'params',
        JSON.stringify({
          userId: this.userInfo.userId,
          accessUserId: loginStore.userInfo?.userId,
          selectKey: this.currentTabKey,
          from: 'personal',
        }),
      );

      const res = normalizeResult<ArticleListResult>(
        await Service.getMyArticleList(params, ABOUT_ME_API_PATH[this.currentTabKey]),
      );
      this.loading = false;
      if (res.success) {
        const { total, list } = res.data;
        // 当是我的收藏时，再增加收藏集时，需要去除重复的收藏集
        if (this.currentTabKey === '1' && this.pageNo > 1) {
          this.articleList = uniqueFunc([...this.articleList, ...list], 'id');
          this.total = total;
        } else {
          this.articleList = [...this.articleList, ...list];
          this.total = total;
        }
      }
    },

    // 删除收藏集
    async delCollection(id: string) {
      Message('删除收藏集同时会移除收藏集中的文章！', '确定移除该收藏集吗？').then(async () => {
        const res = normalizeResult<ArticleListResult>(
          await Service.delCollection({
            id,
            userId: this.userInfo.userId,
            pageNo: this.pageNo,
            pageSize: this.pageSize,
          }),
        );
        if (res.success) {
          const nextPageOne = res?.data?.list[0] || '';
          const list = this.articleList.filter((i) => i.id !== id);
          this.articleList = nextPageOne ? [...list, nextPageOne] : list;
          this.total = this.total - 1;
          // 如果是收藏集tab，getCollectionTotal有值，需要实时获取删除后的收藏集总条数
          this.getCollectionTotal();
          this.getCollectedTotal();
        }
      });
    },

    // 获取收藏集总数
    async getCollectionTotal() {
      const res = normalizeResult<number>(
        await Service.getCollectTotal({
          userId: this.userInfo?.userId!,
          status: this.userInfo.userId !== loginStore.userInfo?.userId ? 1 : 0, // 1: 公开，2：私有
        }),
      );
      if (res.success) {
        this.collectTotal = res.data;
      }
    },

    // 获取收藏文章总条数
    async getCollectedTotal() {
      const res = normalizeResult<{ total: number }>(
        await Service.getCollectedTotal({
          userId: this.userInfo?.userId!,
          status: this.userInfo.userId !== loginStore.userInfo?.userId ? 1 : 0, // 1: 公开，2：私有
        }),
      );
      if (res.success) {
        this.collectedCount = res.data.total;
      }
    },

    // 清除文章列表数据
    clearArticleList() {
      this.articleList = [];
      this.timelineList = [];
      this.total = 0;
      this.pageNo = 0;
      this.collectTotal = 0;
      this.collectedCount = 0;
    },
  },
});
