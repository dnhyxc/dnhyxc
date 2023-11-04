import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult, hlightKeyword } from '@/utils';
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
      if (!userId) {
        this.loading = false;
        return;
      }
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
      if (!useCheckUserId() || !to) return;
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
        const beforeChatList = [...this.chatList, ...this.addChatList].filter((i) => !this.delIds.includes(i.id));
        // 找出删除前的最后一个
        const beforeLastOne = beforeChatList?.[beforeChatList.length - 1];
        this.delIds = [...this.delIds, id];
        const chatList = [...this.chatList, ...this.addChatList].filter((i) => !this.delIds.includes(i.id));
        // 找出删除后的最后一个
        const lastOne = chatList?.[chatList.length - 1] || {
          content: '',
          createTime: 0,
          chatId: beforeLastOne.chatId,
        };
        // 如果相等，则说明是删除的最后一个
        if (beforeLastOne.id === id) {
          this.updateMessage(lastOne);
          // 调用接口更新最新消息及时间
          if (lastOne.id) {
            Service.updateNewChat(lastOne);
          } else {
            Service.deleteNewChat(beforeLastOne.chatId);
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

    // 获取未读消息
    async getUnReadChat() {
      if (!useCheckUserId() || !this.chatUserId) return;
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

    // 保存需要删的联系人id
    addDelContactId(contactId: string) {
      if (!this.delContactIds.includes(contactId)) {
        this.delContactIds.push(contactId);
      }
    },

    // 删除消息
    async deleteContacts() {
      if (!this.delContactIds?.length) return;
      const res = normalizeResult<{ data: string[] }>(await Service.deleteContacts(this.delContactIds));
      if (res.success) {
        this.delContactIds = [];
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
      const res = normalizeResult<ContactList>(
        await Service.getContactList({ pageNo: this.contactPageNo, pageSize: this.contactPageSize }),
      );
      if (res.success) {
        this.contactList = [...this.contactList, ...res.data.list];
        this.contactTotal = res.data.total;
      }
    },

    // 获取联系人
    async searchContacts(keyword: string) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId() || !keyword) return;
      if (this.searchList.length !== 0 && this.searchList.length >= this.searchTotal) return;
      this.searchPageNo = this.searchPageNo + 1;
      this.searchLoading = true;
      const res = normalizeResult<ContactList>(
        await Service.searchContacts({ pageNo: this.searchPageNo, pageSize: this.searchPageSize, keyword }),
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
        await Service.uppdateContact({ contactId, createTime, isUnDisturb, isTop }),
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
            this.contactList = this.contactList
              .map((i) => {
                if (i.contactId === contactId) {
                  i.isTop = isTop!;
                  i.createTime = createTime;
                }
                return i;
              })
              .sort((a, b) => {
                if (a.isTop !== b.isTop) {
                  return (b.isTop as any) - (a.isTop as any);
                }
                return b.createTime - a.createTime;
              });
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
