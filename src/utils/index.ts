import { ElMessageBox } from 'element-plus';
import type { ElMessageBoxOptions } from 'element-plus';
import moment from 'moment';
import { MSG_CONFIG, CODE_CONTROL } from '@/constant';
import { usePlugins } from './plugins';
import { normalizeResult } from './result';
import { decrypt, encrypt } from './crypto';
import request from './request';
import { shareQQ, shareQZon, shareSinaWeiBo } from './share';
import { mountDirectives } from './directive';
import { locSetItem, locGetItem, locRemoveItem, ssnGetItem, ssnSetItem, ssnRemoveItem } from './storage';

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
export const scrollTo = (ref: any, position: number) => {
  // el-scrollbar 容器
  const el = ref.value?.wrapRef as HTMLDivElement;
  // 使用requestAnimationFrame，如果没有则使用setTimeOut
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (callback) => {
      return setTimeout(callback, 20);
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

export {
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
};
