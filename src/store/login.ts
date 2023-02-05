import { defineStore } from 'pinia';
import { LoginParams, UserLoginParams } from '@/typings/common';
import * as Service from '@/server';
import { normalizeResult, encrypt, locSetItem, locGetItem, locRemoveItem } from '@/utils';
import { ElMessage } from 'element-plus';

export const useLoginStore = defineStore('login', {
  state: () => ({
    token: locGetItem('token'),
    userId: locGetItem('userId'),
    username: locGetItem('username'),
    auth: Number(locGetItem('auth')) || null, // 管理员权限
    userInfo: { id: '', username: '' },
  }),

  actions: {
    // 账号注册
    async onRegister(data: LoginParams) {
      try {
        // 密码加密传到后端
        const password = encrypt(data.password);
        const res = normalizeResult<UserLoginParams>(
          await Service.register({
            username: data.username,
            password,
          }),
        );
        if (res.success) {
          ElMessage.success(res.message);
        } else {
          ElMessage.error(res.message);
        }
        return res;
      } catch (error) {
        throw error;
      }
    },

    // 登录
    async onLogin(data: LoginParams) {
      try {
        // 密码加密传到后端
        const password = encrypt(data.password);
        const res = normalizeResult<UserLoginParams>(
          await Service.login({
            username: data.username,
            password,
          }),
        );
        if (res.success) {
          const { token, userId, username, auth } = res.data;
          this.token = token;
          this.userId = userId;
          this.username = username;
          this.auth = auth;
          locSetItem('token', token!);
          locSetItem('userId', userId!);
          locSetItem('username', username!);
          locSetItem('auth', JSON.stringify(auth!));
        } else {
          ElMessage.error(res.message);
        }
        return res;
      } catch (error) {
        throw error;
      }
    },

    // 获取用户信息
    // async getUserInfo() {
    //   try {
    //     const res = normalizeResult<UserInfoParams>(
    //       await Service.getUserInfo({
    //         userId: this.userId!,
    //       }),
    //     );
    //     if (res.success) {
    //       this.userInfo = res.data;
    //     }
    //     return res.data;
    //   } catch (error) {
    //     throw error;
    //   }
    // },

    // 验证token是否过期
    // async verifyToken() {
    //   try {
    //     const res = normalizeResult<number>(await Service.verify());
    //     if (!res.success) {
    //       ElMessage.warning(res.message);
    //       this.onLogout();
    //     }
    //   } catch (error) {
    //     throw error;
    //   }
    // },

    // 退出登录
    onLogout() {
      this.token = '';
      this.userId = '';
      this.username = '';
      this.auth = 0;
      locRemoveItem('token');
      locRemoveItem('userId');
      locRemoveItem('username');
      locRemoveItem('auth');
    },
  },
});
