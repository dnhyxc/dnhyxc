<!--
 * 托盘消息提示
 * @author: dnhyxc
 * @since: 2023-06-16
 * index.vue
-->
<template>
  <div class="tray-message-wrap" @mouseleave="onMouseleave" @mouseenter="onMouseEnter">
    <div class="title">
      新消息<span v-if="data?.count">（{{ data?.count > 99 ? '99+' : data?.count }}）</span>
    </div>
    <div class="content">
      <div v-if="data?.count" class="message-item">
        <div class="left" @click.stop="showMessageModal">
          <span class="username" @click.stop="sendToPersonal(data?.noReadMsg.fromUserId!)">{{
            data?.noReadMsg.fromUsername
          }}</span>
          <span v-if="data?.noReadMsg.action" class="action-type">{{ MESSAGE_ACTIONS[data?.noReadMsg.action] }}</span>
        </div>
        <div class="right">
          <span class="msg-count">{{ data?.count > 99 ? '99+' : data?.count }}</span>
        </div>
      </div>
    </div>
    <div class="action" @click.stop="onIgnoreAll">忽略全部</div>
  </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { onMounted, ref } from 'vue';
import { MESSAGE_ACTIONS } from '@/constant';
import { ArticleItem } from '@/typings/common';
import { locSetItem, locGetItem, locRemoveItem, ipcRenderers, checkOS } from '@/utils';

const data = ref<{ count: number; noReadMsg: ArticleItem }>(
  locGetItem('__MESSAGE_INFO__') && JSON.parse(locGetItem('__MESSAGE_INFO__')!),
);

onMounted(() => {
  if (checkOS() !== 'mac') {
    // 监听主进程发送的消息信息
    ipcRenderer.on('message-info', (e, info) => {
      locSetItem('__MESSAGE_INFO__', info);
      const messageInfo: { count: number; noReadMsg: ArticleItem } = info && JSON.parse(info);
      data.value = messageInfo;
    });
  }
});

// 监听鼠标移出窗口
const onMouseleave = () => {
  ipcRenderers.closeMessageWin();
};

// 鼠标进入
const onMouseEnter = () => {
  ipcRenderers.showMessageWin(true);
  locRemoveItem('__MESSAGE_INFO__');
};

// 忽略全部
const onIgnoreAll = async () => {
  ipcRenderers.ignoreMessageWin();
};

// 点击消息通知主进程让主窗口打开消息弹窗
const showMessageModal = () => {
  ipcRenderers.showMessageWinModal(data.value.count);
};

// 点击发送去用户主页的消息
const sendToPersonal = (userId: string) => {
  ipcRenderers.sendToPersonalWin(userId);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.tray-message-wrap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 200px;
  height: 100%;
  box-sizing: border-box;
  padding: 10px 0;

  .title {
    font-size: 12px;
    padding: 0 10px 5px;
    font-weight: 600;
    line-height: 16px;
    color: var(--font-1);
  }

  .content {
    box-sizing: border-box;

    .message-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 60px;
      cursor: pointer;

      &:hover {
        background-color: var(--background);
      }

      .left {
        flex: 1;
        line-height: 24px;
        font-size: 14px;
        padding: 5px 0 5px 10px;
        .ellipsisMore(2);
      }

      .right {
        line-height: 24px;
        padding-right: 6px;
        margin-left: 6px;

        .msg-count {
          padding: 0 6px;
          font-size: 12px;
          color: var(--font-1);
          background-color: @font-danger;
          border-radius: 10px;
        }
      }

      .username {
        color: @theme-blue;
        margin-right: 5px;

        &:hover {
          color: @active;
        }
      }

      .action-type {
        color: var(--font-1);
      }
    }
  }

  .action {
    padding: 5px 10px 0;
    color: @theme-blue;
    border-top: 1px solid var(--card-border);
    font-size: 13px;
    text-align: right;
    cursor: pointer;
  }
}
</style>
