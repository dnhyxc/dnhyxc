import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { FollowList, FollowItem } from '@/typings/common';
import * as Service from '@/server';
import { normalizeResult, getStoreUserInfo } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { sendMessage } from '@/socket';
import { loginStore, personalStore } from '@/store';

interface IProps {
  followList: FollowItem[]; // 关注列表
  pageNo: number;
  pageSize: number;
  total: number; // 文章列表总数
  loading: boolean | null;
  isFollowed: boolean;
}

export const useFollowStore = defineStore('follow', {
  state: (): IProps => ({
    followList: [],
    loading: null,
    pageNo: 0,
    pageSize: 100,
    total: 0,
    isFollowed: false,
  }),

  actions: {
    // 关注/取消关注用户
    async manageFollow(authorId: string, id: string) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      const res = normalizeResult<{ isFollowed: boolean; userId: string }>(await Service.manageFollow(authorId));
      ElMessage({
        message: res.message,
        type: res.success ? 'success' : 'error',
        offset: 80,
      });
      if (res.success) {
        this.isFollowed = res.data.isFollowed;
        const { userInfo } = getStoreUserInfo();
        const { userId, username } = loginStore.userInfo;
        if (authorId !== userId && authorId !== userInfo?.userId) {
          // 推送 ws 消息
          sendMessage(
            JSON.stringify({
              action: 'push',
              data: {
                toUserId: authorId,
                fromUsername: username || userInfo?.username,
                fromUserId: userId || userInfo?.userId,
                action: this.isFollowed ? 'FOLLOWED' : 'CANCEL_FOLLOWED',
              },
              userId: userId! || userInfo?.userId,
            }),
          );
        }
        // 更改关注状态状态
        const list = this.followList?.map((i) => {
          if (i.id === id) {
            i.isFollowed = !i.isFollowed;
          }
          return i;
        });
        this.followList = [...list];
      }
    },

    // 分页获取关注用户列表
    async getFollowList(userId?: string) {
      if (!userId) return;
      if (this.followList.length !== 0 && this.followList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      personalStore.loading = true;
      const res = normalizeResult<FollowList>(
        await Service.getFollowList({ userId, pageNo: this.pageNo, pageSize: this.pageSize }),
      );
      personalStore.loading = false;
      if (res.success) {
        this.followList = [...this.followList, ...res.data.list];
        this.total = res.data.total;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 查询是否关注该用户
    async findFollowed(authorId: string) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId(false)) return;
      const res = normalizeResult<boolean>(await Service.findFollowed(authorId));
      if (res.success) {
        this.isFollowed = res.data;
      }
    },

    // 清除文章列表数据
    clearInteractList() {
      this.followList = [];
      this.total = 0;
      this.pageNo = 0;
      this.loading = null;
    },
  },
});
