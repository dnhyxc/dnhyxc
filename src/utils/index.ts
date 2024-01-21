import { ipcRenderer } from 'electron';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { ElMessageBoxOptions } from 'element-plus';
import moment from 'moment';
import SparkMD5 from 'spark-md5';
import { MSG_CONFIG, CODE_CONTROL, EMOJI_TEXTS, EMOJI_URLS, CODE_LENGTH, CHARACTERS } from '@/constant';
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
import { eStore, setTheme, getTheme, removeTheme, getMsgStatus } from './store';
import { compressImage } from './compress';
export { Verify, checkNumber, checkMin, checkMax, verifyEmpty, verifyLength, verfiySpecialCharacters } from './verify';
export * from './speak';
export * from './codeTemplate';

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
  compressImage,
  getMsgStatus,
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
export const Message = (title: string = '确定下架该文章吗？', content: string = '下架文章', type?: string) => {
  return ElMessageBox.confirm(title, content, MSG_CONFIG(type) as ElMessageBoxOptions);
};

// 格式化时间
export const formatDate = (date: number, format = 'YYYY/MM/DD HH:mm:ss') => {
  if (!date) return;

  return moment(date).format(format);
};

// 转化距离当前时间的间隔时长
export const formatGapTime = (date: number) => {
  if (!date) return;
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

// 将时间戳转换为 "刚刚"、"N分钟前"、"今天几点几分"、"昨天几点几分"、"星期几几点几分" 等表示法
export const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return;
  const now = new Date();
  const date = new Date(timestamp);
  // 计算时间差（单位：毫秒）
  const diff = now.getTime() - date.getTime();
  const minutesDiff = Math.floor(diff / 60000); // 转换为分钟
  // 判断时间差并返回相应的表示法
  if (minutesDiff < 1) {
    return '刚刚';
  } else if (minutesDiff < 60) {
    return `${minutesDiff}分钟前`;
  } else if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `今天 ${hours}:${minutes}`;
  } else if (
    date.getDate() === now.getDate() - 1 &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `昨天 ${hours}:${minutes}`;
  } else if (date.getFullYear() === now.getFullYear() && date.getTime() > now.getTime() - 6 * 24 * 60 * 60 * 1000) {
    const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dayOfWeek = weekday[date.getDay()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dayOfWeek} ${hours}:${minutes}`;
  } else {
    // 如果不是今天、昨天或最近一周，则返回完整的日期和时间
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  }
};

export const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
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
export const url2Base64 = (src: string, type?: string) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    // 处理缓存
    image.src = src + '?v=' + Math.random();
    // 支持跨域图片
    image.crossOrigin = '*';
    image.onload = () => {
      const base64 = image2Base64(image, type);
      resolve(base64);
    };
  });
};

// File to base64
export const fileToBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

// 将网络图片转换成base64格式
export const image2Base64 = (image: any, type?: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(image, 0, 0, image.width, image.height);
  // 可选其他值 image/jpeg
  return canvas.toDataURL(type || 'image/png');
};

// 展示message
export const showMessage = (
  type: 'error' | 'info' | 'success' | 'warning' = 'warning',
  message: string = '文章已下架，无法操作',
  offset: number = 80,
) => {
  ElMessage({
    message,
    type,
    offset,
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

// 验证码校验
export const verifyCode = (value: string, charater: string) => {
  if (value.toLowerCase() === charater.toLowerCase()) {
    return {
      msg: '',
      status: true,
    };
  }
  return {
    msg: '验证码输入错误',
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

// 手机号校验
export const verifyPhone = (value: string) => {
  const pwdRegex = /^1[3456789]\d{9}$/;
  if (pwdRegex.test(value)) {
    return {
      msg: '',
      status: true,
    };
  } else {
    return {
      msg: '手机号码格式错误',
      status: false,
    };
  }
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
      return `
        <img
          id="__COMMENT_IMG__"
          style="border-radius: 5px;
          width: 100%;
          max-width: 250px;
          height:auto;
          display: block;
          padding: 5px 0;
          cursor: pointer;
          -webkit-user-drag: none;
          user-select: none;"
          src="${arr[1]}"
          title="${arr[0]}"
        />
      `;
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
  node?: HTMLTextAreaElement; // textarea输入框元素
  username?: string; // 用户名称
  url?: string; // 图片地址
  emoji?: string; // 表情内容
}) => {
  const content = emoji || `<${username},${url}>`;
  if (keyword.substring(0, node?.selectionStart)) {
    const res = `${keyword.substring(0, node?.selectionStart)}${content}${keyword.substring(
      node?.selectionEnd!,
      node?.textLength,
    )}`;
    return res;
  } else {
    // selectionStart 为0时，默认向最后面插入
    const res = `${keyword.substring(node?.selectionEnd!, node?.textLength)}${content}${keyword.substring(
      0,
      node?.selectionStart,
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

// 根据文件生成唯一hash
export const md5HashName = (file: File) => {
  return new Promise((resolve, reject) => {
    // 创建FileReader实例
    const fileReader = new FileReader();
    // 开始读文件
    fileReader.readAsBinaryString(file);
    // 文件读完之后，触发load事件
    fileReader.onload = (e) => {
      // result是fileReader读到的部分
      const result = (e.target as FileReader).result as string;
      // 如果读到的长度和文件长度一致，则读取成功
      const isSuccess = file.size === result?.length;
      // 读取成功，则生成MD5，扔出去。失败就报错
      isSuccess ? resolve(SparkMD5.hashBinary(result)) : reject(new Error('读取出错了'));
    };
    // 读取过程中出错也直接报错
    fileReader.onerror = () => reject(new Error('读取出错了'));
  });
};

// 得到唯一文件名称
export const getUniqueFileName = async (file: File, mark?: string): Promise<{ fileName: string; newFile: File }> => {
  return new Promise((resolve, reject) => {
    md5HashName(file).then((md5) => {
      const findIndex = file?.name?.lastIndexOf('.');
      const ext = file.name.slice(findIndex + 1);
      // 修改文件名称，__FILE__ 用户区分是否是上传的图片集图片
      const newFile = new File([file], `${mark || '__FILE__'}${md5}.${ext}`, {
        type: file.type,
      });
      resolve({
        fileName: md5 as string,
        newFile,
      });
    });
  });
};

// 生成唯一id
export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 随机生成颜色
export const randomColor = (min: number, max: number) => {
  const r = randomNum(min, max);
  const g = randomNum(min, max);
  const b = randomNum(min, max);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
};

// 随机生成数字
const randomNum = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

// canvas 绘制验证码
export const drawCharater = ({
  canvasElement,
  width,
  height,
}: {
  canvasElement: HTMLCanvasElement;
  width: number;
  height: number;
}) => {
  let txt = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    txt += CHARACTERS[randomNum(0, CHARACTERS.length)];
  }
  const ctx = canvasElement?.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = randomColor(180, 255);
  ctx.fillRect(0, 0, width, height);
  // 字体对齐位置
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center'; // 设置文本对齐方式为居中
  ctx.fillRect(0, 0, width, height); // 填充背景色
  ctx.font = '32px sans-serif'; // 设置字体样式
  // 随机生成字体大小(0.5 - 0.75)高的范围
  // ctx.font = randomNum((height * 2) / 4, (height * 3) / 4) + 'px sans-serif';
  ctx.fillStyle = randomColor(0, 255);
  ctx.fillText(txt, width / 2, height / 2 + 3); // 绘制文本
  // 绘制干扰线
  for (let j = 0; j < CODE_LENGTH; j++) {
    ctx.strokeStyle = randomColor(30, 180);
    ctx.beginPath();
    ctx.moveTo(randomNum(0, width), randomNum(0, height));
    ctx.lineTo(randomNum(0, width), randomNum(0, height));
    ctx.stroke();
  }
  // 绘制干扰点
  for (let k = 0; k < 30; k++) {
    ctx.fillStyle = randomColor(0, 255);
    ctx.beginPath();
    ctx.arc(randomNum(0, width), randomNum(0, height), 1, 0, 2 * Math.PI);
    ctx.fill();
  }

  return txt;
};

// 防抖函数
export const debounce = (fn: Function, delay = 1000, immediate = false) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    if (immediate && !timer) {
      // @ts-ignore
      fn.apply(this, arguments);
    }
    timer = setTimeout(() => {
      // @ts-ignore
      fn.apply(this);
    }, delay);
  };
};

