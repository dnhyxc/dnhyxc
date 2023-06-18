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
    ipcRenderer.send(
      'hide-message',
      JSON.stringify({
        count: messageStore.msgCount,
        noReadMsg: messageStore.noReadMsgList?.[0],
      }),
    );
  }
};
