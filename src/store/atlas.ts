import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { PAGESIZE } from '@/constant';

interface IProps {
  loading: boolean;
  atlasList: string[];
  pageNo: number;
  pageSize: number;
  total: number; // 文章列表总数
}

export const useToolsStore = defineStore('tools', {
  state: (): IProps => ({
    loading: false,
    atlasList: [],
    total: 0,
    pageNo: 0,
    pageSize: PAGESIZE,
  }),

  actions: {
    // 获取图片集列表
    async getAtlasList() {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      if (this.atlasList.length !== 0 && this.atlasList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<{ list: string[]; total: number }>(
        await Service.getAtlasList({ pageNo: this.pageNo, pageSize: this.pageSize }),
      );
      this.loading = false;
      if (res.success) {
        this.atlasList = [...this.atlasList, ...res.data.list];
        this.total = res.data.total;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },
  },
});
