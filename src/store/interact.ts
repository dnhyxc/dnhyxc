import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { BarrageItem, InteractListRes } from '@/typings/common';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { loginStore } from '@/store';
import { useCheckUserId } from '@/hooks';

interface IProps {
  barrageList: BarrageItem[]; // 弹幕列表
  interactList: BarrageItem[]; // 留言列表
  pageNo: number;
  pageSize: number;
  total: number; // 文章列表总数
  loading: boolean | null;
  interactLoading: boolean | null;
}

export const useInteractStore = defineStore('interact', {
  state: (): IProps => ({
    barrageList: [],
    interactList: [],
    loading: null,
    interactLoading: null,
    pageNo: 0,
    pageSize: 100,
    total: 0,
  }),

  actions: {
    // 获取留言列表
    async createInteract(comment: string) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      const { username = '', headUrl = '' } = loginStore.userInfo;
      const res = normalizeResult<BarrageItem[]>(
        await Service.createInteract({
          comment,
          username,
          avatar: headUrl,
        }),
      );
      if (!res.success) {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取留言列表
    async getInteracts() {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      this.interactLoading = true;
      const res = normalizeResult<BarrageItem[]>(await Service.getInteracts());
      this.interactLoading = false;
      if (res.success) {
        this.barrageList = res.data;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 分页获取留言列表
    async getInteractList() {
      if (this.interactList.length !== 0 && this.interactList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
      };
      const res = normalizeResult<InteractListRes>(await Service.getInteractList(params));
      this.loading = false;
      if (res.success) {
        this.interactList = [...this.interactList, ...res.data.list];
        this.total = res.data.total;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 添加留言
    addInteract(params: BarrageItem) {
      this.interactList = [params, ...this.interactList];
    },

    // 清除文章列表数据
    clearInteractList() {
      this.interactList = [];
      this.total = 0;
      this.pageNo = 0;
      this.loading = null;
    },
  },
});