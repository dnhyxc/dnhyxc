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
  AtlasImgInfo,
  ChatItem,
  BookRecord,
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

// 获取验证码
export const verifyCode = async (params: { id?: string }) => {
  return await post(API.VERIFY_CODE, params);
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
export const resetPassword = async (params: { username: string; password: string; phone: string }) => {
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

// 查询关注我的用户
export const getFollowMeList = async (params: { pageNo: number; pageSize: number; userId?: string }) => {
  return await post(API.GET_FOLLOW_ME_LIST, copeParams(params));
};

// 获取工具列表
export const getToolList = async (type: string) => {
  return await post(API.GET_TOOL_LIST, copeParams({ type }));
};

// 创建工具排序
export const createToolSort = async (params: { sortInfo: { id: string; sort: number }[] }) => {
  const res = await post(API.CREATE_TOOL_SORT, copeParams(params));
  return res;
};

// 更新工具排序
export const updateToolSort = async (params: { sortInfo: { id: string; sort: number }[] }) => {
  const res = await post(API.UPDATE_TOOLSORT, copeParams(params));
  return res;
};

// 添加图片集
export const addAtlasImages = async (params: AtlasImgInfo) => {
  return await post(API.ADD_ATLAS_IMAGES, copeParams(params));
};

// 获取图片集列表
export const getAtlasList = async ({ pageNo, pageSize }: { pageNo: number; pageSize: number }) => {
  return await post(API.GET_ATLAS_LIST, copeParams({ pageNo, pageSize }));
};

// 删除图片集列表
export const deleteAtlasImages = async ({ id, url }: { id: string | string[]; url?: string | string[] }) => {
  return await post(API.DELETE_ATLAS_IMAGES, copeParams({ id, url }));
};

// 更新图片信息
export const updateFileInfo = async (params: { id: string; fileName: string }) => {
  return await post(API.UPDATE_FILE_INFO, copeParams(params));
};

// 获取用户菜单权限
export const getUserMenuRoles = async () => {
  return await post(API.GET_USER_MENU_ROLES, copeParams({}));
};

// 添加转换列表
export const createConvert = async (params: { keyword: string }) => {
  return await post(API.CREATE_CONVERT, copeParams(params));
};

// 获取转换列表
export const getConvertList = async () => {
  return await post(API.GET_CONVERT_LIST, copeParams({}));
};

// 删除转换列表
export const deleteConvert = async (params: { id?: string | string[] }) => {
  return await post(API.DELETE_CONVERT, copeParams(params));
};

// 添加代码示例
export const addCode = async (params: { title: string; abstract: string; content: string; language: string }) => {
  return await post(API.ADD_CODE, copeParams(params));
};

// 更新代码示例
export const updateCode = async (params: {
  id: string;
  title: string;
  abstract: string;
  content: string;
  language: string;
}) => {
  return await post(API.UPDATE_CODE, copeParams(params));
};

// 删除代码示例
export const deleteCode = async (params: { id: string | string[] }) => {
  return await post(API.DELETE_CODE, copeParams(params));
};

// 获取代码示例列表
export const getCodeList = async (params: { pageNo: number; pageSize: number }) => {
  return await post(API.GET_CODE_LIST, copeParams(params));
};

// 获取代码示例
export const getCodeById = async (id: string) => {
  return await post(API.GET_CODE_BY_ID, copeParams({ id }));
};

// 编译C语言
export const compileCCode = async (code: string) => {
  return await post(API.COMPILE_C_CODE, copeParams({ code }));
};

// 获取聊天消息列表
export const getChatList = async (params: { pageNo: number; pageSize: number; chatId: string }) => {
  return await post(API.GET_CHAT_LIST, copeParams(params));
};

// 合并消息
export const mergeChats = async (chatId: string) => {
  return await post(API.MERGE_CHATS, copeParams({ chatId }));
};

// 获取缓存消息
export const getCacheChats = async (chatId: string) => {
  return await post(API.GET_CACHE_CHATS, copeParams({ chatId }));
};

// 删除消息
export const deleteChats = async (delIds: string[]) => {
  return await post(API.DELETE_CHATS, copeParams({ delIds }));
};

// 删除联系人，清空消息
export const deleteChatMesaage = async (chatId: string) => {
  return await post(API.DELETE_CHAT_MESAAGE, copeParams({ chatId }));
};

// 获取联系人
export const getContactList = async (params: { pageNo: number; pageSize: number }) => {
  return await post(API.GET_CONTACT_LIST, copeParams(params));
};

// 添加联系人
export const addContacts = async (params: { contactId: string; createTime: number }) => {
  return await post(API.ADD_CONTACTS, copeParams(params));
};

// 更新联系人
export const uppdateContact = async (params: {
  contactId: string;
  createTime?: number;
  isTop?: boolean;
  isUnDisturb?: null | boolean;
}) => {
  return await post(API.UPDATE_CONTACT, copeParams(params));
};

// 删除联系人
export const deleteContacts = async (contactIds: string[]) => {
  return await post(API.DELETE_CONTACTS, copeParams({ contactIds }));
};

// 获取未读消息数量
export const getUnReadChat = async (chatId: string) => {
  return await post(API.GET_UNREAD_CHAT, copeParams({ chatId }));
};

// 消息免打扰
export const onNotDisturb = async (contactId: string) => {
  return await post(API.ON_NOT_DISTURB, copeParams({ contactId }));
};

// 更新最新消息
export const updateNewChat = async (params: ChatItem) => {
  return await post(API.UPDATE_NEW_CHAT, copeParams(params));
};

// 删除最新消息
export const deleteNewChat = async (chatId: string) => {
  return await post(API.DELETE_NEW_CHAT, copeParams({ chatId }));
};

// 删除缓存消息
export const deleteCatchChat = async (id: string) => {
  return await post(API.DELETE_CATCH_CHAT, copeParams({ id }));
};

// 搜索联系人
export const searchContacts = async (params: { keyword: string; pageNo: number; pageSize: number }) => {
  return await post(API.SEARCH_CONTACTS, copeParams(params));
};

// 获取缓存联系人
export const getCatchContactList = async () => {
  return await post(API.GET_CATCH_CONTACT_LIST, copeParams({}));
};

// 更新缓存联系人
export const onUpdateCatchContact = async (params: {
  contactId: string;
  createTime?: number;
  isTop?: boolean;
  isUnDisturb?: null | boolean;
}) => {
  return await post(API.ON_UPDATE_CATCH_CONTACT, copeParams(params));
};

// 合并联系人
export const mergeContacts = async () => {
  return await post(API.MERGE_CONTACTS, copeParams({}));
};

// 删除缓存联系人
export const deleteCatchContacts = async (contactId: string) => {
  return await post(API.DELETE_CATCH_CONTACTS, copeParams({ contactId }));
};

// 添加书籍
export const addBook = async (params: AtlasImgInfo) => {
  return await post(API.ADD_BOOK, copeParams(params));
};

// 更新书籍
export const updateBookInfo = async (params: {
  id: string;
  fileName: string;
  coverImg: string;
  author: string;
  language: string;
}) => {
  return await post(API.UPDATE_BOOK_INFO, copeParams(params));
};

// 获取书籍列表
export const getBookList = async (params: { pageNo: number; pageSize: number; bookType: string }) => {
  return await post(API.GET_BOOK_LIST, copeParams(params));
};

// 删除书籍
export const deleteBook = async ({ id, url }: { id: string; url?: string }) => {
  return await post(API.DELETE_BOOK, copeParams({ id, url }));
};

// 查找书籍信息
export const findBook = async (params: { url: string }) => {
  return await post(API.FIND_BOOK, copeParams(params));
};

// 添加读书记录
export const createReadBookRecords = async (params: BookRecord) => {
  return await post(API.CREATE_READ_BOOK_RECORDS, copeParams(params));
};

// 获取读书记录
export const getReadBookRecords = async (params: { bookId: string }) => {
  return await post(API.GET_READ_BOOK_RECORDS, copeParams(params));
};

// 删除读书记录
export const deleteReadBookRecords = async (params: { bookId: string }) => {
  return await post(API.DELETE_READ_BOOK_RECORDS, copeParams(params));
};

// 获取最新及最多点赞的文章
export const findMostLikeAndNewArticles = async () => {
  return await post(API.FIND_MOST_LIKE_AND_NEW_ARTICLES, copeParams({}));
};
