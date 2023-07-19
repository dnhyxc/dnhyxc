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
  return params?.userId ? params : { ...params, userId: userInfo?.userId || storeUserInfo?.userId };
};

// 自定义文件上传路径
export const uploadFile = async (params?: any) => {
  return await post(API.UPLOAD, params);
};

// 删除文件
export const removeFile = async (url: string) => {
  return await post(API.REMOVE_FILE, copeParams({ url }));
};

// 登录
export const login = async (params: LoginParams) => {
  try {
    return await post(API.LOGIN, params);
  } catch (error) {
    throw error;
  }
};

// 注册
export const register = async (params: LoginParams) => {
  try {
    return await post(API.REGISTER, params);
  } catch (error) {
    throw error;
  }
};

// 账号注销
export const logout = async () => {
  return await post(API.LOGOUT, copeParams({}));
};

// 重置密码
export const resetPassword = async (params: { username: string; password: string }) => {
  return await put(API.RESET_PASSWORD, params);
};

// 获取用户信息
export const getUserInfo = async (params?: { userId?: string; auth?: number; needTotal?: boolean }) => {
  return await post(API.GET_USER_INFO, copeParams(params));
};

// 新建文章
export const createArticle = async (params: CreateArticleParams) => {
  return await post(API.CREATE_ARTICLE, params);
};

// 获取文章列表
export const getArticleList = async (params: GetArticleListParams) => {
  return await post(API.ARTICLE_LIST, copeParams(params));
};

// 获取文章详情
export const getArticleDetail = async (id: string, isEdit?: boolean) => {
  return await post(API.ARTICLE_DETAIL, { id, isEdit });
};

// 获取相似的文章
export const getLikenessArticles = async (params: { classify: string; tag: string; id: string }) => {
  return await post(API.GET_LIKENESS_ARTICLES, copeParams(params));
};

// 随机获取文章
export const getArticleByRandom = async () => {
  return await post(API.GET_ARTICLE_BY_RANDOM, copeParams());
};

// 删除文章
export const deleteArticle = async (params: DeleteArticleParams) => {
  return await post(API.DELETE_ARTICLE, params);
};

// 获取评论
export const getCommentList = async (id: string) => {
  return await post(API.GET_COMMENT_LIST, copeParams({ id }));
};

// 发布评论
export const releaseComment = async (params: CommentParams) => {
  return await post(API.COMMENTS, params);
};

// 评论点赞
export const giveCommentLike = async (params: { commentId: string; fromCommentId?: string }) => {
  return await post(API.GIVE_COMMENT_LIKE, params);
};

// 删除评论
export const deleteComment = async (params: { commentId: string; fromCommentId?: string }) => {
  return await post(API.DELETE_COMMENT, params);
};

// 文章点赞
export const likeArticle = async (params: { id: string; authorId?: string | null | undefined }) => {
  return await post(API.LIKE_ARTICLE, copeParams(params));
};

// 校验文章点赞点赞状态
export const checkArticleLikeStatus = async (id: string) => {
  return await post(API.CHECK_ARTICLE_LIKE_STATUS, copeParams({ id }));
};

// 新建收藏集
export const createCollection = async (params: CollectParams) => {
  return await post(API.CREATE_COLLECTION, copeParams(params));
};

// 更新收藏集
export const updateCollection = async (params: CollectParams) => {
  return await post(API.UPDATE_COLLECTION, copeParams(params));
};

// 获取收藏集列表
export const getCollectionList = async (params: { pageNo: number; pageSize: number }) => {
  return await post(API.GET_COLLECTION_LIST, copeParams(params));
};

// 收藏文章
export const collectArticles = async (params: { ids: string[]; articleId: string; isMove?: boolean }) => {
  return await post(API.COLLECT_ARTICLES, copeParams(params));
};

// 获取文章收藏状态
export const checkCollectionStatus = async (articleId: string) => {
  return await post(API.CHECK_COLLECTION_STATUS, copeParams({ articleId }));
};

// 取消收藏
export const cancelCollected = async (articleId: string) => {
  return await post(API.CANCEL_COLLECTED, copeParams({ articleId }));
};

// 获取文章分类、标签列表
export const getTagList = async (type: string) => {
  return await post(API.GET_TAG_LIST, { type });
};

// 获取文章分类列表
export const getClassifyList = async (params: {
  pageNo?: number;
  pageSize?: number;
  classify: string | number;
  filter?: string;
}) => {
  return await post(API.GET_CLASSIFY_LIST, copeParams(params));
};

// 获取后台添加的文章分类列表
export const getAddedClassifys = async () => {
  return await post(API.GET_ADDED_CLASSIFYS, copeParams({}));
};

// 文章搜索
export const searchArticle = async (params: SearchArticleParams) => {
  return await post(API.SEARCH_ARTICLE, copeParams(params));
};