export const onDownloadFile = async ({ url, type = 'png' }: { url: string; type?: string }) => {
  if (url.includes('data:image') || type === 'blob') {
    ipcRenderers.sendDownload(url as string);
  } else {
    const base64url = await url2Base64(url, type);
    if (base64url) {
      ipcRenderers.sendDownload(base64url as string);
    }
  }
  // 设置一次性监听，防止重复触发
  ipcRenderer.once('download-file', (e, res: string) => {
    if (res) {
      ElMessage({
        message: '下载成功',
        type: 'success',
        offset: 80,
        duration: 2000,
      });
    }
  });
};

/**
 * canvas转成img
 * @param {imgUrl} 图片url
 * @param {width} 容器宽度
 * @param {height} 容器高度
 * @param {type} 转成的图片格式，如：png
 * @param {top} 水印相对与图片上面的偏移量
 * @param {left} 水印相对与图片左边的偏移量
 * @param {size} 水印文字大小
 * @param {markTextWidth} 水印文字元素宽度
 * @param {markTextHeight} 水印文字元素高度
 * @param {markType} 水印类型，line: 单行，more: 多行
 * @param {spacing} 多行水印间距
 * @param {markOffsetTop} 多行水印垂直位置调整值
 * @return {canvas} HTMLCanvasElement
 */
