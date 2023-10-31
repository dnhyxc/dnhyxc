import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { createWebSocket, sendMessage } from '@/socket';
import { loginStore } from '@/store';
import { ChatItem, ChatList, ContactItem, ContactList, UserInfoParams } from '@/typings/common';

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
  delIds: string[];
  chatUserId: string; // 当前的聊天对象userId
  wrapRef: HTMLElement | null; // 滚动元素
  timer: ReturnType<typeof setTimeout> | null;
  unReadCount: number;
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
    delIds: [],
    chatUserId: '',
    wrapRef: null,
    timer: null,
    unReadCount: 0,
  }),

  actions: {
    // 初始化io
    initIO() {
      createWebSocket();
    },

    // 发送消息
    sendChatMessage({ to, content }: { to: string; content: string }) {
      const { userId } = loginStore.userInfo;
      if (userId === to) return;
      const chatId = [userId, to].sort().join('_');
      sendMessage(
        JSON.stringify({
          action: 'chat',
          data: {
            from: userId,
            to,
            content,
            chatId,
            createTime: new Date().valueOf(),
            action: 'CHAT',
            toUserId: to, // 用于提示消息
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
      if (params.from === params.to) return;
      if (params.from === this.chatUserId || params.to === this.chatUserId) {
        this.addChatList = [...this.addChatList, params];
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        this.timer = setTimeout(() => {
          const scroll = this.wrapRef as HTMLDivElement;
          const height = scroll.scrollHeight;
          scroll.scrollTop = height;
        }, 100);
      }
      this.updateMessage(params);
      const findOne = this.contactList.find((item) => item.chatId === params.chatId);
      if (!findOne && params.to === loginStore.userInfo.userId) {
        this.addAbsentContact(params as ContactItem & ChatItem);
      }
    },

    // 删除消息
    async deleteChats() {
      if (!this.delIds?.length) return;
      const res = normalizeResult<{ data: string[] }>(await Service.deleteChats(this.delIds));
      if (res.success) {
        this.delIds = [];
      }
    },

    // 保存需要删除的消息 id
    addDelIds(id: string) {
      if (!this.delIds.includes(id)) {
        this.delIds = [...this.delIds, id];
      }
    },

    // 获取未读消息
    async getUnReadChat() {
      if (!useCheckUserId()) return;
      const chatId = [loginStore.userInfo.userId, this.chatUserId].sort().join('_');
      const res = normalizeResult<{ noReadCount: number }>(await Service.getUnReadChat(chatId));
      if (res.success) {
        const newContacts = this.contactList.map((i) => {
          if (i.chatId === chatId) {
            i.noReadCount = res.data.noReadCount;
          }
          return i;
        });
        this.contactList = newContacts;
      }
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

    // 获取用户信息
    async getUserInfo(userId: string) {
      const res = normalizeResult<UserInfoParams>(await Service.getUserInfo({ userId }));
      if (res.success) {
        return res;
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

    // 接收到未在聊天列表的人的消息时,添加到联系人列表
    async addAbsentContact(params: ContactItem & ChatItem) {
      const res = await this.getUserInfo(params.from);
      if (res?.success) {
        const { headUrl, username, job, userId } = res.data;
        this.contactList = [
          {
            ...params,
            headUrl: headUrl || '',
            username: username!,
            job: job || '',
            message: params.content,
            sendTime: params.createTime,
            contactId: userId!,
            noReadCount: 1,
          },
          ...this.contactList,
        ];
      }
    },

    // 更新对应联系人的最新消息
    updateMessage(params: ChatItem) {
      const chatId = [loginStore.userInfo.userId, this.chatUserId].sort().join('_');
      const newContacts = this.contactList.map((i) => {
        if (i.chatId === params.chatId) {
          i.message = params.content;
          i.createTime = params.createTime;
          i.sendTime = params.createTime;
          // 判断是否是当前聊天窗口发来的消息，如果是，不需要增加未读数量
          if (i.chatId !== chatId) {
            i.noReadCount += 1;
          }
        }
        return i;
      });
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
