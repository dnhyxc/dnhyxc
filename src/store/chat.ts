import { defineStore } from 'pinia';
// import io from 'socket.io-client';
// import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
// import { DOMAIN_URL } from '@/constant';
import { createWebSocket, sendMessage } from '@/socket';
import { loginStore } from '@/store';
import { ChatItem, ChatList } from '@/typings/common';

interface IProps {
  loading: boolean | null;
  chatList: ChatItem[];
  pageNo: number;
  pageSize: number;
  total: number;
}

export const useChatStore = defineStore('chat', {
  state: (): IProps => ({
    loading: null,
    chatList: [],
    total: 0,
    pageNo: 0,
    pageSize: 50,
  }),

  actions: {
    // 初始化io
    async initIO() {
      createWebSocket();
    },

    sendChatMessage(params: { from: string; to: string; content: string }) {
      console.log(params, 'params');

      sendMessage(
        JSON.stringify({
          action: 'chat',
          data: {
            ...params,
          },
          userId: loginStore.userInfo?.userId,
        }),
      );
    },

    // 获取消息列表
    async getChatList() {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      if (this.chatList.length !== 0 && this.chatList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<ChatList>(
        await Service.getCodeList({ pageNo: this.pageNo, pageSize: this.pageSize }),
      );
      this.loading = false;
      if (res.success) {
        this.chatList = [...this.chatList, ...res.data.list];
        this.total = res.data.total;
      }
    },

    // 添加聊天消息
    async addChat({ from, to, content }: { from: string; to: string; content: string }) {
      const res = normalizeResult<ChatItem>(await Service.addChat({ from, to, content }));
      if (res.success) {
        this.chatList = [...this.chatList, res.data];
      }
    },

    // 清除数据
    clearChatInfo() {
      this.pageNo = 0;
      this.total = 0;
      this.chatList = [];
      this.loading = null;
    },
  },
});
