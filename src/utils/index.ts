import { ElMessageBox, ElMessage } from 'element-plus';
import type { ElMessageBoxOptions } from 'element-plus';
import moment from 'moment';
import { MSG_CONFIG, CODE_CONTROL, EMOJI_TEXTS, EMOJI_URLS } from '@/constant';
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
import { modifyTheme } from './theme';
import { eStore, setTheme, getTheme, removeTheme } from './store';

export {
  ipcRenderers,
  request,
  normalizeResult,
  decrypt,
  encrypt,
  locSetItem,
  locGetItem,
  locRemoveItem,
  ssnGetItem,
  ssnSetItem,
  ssnRemoveItem,
  usePlugins,
  mountDirectives,
  shareQQ,
  shareQZon,
  shareSinaWeiBo,
  EventBus,
  modifyTheme,
  eStore,
  setTheme,
  getTheme,
  removeTheme,
};

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
export const formatDate = (date: number, format = 'YYYY/MM/DD HH:mm:ss') => {
  if (!date) return;

  return moment(date).format(format);
};

// 转化距离当前时间的间隔时长
export const formatGapTime = (date: number) => {
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

// 判断图片是否是base64
export const checkImgUrlType = (url: string) => {
  const reg =
    /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@/?%\s]*?)\s*$/i;

  if (reg.test(url)) {
    return 'BASE64';
  } else {
    return 'URL';
  }
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

// 处理输入的换行符
export const replaceCommentContent = (content: string) => {
  const context = content.replace(/\n/g, '<br/>');
  return replaceEmojis(context);
};

// 表情包转换
export const replaceEmojis = (content: string) => {
  content = content.replace(/\[[^[^\]]+\]/g, (word) => {
    const index = EMOJI_TEXTS.indexOf(word.replace('[', '').replace(']', ''));
    if (index > -1) {
      return `<img style="vertical-align: middle;width: 32px;height: 32px" src="${
        EMOJI_URLS[index + 1]
      }" title="${word}"/>`;
    } else {
      return word;
    }
  });
  return replacePictures(content);
};

// 图片转换
export const replacePictures = (content: string) => {
  content = content.replace(/<[^<^>]+>/g, (word) => {
    const index = word.indexOf(',');
    if (index > -1) {
      const arr = word.replace('<', '').replace('>', '').split(',');
      return `<img id="__COMMENT_IMG__" style="border-radius: 5px;width: 100%;max-width: 250px;height:auto;display: block;padding: 5px 0;cursor: pointer;" src="${arr[1]}" title="${arr[0]}"/>`;
    } else {
      return word;
    }
  });
  return content;
};

// 向光标所在位置插入内容
export const insertContent = ({
  keyword,
  node,
  username,
  url,
  emoji,
}: {
  keyword: string; // textarea输入内容
  node: HTMLTextAreaElement; // textarea输入框元素
  username?: string; // 用户名称
  url?: string; // 图片地址
  emoji?: string; // 表情内容
}) => {
  const content = emoji || `<${username},${url}>`;
  if (keyword.substring(0, node.selectionStart)) {
    const res = `${keyword.substring(0, node.selectionStart)}${content}${keyword.substring(
      node.selectionEnd,
      node.textLength,
    )}`;
    return res;
  } else {
    // selectionStart 为0时，默认向最后面插入
    const res = `${keyword.substring(node.selectionEnd, node.textLength)}${content}${keyword.substring(
      0,
      node.selectionStart,
    )}`;
    return res;
  }
};

/**
 * @param {图片路径} url
 * @param {图片宽度} width
 * @param {图片高度} height
 * @param {水印文字} watermarkText
 */
export const addWatermark = async ({
  url,
  width,
  height,
  markText = 'dnhyxc',
}: {
  url: string;
  markText: string;
  width?: number;
  height?: number;
}) => {
  // 1. 根据图片路径获取图片数据，转成blob类型
  const fileBlob = await fetch(url)
    .then((r) => r.blob())
    .then((file) => file);

  // 2. 用`FileReader`读取图片blob数据为dataURL
  const reader = new FileReader();
  reader.readAsDataURL(fileBlob);

  // 3. 创建img标签，src属性为dataURL
  const tempImg: HTMLImageElement = await new Promise((resolve) => {
    reader.onload = () => {
      const img = document.createElement('img');
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = reader.result as string;
      resolve(img);
    };
  });

  // 4. 监听`img.onload`, 创建canvas,将img对象`draw`在canvas里
  const canvas: HTMLCanvasElement = await new Promise((resolve) => {
    const canvas = document.createElement('canvas');

    canvas.width = width || tempImg.width;
    canvas.height = height || tempImg.height;

    tempImg.onload = () => {
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.drawImage(tempImg, 0, 0);

      // 5. 添加水印
      ctx.fillStyle = 'red';
      ctx.textBaseline = 'middle';
      ctx.font = '15px Arial';
      ctx.fillText(markText, 10, 15);

      resolve(canvas);
    };
  });

  // 6. 使用`canvas.toBlob`转成最终图像
  const imgUrl = await new Promise((resolve) => {
    canvas.toBlob((canvasBlob) => {
      const newImg = document.createElement('img');
      const url = URL.createObjectURL(canvasBlob as Blob);
      newImg.onload = function () {
        // 图片加载完成后销毁objectUrl
        URL.revokeObjectURL(url);
      };
      newImg.src = url;
      resolve(url);
    });
  });

  return imgUrl;
};
