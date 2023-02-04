<!--
 * 文章详情
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="detail-wrap">文章详情{{ route.params.id }}</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

console.log(route.params.id, 'ssss');
</script>

<style scoped lang="less">
@import '@/styles/index.less';
</style>
