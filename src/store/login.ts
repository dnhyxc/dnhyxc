import { defineStore } from 'pinia';
import Store from 'electron-store';
import { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import { LoginParams, UserLoginParams, UserInfoParams, registerRes } from '@/typings/common';
import { commonStore, messageStore } from '@/store';
import * as Service from '@/server';
import { useCheckUserId } from '@/hooks';
import { normalizeResult, Message, encrypt, locSetItem, locGetItem, locRemoveItem, ipcRenderers } from '@/utils';
import { createWebSocket } from '@/socket';
import { UPDATE_INFO_API_PATH } from '@/constant';

interface IProps {
  token: string | undefined | null;
  userInfo: UserInfoParams;
}

const store = new Store();

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
      juejin: '',
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
          store.set('token', JSON.stringify(token));
          locSetItem('userInfo', JSON.stringify(userInfo));
          store.set('userInfo', JSON.stringify(userInfo));
          // 登陆成功之后创建websocket
          createWebSocket();
          ipcRenderers.restore();
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

    // 账号注销
    async onLogout(router: Router) {
      Message('', '确定要注销该账号吗？').then(async () => {
        const res = normalizeResult<string>(await Service.logout());
        if (res.success) {
          this.onQuit();
          ElMessage({
            message: res.message,
            type: 'success',
            offset: 80,
          });
          router.push('/home');
        } else {
          ElMessage({
            message: res.message,
            type: 'error',
            offset: 80,
          });
        }
      });
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
    async updateUserInfo(params: UserInfoParams, pageType: number, router?: Router) {
      if (!useCheckUserId(false)) return;
      const { username } = this.userInfo;
      const res = normalizeResult<registerRes>(await Service.updateUserInfo(params, UPDATE_INFO_API_PATH[pageType]));
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

        store.set('userInfo', JSON.stringify({ ...this.userInfo, ...params }));

        // 判断是否是个人资料页面修改了用户名或者在账号设置页面中修改了密码
        if ((params.username && params.username !== username) || params.password) {
          this.token = '';
          locRemoveItem('token');
          store.delete('token');
          locRemoveItem('userInfo');
          store.delete('userInfo');
          ElMessage({
            message: `${params.password ? '密码已重置' : '用户名称已修改'}，请重新登录`,
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
    },

    // 退出登录
    onQuit() {
      this.token = '';
      this.userInfo = {};
      locRemoveItem('token');
      store.delete('token');
      locRemoveItem('userInfo');
      store.delete('userInfo');
      // 退出时清除消息条数，防止推出后头部小铃铛处还是显示消息条数
      messageStore.msgCount = 0;
      ipcRenderers.restore();
    },
  },
});
