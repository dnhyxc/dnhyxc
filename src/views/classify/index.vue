<!--
 * 文章分类
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="classify-wap">文章分类{{ route.query?.name }}</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<style scoped lang="less">
@import '@/styles/index.less';
</style>
