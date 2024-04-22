import { defineStore } from 'pinia';
import { ToolListRes, ToolsItem } from '@/typings/common';
import * as Service from '@/server';
import { message, normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';

interface IProps {
  loading: boolean;
  toolList: ToolsItem[];
  total: number;
}

export const useToolsStore = defineStore('tools', {
  state: (): IProps => ({
    loading: false,
    toolList: [],
    total: 0,
  }),

  actions: {
    // 获取工具列表
    async getToolList() {
      try {
        // 检验是否有userId，如果没有禁止发送请求
        if (!useCheckUserId()) return;
        this.loading = true;
        const res = normalizeResult<ToolListRes>(await Service.getToolList('power'));
        this.loading = false;
        if (res.success) {
          const {list, total} = res.data;
          this.toolList = list;
          this.total = total;
        } else {
          message({
            title: res.message,
            type: 'error',
          });
        }
      } catch (error) {
        throw error;
      }
    },

    // 创建工具排序
    async createToolSort(params: { sortInfo: { id: string; sort: number }[] }) {
      try {
        if (!useCheckUserId()) return;
        const res = normalizeResult<ToolsItem>(await Service.createToolSort(params));
        message({
          title: res.message,
          type: res.success ? 'success' : 'error',
        });
      } catch (error) {
        return false;
      }
    },
  },
});
