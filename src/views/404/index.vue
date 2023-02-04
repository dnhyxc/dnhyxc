<!--
 * 404
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="">
    <div>404</div>
    <div @click="backHome">返回首页</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// 返回首页
const backHome = () => {
  router.push('/home');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';
</style>
