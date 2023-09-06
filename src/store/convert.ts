import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { ConvertParams } from '@/typings/common';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { loginStore } from '.';

interface IProps {
  loading: boolean;
  convertList: ConvertParams[];
}

export const useConvertStore = defineStore('convert', {
  state: (): IProps => ({
    loading: false,
    convertList: [],
  }),

  actions: {
    // 添加转换列表
    async createConvert(keyword: string) {
      try {
        if (!useCheckUserId()) return;
        const findOne = this.convertList.some((i) => i.keyword === keyword);
        if (findOne) return;
        const res = normalizeResult<{ id: string }>(await Service.createConvert({ keyword }));
        if (!res.success) {
          ElMessage.error(res.message);
        } else {
          // 如果列表长度大于五，则删除最后一条
          if (this.convertList.length >= 10) {
            this.convertList.pop();
          }
          this.convertList.unshift({
            keyword,
            userId: loginStore.userInfo?.userId!,
            id: `${Math.random()}`,
          });
        }
      } catch (error) {
        return false;
      }
    },

    // 获取转换列表
    async getConvertList() {
      try {
        // 检验是否有userId，如果没有禁止发送请求
        if (!useCheckUserId()) return;
        this.loading = true;
        const res = normalizeResult<ConvertParams[]>(await Service.getConvertList());
        this.loading = false;
        if (res.success) {
          this.convertList = res.data;
        } else {
          ElMessage.error(res.message);
        }
      } catch (error) {
        throw error;
      }
    },

    // 删除转换列表
    async deleteConvert(id?: string | string[]) {
      try {
        if (!useCheckUserId()) return;
        const ids = this.convertList.map((i) => i.id);
        const res = normalizeResult<{ id: string }>(await Service.deleteConvert({ id: id || ids }));
        if (!res.success) {
          ElMessage.error(res.message);
        } else {
          this.convertList = [];
        }
      } catch (error) {
        return false;
      }
    },
  },
});
