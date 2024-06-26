import { defineStore } from 'pinia';
import { normalizeResult, getStoreUserInfo, ipcRenderers, getMsgStatus, message } from '@/utils';
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
      // 首次获取消息列表时加载未读消息列表，防止未读消息未加载到的问题
      if (this.pageNo === 1) {
        this.getNoReadMsgCount();
      }
      const res = normalizeResult<ArticleListResult>(
        await Service.getMessageList({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        }),
      );
      this.loading = false;
      if (res.success) {
        const {total, list} = res.data;
        this.msgList = [...this.msgList, ...list];
        this.total = total;
        this.setReadStatus();
      } else {
        message({
          title: res.message,
          type: 'error',
        });
      }
    },

    // 设置消息阅读状态
    async setReadStatus(ids?: string[]) {
      const msgIds = this.msgList.filter((i) => !i.isReaded).map((i) => i.id);
      if (!msgIds?.length && !ids?.length) return;
      const allIds = ids?.length ? [...msgIds, ...ids] : msgIds;
      const residueNoReadMsgs = this.msgCount - (ids?.length || msgIds?.length);
      // 判断是否还有未读消息，如果有调用接口设置消息已读
      if (this.msgCount > 0) {
        normalizeResult<number>(await Service.setReadStatus({msgIds: ids || msgIds}));
        this.msgList.forEach((i) => {
          if (allIds.includes(i.id)) {
            i.isReaded = true;
          }
        });
      }
      // 计算未读数量的数量
      if (residueNoReadMsgs > 0) {
        this.msgCount = residueNoReadMsgs;
        const residueList = this.noReadMsgList.filter((i) => !msgIds.includes(i.id));
        // 每次设置已读消息时，重新通知消息窗口刷新数据
        ipcRenderers.sendFlashMsg(
          JSON.stringify({
            count: this.msgCount,
            noReadMsg: residueList?.[0],
          }),
        );
      } else {
        this.msgCount = 0;
        this.noReadMsgList = [];
        // 当没有未读消息时，通知主进程停止托盘闪动
        ipcRenderers.sendStopFlashMsg(
          JSON.stringify({
            count: this.msgCount,
            noReadMsg: this.noReadMsgList?.[0],
          }),
        );
      }
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
        message({
          title: res.message,
          type: 'success',
        });
      } else {
        message({
          title: res.message,
          type: 'error',
        });
      }
    },

    // 删除全部消息
    async deleteAllMessage() {
      const res = normalizeResult<number>(await Service.deleteAllMessage());
      if (res.success) {
        // 清除消息信息
        this.clearMessageInfo();
        this.loading = false;
        // 删除所有消息之后，清除未读消息数量及列表，并通知主进程停止托盘图标闪动
        this.msgCount = 0;
        this.noReadMsgList = [];
        // 当没有未读消息时，通知主进程停止托盘闪动
        ipcRenderers.sendStopFlashMsg(
          JSON.stringify({
            count: this.msgCount,
            noReadMsg: this.noReadMsgList?.[0],
          }),
        );
      } else {
        message({
          title: res.message,
          type: 'error',
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
      const {pathname} = window.location;

      const {userInfo} = getStoreUserInfo();

      // 判断是否别人发给我的消息
      if (
        (data?.fromUserId !== loginStore.userInfo?.userId && !pathname.includes('/article')) ||
        (pathname.includes('/article') && userInfo?.userId !== data?.fromUserId)
      ) {
        this.msgCount += 1;
        // 判断是否开启消息提醒设置，发送托盘图标闪烁的消息
        if (getMsgStatus() === 1) {
          ipcRenderers.sendFlashMsg(
            JSON.stringify({
              count: this.msgCount,
              noReadMsg: data,
            }),
          );
        }
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
