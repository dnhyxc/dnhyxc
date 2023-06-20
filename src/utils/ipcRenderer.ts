import { ipcRenderer } from 'electron';

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

// 显示消息窗口
export const showMessageWin = () => {
  ipcRenderer.send('show-message-win', true);
};

// 隐藏消息窗口
export const closeMessageWin = () => {
  ipcRenderer.send('close-message-win');
};

// 忽略所有未读消息
export const ignoreMessageWin = () => {
  ipcRenderer.send('ignore-message-win');
};
