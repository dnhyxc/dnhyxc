import { loginStore, messageStore } from '@/store';
import { locGetItem, getStoreUserInfo, locRemoveItem, ipcRenderers } from '@/utils';
import { DOMAIN_URL } from '@/constant';

export let ws: any;
let wstime: any = null;
// lockReconnect用于避免重复连接
let lockReconnect = false;

// 连接ws的url
let timeoutObj: any = null;
let serverTimeoutObj: any = null;
const timeout: number = 50000;

// 请求数据
export const QUERY_ALL_FRAME = {
  action: 'queryMessage',
};

// 心跳检测
export const HEARTBEAT_FRAME = {
  action: 'heartBeat',
};

// 删除消息
export const DELETE_FRAME = {
  action: 'deleteMessageAll',
};

// 创建websocket
export function createWebSocket() {
  const { userInfo: storeUserInfo } = getStoreUserInfo();

  const userInfo = (locGetItem('userInfo') && JSON.parse(locGetItem('userInfo')!)) || storeUserInfo || {};

  if (!userInfo?.userId) return;

  const wsUrl = `ws://${location.hostname === DOMAIN_URL ? DOMAIN_URL : '127.0.0.1'}:9002/ws?id=${userInfo?.userId}`;

  try {
    // 创建前先关闭创建好的ws
    closeSocket();
    ws = new WebSocket(wsUrl);
    websocketInit();
  } catch (e) {
    // 出现异常时，重新连接ws
    websocketReconnect();
  }
}

// 初始化ws事件
function websocketInit() {
  ws.onopen = function (event: any) {
    onOpen(event);
  };
  ws.onmessage = function (event: any) {
    onMessage(event);
  };
  // 断开连接时重新连接ws
  ws.onclose = function (event: any) {
    onClose(event);
    websocketReconnect();
  };
  // 连接出现异常时重新连接ws
  ws.onerror = function (event: any) {
    onError(event);
    websocketReconnect();
  };
}

// 关闭ws连接
export function closeSocket() {
  if (ws) {
    ws.onclose = function () {};
    ws.close();
    ws = null;
  }
}

// 重新连接ws
function websocketReconnect() {
  if (lockReconnect) return;
  lockReconnect = true;
  wstime && clearTimeout(wstime);
  // 连接断开时每个5s再次连接
  wstime = setTimeout(function () {
    createWebSocket();
    lockReconnect = false;
  }, 5000);
}

// 设置心跳检测
const heartCheck = {
  start: function () {
    timeoutObj && clearTimeout(timeoutObj);
    serverTimeoutObj && clearTimeout(serverTimeoutObj);
    // 每隔50000进行心跳检测
    timeoutObj = setTimeout(function () {
      sendMessage(JSON.stringify(HEARTBEAT_FRAME));
      // 如果50000之内没有操作关闭ws连接
      serverTimeoutObj = setTimeout(function () {
        ws.close();
      }, timeout);
    }, timeout);
  },
};

// 发送消息
export const sendMessage = (msg?: any) => {
  if (ws && ws.readyState === 1) {
    try {
      ws.send(msg);
    } catch (e) {
      console.log(e);
    }
  }
};

// ws连接成功
function onOpen(event: any) {
  sendMessage(JSON.stringify(QUERY_ALL_FRAME));
  // 发送消息之后重新进行心跳检测
  heartCheck.start();
}

// 收到服务端数据
async function onMessage(event: any) {
  try {
    const parseData = JSON.parse(event.data);

    if (parseData.code === 200) {
      // 心跳数据不处理
      // 所需的正常操作
      if (parseData.action === 'heartBeat') {
        console.log(event.data);
      } else {
        // 解析处理数据
        if (parseData.action === 'push') {
          await messageStore.setMsgCount(parseData.data);
          // 只在消息弹出框显示的时候才添加数据
          if (messageStore.visible) {
            messageStore.addMessage(parseData.data);
          }
        }
        // 收到后台推送的退出登录通知
        if (parseData.action === 'logout' && (loginStore?.token || loginStore?.userInfo?.userId)) {
          loginStore.token = '';
          loginStore.userInfo = {};
          locRemoveItem('token');
          locRemoveItem('userInfo');
          loginStore.logoutStatus = true;
          ipcRenderers.restore('');
        }
      }
    } else {
      throw new Error('收到非格式化数据');
    }
  } catch (e) {
    console.log(e);
  }
  // 拿到任何消息都说明当前连接是正常的，此时从新进行心跳检测
  heartCheck.start();
}

// 关闭连接
function onClose(event: any) {}

// 连接出错
function onError(event: any) {}

createWebSocket();
