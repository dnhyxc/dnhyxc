/*
 * 全局状态
 * @author: dnhyxc
 * @since: 2023-06-21
 * index.vue
 */
import {Tray, BrowserWindow} from 'electron';

export const DOMAIN_URL = 'http://101.43.50.15';

// 全局状态
export const globalInfo: {
  tray: Tray | null;
  win: BrowserWindow | null;
  msgStatus: boolean | null;
  userInfo: string;
  messageWin: BrowserWindow | null;
  openWin: BrowserWindow | null;
  size: {
    width: number;
    height: number;
  };
  store: any
} = {
  tray: null,
  win: null,
  messageWin: null,
  openWin: null,
  // 消息提示控制器
  msgStatus: true,
  // 保存用户信息
  userInfo: '',
  size: {
    width: 0,
    height: 0,
  },
  store: null
};

export const clearGlobalInfo = () => {
  globalInfo.win = null;
  globalInfo.messageWin = null;
  globalInfo.openWin = null;
  globalInfo.tray = null;
  globalInfo.msgStatus = true;
  globalInfo.userInfo = '';
};

export const isDev: boolean = process.env.NODE_ENV === 'development';

export const isMac: boolean = process.platform === 'darwin';

// 多窗口数据存储
export const globalChildWins = {
  newWins: new Map(),
};

export const CATCHS = [
  'appcache',
  'filesystem',
  'indexdb',
  'localstorage',
  'shadercache',
  'websql',
  'serviceworkers',
  'cachestorage',
];

// 工具子窗口
export const TOOLS_KEYS = [
  'tools_compress',
  'tools_cropper',
  'tools_codeRun',
  'tools_textToSpeech',
  'tools_watermark',
  'tools_board',
  'tools_transcribe',
  'tools_word',
  'tools_pdf',
  'tools_epub',
];
