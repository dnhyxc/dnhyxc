import { ElMessageBox } from 'element-plus';
import type { ElMessageBoxOptions } from 'element-plus';
import moment from 'moment';
import { normalizeResult } from './result';
import { decrypt, encrypt } from './crypto';
import request from './request';
import { locSetItem, locGetItem, locRemoveItem, ssnGetItem, ssnSetItem, ssnRemoveItem } from './storage';

import { MSG_CONFIG } from '@/constant';

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
  return ElMessageBox.confirm(title, content, MSG_CONFIG as ElMessageBoxOptions);
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
};
