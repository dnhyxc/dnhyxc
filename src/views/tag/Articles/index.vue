<!--
 * 标签文章列表
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="articles-wrap">标签文章列表{{ route.query.tag }}</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<style scoped lang="less">
@import '@/styles/index.less';
</style>
