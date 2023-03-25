import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { CollectListRes, AddCollectionRes, CollectParams, ArticleItem } from '@/typings/common';
import { articleStore, personalStore } from '@/store';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { PAGESIZE } from '@/constant';

interface IProps {
  loading: boolean;
  pageNo: number;
  pageSize: number;
  collectList: AddCollectionRes[]; // 收藏集列表数据
  total: number; // 收藏集列表总数
  checkedCollectIds: string[];
  collectStatus: boolean;
}

export const useCollectStore = defineStore('collect', {
  state: (): IProps => ({
    pageNo: 0,
    pageSize: PAGESIZE,
    total: 0,
    collectList: [],
    loading: false,
    checkedCollectIds: [],
    collectStatus: false,
  }),

  actions: {
    // 创建收藏集
    async addCollect(params: CollectParams) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      const res = normalizeResult<AddCollectionRes>(
        await Service.createCollection({ ...params, status: Number(params.status) }),
      );
      if (res.success) {
        ElMessage({
          message: res.message,
          type: 'success',
          offset: 80,
        });
        this.checkedCollectIds = [res.data.id];
        // 创建成功后，静态向我的主页中的我的收藏列表中曾加
        personalStore.articleList = [res.data, ...personalStore.articleList];
        personalStore.total = personalStore.total + 1;
        personalStore.collectTotal += 1;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 更新收藏集
    async updateCollect(params: CollectParams) {
      if (!params?.id) return;
      const res = normalizeResult<{ id: string }>(
        await Service.updateCollection({
          ...params,
          status: Number(params.status),
        }),
      );
      if (res.success) {
        // 静默更新收藏列表
        personalStore.articleList = personalStore.articleList.map((i) => {
          if (i.id === params.id) {
            return {
              ...i,
              ...params,
            };
          }
          return i;
        }) as unknown as ArticleItem[];
        ElMessage({
          message: res.message,
          type: 'success',
          offset: 80,
        });
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取收藏集
    async getCollectList() {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      if (this.collectList.length !== 0 && this.collectList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<CollectListRes>(
        await Service.getCollectionList({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        }),
      );
      this.loading = false;
      if (res.success) {
        this.collectList = [...this.collectList, ...res.data.list];
        this.total = res.data.total;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 收藏文章
    async collectArticles(articleId: string) {
      if (!useCheckUserId()) return;
      const res = normalizeResult<string>(
        await Service.collectArticles({
          ids: this.checkedCollectIds,
          articleId,
        }),
      );
      if (res.success) {
        if (articleStore?.articleDetail?.collectCount !== undefined) {
          articleStore.articleDetail.collectCount += 1;
        }
        this.collectStatus = true;
        ElMessage({
          message: res.message,
          type: 'success',
          offset: 80,
        });
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取文章收藏状态
    async getCollectStatus(articleId: string) {
      if (!useCheckUserId(false)) return;
      const res = normalizeResult<{ collected: boolean }>(await Service.checkCollectionStatus(articleId));
      if (res.success) {
        this.collectStatus = res.data.collected;
      }
    },

    // 取消收藏
    async cancelCollected(articleId: string) {
      const res = normalizeResult<number>(await Service.cancelCollected(articleId));
      if (res.success) {
        if (articleStore?.articleDetail?.collectCount) {
          articleStore.articleDetail.collectCount -= 1;
        }
        this.collectStatus = false;
        ElMessage({
          message: res.message,
          type: 'success',
          offset: 80,
        });
      }
    },

    // 清除收藏集
    clearCollectList() {
      this.collectList = [];
      this.pageNo = 0;
      this.total = 0;
      this.checkedCollectIds = [];
    },
  },
});
