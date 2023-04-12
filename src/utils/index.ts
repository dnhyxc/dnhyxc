import { ElMessageBox, ElMessage } from 'element-plus';
import type { ElMessageBoxOptions } from 'element-plus';
import Store from 'electron-store';
import moment from 'moment';
import { MSG_CONFIG, CODE_CONTROL } from '@/constant';
import { ArticleItem } from '@/typings/common';
import { usePlugins } from './plugins';
import { normalizeResult } from './result';
import { decrypt, encrypt } from './crypto';
import request from './request';
import { shareQQ, shareQZon, shareSinaWeiBo } from './share';
import { mountDirectives } from './directive';
import EventBus from './eventBus';
import { locSetItem, locGetItem, locRemoveItem, ssnGetItem, ssnSetItem, ssnRemoveItem } from './storage';
import * as ipcRenderers from './ipcRenderer';

const store = new Store();

// 判断系统类型
export const checkOS = () => {
  const agent = navigator.userAgent.toLowerCase();
  const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
  if (agent.indexOf('win32') >= 0 || agent.indexOf('wow32') >= 0) {
    return 'win32';
  }
  if (agent.indexOf('win64') >= 0 || agent.indexOf('wow64') >= 0) {
    return 'win64';
  }
  if (isMac) {
    return 'mac';
  }
};

// 数组去重方法
export const uniqueFunc = (arr: any, uniId: string) => {
  const res = new Map();
  return arr.filter((item: any) => !res.has(item[uniId]) && res.set(item[uniId], 1));
};

// 二次确认弹窗
export const Message = (title: string = '确定下架该文章吗？', content: string = '下架文章') => {
  return ElMessageBox.confirm(title, content, MSG_CONFIG() as ElMessageBoxOptions);
};

// 格式化时间
const formatDate = (date: number, format = 'YYYY/MM/DD HH:mm:ss') => {
  if (!date) return;

  return moment(date).format(format);
};

// 转化距离当前时间的间隔时长
const formatGapTime = (date: number) => {
  const ms = Date.now() - date;
  const seconds = Math.round(ms / 1000);
  const minutes = Math.round(ms / 60000);
  const hours = Math.round(ms / 3600000);
  const days = Math.round(ms / 86400000);
  const months = Math.round(ms / 2592000000);
  const years = Math.round(ms / 31104000000);

  switch (true) {
    case seconds < 60:
      return '刚刚';
    case minutes < 60:
      return `${minutes} 分钟前`;
    case hours < 24:
      return `${hours} 小时前`;
    case days < 30:
      return `${days} 天前`;
    case months < 12:
      return `${months} 月前`;
    default:
      return `${years} 年前`;
  }
};

// 滚动到某位置
const cubic = (value: number) => Math.pow(value, 3);
const easeInOutCubic = (value: number) => (value < 0.5 ? cubic(value * 2) / 2 : 1 - cubic((1 - value) * 2) / 2);

export const scrollToTop = (ref: any, time: number = 500, position: number = 0) => {
  // el-scrollbar 容器
  const el = ref.value?.wrapRef as HTMLDivElement;
  const beginTime = Date.now();
  const beginValue = el.scrollTop;
  const rAF = window.requestAnimationFrame || ((func) => setTimeout(func, 16));
  const frameFunc = () => {
    const progress = (Date.now() - beginTime) / time;
    if (progress < 1) {
      el.scrollTop = beginValue * (1 - easeInOutCubic(progress));
      rAF(frameFunc);
    } else {
      el.scrollTop = position;
    }
  };
  rAF(frameFunc);
};

// 滚动到某位置
export const scrollTo = (ref: any, position: number, time = 20) => {
  // el-scrollbar 容器
  const el = ref.value?.wrapRef as HTMLDivElement;
  // 使用requestAnimationFrame，如果没有则使用setTimeOut
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (callback) => {
      return setTimeout(callback, time);
    };
  }
  // 获取当前元素滚动的距离
  let scrollTopDistance = el.scrollTop;
  const smoothScroll = () => {
    // 如果你要滚到顶部，那么position传过来的就是0，下面这个distance肯定就是负值。
    const distance = position - scrollTopDistance;
    // 每次滚动的距离要不一样，制造一个缓冲效果
    scrollTopDistance = scrollTopDistance + distance / 5;
    // 判断条件
    if (Math.abs(distance) < 1) {
      el.scrollTop = position;
    } else {
      el.scrollTop = scrollTopDistance;
      requestAnimationFrame(smoothScroll);
    }
  };
  requestAnimationFrame(smoothScroll);
};

// 处理键盘快捷键输入
export const setShortcutKey = (e: KeyboardEvent, addHotkey: Function) => {
  const { altKey, ctrlKey, shiftKey, key, code } = e;
  if (!CODE_CONTROL.includes(key)) {
    let controlKey = '';
    [
      { key: shiftKey, text: 'Shift' },
      { key: ctrlKey, text: 'Ctrl' },
      { key: altKey, text: 'Alt' },
    ].forEach((curKey) => {
      if (curKey.key) {
        if (controlKey) controlKey += ' + ';
        controlKey += curKey.text;
      }
    });
    if (key) {
      if (controlKey) controlKey += ' + ';
      controlKey += key.toUpperCase();
    }

    addHotkey({
      text: controlKey,
      controlKey: { altKey, ctrlKey, shiftKey, key, code },
    });
  }
};

export const getImgInfo = (url: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = '*';
    img.onload = function () {
      const width = img.width;
      const height = img.height;
      resolve({
        width,
        height,
      });
    };
    img.onerror = function () {
      reject(new Error('图片加载失败'));
    };
    img.src = url;
  });
};

