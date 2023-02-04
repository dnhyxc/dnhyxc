<!--
 * 文章标签
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="tag-wrap">文章标签{{ route.query?.name }}</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<style scoped lang="less">
@import '@/styles/index.less';
</style>
