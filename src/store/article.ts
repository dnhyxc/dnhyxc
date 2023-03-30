import { defineStore } from 'pinia';
import { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult, Message } from '@/utils';
import { useCheckUserId } from '@/hooks';
import {
  ArticleListResult,
  ArticleItem,
  AnotherParams,
  CommentParams,
  ReplayComment,
  DeleteArticleParams,
  TimelineResult,
} from '@/typings/common';
import {
  authorStore,
  classifyStore,
  collectStore,
  commonStore,
  createStore,
  loginStore,
  personalStore,
  searchStore,
  tagStore,
  timelineStore,
} from '@/store';
import { PAGESIZE } from '@/constant';

interface IProps {
  loading: boolean;
  likeLoading: boolean;
  pageNo: number;
  pageSize: number;
  articleList: ArticleItem[]; // 文章列表数据（首页、分类页等）
  total: number; // 文章列表总数
  articleDetail: ArticleItem; // 文章详情
  anotherArticleList: ArticleItem[]; // 详情上下篇文章列表
  recommendArticleList: ArticleItem[]; // 随机文章列表
  commentList: CommentParams[]; // 评论列表
  detailArtLikeCount: number; // 详情文章点赞数量
  hot?: boolean; // 是否查询最热文章
}

export const useArticleStore = defineStore('article', {
  state: (): IProps => ({
    // 首页、标签列表、分类列表文章列表数据
    loading: false,
    likeLoading: false,
    pageNo: 0,
    pageSize: PAGESIZE,
    articleList: [],
    total: 0,
    articleDetail: {
      id: '',
    },
    anotherArticleList: [],
    recommendArticleList: [],
    commentList: [],
    detailArtLikeCount: 0,
    hot: false,
  }),

  actions: {
    // 获取文章列表
    async getArticleList() {
      if (this.articleList.length !== 0 && this.articleList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<ArticleListResult>(
        await Service.getArticleList({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          hot: this.hot,
          filter: commonStore.keyword,
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

    // 获取文章详情
    async getArticleDetail(id: string, store?: true) {
      if (!id) {
        ElMessage.error('哦豁！文章不翼而飞了！');
        return;
      }
      this.loading = true;
      const res = normalizeResult<ArticleItem>(await Service.getArticleDetail(id));
      if (res.success) {
        this.detailArtLikeCount = res.data?.likeCount!;
        this.articleDetail = res.data;
        // store 为 true，则说明是编辑，需要缓存编辑内容
        if (store) {
          createStore.createInfo = {
            authorId: res.data.authorId,
            title: res.data.title,
            content: res.data.content,
            classify: res.data.classify,
            tag: res.data.tag,
            createTime: res.data.createTime,
            coverImage: res.data.coverImage,
            abstract: res.data.abstract,
            articleId: res.data.id,
          };
          // 如果是创建页调用获取详情的接口，则需要清除文章详情的缓存。防止再次进入详情时文章目录出现错乱
          this.articleDetail = { id: '' };
          this.detailArtLikeCount = 0;
        }
        return res.data;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
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
      if (!params.id) {
        ElMessage({
          message: '哦豁！文章不翼而飞了',
          type: 'error',
          offset: 80,
        });
        return;
      }
      const res = await Promise.all([this.getPrevArticle(params), this.getNextArticle(params)]);
      this.loading = false;
      if (res?.length) {
        this.anotherArticleList = res;
      }
    },

    // 随机获取文章
    async getArticleByRandom() {
      const res = normalizeResult<ArticleItem[]>(await Service.getArticleByRandom());
      if (res.success) {
        this.recommendArticleList = res.data;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 删除文章
    async deleteArticle(params: DeleteArticleParams, router: Router) {
      // 设置个页面列表数据
      const articleList = {
        home: this.articleList,
        classify: classifyStore.articleList,
        tag: tagStore.articleList,
        author: authorStore.articleList,
        personal: personalStore.articleList,
        search: searchStore.articleList,
      };

      // 个页面pageNo
      const pageNo = {
        home: this.pageNo,
        classify: classifyStore.pageNo,
        tag: tagStore.pageNo,
        author: authorStore.pageNo,
        personal: personalStore.pageNo,
        search: searchStore.pageNo,
      };

      const res = normalizeResult<ArticleListResult>(
        await Service.deleteArticle({
          ...params,
          pageNo: pageNo[params.pageType!],
          pageSize: PAGESIZE,
          userId: params.authorId || loginStore.userInfo?.userId,
        }),
      );

      if (res.success) {
        const nextPageOne = res?.data?.list[0] || '';
        const list = articleList[params.pageType!].filter((i: ArticleItem) => i.id !== params.articleId);

        switch (params.pageType) {
          case 'home':
            this.articleList = nextPageOne ? [...list, nextPageOne] : list;
            this.total = this.total - 1;

            break;

          case 'classify':
            classifyStore.articleList = nextPageOne ? [...list, nextPageOne] : list;
            classifyStore.total = classifyStore.total - 1;
            // 删除分类文章的同时，更新对应分类的数量
            classifyStore.classifys.forEach((i) => {
              if (params.classify === i.name) {
                i.value = i.value! - 1;
              }
            });
            if (classifyStore.classifys.find((i) => !i.value)) {
              // 删除分类数量为 0 的分类
              classifyStore.classifys = classifyStore.classifys.filter((i) => i.value);
              classifyStore.currentClassify = classifyStore.classifys[0]?.name!;
              params.router.push('/classify');
            }

            break;
          case 'tag':
            tagStore.articleList = nextPageOne ? [...list, nextPageOne] : list;
            tagStore.total = tagStore.total - 1;
            // 删除标签中的文章的同时，更新对应标签的数量
            tagStore.tags.forEach((i) => {
              if (params.tagName === i.name) {
                i.value = i.value! - 1;
              }
            });
            if (tagStore.tags.find((i) => !i.value)) {
              // 删除分类数量为 0 的分类
              tagStore.tags = tagStore.tags.filter((i) => i.value);
              tagStore.currentTag = tagStore.tags[0]?.name!;
              params.router.push('/tag/list');
            }

            break;
          case 'author':
            authorStore.articleList = nextPageOne ? [...list, nextPageOne] : list;
            authorStore.total = authorStore.total - 1;

            break;
          case 'personal':
            personalStore.articleList = nextPageOne ? [...list, nextPageOne] : list;
            personalStore.total = personalStore.total - 1;

            break;
          case 'search':
            searchStore.articleList = nextPageOne ? [...list, nextPageOne] : list;
            searchStore.total = searchStore.total - 1;

            break;

          default:
            break;
        }

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

    // 列表文章点赞
    async likeListArticle({ id, isTimeLine, pageType }: { id: string; pageType?: string; isTimeLine?: boolean }) {
      const res = normalizeResult<{ id: string; isLike: boolean; nextPageOne: ArticleItem[]; total: number }>(
        await Service.likeArticle({ id }),
      );
      if (res.success) {
        const { id, isLike } = res.data;
        // 时间轴页面
        if (isTimeLine || authorStore.currentTabKey === '2') {
          const cloneArticles: TimelineResult[] =
            authorStore.currentTabKey !== '2'
              ? JSON.parse(JSON.stringify(timelineStore.timelineList))
              : JSON.parse(JSON.stringify(authorStore.timelineList));

          const timelineList = cloneArticles.map((i) => {
            i.articles.forEach((j) => {
              if (j.id === id) {
                j.isLike = res.data.isLike;
                if (isLike) {
                  j.likeCount! += 1;
                } else {
                  j.likeCount! > 0 ? (j.likeCount! -= 1) : (j.likeCount = 0);
                }
              }
            });
            return i;
          });
          // authorStore.currentTabKey !== '2' 为时间轴页面，否则为博主时间轴页面
          if (authorStore.currentTabKey !== '2') {
            timelineStore.timelineList = timelineList;
          } else {
            authorStore.timelineList = timelineList;
          }
        } else {
          // 设置各个页面的文章列表数据
          const dataList = {
            home: this.articleList,
            classify: classifyStore.articleList,
            tag: tagStore.articleList,
            author: authorStore.articleList,
            personal: personalStore.articleList,
            collect: collectStore.articleList,
            search: searchStore.articleList,
          };

          const cloneList: ArticleItem[] = JSON.parse(JSON.stringify(dataList[pageType!]));

          // 处理点赞数
          const list = cloneList.map((i) => {
            if (i.id === id) {
              i.isLike = res.data.isLike;
              if (isLike) {
                i.likeCount! += 1;
              } else {
                i.likeCount! > 0 ? (i.likeCount! -= 1) : (i.likeCount = 0);
              }
            }
            return i;
          });

          switch (pageType) {
            case 'home':
              this.articleList = list;
              break;
            case 'classify':
              classifyStore.articleList = list;
              break;
            case 'tag':
              tagStore.articleList = list;
              break;
            case 'author':
              // 取消点赞之后，重新获取点赞文章列表
              if (loginStore.userInfo?.auth === 1 && authorStore.currentTabKey === '1') {
                authorStore.clearArticleList();
                authorStore.getAuthorArticles();
                return;
              }
              authorStore.articleList = list;
              break;
            case 'personal':
              // 取消点赞之后，重新获取点赞文章列表
              if (personalStore.currentTabKey === '2') {
                personalStore.clearArticleList();
                personalStore.getMyArticleList();
                return;
              }
              personalStore.articleList = list;
              break;
            case 'collect':
              collectStore.articleList = list;
              break;
            case 'search':
              searchStore.articleList = list;
              break;

            default:
              break;
          }
        }
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取文章评论
    async getCommentList(id: string) {
      // 检验是否有userId，如果没有禁止发送请求
      // if (!useCheckUserId()) return;
      if (!id) {
        ElMessage({
          message: '哦豁！文章不翼而飞了，评论也随着不知所踪',
          type: 'error',
          offset: 80,
        });
        return;
      }
      const res = normalizeResult<CommentParams[]>(await Service.getCommentList(id));
      if (res?.success) {
        this.commentList = res.data;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
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
        ElMessage({
          message: res.message,
          type: 'success',
          offset: 80,
        });
        return res;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
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
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
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
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;

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

      Message('确定要删除该评论吗', '删除评论').then(async () => {
        const res = normalizeResult<{ status: number }>(await Service.deleteComment(params));
        if (res.success) {
          ElMessage({
            message: res.message,
            type: 'success',
            offset: 80,
          });
          getCommentList && getCommentList();
        } else {
          ElMessage({
            message: res.message,
            type: 'error',
            offset: 80,
          });
        }
      });
    },

    // 文章点赞
    async likeArticle({ id, authorId }: { id: string; authorId?: string }) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      const res = normalizeResult<{ id: string; isLike: boolean }>(await Service.likeArticle({ id, authorId }));
      if (!res.success) {
        ElMessage.error(res.message);
      } else {
        // 点赞后将原本的点赞数自动加减 1
        if (res.data.isLike) {
          this.detailArtLikeCount += 1;
          this.articleDetail.isLike = true;
        } else {
          this.detailArtLikeCount -= 1;
          this.articleDetail.isLike = false;
        }
        return res.data;
      }
    },

    // 清除文章列表数据
    clearArticleList() {
      this.articleList = [];
      this.total = 0;
      this.pageNo = 0;
    },

    // 清除详情缓存
    onClearList() {
      this.articleDetail = { id: '' };
      this.commentList = [];
      this.anotherArticleList = [];
      this.detailArtLikeCount = 0;
    },
  },
});