export const convas2ImgAddWatermark = async ({
  imgUrl,
  width,
  height,
  type = 'png',
  top,
  left,
  size,
  color,
  text,
  markTextWidth,
  markTextHeight,
  spacing = 100,
  markType = 'line',
  markOffsetTop,
}: {
  imgUrl: string;
  top: number;
  left: number;
  width: number;
  height: number;
  size: number;
  color: string;
  text: string;
  markTextWidth: number;
  markTextHeight: number;
  spacing?: number;
  markType?: string;
  type?: string;
  markOffsetTop?: number;
}) => {
  // 1.图片路径转成canvas
  const tempCanvas = await imgToCanvas(imgUrl);
  // 2.canvas添加水印
  const canvas = addImgWatermark({
    canvas: tempCanvas,
    text,
    size,
    top,
    left,
    width,
    height,
    color,
    markTextWidth,
    markTextHeight,
    spacing,
    markType,
    markOffsetTop,
  });
  // 指定格式 PNG
  return canvas.toDataURL(`image/${type}`);
};

// 图片路径转成canvas
export const imgToCanvas = async (url: string) => {
  // 创建img元素
  const img = document.createElement('img');
  img.src = url;
  // 防止跨域引起的 Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported.
  img.setAttribute('crossOrigin', 'anonymous');
  await new Promise((resolve) => (img.onload = resolve));
  // 创建canvas DOM元素，并设置其宽高和图片一样
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  // 坐标(0,0) 表示从此处开始绘制，相当于偏移。
  canvas.getContext('2d')?.drawImage(img, 0, 0);
  return canvas;
};

// canvas添加水印
export const addImgWatermark = (params: {
  canvas: HTMLCanvasElement;
  text: string;
  size: number;
  width: number;
  height: number;
  top: number;
  left: number;
  color: string;
  markTextWidth: number;
  markTextHeight: number;
  markType: string; // 水印类型
  spacing: number; // 水印间距
  markOffsetTop?: number;
}) => {
  const {
    canvas,
    text,
    size,
    top,
    left,
    width,
    height,
    color,
    markTextWidth,
    markTextHeight,
    markType,
    spacing,
    markOffsetTop = 0,
  } = params;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.font = `${(canvas.width / width) * size}px sans-serif`; // 设置字体样式
  // 设置多行水印
  const setMoreLineWatermark = () => {
    const textMetrics = ctx.measureText(text);
    // 水印文本宽度
    const textWidth = textMetrics.width;
    // 水印文本高度
    const textHeight = textMetrics.fontBoundingBoxAscent;
    // 计算水印的起始位置，使其水平和垂直居中排列
    const cols = Math.floor(canvas.width / (textWidth + spacing));
    const rows = Math.floor(canvas.height / (textHeight + spacing));
    // 计算水印上间距和左间距
    const startX = (canvas.width - cols * textWidth - (cols - 1) * spacing) / 2;
    const startY = (canvas.height - rows * textHeight - (rows - 1) * spacing) / 2 + 15 + markOffsetTop;
    // 绘制水印
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = startX + j * (textWidth + spacing);
        const y = startY + i * (textHeight + spacing);
        ctx.fillText(text, x, y);
      }
    }
  };

  // 设置单行水印
  const setOneLineWatermark = () => {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    if (left && top) {
      ctx!.fillText(
        text,
        (canvas.width / width) * left + (canvas.width / width) * markTextWidth,
        (canvas.height / height) * top + (canvas.height / height) * markTextHeight,
      );
    } else {
      ctx!.fillText(text, canvas.width - 20, canvas.height - 20);
    }
  };

  if (markType === 'line') {
    setOneLineWatermark();
  }

  if (markType === 'more') {
    setMoreLineWatermark();
  }

  return canvas;
};

