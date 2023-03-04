import { post, put } from '@/utils/request';
import { LoginParams, CreateArticleParams, GetArticleListParams, AnotherParams, CommentParams } from '@/typings/common';
import { loginStore } from '@/store';
import * as API from './api';

// 自定义文件上传路径
export const uploadFile = async (params?: any) => {
  const res = await post(API.UPLOAD, params);
  return res;
};

// 处理请求参数，为请求自动加上userId
const copeParams = <T>(params?: T) => {
  const { userInfo } = loginStore;
  const data = {
    ...params,
    userId: userInfo?.userId,
  };
  return data;
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

//
export const resetPassword = async (params: { username: string; password: string }) => {
  const res = await put(API.RESET_PASSWORD, params);
  return res;
};

// 获取用户信息
export const getUserInfo = async () => {
  const res = await post(API.GET_USER_INFO, copeParams());
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
export const getArticleDetail = async (id: string) => {
  const res = await post(API.ARTICLE_DETAIL, { id });
  return res;
};

// 获取上一篇文章
export const getPrevArticle = async (params: AnotherParams) => {
  const res = await post(API.GET_PREV_ARTICLE, params);
  return res;
};

// 获取下一篇文章
export const getNextArticle = async (params: AnotherParams) => {
  const res = await post(API.GET_NEXT_ARTICLE, copeParams(params));
  return res;
};

// 获取下一篇文章
export const getCommentList = async (id: string) => {
  const res = await post(API.GET_COMMENT_LIST, { id });
  return res;
};

// 获取下一篇文章
export const releaseComment = async (params: CommentParams) => {
  const res = await post(API.COMMENTS, params);
  return res;
};
