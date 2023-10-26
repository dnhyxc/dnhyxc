import { defineStore } from 'pinia';
// import io from 'socket.io-client';
// import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult, uniqueFunc } from '@/utils';
import { useCheckUserId } from '@/hooks';
// import { DOMAIN_URL } from '@/constant';
import { createWebSocket, sendMessage } from '@/socket';
import { loginStore } from '@/store';
import { ChatItem, ChatList } from '@/typings/common';

interface IProps {
  loading: boolean | null;
  chatList: ChatItem[];
  addChatList: ChatItem[];
  pageNo: number;
  pageSize: number;
  total: number;
  addCount: number;
}

export const useChatStore = defineStore('chat', {
  state: (): IProps => ({
    loading: null,
    chatList: [],
    addChatList: [],
    total: 0,
    pageNo: 0,
    pageSize: 10,
    addCount: 0,
  }),

  actions: {
    // 初始化io
    async initIO() {
      createWebSocket();
    },

    // 发送消息
    sendChatMessage({ to, content }: { to: string; content: string }) {
      const { userId } = loginStore.userInfo;
      const chatId = [userId, to].sort().join('_');
      sendMessage(
        JSON.stringify({
          action: 'chat',
          data: {
            // from: to,
            // to: userId,
            from: userId,
            to,
            content,
            chatId,
            createTime: new Date().valueOf(),
          },
          userId: loginStore.userInfo?.userId,
        }),
      );
    },

    // 获取消息列表
    async getChatList(userId: string) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      if (this.chatList.length !== 0 && this.chatList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const chatId = [loginStore.userInfo.userId, userId].sort().join('_');
      const res = normalizeResult<ChatList>(
        await Service.getChatList({ pageNo: this.pageNo, pageSize: this.pageSize, chatId }),
      );
      this.loading = false;
      if (res.success) {
        console.log([...res.data.list, ...this.chatList], '[...res.data.list, ...this.chatList]');

        const uniqueData = uniqueFunc([...res.data.list, ...this.chatList], 'id');

        const count = [...res.data.list, ...this.chatList].length - uniqueData.length;

        console.log(uniqueData, 'uniqueData', count);

        this.chatList = [...res.data.list, ...this.chatList];
        // this.addCount = this.addCount - count;
        this.total = res.data.total;

        console.log(this.chatList.length, 'this.chatList.length');
        console.log('this.total', this.total);
        // console.log([...res.data.list, ...this.chatList], '[...res.data.list, ...this.chatList]');

        // const uniqueData = uniqueFunc([...res.data.list, ...this.chatList], 'id');

        // const count = [...res.data.list, ...this.chatList].length - uniqueData.length;

        // console.log(uniqueData, 'uniqueData', count);

        // this.chatList = uniqueData;
        // this.addCount = this.addCount - count;
        // this.total = res.data.total + this.addCount;

        // console.log(this.chatList.length, 'this.chatList.length');
        // console.log('this.total', this.total);
      }
    },

    // 添加聊天消息
    async addChat(params: ChatItem) {
      console.log(params, 'params');
      this.addChatList = [...this.addChatList, params];
      // this.chatList = [...this.chatList, params];
      this.addCount += 1;
      console.log(this.addCount, 'this.addCount');
      // this.total = this.total + this.addCount;
    },

    // 清除数据
    clearChatInfo() {
      this.pageNo = 0;
      this.total = 0;
      this.chatList = [];
      this.loading = null;
      this.addCount = 0;
    },
  },
});