// 判断数据类型
export const diffType = (value: string | number | string | boolean | Function | Date) => {
  const type = Object.prototype.toString.call(value);
  const types = {
    '[object Undefined]': 'undefined',
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object BigInt]': 'bigint',
    '[object Function]': 'function',
    '[object Object]': 'object',
    '[object Array]': 'array',
    '[object Null]': 'null',
    '[object Date]': 'date',
  };
  return types[type];
};

// 设置盲水印
export const createWaterMark = ({
  url,
  text,
  fontSize,
  fontFamily,
  spacing,
}: {
  url: string;
  text: string;
  fontSize: string;
  fontFamily: string;
  spacing: number; // 水印上下间距
}): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const img = new Image();
  img.crossOrigin = '';
  let textData, originalData;
  img.src = url;
  // 图片加载完成
  return new Promise((resolve) => {
    img.onload = () => {
      // 设置画布宽高为图片宽高
      canvas.width = img.width;
      canvas.height = img.height;
      // 设置水印字体
      ctx.font = `${fontSize} ${fontFamily}`;
      const textMetrics = ctx.measureText(text);
      // 水印文本宽度
      const textWidth = textMetrics.width;
      // 水印文本高度
      const textHeight = textMetrics.fontBoundingBoxAscent;
      // 计算水印的起始位置，使其水平和垂直居中排列
      const rows = Math.floor(canvas.height / (textHeight + spacing));
      const cols = Math.floor(canvas.width / (textWidth + spacing));
      const startX = (canvas.width - (cols * textWidth + (cols - 1) * spacing)) / 2;
      const startY = (canvas.height - (rows * textHeight + (rows - 1) * spacing)) / 2 + 15;
      // 绘制水印
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = startX + j * (textWidth + spacing);
          const y = startY + i * (textHeight + spacing);
          ctx.fillText(text, x, y);
        }
      }
      // 此时画布上已经有了水印的信息，我们获取水印的各个像素的信息
      textData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      // 将图片绘入画布
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      originalData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      // 调用盲水印算法
      mergeData({ ctx, textData, color: 'R', originalData });
      const url = canvas.toDataURL('image/png');
      resolve(url);
    };
  });

  // 盲水印加密算法
  function mergeData({
    ctx,
    textData,
    color,
    originalData,
  }: {
    ctx: CanvasRenderingContext2D;
    textData: any;
    color: string;
    originalData: any;
  }) {
    const oData = originalData.data;
    const newData = textData.data;
    // offset的作用是找到结合bit找到对应的A值，即透明度
    let bit = 0;
    let offset = 3;

    switch (color) {
      case 'R':
        bit = 0;
        offset = 3;
        break;
      case 'G':
        bit = 1;
        offset = 2;
        break;
      case 'B':
        bit = 2;
        offset = 1;
        break;
    }

    for (let i = 0; i < oData.length; i++) {
      // 此处是为了筛选我们要修改的RGB中那一项，在此处，过滤出来的就是每个坐标点的R值
      if (i % 4 === bit) {
        // 我们获取到R值的位置，那对应这个点的A值就是i+offset
        if (newData[i + offset!] === 0 && oData[i] % 2 === 1) {
          // 此处先判断该坐标点的透明度，如果为0，说明这个点是没有水印的，将没有水印信息点的R值变为偶数，并且不能超过0-255的范围
          if (oData[i] === 255) {
            oData[i]--;
          } else {
            oData[i]++;
          }
        } else if (newData[i + offset!] !== 0 && oData[i] % 2 === 0) {
          // 透明度非0，该点有信息，若该点的R值是偶数，将其改为奇数
          oData[i]++;
        }
      }
    }
    // 至此，整个图片中所有包含水印信息的点的R值都是奇数，没有水印信息的点的R值都是偶数，再将图片绘入画布，即完成整个水印添加过程
    ctx.putImageData(originalData, 0, 0);
  }
};

