import { defineStore } from 'pinia';
import { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import { LoginParams, UserLoginParams, UserInfoParams, registerRes } from '@/typings/common';
import { commonStore } from '@/store';
import * as Service from '@/server';
import { useCheckUserId } from '@/hooks';
import { normalizeResult, encrypt, locSetItem, locGetItem, locRemoveItem } from '@/utils';
import { UPDATE_INFO_API_PATH } from '@/constant';

interface IProps {
  token: string | undefined | null;
  userInfo: UserInfoParams;
}

export const useLoginStore = defineStore('login', {
  state: (): IProps => ({
    token: locGetItem('token'),
    userInfo: JSON.parse(locGetItem('userInfo')!) || {
      userId: '',
      username: '',
      job: '',
      motto: '',
      introduce: '',
      headUrl: '',
      mainCover: '',
      juejin: 'https://juejin.cn/user/4265760848885368',
      zhihu: '',
      github: '',
      blog: '',
    }, // 当前登录人用户信息
  }),

  getters: {},

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
        return res;
      } catch (error) {
        throw error;
      }
    },

    // 登录
    async onLogin(data: LoginParams, router?: Router) {
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
          const { token, ...userInfo } = res.data;
          this.token = token;
          this.userInfo = userInfo as UserInfoParams;
          locSetItem('token', token!);
          locSetItem('userInfo', JSON.stringify(userInfo));
          // 登陆成功后返回到上一页面
          router?.push(commonStore.backPath);
        } else {
          ElMessage({
            message: res.message,
            type: 'error',
            offset: 80,
          });
        }
        return res;
      } catch (error) {
        throw error;
      }
    },

    // 重置密码
    async onResetPwd(params: LoginParams, router?: Router) {
      const res = normalizeResult<UserInfoParams>(
        await Service.resetPassword({ ...params, password: encrypt(params.password) }),
      );
      // 重置成功后直接登录
      if (res.success) {
        await this.onLogin(params, router);
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 获取用户信息
    async getUserInfo() {
      if (!useCheckUserId(false)) return;
      try {
        const res = normalizeResult<UserInfoParams>(await Service.getUserInfo());
        return res.data;
      } catch (error) {
        throw error;
      }
    },

    // 修改用户信息
    async updateUserInfo(params: UserInfoParams, router?: Router) {
      if (!useCheckUserId(false)) return;
      const { username, motto, job, introduce, headUrl, mainCover } = this.userInfo;
      if (
        params.username !== username ||
        params.job !== job ||
        params.motto !== motto ||
        params.introduce !== introduce ||
        params.headUrl !== headUrl ||
        params.mainCover !== mainCover
      ) {
        const res = normalizeResult<registerRes>(await Service.updateUserInfo(params, UPDATE_INFO_API_PATH[1]));
        if (res.success) {
          this.userInfo = {
            ...this.userInfo,
            ...params,
          };
          locSetItem(
            'userInfo',
            JSON.stringify({
              ...this.userInfo,
              ...params,
            }),
          );
          if (params.username !== username) {
            this.token = '';
            locRemoveItem('token');
            locRemoveItem('userInfo');
            ElMessage({
              message: '用户名称已修改，请重新登录',
              type: 'success',
              offset: 80,
            });
            router?.replace('/login');
          } else {
            ElMessage({
              message: res.message,
              type: 'success',
              offset: 80,
            });
          }
        } else {
          ElMessage({
            message: res.message,
            type: 'warning',
            offset: 80,
          });
        }
      } else {
        ElMessage({
          message: '没修改信息，休想提交',
          type: 'warning',
          offset: 80,
        });
      }
    },

    // 退出登录
    onLogout() {
      this.token = '';
      this.userInfo = {};
      locRemoveItem('token');
      locRemoveItem('userInfo');
    },
  },
});
