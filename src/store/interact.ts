import { defineStore } from 'pinia';
import { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import { BarrageItem, InteractListRes } from '@/typings/common';
import * as Service from '@/server';
import { normalizeResult, Message } from '@/utils';
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
    pageSize: 20,
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
    async getInteracts(router?: Router) {
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
    async getInteractList(reset?: boolean, onScroll?: Function, isDelete?: boolean) {
      if (!reset && this.interactList.length !== 0 && this.interactList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
      };
      const res = normalizeResult<InteractListRes>(await Service.getInteractList(params));
      this.loading = false;
      if (res.success) {
        this.interactList = reset ? res.data.list : [...this.interactList, ...res.data.list];
        this.total = res.data.total;
        onScroll?.(2, isDelete);
      }
    },

    // 添加留言
    addInteract(onScrollTo: Function) {
      this.clearInteractList(false);
      this.getInteractList(true, onScrollTo);
    },

    // 删除留言
    async delInteract(id: string | string[], onScrollTo: Function) {
      Message('', !id.length ? '确定要删除该留言吗？' : '确定要清空所有吗？').then(async () => {
        const res = normalizeResult<InteractListRes>(await Service.removeInteracts(id));
        if (res.success) {
          this.barrageList = id.length ? this.barrageList.filter((i) => i.id !== id) : [];
          this.clearInteractList(false);
          this.getInteractList(true, onScrollTo, true);
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
      });
    },

    // 清除文章列表数据
    clearInteractList(clear: boolean = true) {
      if (clear) {
        this.interactList = [];
      }
      this.total = 0;
      this.pageNo = 0;
      this.loading = null;
    },
  },
});