// 解密盲水印
export const processWaterMark = (url: string): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const img = new Image();
  let originalData = null;
  img.src = url;
  // 图片加载完成
  return new Promise((resolve) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      // 将带有盲水印的图片绘入画布，获取到像素点的RGBA数组信息
      originalData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      // 调用盲水印解密算法
      processData(ctx, originalData);
      const processUrl = canvas.toDataURL('image/png');
      resolve(processUrl);
    };
  });

  // 盲水印解密算法
  function processData(ctx: CanvasRenderingContext2D, originalData: any) {
    const data = originalData.data;
    for (let i = 0; i < data.length; i++) {
      // 筛选每个像素点的R值
      if (i % 4 === 0) {
        if (data[i] % 2 === 0) {
          // 如果R值为偶数，说明这个点是没有水印信息的，将其R值设为0
          data[i] = 0;
        } else {
          // 如果R值为奇数，说明这个点是有水印信息的，将其R值设为255
          data[i] = 255;
        }
      } else if (i % 4 === 3) {
        // 透明度不作处理
        continue;
      } else {
        // G、B值设置为0，不影响
        data[i] = 0;
      }
    }
    // 至此，带有水印信息的点都将展示为255,0,0   而没有水印信息的点将展示为0,0,0  将结果绘制到画布
    ctx.putImageData(originalData, 0, 0);
  }
};

// 在线图片转为File
export const onlineImgToFile = async (url: string): Promise<File> => {
  const blob = await fetch(url).then((response) => response.blob());
  const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
  return file;
};

// 检测链接是否是可用的图片
export const checkImage = (link: string) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(true);
    };
    img.onerror = () => {
      resolve(false);
    };
    img.src = link;
  });
};

// 搜索关键词高亮
export const hlightKeyword = (keyword: string, list: Array<any>) => {
  const reg = new RegExp(keyword, 'gi');
  return list.map((i) => {
    i.abstract = i.abstract?.replace(reg, (key: string) => `<span style="color: #ff9900">${key}</span>`);
    i.title = i.title?.replace(reg, (key: string) => `<span style="color: #ff9900">${key}</span>`);
    i.authorName = i.authorName?.replace(reg, (key: string) => `<span style="color: #ff9900">${key}</span>`);
    i.classify = i.classify?.replace(reg, (key: string) => `<span style="color: #ff9900">${key}</span>`);
    i.tag = i.tag?.replace(reg, (key: string) => `<span style="color: #ff9900">${key}</span>`);
    i.username = i.username?.replace(reg, (key: string) => `<span style="color: #ff9900">${key}</span>`);
    return i;
  });
};

// 判断链接是否包含图片
export const checkWithLink = (content: string, check?: boolean) => {
  const regex = /<[^>]+>/g;
  const matches = content.match(regex);
  const links = matches?.map((match) => match.substring(1, match.length - 1).split(',')[1]);
  return check ? !!links?.[0] : links;
};

// 计算资源加载的进度
export const calculateLoadProgress = ({
  url,
  getProgress,
  needFileType = 'arrayBuffer',
  previousReader,
  addPreviousReader,
}: {
  url: string;
  getProgress: (progress: number) => void;
  previousReader: any;
  addPreviousReader: (previousReader: any) => void;
  needFileType?: string;
}): Promise<ArrayBuffer | any> => {
  let contentLength = '';
  let totalBytes = 0;
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`资源加载失败: ${response.status} ${response.statusText}`);
      }
      contentLength = response.headers.get('content-length') as string;
      totalBytes = parseInt(contentLength, 10);
      let loadedBytes = 0;
      // 如果上一个读取器存在，则取消它
      if (previousReader) {
        previousReader.cancel();
        addPreviousReader && addPreviousReader(null);
      }
      const reader = response.body?.getReader();
      // 将当前读取器保存为上一个读取器
      addPreviousReader && addPreviousReader(reader);
      const chunks = [] as Uint8Array[];
      const readChunk = (): any => {
        return reader!.read().then(({ done, value }) => {
          if (done) {
            return chunks;
          }
          loadedBytes += value.byteLength;
          const progress = Math.round((loadedBytes / totalBytes) * 100);
          getProgress(progress);
          chunks.push(value);
          return readChunk();
        });
      };
      return readChunk();
    })
    .then((_chunks) => {
      if (needFileType === 'blob') {
        const blob = new Blob(_chunks, { type: 'application/pdf' });
        if (blob?.size < totalBytes) {
          return new Promise((resolve) => {
            resolve(null);
          });
        } else {
          return new Promise((resolve) => {
            resolve(blob);
          });
        }
      } else {
        const blob = new Blob(_chunks);
        if (blob?.size < totalBytes) {
          return new Promise((resolve) => {
            resolve(null);
          });
        } else {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsArrayBuffer(blob);
          });
        }
      }
    })
    .catch((error) => {
      console.error('资源加载失败:', error);
    });
};
