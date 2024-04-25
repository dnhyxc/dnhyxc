import { defineStore } from 'pinia';
import * as Service from '@/server';
import { normalizeResult, Message, ipcRenderers, message } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { TimelineResult } from '@/typings/common';

interface IProps {
  timelineList: TimelineResult[];
  loading: boolean | null;
}

export const useTimelineStore = defineStore('timeline', {
  state: (): IProps => ({
    timelineList: [],
    loading: null,
  }),

  actions: {
    // 获取时间轴列表
    async getTimelineList() {
      this.loading = true;
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      const res = normalizeResult<TimelineResult[]>(await Service.getTimelineList());
      this.loading = false;
      if (res.success) {
        this.timelineList = res.data;
      } else {
        message({
          title: res.message,
          type: 'error',
        });
      }
    },

    // 删除timeline文章hooks
    async deleteTimelineArticle(articleId: string) {
      Message('', '确定删除该文章吗？').then(async () => {
        const res = normalizeResult<{ id: string }>(await Service.deleteArticle({ articleId, type: 'timeline' }));
        if (res.success) {
          // 发送删除的文章的消息给主进程，通知主进程及时关闭对应子窗口
          ipcRenderers.sendRemove(articleId)
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
          message({
            title: res.message,
            type: 'error',
          });
        }
      });
    },
  },
});
