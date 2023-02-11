import { post, put } from '@/utils/request';
import { LoginParams, CreateArticleParams } from '@/typings/common';
import { loginStore } from '@/store';
import * as API from './api';

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
  const res = await post(API.CREATE_ARTICLE, copeParams(params));
  return res;
};
