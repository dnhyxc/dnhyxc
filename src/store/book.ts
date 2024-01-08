import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { AtlasList, AtlasItemParams, BookRecord } from '@/typings/common';

interface IProps {
  loading: boolean | null;
  bookList: AtlasItemParams[];
  pageNo: number;
  pageSize: number;
  total: number;
  currentUploadId: string;
  bookRecordInfo: Partial<BookRecord | null>; // 赋值为可选属性
}

export const useBookStore = defineStore('book', {
  state: (): IProps => ({
    loading: null,
    bookList: [],
    total: 0,
    pageNo: 0,
    pageSize: 30,
    bookRecordInfo: null,
    currentUploadId: '',
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
        this.currentUploadId = res.data.id;
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
    async updateBookInfo(params: {
      id: string;
      fileName: string;
      coverImg: string;
      author: string;
      translator: string;
      language: string;
    }) {
      const res = normalizeResult<{ count: number }>(await Service.updateBookInfo(params));
      if (res.success) {
        this.bookList = this.bookList.map((item) => {
          if (item.id === params.id) {
            return {
              ...item,
              fileName: params.fileName,
              coverImg: params.coverImg,
              author: params.author,
              translator: params.translator,
              language: params.language,
            };
          }
          return item;
        });
      }
      ElMessage({
        message: res.message,
        type: res.success ? 'success' : 'error',
        offset: 80,
      });
    },

    // 添加读书记录
    async createReadBookRecords(params: BookRecord) {
      const res = normalizeResult<BookRecord>(await Service.createReadBookRecords(params));
      if (!res.success) {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取读书记录
    async getReadBookRecords(bookId: string) {
      const res = normalizeResult<BookRecord>(await Service.getReadBookRecords({ bookId }));
      if (res.success) {
        this.bookRecordInfo = res.data;
        return res.data;
      } else {
        ElMessage({
          message: res.message,
          type: res.success ? 'success' : 'error',
          offset: 80,
        });
      }
    },

    // 删除读书记录
    async deleteReadBookRecords(bookId: string) {
      const res = normalizeResult<{ count: number }>(await Service.deleteReadBookRecords({ bookId }));
      ElMessage({
        message: res.message,
        type: res.success ? 'success' : 'error',
        offset: 80,
      });
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
