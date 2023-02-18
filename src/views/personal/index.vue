<!--
 * 我的主页
 * @author: dnhyxc
 * @since: 2023-01-30
 * index.vue
-->
<template>
  <div class="personal-wrap">personal{{ route.query?.id }}</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<style scoped lang="less">
@import '@/styles/index.less';
</style>
