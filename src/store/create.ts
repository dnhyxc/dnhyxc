import { defineStore } from 'pinia';
import { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import { CreateArticleParams } from '@/typings/common';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { loginStore } from '@/store';

export const useCreateStore = defineStore('create', {
  state: () => ({}),

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
          ElMessage.success(res.message);
          router?.push('/home');
        } else {
          ElMessage.error(res.message);
        }
      } catch (error) {
        throw error;
      }
    },
  },
});
