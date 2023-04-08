import { defineStore } from 'pinia';
import { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  ArticleItem,
  CreateArticleParams,
  ArticleListResult,
  CreateDraftParamsResult,
  ArticleDetailParams,
} from '@/typings/common';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { loginStore } from '@/store';
import { PAGESIZE, ARTICLE_DRAFT } from '@/constant';

interface IProps {
  createInfo: CreateArticleParams;
  pageNo: number;
  pageSize: number;
  draftList: ArticleItem[];
  total: number; // 列表总数
  loading: boolean | null;
  draftArticleId: string; // 草稿id
  draftInfo: ArticleDetailParams;
}

export const useCreateStore = defineStore('create', {
  state: (): IProps => ({
    createInfo: {
      createTime: new Date().valueOf(),
      authorId: '',
      title: '',
      content: '',
      classify: '',
      tag: '',
      coverImage: '',
      abstract: '',
      articleId: '',
    },
    pageNo: 0,
    pageSize: PAGESIZE,
    total: 0,
    draftList: [],
    loading: null,
    draftArticleId: '',
    draftInfo: {},
  }),

  actions: {
    // 创建文章
    async createArticle(params: CreateArticleParams, router?: Router) {
      const { userInfo } = loginStore;
      try {
        // 检验是否有userId，如果没有禁止发送请求
        if (!useCheckUserId()) return;
        const res = normalizeResult<{ id: string }>(
          await Service.createArticle({
            ...params,
            authorId: userInfo?.userId,
          }),
        );
        if (res.success) {
          // 如果使用的是草稿发布的文章，则发布成功之后，需要删除当前草稿
          this.deleteDraft('', true);
          ElMessage({
            message: res.message,
            type: 'success',
            offset: 80,
            duration: 2000,
          });
          router?.push('/home');
        } else {
          ElMessage({
            message: res.message,
            type: 'error',
            offset: 80,
            duration: 2000,
          });
        }
      } catch (error) {
        throw error;
      }
    },

    // 文章草稿的创建及更新接口
    async articleDraft(props?: CreateArticleParams) {
      const params = {
        ...this.createInfo,
        authorId: loginStore.userInfo?.userId,
        articleId: props?.draftId || this.draftArticleId,
        ...props,
      };

      // 当没有标题时，自动截取内容的前十个字符作为标题
      if (!params.title) {
        params.title = params.content?.slice(0, 10);
      }

      const res = normalizeResult<CreateDraftParamsResult>(
        await Service.articleDraft(params, ARTICLE_DRAFT[this.draftArticleId || props?.draftId ? 2 : 1]),
      );

      if (res.success) {
        // 保存、编辑成功后，清除存储的draftId
        this.clearCreateDraftInfo();
        ElMessage({
          message: res.message,
          type: 'success',
          offset: 80,
          duration: 2000,
        });
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
          duration: 2000,
        });
      }
    },

    // 获取草稿列表
    async getDraftList() {
      if (this.draftList.length !== 0 && this.draftList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<ArticleListResult>(
        await Service.getDraftList({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        }),
      );
      this.loading = false;
      if (res.success) {
        const { total, list } = res.data;
        this.draftList = [...this.draftList, ...list];
        this.total = total;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取草稿详情
    async getDraftDetail(draftId: string) {
      if (!draftId && !this.draftArticleId) return;
      const res = normalizeResult<ArticleDetailParams>(
        await Service.getDraftInfoById({ id: draftId! || this.draftArticleId }),
      );
      if (res.success) {
        this.createInfo = res.data as CreateArticleParams;
        this.draftArticleId = res.data.id!;
        this.draftInfo = res.data;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 删除草稿
    async deleteDraft(draftId?: string, noMsg?: boolean) {
      if (!draftId && !this.draftArticleId) return;
      const res = normalizeResult<string>(await Service.deleteDraft({ id: draftId || this.draftArticleId }));
      if (res.success) {
        // 如果是使用草稿创建文章，则不需要提示
        if (noMsg) return;
        // 获取删除时拉取的文章总数，用于取消点赞时，拉取对应的数量
        const total = this.draftList?.length;
        // 删除草稿后，清除原本的草稿数据，重新获取草稿列表
        this.clearDraftListInfo();
        this.pageSize = total;
        this.getDraftList();
        ElMessage({
          message: res.message,
          type: 'success',
          offset: 80,
        });
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 清除编辑内容
    clearCreateInfo(clearAll?: boolean) {
      this.createInfo = {
        createTime: new Date().valueOf(),
        authorId: '',
        title: '',
        content: clearAll ? '' : this.createInfo.content,
        classify: '',
        tag: '',
        coverImage: '',
        abstract: '',
        articleId: '',
      };
    },

    // 清除获取草稿列表相关数据
    clearDraftListInfo() {
      this.pageNo = 0;
      this.draftList = [];
      this.total = 0;
      this.loading = null;
    },

    // 清空草稿相关数据
    clearCreateDraftInfo() {
      this.draftArticleId = '';
    },
  },
});
