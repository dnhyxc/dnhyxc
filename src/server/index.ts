import { post, put } from '@/utils/request';
import {
  LoginParams,
  CreateArticleParams,
  GetArticleListParams,
  CommentParams,
  DeleteArticleParams,
  SearchArticleParams,
  CollectParams,
  UserInfoParams,
  AdvancedSearchParams,
  BarrageItem,
} from '@/typings/common';
import { loginStore } from '@/store';
import { getStoreUserInfo } from '@/utils';
import * as API from './api';

// 处理请求参数，为请求自动加上userId
const copeParams = (params?: any) => {
  const userInfo = loginStore?.userInfo;
  const { userInfo: storeUserInfo } = getStoreUserInfo();
  const data = params?.userId ? params : { ...params, userId: userInfo?.userId || storeUserInfo?.userId };
  return data;
};

// 自定义文件上传路径
export const uploadFile = async (params?: any) => {
  const res = await post(API.UPLOAD, params);
  return res;
};

// 删除文件
export const removeFile = async (url: string) => {
  const res = await post(API.REMOVE_FILE, copeParams({ url }));
  return res;
};

// 登录
export const login = async (params: LoginParams) => {
  try {
    const res = await post(API.LOGIN, params);
    return res;
  } catch (error) {
    throw error;
  }
};

// 注册
export const register = async (params: LoginParams) => {
  try {
    const res = await post(API.REGISTER, params);
    return res;
  } catch (error) {
    throw error;
  }
};

// 账号注销
export const logout = async () => {
  const res = await post(API.LOGOUT, copeParams({}));
  return res;
};

// 重置密码
export const resetPassword = async (params: { username: string; password: string }) => {
  const res = await put(API.RESET_PASSWORD, params);
  return res;
};

// 获取用户信息
export const getUserInfo = async (params?: { userId?: string; auth?: number; needTotal?: boolean }) => {
  const res = await post(API.GET_USER_INFO, copeParams(params));
  return res;
};

// 新建文章
export const createArticle = async (params: CreateArticleParams) => {
  const res = await post(API.CREATE_ARTICLE, params);
  return res;
};

// 获取文章列表
export const getArticleList = async (params: GetArticleListParams) => {
  const res = await post(API.ARTICLE_LIST, copeParams(params));
  return res;
};

// 获取文章详情
export const getArticleDetail = async (id: string, isEdit?: boolean) => {
  const res = await post(API.ARTICLE_DETAIL, { id, isEdit });
  return res;
};

// 获取相似的文章
export const getLikenessArticles = async (params: { classify: string; tag: string; id: string }) => {
  const res = await post(API.GET_LIKENESS_ARTICLES, copeParams(params));
  return res;
};

// 随机获取文章
export const getArticleByRandom = async () => {
  const res = await post(API.GET_ARTICLE_BY_RANDOM, copeParams());
  return res;
};

// 删除文章
export const deleteArticle = async (params: DeleteArticleParams) => {
  const res = await post(API.DELETE_ARTICLE, params);
  return res;
};

// 获取评论
export const getCommentList = async (id: string) => {
  const res = await post(API.GET_COMMENT_LIST, copeParams({ id }));
  return res;
};

// 发布评论
export const releaseComment = async (params: CommentParams) => {
  const res = await post(API.COMMENTS, params);
  return res;
};

// 评论点赞
export const giveCommentLike = async (params: { commentId: string; fromCommentId?: string }) => {
  const res = await post(API.GIVE_COMMENT_LIKE, params);
  return res;
};

// 删除评论
export const deleteComment = async (params: { commentId: string; fromCommentId?: string }) => {
  const res = await post(API.DELETE_COMMENT, params);
  return res;
};

// 文章点赞
export const likeArticle = async (params: { id: string; authorId?: string | null | undefined }) => {
  const res = await post(API.LIKE_ARTICLE, copeParams(params));
  return res;
};

// 校验文章点赞点赞状态
export const checkArticleLikeStatus = async (id: string) => {
  const res = await post(API.CHECK_ARTICLE_LIKE_STATUS, copeParams({ id }));
  return res;
};

// 新建收藏集
export const createCollection = async (params: CollectParams) => {
  const res = await post(API.CREATE_COLLECTION, copeParams(params));
  return res;
};

// 更新收藏集
export const updateCollection = async (params: CollectParams) => {
  const res = await post(API.UPDATE_COLLECTION, copeParams(params));
  return res;
};

// 获取收藏集列表
export const getCollectionList = async (params: { pageNo: number; pageSize: number }) => {
  const res = await post(API.GET_COLLECTION_LIST, copeParams(params));
  return res;
};

// 收藏文章
export const collectArticles = async (params: { ids: string[]; articleId: string; isMove?: boolean }) => {
  const res = await post(API.COLLECT_ARTICLES, copeParams(params));
  return res;
};

// 获取文章收藏状态
export const checkCollectionStatus = async (articleId: string) => {
  const res = await post(API.CHECK_COLLECTION_STATUS, copeParams({ articleId }));
  return res;
};

// 取消收藏
export const cancelCollected = async (articleId: string) => {
  const res = await post(API.CANCEL_COLLECTED, copeParams({ articleId }));
  return res;
};

// 获取文章分类、标签列表
export const getTagList = async (type: string) => {
  const res = await post(API.GET_TAG_LIST, { type });
  return res;
};

