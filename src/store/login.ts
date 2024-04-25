import { defineStore } from 'pinia';
import { Router } from 'vue-router';
import { LoginParams, UserLoginParams, UserInfoParams, registerRes, VerifyCodeParams } from '@/typings/common';
import { commonStore, messageStore } from '@/store';
import * as Service from '@/server';
import { useCheckUserId } from '@/hooks';
import {
  normalizeResult,
  Message,
  encrypt,
  decrypt,
  locSetItem,
  locGetItem,
  locRemoveItem,
  ipcRenderers, message,
} from '@/utils';
import { createWebSocket, closeSocket } from '@/socket';
import { UPDATE_INFO_API_PATH } from '@/constant';

interface IProps {
  token: string | undefined | null;
  userInfo: UserInfoParams;
  timer: ReturnType<typeof setTimeout> | null;
  logoutStatus: boolean; // 登出状态
  menus: string[];
  verifyCode: Partial<VerifyCodeParams>;
  loadCode: boolean;
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
      juejin: '',
      zhihu: '',
      github: '',
      blog: '',
    }, // 当前登录人用户信息
    menus: [],
    timer: null,
    logoutStatus: false,
    verifyCode: {},
    loadCode: false,
  }),

  getters: {},

  actions: {
    // 账号注册
    async onRegister(data: LoginParams) {
      try {
        // 密码加密传到后端
        const password = encrypt(data.password);
        const phone = encrypt(data.phone!);
        const res = normalizeResult<UserLoginParams>(
          await Service.register({
            username: data.username,
            password,
            phone,
          }),
        );
        if (res.success) {
          message({
            title: res.message,
            type: 'success',
          });
        } else {
          message({
            title: res.message,
            type: 'error',
          });
        }
        return res.success;
      } catch (error) {
        throw error;
      }
    },

    // 获取验证码
    async getVerifyCode() {
      if (this.loadCode) return;
      this.loadCode = true;
      const res = normalizeResult<VerifyCodeParams>(await Service.verifyCode({id: this.verifyCode.id}));
      this.loadCode = false;
      if (res.success) {
        const code = decrypt(res.data.code);
        this.verifyCode = {
          ...res.data,
          code,
        };
      }
    },

    // 登录
    async onLogin(data: LoginParams, router?: Router, onResetCode?: Function) {
      try {
        // 密码加密传到后端
        const password = encrypt(data.password);
        const code = encrypt(data.code!);
        const res = normalizeResult<UserLoginParams>(
          await Service.login({
            username: data.username,
            password,
            codeId: this.verifyCode.id,
            code,
          }),
        );
        if (res.success) {
          const {token, ...userInfo} = res.data;
          this.token = token;
          this.userInfo = userInfo as UserInfoParams;
          locSetItem('token', token!);
          locSetItem('userInfo', JSON.stringify(userInfo));
          // 登陆成功之后创建websocket
          ipcRenderers.restore(JSON.stringify({userInfo: this.userInfo, token: this.token}));
          // article 页面不立即创建，因为 article 页面加载之后自动会创建
          if (!window.location.pathname.includes('/article')) {
            createWebSocket();
          }
          await this.getUserMenuRoles();
          // 登陆成功后返回到上一页面
          router?.push(commonStore.backPath);
        } else {
          res.code === 406 && onResetCode?.();
          message({
            title: res.message,
            type: 'error',
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
        await Service.resetPassword({...params, phone: encrypt(params.phone!), password: encrypt(params.password)}),
      );
      // 重置成功后直接登录
      if (res.success) {
        // 先退出登录，防止自己踢自己
        // this.onQuit();
        // await this.onLogin(params, router);
        message({
          title: res.message,
          type: 'success',
        });
      } else {
        message({
          title: res.message,
          type: 'error',
        });
      }
      return res.success;
    },

    // 账号注销
    async onLogout(router?: Router) {
      Message('', '确定要注销该账号吗？').then(async () => {
        const res = normalizeResult<string>(await Service.logout());
        if (res.success) {
          this.onQuit();
          message({
            title: res.message,
            type: 'success',
          });
          router?.push('/home');
        } else {
          message({
            title: res.message,
            type: 'error',
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
      const {username} = this.userInfo;
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

        // 判断是否是个人资料页面修改了用户名或者在账号设置页面中修改了密码
        if ((params.username && params.username !== username) || params.password) {
          // 清空所有用户信息
          this.onQuit();
          message({
            title: '重置成功！',
            message: `${ params.password ? '密码已重置' : '用户名称已修改' }，请重新登录`,
            type: 'success',
          });
          this.timer = setTimeout(() => {
            if (this.timer) {
              clearTimeout(this.timer);
              this.timer = null;
            }
            router?.replace('/login');
          }, 100);
        } else {
          message({
            title: res.message,
            type: 'success',
          });
        }
      } else {
        message({
          title: res.message,
          type: 'warning',
        });
      }
    },

    // 获取用户菜单
    async getUserMenuRoles() {
      if (!this.token) return;
      const res = normalizeResult<{ id: string; menus: string[] }>(await Service.getUserMenuRoles());
      if (res.success) {
        this.menus = res.data?.menus || [];
        return this.menus;
      } else {
        return [];
      }
    },

    // 退出登录
    onQuit() {
      this.token = '';
      this.userInfo = {};
      this.menus = [];
      locRemoveItem('token');
      locRemoveItem('userInfo');
      // 关闭消息闪动
      ipcRenderers.sendStopFlashMsg(
        JSON.stringify({
          count: messageStore.msgCount,
          noReadMsg: messageStore.noReadMsgList?.[0],
        }),
      );
      // 退出时清除消息条数，防止退出后头部小铃铛处还是显示消息条数
      // messageStore.msgCount = 0;
      ipcRenderers.restore('');
      // 关闭ws链接
      closeSocket();
    },
  },
});
