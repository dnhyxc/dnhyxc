import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { CodeItem, CodeList } from '@/typings/common';

interface IProps {
  loading: boolean | null;
  codeList: CodeItem[];
  pageNo: number;
  pageSize: number;
  total: number; // 文章列表总数
  currentCodeId: string; // 当前保存的 code id
  codeInfo: {
    title: string;
    abstract: string;
  };
  editCode: string;
  codeDetail: CodeItem;
  compileData: string;
  compileLoading: boolean;
}

export const useCodeStore = defineStore('code', {
  state: (): IProps => ({
    loading: null,
    codeList: [],
    total: 0,
    pageNo: 0,
    pageSize: 30,
    currentCodeId: '',
    codeInfo: {
      title: '',
      abstract: '',
    },
    editCode: '',
    codeDetail: {} as CodeItem,
    compileData: '',
    compileLoading: false,
  }),

  actions: {
    // 获取代码示例列表
    async getCodeList() {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      if (this.codeList.length !== 0 && this.codeList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<CodeList>(
        await Service.getCodeList({ pageNo: this.pageNo, pageSize: this.pageSize }),
      );
      this.loading = false;
      if (res.success) {
        this.codeList = [...this.codeList, ...res.data.list];
        this.total = res.data.total;
      }
    },

    // 添加图片
    async saveCode({ content, language }: { content: string; language: string }) {
      const res = normalizeResult<CodeItem>(
        await Service[this.currentCodeId ? 'updateCode' : 'addCode']({
          id: this.currentCodeId,
          title: this.codeInfo.title,
          abstract: this.codeInfo.abstract,
          content,
          language,
        }),
      );

      if (res.success) {
        this.codeList = [res.data, ...this.codeList];
        !this.currentCodeId && (this.currentCodeId = res.data.id);
      }

      ElMessage({
        message: res.message,
        type: res.success ? 'success' : 'error',
        offset: 80,
      });
    },

    // 删除代码示例
    async deleteCode(id: string) {
      const res = normalizeResult<{ id: string }>(await Service.deleteCode({ id }));
      if (res.success) {
        this.clearCodeInfo();
        this.getCodeList();
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取代码示例
    async getCodeById(id: string) {
      const res = normalizeResult<CodeItem>(await Service.getCodeById(id));
      if (res.success) {
        this.codeDetail = res.data;
        this.currentCodeId = res.data.id;
        this.codeInfo = {
          title: res.data.title,
          abstract: res.data.abstract,
        };
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 编译C语言, options: gcc 编译选项，如 -lm（链接数学库）、-std=<standard>：指定符合的 C 或 C++ 标准，例如 -std=c11
    async compileCCode(code: string, options?: string) {
      this.compileLoading = true;
      const res = normalizeResult<string>(await Service.compileCCode({ code, options }));
      this.compileLoading = false;
      if (res.success) {
        this.compileData = res.data;
      }
    },

    // 编译JS
    async compileJSCode(code: string) {
      this.compileLoading = true;
      const res = normalizeResult<string>(await Service.compileJSCode(code));
      this.compileLoading = false;
      if (res.success) {
        this.compileData = res.data ? `${res.data}` : '';
      }
    },

    // 清除数据
    clearCodeInfo() {
      this.pageNo = 0;
      this.total = 0;
      this.codeList = [];
      this.loading = null;
    },

    // 清除当前保存的code id
    clearCodeId() {
      this.currentCodeId = '';
      this.codeInfo = {
        title: '',
        abstract: '',
      };
      this.codeDetail = {} as CodeItem;
    },
  },
});
