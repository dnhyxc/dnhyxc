<!--
 * 全局loading配置
 * @author: dnhyxc
 * @since: 2023-03-02
 * index.vue
-->
<template>
  <div
    v-loading="loading"
    element-loading-text="正在努力加载中 . . ."
    :element-loading-spinner="LOADING_SVG"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-background="rgba(249, 255, 249, 0.8)"
    class="loading-wrap"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { LOADING_SVG } from '@/constant';

interface IProps {
  loading: boolean | null;
  loadIcon?: string;
}

defineProps<IProps>();
</script>

<style scoped lang="less">
@import '@/styles/index.less';
</style>
