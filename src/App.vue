<template>
  <!-- <RouterView /> -->
  <RouterView v-if="isRouterAlive" v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
</template>

<script setup lang="ts">
import { ref, nextTick, provide, onMounted } from 'vue';
import { useCommonStore } from '@/store/common';

const isRouterAlive = ref<boolean>(true);

const commonStore = useCommonStore();

onMounted(() => {
  document.body.addEventListener('click', onBodyClick);
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
