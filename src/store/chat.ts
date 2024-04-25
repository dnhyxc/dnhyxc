import { defineStore } from 'pinia';
import * as Service from '@/server';
import { normalizeResult, hlightKeyword, message } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { createWebSocket, sendMessage } from '@/socket';
import { loginStore } from '@/store';
import { ChatItem, ChatInfo, ChatList, ContactItem, ContactList, UserInfoParams, ReplyInfo } from '@/typings/common';

interface IProps {
  loading: boolean | null;
  chatList: ChatItem[];
  addChatList: ChatItem[];
  pageNo: number;
  pageSize: number;
  total: number;
  contactList: ContactItem[];
  addContactList: ContactItem[];
  contactPageNo: number;
  contactPageSize: number;
  contactTotal: number;
  delIds: string[];
  chatUserId: string; // 当前的聊天对象userId
  wrapRef: HTMLElement | null; // 滚动元素
  timer: ReturnType<typeof setTimeout> | null;
  unReadCount: number;
  delContactIds: string[]; // 需要删除的联系人id
  // 搜索联系人信息
  searchList: ContactItem[];
  searchPageNo: number;
  searchPageSize: number;
  searchTotal: number;
  searchLoading: boolean | null;
}

export const useChatStore = defineStore('chat', {
  state: (): IProps => ({
    loading: null,
    chatList: [],
    addChatList: [],
    contactList: [],
    addContactList: [],
    total: 0,
    pageNo: 0,
    pageSize: 30,
    contactPageNo: 0,
    contactPageSize: 20,
    contactTotal: 0,
    delIds: [],
    chatUserId: '',
    wrapRef: null,
    timer: null,
    unReadCount: 0,
    delContactIds: [],
    searchList: [],
    searchPageNo: 0,
    searchPageSize: 20,
    searchTotal: 0,
    searchLoading: null,
  }),

  actions: {
    // 初始化io
    initIO() {
      createWebSocket();
    },

    // 发送消息
    sendChatMessage({to, content, replyInfo}: { to: string; content: string; replyInfo?: ReplyInfo }) {
      const {userId} = loginStore.userInfo;
      if (userId === to) return;
      const chatId = [userId, to].sort().join('_');
      sendMessage(
        JSON.stringify({
          action: 'chat',
          data: {
            from: userId,
            to,
            content,
            replyInfo,
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
      if (!userId) {
        this.loading = false;
        return;
      }
      if (this.chatList.length !== 0 && this.chatList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      // this.loading = true;
      const chatId = [loginStore.userInfo.userId, userId].sort().join('_');
      const res = normalizeResult<ChatList>(
        await Service.getChatList({pageNo: this.pageNo, pageSize: this.pageSize, chatId}),
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
      if (!useCheckUserId() || !to) return;
      this.loading = true;
      const {userId} = loginStore.userInfo;
      const chatId = [userId, to].sort().join('_');
      const res = normalizeResult<{ noReadCount: number }>(await Service.mergeChats(chatId));
      if (res.success) {
        const newContacts = this.contactList.map((i) => {
          if (i.chatId === chatId) {
            i.noReadCount = res.data.noReadCount;
            i.hasUnRead = false;
          }
          return i;
        });
        this.contactList = newContacts;
      }
    },

    // 合并消息
    async getCacheChats(to: string) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId() || !to) return;
      this.loading = true;
      const {userId} = loginStore.userInfo;
      const chatId = [userId, to].sort().join('_');
      const res = normalizeResult<ChatItem[]>(await Service.getCacheChats(chatId));
      if (res.success) {
        this.addChatList = [...this.addChatList, ...res.data];
      }
    },

    // 添加聊天消息
    async addChat(params: ChatInfo) {
      if (params.from === params.to) return;
      const chatInfo = {userId: params.from, chat: params, id: params.id};
      if (params.from === this.chatUserId || params.to === this.chatUserId) {
        this.addChatList = [...this.addChatList, chatInfo];
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
      this.updateMessage(chatInfo);
      const findOne = this.contactList.find((item) => item.chatId === params.chatId);
      const findDelId = this.delContactIds.find((i) => i === params.from);
      if (params.to === loginStore.userInfo.userId && location.pathname === '/chat') {
        if (!findOne) {
          this.addAbsentContact(chatInfo as ContactItem & ChatItem);
        } else if (findOne && findOne?.contactId === findDelId) {
          // 判断当前用户是否被删除过，如果删除过，则将其从删除列表中去除，恢复显示
          this.delContactIds = this.delContactIds.filter((i) => i !== findDelId);
          const delContact = this.contactList.find((i) => i.contactId === findDelId);
          const contactList = this.contactList.map((i) => {
            if (i.contactId === findDelId) {
              // 如果当前联系人设置了消息免打扰，则需要将未读消息清除，不增加未读聊天数量，否则才增加未读消息数量
              !delContact?.isUnDisturb ? (i.noReadCount = 1) : (i.noReadCount = 0);
            }
            return i;
          });
          // 按照置顶/时间排序
          this.contactList = this.sortContacts(contactList);
        }
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
        const beforeChatList = [...this.chatList, ...this.addChatList].filter((i) => !this.delIds.includes(i.id));
        // 找出删除前的最后一个
        const beforeLastOne = beforeChatList?.[beforeChatList.length - 1];
        this.delIds = [...this.delIds, id];
        const chatList = [...this.chatList, ...this.addChatList].filter((i) => !this.delIds.includes(i.id));
        // 找出删除后的最后一个
        const lastOne = chatList?.[chatList.length - 1] || {
          chat: {
            content: '',
            createTime: 0,
            chatId: beforeLastOne.chat.chatId,
          },
        };
        // 如果相等，则说明是删除的最后一个
        if (beforeLastOne.id === id) {
          this.updateMessage(lastOne);
          // 如果删除后,还能找出最后一个,则调用接口更新最新消息及时间
          if (lastOne.id) {
            Service.updateNewChat(lastOne);
          } else {
            // 进入这里说明删除的是最后一条消息,已经没有消息了,则需要把新添加的这条数据删除
            Service.deleteNewChat(beforeLastOne.chat.chatId);
          }
        }
        // 如果addChatList数组不为空，则说明有新加的消息，需要从缓存中删除
        if (this.addChatList.length) {
          this.addChatList = this.addChatList.filter((i) => i.id !== id);
          // 删除缓存中的消息
          Service.deleteCatchChat(id);
        }
      }
    },

    // 添加联系人
    async addContacts(userId: string) {
      if (!useCheckUserId()) return;
      const res = normalizeResult<ContactItem>(
        await Service.addContacts({contactId: userId, createTime: new Date().valueOf()}),
      );
      if (!res.success) {
        message({
          title: res.message,
          type: 'error',
        });
      }
    },

    // 保存需要删的联系人id
    addDelContactId(contactId: string) {
      if (!this.delContactIds.includes(contactId)) {
        this.delContactIds.push(contactId);
        this.deleteCatchContacts(contactId);
      }
    },

    // 删除缓存联系人
    async deleteCatchContacts(contactId: string) {
      if (!this.delContactIds?.length) return;
      const res = normalizeResult<{ data: string[] }>(await Service.deleteCatchContacts(contactId));
      if (res.success && this.chatUserId === contactId) {
        this.chatUserId = '';
      }
    },

    // 删除联系人
    async deleteContacts() {
      if (!this.delContactIds?.length) return;
      const res = normalizeResult<{ data: string[] }>(await Service.deleteContacts(this.delContactIds));
      if (res.success) {
        this.delContactIds = [];
      }
    },

    // 删除联系人的同时，删除与之的聊天记录
    async deleteChatMesaage(chatId: string) {
      normalizeResult<{ delNewChatCount: number; delCatchChat: number; delChatCount: number }>(
        await Service.deleteChatMesaage(chatId),
      );
    },

    // 获取用户信息
    async getUserInfo(userId: string) {
      const res = normalizeResult<UserInfoParams>(await Service.getUserInfo({userId}));
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
      const res = normalizeResult<ContactList>(
        await Service.getContactList({pageNo: this.contactPageNo, pageSize: this.contactPageSize}),
      );
      if (res.success) {
        this.contactList = [...this.contactList, ...res.data.list];
        this.contactTotal = res.data.total;
      }
    },

    // 获取缓存联系人
    async getCatchContactList() {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      const res = normalizeResult<ContactItem[]>(await Service.getCatchContactList());
      if (res.success) {
        this.addContactList = [...this.addContactList, ...res.data];
      }
    },

    // 合并缓存联系人
    async mergeContacts() {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      normalizeResult<ContactItem[]>(await Service.mergeContacts());
    },

    // 获取联系人
    async searchContacts(keyword: string) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId() || !keyword) return;
      if (this.searchList.length !== 0 && this.searchList.length >= this.searchTotal) return;
      this.searchPageNo = this.searchPageNo + 1;
      this.searchLoading = true;
      const res = normalizeResult<ContactList>(
        await Service.searchContacts({pageNo: this.searchPageNo, pageSize: this.searchPageSize, keyword}),
      );
      this.searchLoading = false;
      if (res.success) {
        const searchList = [...this.searchList, ...res.data.list];
        this.searchList = hlightKeyword(keyword, searchList);
        this.searchTotal = res.data.total;
      }
    },

    // 置顶联系人/消息免打扰
    async onUppdateContact({
      contactId,
      createTime,
      isTop,
      isUnDisturb,
      setTop,
    }: {
      contactId: string;
      createTime?: number;
      isTop?: boolean;
      isUnDisturb?: boolean;
      setTop?: boolean;
    }) {
      if (!useCheckUserId()) return;
      const res = normalizeResult<{ userId: string }>(
        await Service.uppdateContact({contactId, createTime, isUnDisturb, isTop}),
      );
      if (res.success) {
        if (createTime && setTop) {
          if (isTop) {
            // 消息置顶，将选中的消息插入到最前面
            const findIndex = this.contactList.findIndex((i) => i.contactId === contactId);
            const contact = this.contactList.splice(findIndex, 1)[0];
            contact.isTop = true;
            this.contactList.unshift(contact);
          } else {
            // 取消消息置顶，将选中的消息先按isTop排序，值为true的放前面，再安createTime倒序排列
            const contactList = this.contactList.map((i) => {
              if (i.contactId === contactId) {
                i.isTop = isTop!;
                i.createTime = createTime;
              }
              return i;
            });
            // 按照置顶/时间排序
            this.contactList = this.sortContacts(contactList);
          }
        } else {
          this.contactList = this.contactList.map((i) => {
            if (i.contactId === contactId) {
              i.isUnDisturb = isUnDisturb!;
            }
            return i;
          });
        }
      }
    },

    // 接收到未在聊天列表的人的消息时,添加到联系人列表
    async addAbsentContact(params: ContactItem & ChatItem) {
      const res = await this.getUserInfo(params.chat.from);
      if (res?.success) {
        const {headUrl, username, job, userId} = res.data;
        // @ts-ignore
        const topIndex = this.contactList.findLastIndex((i) => i.isTop);
        const contact = {
          id: params.id,
          chatId: params.chat.chatId,
          headUrl: headUrl || '',
          username: username!,
          job: job || '',
          message: params.chat.content,
          sendTime: params.chat.createTime,
          contactId: userId!,
          noReadCount: 1,
        } as ContactItem;
        // 向最后一个置顶元素后插入新的有新消息的联系人
        this.contactList.splice(topIndex + 1, 0, contact);
      }
    },

    // 更新对应联系人的最新消息
    updateMessage(params: ChatItem) {
      const chatId = [loginStore.userInfo.userId, this.chatUserId].sort().join('_');
      const newContacts = this.contactList.map((i) => {
        if (i.chatId === params.chat.chatId) {
          i.message = params.chat.content;
          i.createTime = params.chat.createTime;
          i.sendTime = params.chat.createTime;
          // 判断是否是当前聊天窗口发来的消息，如果是，不需要增加未读数量
          if (i.chatId !== chatId) {
            // 如果当前联系人设置了消息免打扰，则需要将未读消息清除，不增加未读聊天数量，否则才增加未读消息数量
            !i.isUnDisturb ? (i.noReadCount += 1) : (i.noReadCount = 0);
          }
        }
        return i;
      });
      this.contactList = newContacts;
    },

    // 联系人排序
    sortContacts(contacts: ContactItem[]) {
      return contacts.sort((a, b) => {
        if (a.isTop !== b.isTop) {
          return (b.isTop as any) - (a.isTop as any);
        }
        return b.createTime - a.createTime;
      });
    },

    // 清除数据
    clearChatInfo() {
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
      this.loading = null;
    },

    // 清空搜索数据
    clearSearchInfo() {
      this.searchList = [];
      this.searchPageNo = 0;
      this.searchTotal = 0;
      this.searchLoading = null;
    },
  },
});
