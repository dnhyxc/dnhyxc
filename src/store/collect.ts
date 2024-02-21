import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { CollectListRes, AddCollectionRes, CollectParams, ArticleItem, ArticleListResult } from '@/typings/common';
import { articleStore, personalStore, loginStore } from '@/store';
import * as Service from '@/server';
import { normalizeResult, Message, getStoreUserInfo, ipcRenderers } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { PAGESIZE } from '@/constant';
import { sendMessage } from '@/socket';

interface IProps {
  loading: boolean | null;
  pageNo: number;
  pageSize: number;
  collectList: AddCollectionRes[]; // 收藏集列表数据
  total: number; // 收藏集列表总数
  checkedCollectIds: string[]; // 选中的收藏集ids
  collectStatus: boolean;
  collectInfo: AddCollectionRes; // 当前收藏集详情
  articleList: ArticleItem[];
}

export const useCollectStore = defineStore('collect', {
  state: (): IProps => ({
    pageNo: 0,
    pageSize: PAGESIZE,
    total: 0,
    collectList: [],
    loading: null,
    checkedCollectIds: [],
    collectStatus: false,
    collectInfo: { id: '' },
    articleList: [],
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
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
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
        // 更新收藏集后静默更新当前收藏集数据
        this.collectInfo = {
          ...this.collectInfo,
          ...params,
          status: Number(params?.status), // 将状态改为数值类型，用户界面判断是否展示锁的标识
        } as AddCollectionRes;
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

      // 判断是article还是detail、分别推送刷新消息给主进程
      const { pathname } = window.location;

      const res = normalizeResult<string>(
        await Service.collectArticles({
          ids: this.checkedCollectIds,
          articleId,
          isMove: pathname.includes('/collect'), // 如果是true，说明是从我的收藏集中点的转移按钮进行文章的转移
        }),
      );
      if (res.success) {
        if (articleStore?.articleDetail?.collectCount !== undefined) {
          articleStore.articleDetail.collectCount += 1;
        }
        this.collectStatus = true;

        // 如果所选择的收藏集不包含当前需要转移文章的收藏集，就需要将该文章移除当前收藏集
        if (!this.checkedCollectIds.includes(this.collectInfo.id) && pathname.includes('/collect')) {
          // 第三个参数 true，说明是点击转移按钮转移收藏的文章，告诉后端不需要增减收藏数
          this.removeCollectArticle(articleId, this.collectInfo.id, true);
        }

        const { userInfo } = getStoreUserInfo();
        // 收藏别人文章成功之后推送消息
        const { username, userId } = loginStore.userInfo;

        const { authorId } = articleStore?.articleDetail;

        if (userInfo?.userId !== authorId && authorId !== userId) {
          sendMessage(
            JSON.stringify({
              action: 'push',
              data: {
                ...articleStore?.articleDetail,
                articleId,
                toUserId: authorId,
                action: 'COLLECT',
                fromUsername: username || userInfo?.username,
                fromUserId: userId || userInfo?.userId,
              },
              userId: userId || userInfo?.userId,
            }),
          );
        }

        ipcRenderers.sendRefresh({ articleId, pathname, isLike: false });

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

        const { userInfo } = getStoreUserInfo();

        const { username, userId } = loginStore.userInfo;

        const { authorId } = articleStore?.articleDetail;

        if (userId !== authorId && authorId !== userInfo?.userId) {
          sendMessage(
            JSON.stringify({
              action: 'push',
              data: {
                ...articleStore?.articleDetail,
                articleId,
                toUserId: authorId,
                action: 'CANCEL_COLLECT',
                fromUsername: username || userInfo?.username,
                fromUserId: userId || userInfo?.userId,
              },
              userId: userId! || userInfo?.userId,
            }),
          );
        }

        const { pathname } = window.location;
        // 判断是article还是detail、分别推送刷新消息给主进程
        ipcRenderers.sendRefresh({ articleId, pathname, isLike: false });

        ElMessage({
          message: res.message,
          type: 'success',
          offset: 80,
        });
      }
    },

    // 获取收藏集详情
    async getCollectInfo(id: string) {
      // 每次获取收藏集详情之前，先重置缓存中的各种收藏集信息
      this.clearCollectList();
      const res = normalizeResult<AddCollectionRes>(await Service.getCollectInfo(id));
      if (res.success) {
        this.collectInfo = res.data;
        // 查询完收藏集信息之后，初始化获取收藏的文章列表
        this.getCollectArticles();
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取收藏集中收藏的文章
    async getCollectArticles() {
      if (this.collectList.length !== 0 && this.collectList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;

      const res = normalizeResult<ArticleListResult>(
        await Service.getCollectArticles({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          articleIds: this.collectInfo?.articleIds,
        }),
      );
      this.loading = false;
      if (res.success) {
        this.articleList = [...this.articleList, ...res.data.list];
        this.total = res.data.total;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 移除收藏集中的文章
    async removeCollectArticle(articleId: string, collectId: string, isMove?: boolean) {
      if (!collectId) return;
      this.loading = true;
      const res = normalizeResult<number>(
        await Service.removeCollectArticle({
          id: collectId,
          articleId,
          isMove,
        }),
      );
      if (res.success) {
        // 发送删除的文章的消息给主进程，通知主进程及时关闭对应子窗口
        ipcRenderers.sendRemove(articleId);
        this.collectInfo.articleIds = this.collectInfo?.articleIds?.filter((i) => i !== articleId);
        this.clearCollectList();
        // 重新获取收藏集中的文章
        this.getCollectArticles();
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 将收藏集中的文章移除，注意：并不是删除文章
    async removeArticle(id: string, collectId: string) {
      Message('移除后，该文章将从当前收藏集中删除', '确定移除该文章吗？').then(async () => {
        // 调用接口，移除收藏集中收藏的文章
        await this.removeCollectArticle(id, collectId);
      });
    },

    // 删除收藏集
    async deleteCollect(toPersonal: Function) {
      Message('删除收藏集同时会移除收藏集中的文章！', '确定移除该收藏集吗？').then(async () => {
        const res = normalizeResult<ArticleListResult>(
          await Service.delCollection({
            id: this.collectInfo?.id,
          }),
        );
        if (res.success) {
          ElMessage({
            message: res.message,
            type: 'success',
            offset: 80,
          });
          // 删除成功后，重新回到我的主页
          toPersonal && toPersonal();
        } else {
          ElMessage({
            message: res.message,
            type: 'error',
            offset: 80,
          });
        }
      });
    },

    // 清除收藏集滚动相关数据
    init() {
      this.pageNo = 0;
      this.total = 0;
      this.collectList = [];
      this.checkedCollectIds = [];
    },

    // 清除收藏集
    clearCollectList() {
      this.collectList = [];
      this.pageNo = 0;
      this.total = 0;
      this.checkedCollectIds = [];
      this.articleList = [];
    },
  },
});
