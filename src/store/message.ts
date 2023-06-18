import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';
import { normalizeResult, getStoreUserInfo } from '@/utils';
import * as Service from '@/server';
import { PAGESIZE } from '@/constant';
import { loginStore } from '@/store';
import { ArticleItem, ArticleListResult } from '@/typings/common';

interface IProps {
  msgCount: number;
  noReadMsgList: ArticleItem[];
  msgList: ArticleItem[];
  loading: boolean | null;
  total: number;
  pageNo: number;
  pageSize: number;
  visible: boolean;
}

export const useMessageStore = defineStore('message', {
  state: (): IProps => ({
    msgCount: 0,
    noReadMsgList: [],
    msgList: [],
    loading: null,
    total: 0,
    pageNo: 0,
    pageSize: PAGESIZE,
    visible: false,
  }),

  actions: {
    // 获取消息列表
    async getMessageList() {
      if (!loginStore?.userInfo?.userId) {
        this.loading = false;
        return;
      }
      if (this.msgList.length !== 0 && this.msgList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<ArticleListResult>(
        await Service.getMessageList({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        }),
      );
      this.loading = false;
      if (res.success) {
        const { total, list } = res.data;
        this.msgList = [...this.msgList, ...list];
        this.total = total;
        this.setReadStatus();
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 设置消息阅读状态
    async setReadStatus(ids?: string[]) {
      const msgIds = this.msgList
        .filter((i) => !i.isReaded)
        .map((i) => i.id)
        .slice((this.pageNo - 1) * this.pageSize, this.pageNo * this.pageSize + this.pageSize); // 0 => 20, 20 => 40, 40 => 60

      if (!msgIds?.length && !ids?.length) return;

      normalizeResult<number>(await Service.setReadStatus({ msgIds: ids || msgIds }));
    },

    // 获取未读消息数量
    async getNoReadMsgCount() {
      if (!loginStore?.userInfo?.userId) return;
      const res = normalizeResult<{ count: number; list: ArticleItem[] }>(await Service.getNoReadMsgCount());
      if (res.success) {
        this.msgCount = res.data.count;
        this.noReadMsgList = res.data.list;
      }
      return res;
    },

    // 删除消息
    async deleteMessage(id: string) {
      const res = normalizeResult<string>(await Service.deleteMessage(id));
      if (res.success) {
        // 删除成功之后，重新获取消息列表
        const total = this.msgList?.length;
        // 删除草稿后，清除原本的草稿数据，重新获取草稿列表
        this.clearMessageInfo();
        this.pageSize = total;
        this.getMessageList();
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
    },

    // 删除全部消息
    async deleteAllMessage() {
      const res = normalizeResult<number>(await Service.deleteAllMessage());
      if (res.success) {
        // 删除草稿后，清除原本的草稿数据
        this.clearMessageInfo();
        this.loading = false;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 添加消息
    addMessage(data: ArticleItem) {
      // 推送消息时，重新获取消息列表，并将未读数清除
      this.clearMessageInfo();
      this.getMessageList();
      this.msgCount = 0;
    },

    // 计算消息数量
    setMsgCount(data: ArticleItem) {
      const { pathname } = window.location;

      const { userInfo } = getStoreUserInfo();

      if (
        (data?.fromUserId !== loginStore.userInfo?.userId && !pathname.includes('/article')) ||
        (pathname.includes('/article') && userInfo?.userId !== data?.fromUserId)
      ) {
        this.msgCount += 1;
      }
    },

    // 清除消息列表
    clearMessageInfo() {
      this.pageNo = 0;
      this.msgList = [];
      this.total = 0;
      this.pageSize = PAGESIZE;
      this.loading = null;
    },
  },
});
