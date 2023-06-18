<template>
  <!-- <RouterView /> -->
  <RouterView v-if="isRouterAlive" v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref, nextTick, provide, onMounted, onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { commonStore, messageStore, personalStore, loginStore } from '@/store';
import { modifyTheme, getTheme } from '@/utils';

const route = useRoute();

const timer = ref<ReturnType<typeof setTimeout> | null>(null);

const router = useRouter();

const isRouterAlive = ref<boolean>(true);

// 修改主题色
onBeforeMount(() => {
  // 获取存储在electron store中的主题颜色
  const theme = getTheme();
  if (theme) {
    modifyTheme(theme);
  }
});

onMounted(() => {
  document.body.addEventListener('click', onBodyClick);
  // 在 App 中监听主进程中发送的清除消息列表的消息，防止重复首次加载时重复监听的问题
  ipcRenderer.on('clear-message', async (e, data) => {
    // 设置消息已读
    await messageStore.getNoReadMsgCount();
    // 获取未读消息id
    const msgIds = messageStore.noReadMsgList?.map((i) => i.id);
    if (msgIds?.length) {
      await messageStore.setReadStatus(msgIds);
      messageStore.msgCount = 0;
    }
  });

  ipcRenderer.on('to-personal', (e, userId) => {
    router.push(`/personal?authorId=${userId}`);
    personalStore.currentTabKey = '0';
    if (route.path === '/personal' && loginStore?.userInfo.userId !== userId) {
      if (personalStore.currentTabKey === '1' && route.query.authorId === userId) return;
      timer.value = setTimeout(() => {
        reload();
        timer.value = null;
      }, 100);
    }
  });
});

// body点击事件，清除右键菜单设置
const onBodyClick = (e: MouseEvent) => {
  e.stopPropagation();
  commonStore.clearContentmenuInfo();
};

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
