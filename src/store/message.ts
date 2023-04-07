import { ArticleItem } from '@/typings/common';
import { defineStore } from 'pinia';
import { loginStore } from '@/store';
import { PAGESIZE } from '@/constant';

interface IProps {
  count: number;
  msgList: ArticleItem[];
  loading: boolean | null;
  total: number;
  pageNo: number;
  pageSize: number;
}

export const useMessageStore = defineStore('message', {
  state: (): IProps => ({
    count: 0,
    msgList: [],
    loading: null,
    total: 0,
    pageNo: 0,
    pageSize: PAGESIZE,
  }),

  actions: {
    setCount() {
      this.count++;
    },

    // 增加消息记录
    setMsgList(data: ArticleItem) {
      const { userId } = loginStore.userInfo;
      console.log(data, '接收到消息，设置到消息列表', userId, userId === data?.toUserId, data?.toUserId);
      // 判断消息是否是推送给当前用户的
      if (userId === data?.toUserId) {
        this.msgList.unshift(data);
        this.msgList = [...this.msgList];
      }
    },
  },
});
