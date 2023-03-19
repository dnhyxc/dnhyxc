import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult, locSetItem, Message } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { TimelineResult } from '@/typings/common';
import { loginStore } from '@/store';

interface IProps {
  timelineList: TimelineResult[];
  loading: boolean;
}

export const useTimelineStore = defineStore('timeline', {
  state: (): IProps => ({
    timelineList: [],
    loading: false,
  }),

  actions: {
    // 获取时间轴列表
    async getTimelineList() {
      this.loading = true;
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      const params = { userId: loginStore.userInfo?.userId };
      // 保存至storage用于根据不同页面进入详情时，针对性的进行上下篇文章的获取（如：分类页面上下篇、标签页面上下篇）
      locSetItem('params', JSON.stringify({ ...params, from: 'timeline' }));
      const res = normalizeResult<TimelineResult[]>(await Service.getTimelineList());
      this.loading = false;
      if (res.success) {
        this.timelineList = res.data;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 删除timeline文章hooks
    async deleteTimelineArticle(articleId: string) {
      Message('', '确定删除该文章吗？').then(async () => {
        const res = normalizeResult<{ id: string }>(await Service.deleteArticle({ articleId, type: 'timeline' }));
        if (res.success) {
          const list = this.timelineList.map((i) => {
            if (i.articles.length) {
              const filterList = i.articles.filter((j) => j.id !== articleId);
              return {
                ...i,
                count: filterList.length,
                articles: filterList,
              };
            }
            return { ...i };
          });
          this.timelineList = list;
        } else {
          ElMessage({
            message: res.message,
            type: 'error',
            offset: 80,
          });
        }
      });
    },
  },
});