// 设置头像base64
export const url2Base64 = (src: string) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    // 处理缓存
    image.src = src + '?v=' + Math.random();
    // 支持跨域图片
    image.crossOrigin = '*';
    image.onload = () => {
      const base64 = image2Base64(image);
      resolve(base64);
    };
  });
};

// 将网络图片转换成base64格式
export const image2Base64 = (image: any) => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(image, 0, 0, image.width, image.height);
  // 可选其他值 image/jpeg
  return canvas.toDataURL('image/png');
};

// 校验文章是否下架
export const chackIsDelete = (data: ArticleItem) => {
  return new Promise((resolve, reject) => {
    if (data?.isDelete) {
      ElMessage({
        message: '文章已下架，无法操作',
        type: 'warning',
        offset: 80,
      });
      reject(new Error('文章已下架，无法操作'));
    } else {
      resolve(true);
    }
  });
};

// 校验是否是正常的url
export const checkUrl = (url: string) => {
  const Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/;
  const objExp = new RegExp(Expression);
  return objExp.test(url);
};

// 获取存储在electron-store中的登录信息
export const getStoreUserInfo = () => {
  // 获取存储在硬盘store中的登录信息
  const userInfo = locGetItem('userInfo') && JSON.parse(locGetItem('userInfo') as string);
  const token = locGetItem('token');
  return {
    userInfo,
    token,
  };
};

// 返回 electron-store 的实例
export const eStore = store;

// 处理各页面存储在store的数据
export const setParamsToStore = (from: string, data: any) => {
  const paramList = (store.get('paramList') && JSON.parse(store.get('paramList') as string)) || [];
  const params = {
    from,
    data,
  };
  const index = paramList.findIndex((i: any) => i.from === from);
  if (index > -1) {
    // 先删除原来的数据，然后再向最前面添加，保持最新添加的始终在最前面
    paramList.splice(index, 1);
    paramList.unshift(params);
  } else {
    paramList.unshift(params);
  }
  store.set('paramList', JSON.stringify(paramList));
};

// 清除保存在store中的paramList
export const clearParamListFromStore = () => {
  store.delete('paramList');
};

// 获取保存在store中的paramList
export const getParamListFromStore = (from: string) => {
  const data = store.get('paramList');
  if (data && JSON.parse(data as string)) {
    const findData = JSON.parse(data as string).find((i: any) => i.from === from);
    return findData?.data;
  } else {
    return {};
  }
};

// 账号校验
export const verifyUsername = (value: string) => {
  const usrRegex = /^((?!\\|\/|\(|\)|\+|-|=|~|～|`|!|！|:|\*|\?|<|>|\||'|%|#|&|\$|\^|&|\*).){1,20}$/;
  if (usrRegex.test(value)) {
    return {
      msg: '',
      status: true,
    };
  }
  if (value.length < 1) {
    return {
      msg: '用户名不能少于1位',
      status: false,
    };
  }
  if (value.length > 15) {
    return {
      msg: '用户名不能大于15位',
      status: false,
    };
  }
  return {
    msg: '用户名不能包含特殊字符',
    status: false,
  };
};

// 密码校验
export const verifyPassword = (value: string) => {
  const pwdRegex = /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,20}/;
  if (value.length > 20) {
    return {
      msg: '密码不能不大于20位',
      status: false,
    };
  }
  if (value.length < 8) {
    return {
      msg: '密码不能少于8位',
      status: false,
    };
  }
  if (pwdRegex.test(value)) {
    return {
      msg: '',
      status: true,
    };
  }
  return {
    msg: '必须包含字母、数字、特称字符',
    status: false,
  };
};

// 密码校验
export const verifyResetPassword = (value: string, newPwd: string) => {
  const pwdRegex = /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,20}/;
  if (value.length > 20) {
    return {
      msg: '密码不能不大于20位',
      status: false,
    };
  }
  if (value.length < 8) {
    return {
      msg: '密码不能少于8位',
      status: false,
    };
  }
  if (value !== newPwd) {
    return {
      msg: '两次输入的密码不一致',
      status: false,
    };
  }
  if (pwdRegex.test(value)) {
    return {
      msg: '',
      status: true,
    };
  }
  return {
    msg: '必须包含字母、数字、特称字符',
    status: false,
  };
};

// 识别图片主色的方法
export const getImageColor = (img: HTMLImageElement) => {
  // 创建画布
  const canvas = document.createElement('canvas');

  canvas.width = img.width;
  canvas.height = img.height;

  const context = canvas.getContext('2d');

  context?.drawImage(img, 0, 0);

  const pxArr = Array.from(context?.getImageData(0, 0, img.width, img.height).data!);

  const colorList = {};
  let i = 0;
  while (i < pxArr?.length!) {
    const r = pxArr?.[i];
    const g = pxArr?.[i + 1];
    const b = pxArr?.[i + 2];
    const a = pxArr?.[i + 3];
    i = i + 4; // 最后 +4 比每次 i++ 快 10ms 左右性能
    const key = [r, g, b, a].join(',');
    key in colorList ? ++colorList[key] : (colorList[key] = 1);
  }

  let arr = [];
  for (const key in colorList) {
    arr.push({
      rgba: `rgba(${key})`,
      num: colorList[key],
    });
  }
  arr = arr.sort((a, b) => b.num - a.num);

  return arr;
};

export {
  ipcRenderers,
  request,
  normalizeResult,
  decrypt,
  encrypt,
  formatDate,
  locSetItem,
  locGetItem,
  locRemoveItem,
  ssnGetItem,
  ssnSetItem,
  ssnRemoveItem,
  formatGapTime,
  usePlugins,
  mountDirectives,
  shareQQ,
  shareQZon,
  shareSinaWeiBo,
  EventBus,
};