// 获取文章分类列表
export const getClassifyList = async (params: {
  pageNo?: number;
  pageSize?: number;
  classify: string | number;
  filter?: string;
}) => {
  const res = await post(API.GET_CLASSIFY_LIST, copeParams(params));
  return res;
};

// 获取后台添加的文章分类列表
export const getAddedClassifys = async () => {
  const res = await post(API.GET_ADDED_CLASSIFYS, copeParams({}));
  return res;
};

// 文章搜索
export const searchArticle = async (params: SearchArticleParams) => {
  const res = await post(API.SEARCH_ARTICLE, copeParams(params));
  return res;
};

// 获取时间轴列表
export const getTimelineList = async (params?: { pageNo?: number; pageSize?: number; keyword?: string }) => {
  const res = await post(API.GET_TIMELINE_LIST, copeParams(params));
  return res;
};

// 获取博主各种文章列表
export const getAuthorArticleList = async (
  params: {
    pageNo?: number;
    pageSize?: number;
    accessUserId?: string;
  },
  path: string,
) => {
  const res = await post(path, params);
  return res;
};

// 获取博主时间轴文章列表
export const getAuthorTimeline = async (params: { accessUserId?: string }) => {
  const res = await post(API.GET_AUTHOR_TIMELINE, params);
  return res;
};

// 获取个人主页的列表数据
export const getMyArticleList = async (
  params: {
    pageNo?: number;
    pageSize?: number;
    userId: string;
    accessUserId?: string;
  },
  path: string,
) => {
  const res = await post(path, params);
  return res;
};

// 删除收藏集
export const delCollection = async (params: { id: string; userId?: string; pageNo?: number; pageSize?: number }) => {
  const res = await post(API.DEL_COLLECTION, copeParams(params));
  return res;
};

// 获取收藏数
export const getCollectTotal = async (params: { userId: string; status: number }) => {
  const res = await post(API.GET_COLLECT_TOTAL, params);
  return res;
};

// 获取收藏文章总条数
export const getCollectedTotal = async (params: { userId: string; status: number }) => {
  const res = await post(API.GET_COLLECTED_TOTAL, params);
  return res;
};

// 获取收藏集中的文章
export const getCollectArticles = async (params: { pageNo: number; pageSize: number; articleIds?: string[] }) => {
  const res = await post(API.GET_COLLECT_ARTICLES, copeParams(params));
  return res;
};

// 获取收藏集详情
export const getCollectInfo = async (id: string) => {
  const res = await post(API.GET_COLLECT_INFO, { id });
  return res;
};

// 取消收藏收藏集中的文章(移除收藏集中的文章)
export const removeCollectArticle = async (params: {
  articleId: string;
  id: string; // 收藏集id
  isMove?: boolean; // s标识是否是转移，不需要增减收藏数
}) => {
  const res = await post(API.REMOVE_COLLECT_ARTICLE, copeParams(params));
  return res;
};

// 更新用户信息
export const updateUserInfo = async (params: UserInfoParams, path: string) => {
  const res = await put(path, copeParams(params));
  return res;
};

// 高级搜索
export const advancedSearch = async (params: AdvancedSearchParams) => {
  const res = await post(API.ADVANCED_SEARCH, copeParams(params));
  return res;
};

// 保存草稿

export const articleDraft = async (params: CreateArticleParams, path: string) => {
  const res = await post(path, copeParams(params));
  return res;
};

// 获取草稿列表
export const getDraftList = async (params: GetArticleListParams) => {
  const res = await post(API.GET_DRAFT_LIST, copeParams(params));
  return res;
};

// 获取草稿详情
export const getDraftInfoById = async (params: { id: string }) => {
  const res = await post(API.GET_DRAFT_BY_ID, copeParams(params));
  return res;
};

// 删除草稿
export const deleteDraft = async (params: { id: string | null }) => {
  const res = await post(API.DELETE_DRAFT, copeParams(params));
  return res;
};

// 获取消息列表
export const getMessageList = async (params: { pageNo: number; pageSize: number }) => {
  const res = await post(API.GET_MESSAGE_LIST, copeParams(params));
  return res;
};

// 设置消息阅读状态
export const setReadStatus = async (params: { msgIds: string[] }) => {
  const res = await post(API.SET_READ_STATUS, copeParams(params));
  return res;
};

// 获取未读消息数量
export const getNoReadMsgCount = async () => {
  const res = await post(API.GET_NO_READ_MSG_COUNT, copeParams({}));
  return res;
};

// 删除消息
export const deleteMessage = async (id: string) => {
  const res = await post(API.DELETE_MESSAGE, copeParams({ id }));
  return res;
};

// 删除全部消息
export const deleteAllMessage = async () => {
  const res = await post(API.DELETE_ALL_MESSAGE, copeParams({}));
  return res;
};

// 创建留言
export const createInteract = async (params: BarrageItem) => {
  const res = await post(API.CREATE_INTERACT, copeParams(params));
  return res;
};

// 获取留言列表
export const getInteracts = async () => {
  const res = await post(API.GET_INTERACTS, copeParams({}));
  return res;
};

// 分页获取留言列表
export const getInteractList = async (params: { pageNo: number; pageSize: number }) => {
  const res = await post(API.GET_INTERACT_LIST, copeParams(params));
  return res;
};

// 移除留言
export const removeInteracts = async (ids: string | string[]) => {
  const res = await post(API.REMOVE_INTERACTS, copeParams({ ids }));
  return res;
};
