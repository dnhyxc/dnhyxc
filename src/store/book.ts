import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { AtlasList, AtlasItemParams } from '@/typings/common';

interface IProps {
  loading: boolean | null;
  bookList: AtlasItemParams[];
  pageNo: number;
  pageSize: number;
  total: number;
}

export const useBookStore = defineStore('book', {
  state: (): IProps => ({
    loading: null,
    bookList: [],
    total: 0,
    pageNo: 0,
    pageSize: 30,
  }),

  actions: {
    // 添加书籍
    async addBook(url: string, file: Blob) {
      const res = normalizeResult<AtlasItemParams>(
        await Service.addBook({
          url,
          size: file.size,
          fileName: file.name,
          type: file.type,
        }),
      );

      if (res.success) {
        if (res.code === 201) return;
        this.bookList = [res.data, ...this.bookList];
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取书籍列表
    async getBookList() {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      if (this.bookList.length !== 0 && this.bookList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<AtlasList>(
        await Service.getBookList({ pageNo: this.pageNo, pageSize: this.pageSize }),
      );
      this.loading = false;
      if (res.success) {
        this.bookList = [...this.bookList, ...res.data.list];
        this.total = res.data.total;
      }
    },

    // 删除书籍列表
    async deleteBook({ id, url }: { id: string; url?: string }) {
      const res = normalizeResult<{ url: string }>(await Service.deleteBook({ id, url }));
      if (res.success) {
        this.clearBookInfo();
        this.getBookList();
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 更新书籍信息
    async updateBookInfo(params: { id: string; fileName: string }) {
      const res = normalizeResult<{ count: number }>(await Service.updateBookInfo(params));
      if (res.success) {
        this.clearBookInfo();
        this.getBookList();
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 清除数据
    clearBookInfo() {
      this.pageNo = 0;
      this.total = 0;
      this.bookList = [];
      this.loading = null;
    },
  },
});
