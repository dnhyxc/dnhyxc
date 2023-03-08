import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { CollectListRes, AddCollectionRes } from '@/typings/common';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';

interface IProps {
  loading: boolean;
  pageNo: number;
  pageSize: number;
  collectList: AddCollectionRes[]; // 收藏集列表数据
  total: number; // 收藏集列表总数
  checkedCollectIds: string[];
}

export const useCollectStore = defineStore('collect', {
  state: (): IProps => ({
    pageNo: 0,
    pageSize: 10,
    total: 0,
    collectList: [],
    loading: false,
    checkedCollectIds: [],
  }),

  actions: {
    // 创建文章
    async addCollect(params: { name: string; desc: string; status: string }) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      const res = normalizeResult<AddCollectionRes>(
        await Service.createCollection({ ...params, status: Number(params.status) }),
      );
      if (res.success) {
        ElMessage.success(res.message);
        this.checkedCollectIds = [res.data.id];
        return res;
      } else {
        ElMessage.error(res.message);
      }
    },

    // 获取收藏集
    async getCollectList() {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      if (this.collectList.length !== 0 && this.collectList.length > this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<CollectListRes>(
        await Service.getCollectionList({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        }),
      );
      this.loading = false;
      if (res.success) {
        this.collectList = [...this.collectList, ...res.data.list];
        this.total = res.data.total;
      } else {
        ElMessage.error(res.message);
      }
    },

    // 清除收藏集
    clearCollectList() {
      this.collectList = [];
      this.pageNo = 0;
      this.total = 0;
      this.checkedCollectIds = [];
    },
  },
});
