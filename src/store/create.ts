import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { CreateArticleParams } from '@/typings/common';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
// import { loginStore } from '@/store';

export const useCreateStore = defineStore('create', {
  state: () => ({}),

  actions: {
    // 创建文章
    async createArticle(params: CreateArticleParams) {
      try {
        // 检验是否有userId，如果没有禁止发送请求
        if (!useCheckUserId()) return;
        const res = normalizeResult<{ id: string }>(await Service.createArticle(params));
        if (res.success) {
          ElMessage.success(res.message);
        } else {
          ElMessage.error(res.message);
        }
      } catch (error) {
        throw error;
      }
    },
  },
});