// 获取时间轴列表
export const getTimelineList = async (params?: { pageNo?: number; pageSize?: number; keyword?: string }) => {
  return await post(API.GET_TIMELINE_LIST, copeParams(params));
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
  return await post(path, params);
};

// 获取博主时间轴文章列表
export const getAuthorTimeline = async (params: { accessUserId?: string }) => {
  return await post(API.GET_AUTHOR_TIMELINE, params);
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
  return await post(path, params);
};

// 删除收藏集
export const delCollection = async (params: { id: string; userId?: string; pageNo?: number; pageSize?: number }) => {
  return await post(API.DEL_COLLECTION, copeParams(params));
};

// 获取收藏数
export const getCollectTotal = async (params: { userId: string; status: number }) => {
  return await post(API.GET_COLLECT_TOTAL, params);
};

// 获取收藏文章总条数
export const getCollectedTotal = async (params: { userId: string; status: number }) => {
  return await post(API.GET_COLLECTED_TOTAL, params);
};

// 获取收藏集中的文章
export const getCollectArticles = async (params: { pageNo: number; pageSize: number; articleIds?: string[] }) => {
  return await post(API.GET_COLLECT_ARTICLES, copeParams(params));
};

// 获取收藏集详情
export const getCollectInfo = async (id: string) => {
  return await post(API.GET_COLLECT_INFO, { id });
};

// 取消收藏收藏集中的文章(移除收藏集中的文章)
export const removeCollectArticle = async (params: {
  articleId: string;
  id: string; // 收藏集id
  isMove?: boolean; // s标识是否是转移，不需要增减收藏数
}) => {
  return await post(API.REMOVE_COLLECT_ARTICLE, copeParams(params));
};

// 更新用户信息
export const updateUserInfo = async (params: UserInfoParams, path: string) => {
  return await put(path, copeParams(params));
};

// 高级搜索
export const advancedSearch = async (params: AdvancedSearchParams) => {
  return await post(API.ADVANCED_SEARCH, copeParams(params));
};

// 保存草稿

export const articleDraft = async (params: CreateArticleParams, path: string) => {
  return await post(path, copeParams(params));
};

// 获取草稿列表
export const getDraftList = async (params: GetArticleListParams) => {
  return await post(API.GET_DRAFT_LIST, copeParams(params));
};

// 获取草稿详情
export const getDraftInfoById = async (params: { id: string }) => {
  return await post(API.GET_DRAFT_BY_ID, copeParams(params));
};

// 删除草稿
export const deleteDraft = async (params: { id: string | null }) => {
  return await post(API.DELETE_DRAFT, copeParams(params));
};

// 获取消息列表
export const getMessageList = async (params: { pageNo: number; pageSize: number }) => {
  return await post(API.GET_MESSAGE_LIST, copeParams(params));
};

// 设置消息阅读状态
export const setReadStatus = async (params: { msgIds: string[] }) => {
  return await post(API.SET_READ_STATUS, copeParams(params));
};

// 获取未读消息数量
export const getNoReadMsgCount = async () => {
  return await post(API.GET_NO_READ_MSG_COUNT, copeParams({}));
};

// 删除消息
export const deleteMessage = async (id: string) => {
  return await post(API.DELETE_MESSAGE, copeParams({ id }));
};

// 删除全部消息
export const deleteAllMessage = async () => {
  return await post(API.DELETE_ALL_MESSAGE, copeParams({}));
};

// 创建留言
export const createInteract = async (params: BarrageItem) => {
  return await post(API.CREATE_INTERACT, copeParams(params));
};

// 获取留言列表
export const getInteracts = async () => {
  return await post(API.GET_INTERACTS, copeParams({}));
};

// 分页获取留言列表
export const getInteractList = async (params: { pageNo: number; pageSize: number }) => {
  return await post(API.GET_INTERACT_LIST, copeParams(params));
};

// 移除留言
export const removeInteracts = async (ids: string | string[]) => {
  return await post(API.REMOVE_INTERACTS, copeParams({ ids }));
};

// 关注/取消关注用户
export const manageFollow = async (authorId: string) => {
  return await post(API.MANAGE_FOLLOW, copeParams({ authorId }));
};

// 获取关注用户列表
export const getFollowList = async (params: { pageNo: number; pageSize: number; userId?: string }) => {
  return await post(API.GET_FOLLOW_LIST, copeParams(params));
};

// 查询是否关注该用户
export const findFollowed = async (authorId: string, userId?: string, token?: string) => {
  return await post(API.FIND_FOLLOWED, copeParams({ authorId, userId, token }));
};

// 获取工具列表
export const getToolList = async (type: string) => {
  return await post(API.GET_TOOL_LIST, copeParams({ type }));
};

// 获取工具列表
export const getAtlasList = async ({ pageNo, pageSize }: { pageNo: number; pageSize: number }) => {
  return await post(API.GET_ATLAS_LIST, copeParams({ pageNo, pageSize }));
};
