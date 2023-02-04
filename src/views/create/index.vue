<!--
 * 发布文章
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="create-wrap">发布文章{{ route.query?.id }}</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<style scoped lang="less">
@import '@/styles/index.less';
</style>
