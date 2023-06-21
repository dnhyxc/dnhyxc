import { ipcRenderer } from 'electron';

// 窗口最大化
export const sendWindowMax = () => {
  ipcRenderer.send('window-max');
};

// 窗口最小化
export const sendWindowMin = () => {
  ipcRenderer.send('window-min');
};

// 窗口关闭
export const sendWindowCLose = () => {
  ipcRenderer.send('window-close');
};

// 窗口退出
export const sendWindowOut = () => {
  ipcRenderer.send('window-out');
};

// 窗口置顶
export const sendWinSticky = (value: boolean) => {
  ipcRenderer.send('win-show', value);
};

// 新建窗口
export const sendNewWin = (params: { path: string; id: string; userInfo: string; prevArticleId?: string }) => {
  if (params.prevArticleId) {
    ipcRenderer.send('new-win', params.path, params.id, params.userInfo, params.prevArticleId);
  } else {
    ipcRenderer.send('new-win', params.path, params.id, params.userInfo);
  }
};

// 下载
export const sendDownload = (url: string) => {
  ipcRenderer.send('download', url);
};

// 发送删除的文章的消息给主进程，通知主进程及时关闭对应子窗口
export const sendRemove = (articleId: string) => {
  ipcRenderer.send('remove', articleId);
};

// 子窗口置顶
export const sendNewWinSticky = (status: boolean, id: string) => {
  ipcRenderer.send('new-win-show', status, id);
};

// 子窗口最大化
export const sendNewWinMax = (id: string) => {
  ipcRenderer.send('new-win-max', id);
};

// 子窗口最小化
export const sendNewWinMin = (id: string) => {
  ipcRenderer.send('new-win-min', id);
};

// 子窗口关闭
export const sendNewWinOut = (id: string) => {
  ipcRenderer.send('new-win-out', id);
};

// 通知主进程重新注册快捷键
export const restoreRegisterShortCut = () => {
  ipcRenderer.send('restore-register-shortcut');
};

// 获取electron应用的存储目录
export const getAppPath = () => {
  ipcRenderer.send('get-app-path');
};

// 监听开机自启状态
export const openAtLogin = (value: number) => {
  ipcRenderer.send('open-at-login', value);
};

// 监听是否开启消息提醒
export const msgStatus = (value: number) => {
  ipcRenderer.send('msg-status', value);
};

// 与主进程通信，唤起文件夹选择弹窗
export const openDialog = () => {
  ipcRenderer.send('openDialog');
};

// 推送刷新页面的，articleId：文章id、pathname：路由路径、isLike：是否是点赞操作
export const sendRefresh = (articleId: string, pathname?: string, isLike?: boolean) => {
  // 判断是article还是detail、分别推送刷新消息给主进程
  if (pathname?.includes('/article')) {
    ipcRenderer.send('refresh', articleId, 'article', isLike);
  } else if (pathname?.includes('/detail')) {
    ipcRenderer.send('refresh', articleId, 'detail', isLike);
  } else {
    ipcRenderer.send('refresh', articleId, 'list');
  }
};

// 登录、退出推送消息给主进程，用户刷新子窗口详情
export const restore = (info: string) => {
  ipcRenderer.send('restore', info);
};

// 通知拓展坞闪动
export const sendFlashMsg = (data: any) => {
  ipcRenderer.send('show-message', data);
};

// 通知主进程停止闪烁及关闭消息弹窗
export const sendStopFlashMsg = (data: any) => {
  ipcRenderer.send('hide-message', data);
};

// 发送托盘闪烁消息
export const sendMessageFlashInfo = (params: { messageStore: any; msgStatus: number }) => {
  const { messageStore, msgStatus } = params;
  if (messageStore.msgCount && msgStatus === 1) {
    sendFlashMsg(
      JSON.stringify({
        count: messageStore.msgCount,
        noReadMsg: messageStore.noReadMsgList?.[0],
      }),
    );
  } else {
    sendStopFlashMsg(
      JSON.stringify({
        count: messageStore.msgCount,
        noReadMsg: messageStore.noReadMsgList?.[0],
      }),
    );
  }
};

// 隐藏消息窗口
export const closeMessageWin = () => {
  ipcRenderer.send('close-message-win');
};

// 显示消息窗口
export const showMessageWin = (status: boolean = true) => {
  ipcRenderer.send('show-message-win', status);
};

// 忽略所有未读消息
export const ignoreMessageWin = () => {
  ipcRenderer.send('ignore-message-win');
};

// 点击消息通知主进程让主窗口打开消息弹窗
export const showMessageWinModal = (count: number) => {
  ipcRenderer.send('show-message-modal', count);
};

// 消息窗口点击用户跳转到用户主页
export const sendToPersonalWin = (userId: string) => {
  ipcRenderer.send('to-personal', userId);
};
