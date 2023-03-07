import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult, Message } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { ArticleListResult, ArticleItem, AnotherParams, CommentParams, ReplayComment } from '@/typings/common';
import { loginStore } from '.';

interface IProps {
  loading: boolean;
  likeLoading: boolean;
  pageNo: number;
  pageSize: number;
  articleList: ArticleItem[]; // 文章列表数据（首页、分类页等）
  total: number; // 文章列表总数
  articleDetail: ArticleItem; // 文章详情
  anotherArticleList: ArticleItem[]; // 详情上下篇文章列表
  commentList: CommentParams[]; // 评论列表
}

export const useArticleStore = defineStore('article', {
  state: (): IProps => ({
    // 首页、标签列表、分类列表文章列表数据
    loading: false,
    likeLoading: false,
    pageNo: 0,
    pageSize: 20,
    articleList: [],
    total: 0,
    articleDetail: {
      id: '',
    },
    anotherArticleList: [],
    commentList: [],
  }),

  actions: {
    // 获取文章列表
    async getArticleList() {
      if (this.articleList.length !== 0 && this.articleList.length > this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<ArticleListResult>(
        await Service.getArticleList({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        }),
      );
      this.loading = false;
      if (res.success) {
        this.articleList = [...this.articleList, ...res.data.list];
        this.total = res.data.total;
      } else {
        ElMessage.error(res.message);
      }
    },

    // 获取文章详情
    async getArticleDetail(id: string) {
      if (!id) {
        ElMessage.error('哎呀！文章不翼而飞了！');
        return;
      }
      this.loading = true;
      const res = normalizeResult<ArticleItem>(await Service.getArticleDetail(id));
      if (res.success) {
        console.log(res, 'res');
        this.articleDetail = res.data;
        return res.data;
      } else {
        ElMessage.error(res.message);
      }
    },

    // 清楚文章列表数据
    clearArticleList() {
      this.articleList = [];
      this.total = 0;
      this.pageNo = 0;
    },

    // 获取上一篇文章
    async getPrevArticle(params: AnotherParams) {
      const res = normalizeResult<ArticleItem>(await Service.getPrevArticle(params));
      return res.data;
    },

    // 获取下一篇文章
    async getNextArticle(params: AnotherParams) {
      const res = normalizeResult<ArticleItem>(await Service.getNextArticle(params));
      return res.data;
    },

    // 获取上下篇文章
    async getAnotherArticles(params: AnotherParams) {
      if (!params.id) return ElMessage.error('哦豁！文章不翼而飞了');
      const res = await Promise.all([this.getPrevArticle(params), this.getNextArticle(params)]);
      this.loading = false;
      if (res?.length) {
        this.anotherArticleList = res;
        console.log(res, 'anotherArticleList');
      }
    },

    // 获取文章评论
    async getCommentList(id: string) {
      // 检验是否有userId，如果没有禁止发送请求
      // if (!useCheckUserId()) return;
      if (!id) return ElMessage.error('哦豁！文章不翼而飞了，评论也不知所踪');
      const res = normalizeResult<CommentParams[]>(await Service.getCommentList(id));
      if (res?.success) {
        this.commentList = res.data;
      } else {
        ElMessage.error(res.message);
      }
    },

    // 发布文章评论
    async releaseComment(data: ReplayComment) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;

      const params = {
        userId: loginStore?.userInfo?.userId,
        username: loginStore?.userInfo?.username,
        articleId: data?.articleId || '',
        date: new Date().valueOf(),
        content: data.keyword,
        commentId: data?.selectComment?.commentId,
        fromUsername: data?.selectComment?.username,
        fromUserId: data?.selectComment?.userId,
        formContent: data?.selectComment?.content,
        fromCommentId: data?.selectComment?.commentId,
      };

      if (!data?.isThreeTier) {
        delete params.fromUsername;
        delete params.fromUserId;
        delete params.formContent;
        delete params.fromCommentId;
      }

      const res = normalizeResult<{ commentId: string }>(await Service.releaseComment(params));

      if (res?.success) {
        ElMessage.success(res.message);
        return res;
      } else {
        ElMessage.error(res.message);
      }
    },

    // 评论点赞
    async onGiveLikeToComment(data: { commentId: string; isThreeTier?: boolean; getCommentList?: Function }) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      const params = data.isThreeTier
        ? {
            commentId: data.commentId!,
            fromCommentId: data.commentId!,
            userId: loginStore?.userInfo?.userId,
          }
        : {
            commentId: data.commentId!,
            userId: loginStore?.userInfo?.userId,
          };
      this.likeLoading = true;
      const res = normalizeResult<{ status: number }>(await Service.giveCommentLike(params));
      this.likeLoading = false;
      if (res.success) {
        data.getCommentList && data.getCommentList();
      } else {
        ElMessage.error(res.message);
        return res;
      }
    },

    // 删除评论
    async deleteComment({
      comment,
      articleId,
      isThreeTier,
      getCommentList,
    }: {
      comment: CommentParams;
      articleId: string | undefined;
      isThreeTier?: boolean;
      getCommentList?: Function;
    }) {
      const params = isThreeTier
        ? {
            commentId: comment.commentId!,
            fromCommentId: comment.commentId!,
            articleId,
          }
        : {
            commentId: comment.commentId!,
            articleId,
          };

      Message('确定要下架该文章吗', '下架文章')
        .then(async () => {
          const res = normalizeResult<{ status: number }>(await Service.deleteComment(params));
          if (res.success) {
            ElMessage.success('删除成功');
            getCommentList && getCommentList();
          } else {
            ElMessage.error(res.message);
          }
        })
        .catch(() => {
          ElMessage.error('删除失败');
        });
    },

    // 清除详情缓存
    onClearList() {
      this.articleDetail = { id: '' };
      this.commentList = [];
      this.anotherArticleList = [];
    },
  },
});
