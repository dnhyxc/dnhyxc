import { defineStore } from 'pinia';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { createStore } from '@/store';
import { useCheckUserId } from '@/hooks';

interface IProps {
  uploadFilePath: string;
  visible: boolean;
}

// 公共store
export const useUploadStore = defineStore('upload', {
  state: (): IProps => ({
    uploadFilePath: '',
    visible: false,
  }),

  actions: {
    // 文件上传
    async uploadFile(file: File) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      const formData = new FormData();
      formData.append('file', file);
      const res = normalizeResult<{ filePath: string }>(await Service.uploadFile(formData));
      if (res.success) {
        this.uploadFilePath = res.data.filePath;
        createStore.createInfo.coverImage = res.data.filePath;
        this.visible = true;
      }
    },

    // 清空返回路径
    clearFilePath() {
      this.uploadFilePath = '';
    },
  },
});
