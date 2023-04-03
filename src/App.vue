<template>
  <!-- <RouterView /> -->
  <RouterView v-if="isRouterAlive" v-slot="{ Component }">
    <!-- 定义缓存组件：注意include="Create"，Create 组件内部必须声明组件名称 -->
    <KeepAlive include="Create">
      <component :is="Component" />
    </KeepAlive>
  </RouterView>
</template>

<script setup lang="ts">
import { ref, nextTick, provide } from 'vue';

const isRouterAlive = ref<boolean>(true);

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
