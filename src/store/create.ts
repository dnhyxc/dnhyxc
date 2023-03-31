import { defineStore } from 'pinia';
import { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import { CreateArticleParams } from '@/typings/common';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { loginStore } from '@/store';

interface IProps {
  createInfo: CreateArticleParams;
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
  },
});
