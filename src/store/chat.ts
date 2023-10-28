import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { createWebSocket, sendMessage } from '@/socket';
import { loginStore } from '@/store';
import { ChatItem, ChatList, ContactItem, ContactList } from '@/typings/common';

interface IProps {
  loading: boolean | null;
  chatList: ChatItem[];
  addChatList: ChatItem[];
  pageNo: number;
  pageSize: number;
  total: number;
  contactList: ContactItem[];
  contactPageNo: number;
  contactPageSize: number;
  contactTotal: number;
}

export const useChatStore = defineStore('chat', {
  state: (): IProps => ({
    loading: null,
    chatList: [],
    addChatList: [],
    contactList: [],
    total: 0,
    pageNo: 0,
    pageSize: 30,
    contactPageNo: 0,
    contactPageSize: 30,
    contactTotal: 0,
  }),

  actions: {
    // 初始化io
    initIO() {
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
            // from: userId,
            // to,
            from: to,
            to: userId,
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
      // this.loading = true;
      const chatId = [loginStore.userInfo.userId, userId].sort().join('_');
      const res = normalizeResult<ChatList>(
        await Service.getChatList({ pageNo: this.pageNo, pageSize: this.pageSize, chatId }),
      );
      this.loading = false;
      if (res.success) {
        this.chatList = [...res.data.list, ...this.chatList];
        this.total = res.data.total;
      }
    },

    // 合并消息
    async mergeChats(to: string) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      this.loading = true;
      const { userId } = loginStore.userInfo;
      const chatId = [userId, to].sort().join('_');
      await Service.mergeChats(chatId);
    },

    // 添加聊天消息
    async addChat(params: ChatItem) {
      this.addChatList = [...this.addChatList, params];
      this.updateMessage(params);
    },

    // 添加联系人
    async addContacts(userId: string) {
      if (!useCheckUserId()) return;
      const res = normalizeResult<ContactItem>(
        await Service.addContacts({ contactId: userId, createTime: new Date().valueOf() }),
      );
      if (!res.success) {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取联系人
    async getContactList() {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      if (this.contactList.length !== 0 && this.contactList.length >= this.contactTotal) return;
      this.contactPageNo = this.contactPageNo + 1;
      this.loading = true;
      const res = normalizeResult<ContactList>(
        await Service.getContactList({ pageNo: this.contactPageNo, pageSize: this.contactPageSize }),
      );
      this.loading = false;
      if (res.success) {
        this.contactList = [...this.contactList, ...res.data.list];
        this.contactTotal = res.data.total;
      }
    },

    // 置顶联系人
    async toTopContacts(contactId: string) {
      if (!useCheckUserId()) return;
      const res = normalizeResult<{ userId: string }>(
        await Service.toTopContacts({ contactId, createTime: new Date().valueOf() }),
      );
      ElMessage({
        message: res.message,
        type: res.success ? 'success' : 'error',
        offset: 80,
      });
    },

    // 删除联系人
    async deleteContacts(userId: string) {
      if (!useCheckUserId()) return;
      const res = normalizeResult<{ userId: string }>(await Service.deleteContacts(userId));
      ElMessage({
        message: res.message,
        type: res.success ? 'success' : 'error',
        offset: 80,
      });
    },

    // 更新对应联系人的最新消息
    updateMessage(params: ChatItem) {
      const newContacts = this.contactList.map((i) => {
        if (i.chatId === params.chatId) {
          i.message = params.content;
        }
        return i;
      });

      console.log(newContacts, 'newContacts');

      this.contactList = newContacts;
    },

    // 清除数据
    clearChatInfo(clearAll?: boolean) {
      // clearAll && (this.chatList = []);
      this.chatList = [];
      this.pageNo = 0;
      this.total = 0;
      this.addChatList = [];
      this.loading = null;
    },

    // 清除数据
    clearContactInfo() {
      this.contactPageNo = 0;
      this.contactTotal = 0;
      this.contactList = [];
    },
  },
});
