<template>
  <Skeleton v-if="!commonStore.pageLoadStatus" />
  <RouterView v-if="isRouterAlive" v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref, nextTick, provide, onMounted, onBeforeMount, watchEffect, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { commonStore, messageStore, personalStore, loginStore } from '@/store';
import { modifyTheme, getTheme, ipcRenderers, getMsgStatus, checkOS, EventBus } from '@/utils';

const route = useRoute();

let timer: ReturnType<typeof setTimeout> | null = null;

const router = useRouter();

const isRouterAlive = ref<boolean>(true);

// 修改主题色
onBeforeMount(async () => {
  // 获取存储在electron store中的主题颜色
  const theme = getTheme();
  if (theme) {
    modifyTheme(theme);
  }
});

watchEffect(async () => {
  if (loginStore?.userInfo.userId) {
    // 每次刷新重新加载未读消息列表
    await messageStore.getNoReadMsgCount();
    // 发送消息闪烁状态控制
    ipcRenderers.sendMessageFlashInfo({ messageStore, msgStatus: getMsgStatus() as number });
  }
});

onMounted(async () => {
  EventBus.on('quit', () => {
    loginStore.onQuit();
    router.push('/login');
  });
  // 获取路由权限
  await loginStore.getUserMenuRoles();
  if (checkOS() !== 'mac') {
    // 在 App 中监听主进程中发送的清除消息列表的消息，防止重复首次加载时重复监听的问题
    ipcRenderer.on('clear-message', async () => {
      // 每次监听到时，先加载未读消息列表
      await messageStore.getNoReadMsgCount();
      // 获取未读消息id
      const msgIds = messageStore.noReadMsgList?.map((i) => i.id);
      if (msgIds?.length) {
        await messageStore.setReadStatus(msgIds);
      }
    });
    // 监听点击消息中的用户名称跳转用户主页
    ipcRenderer.on('to-personal', (e, userId) => {
      router.push(`/personal?authorId=${userId}`);
      personalStore.currentTabKey = '0';
      if (route.path === '/personal' && loginStore?.userInfo.userId !== userId) {
        // 判断是否是收藏tab及url上的用户id是否等于当前点击用户的用户id
        if (personalStore.currentTabKey === '1' && route.query.authorId === userId) return;
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          reload();
          timer = null;
        }, 100);
      }
    });
    // 监听主进程发送的打开消息弹窗的消息
    ipcRenderer.on('show-message-modal', (e, status) => {
      messageStore.visible = true;
    });

    // 监听主进程发送的打开消息弹窗的消息
    ipcRenderer.on('win-show-status', (e, status) => {
      commonStore.updateWinStatus(status);
    });
  }
});

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
});

watch(
  () => messageStore.visible,
  (newVal) => {
    if (newVal) {
      // 消息弹出框显示的时候，清除消息数据
      // messageStore.msgCount = 0;
      messageStore.getMessageList();
    } else {
      messageStore.clearMessageInfo();
    }
  },
);

// 刷新当前页面
const reload = () => {
  isRouterAlive.value = false;
  nextTick(() => {
    isRouterAlive.value = true;
  });
};

// 父组件注册刷新当前页面的方法
provide('reload', reload);
</script>
