import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { AtlasList, AtlasItemParams } from '@/typings/common';

interface IProps {
  loading: boolean | null;
  atlasList: AtlasItemParams[];
  pageNo: number;
  pageSize: number;
  total: number; // 文章列表总数
}

export const usePictureStore = defineStore('picture', {
  state: (): IProps => ({
    loading: null,
    atlasList: [],
    total: 0,
    pageNo: 0,
    pageSize: 30,
  }),

  actions: {
    // 获取图片集列表
    async getAtlasList() {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      if (this.atlasList.length !== 0 && this.atlasList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<AtlasList>(
        await Service.getAtlasList({ pageNo: this.pageNo, pageSize: this.pageSize }),
      );
      this.loading = false;
      if (res.success) {
        this.atlasList = [...this.atlasList, ...res.data.list];
        this.total = res.data.total;
      }
    },

    // 添加图片
    async addAtlasImages(url: string, file: Blob) {
      const res = normalizeResult<AtlasItemParams>(
        await Service.addAtlasImages({
          url,
          size: file.size,
          fileName: file.name,
          type: file.type,
        }),
      );
      if (res.success) {
        const findOne = this.atlasList.find((i) => i.id === res.data.id);
        // 如果存在则不添加
        if (!findOne) {
          this.atlasList = [res.data, ...this.atlasList];
        }
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 删除图片集列表
    async deleteAtlasImages({ id, url }: { id: string | string[]; url?: string }) {
      const res = normalizeResult<{ url: string }>(await Service.deleteAtlasImages({ id, url }));
      if (res.success) {
        this.clearAtlasInfo();
        this.getAtlasList();
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 更新图片信息
    async updateImagesInfo(params: { id: string; fileName: string }) {
      const res = normalizeResult<{ count: number }>(await Service.updateFileInfo(params));
      if (res.success) {
        this.clearAtlasInfo();
        this.getAtlasList();
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 清除数据
    clearAtlasInfo() {
      this.pageNo = 0;
      this.total = 0;
      this.atlasList = [];
      this.loading = null;
    },
  },
});
