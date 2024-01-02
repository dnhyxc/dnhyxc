<!--
 * 全局loading配置
 * @author: dnhyxc
 * @since: 2023-03-02
 * index.vue
-->
<template>
  <div class="loading-wrap">
    <AsyncLoading v-if="loading" class="async-load-wrap">
      <div class="load-text">{{ loadText || '正在卖力加载中' }}</div>
      <slot name="loadInfo"></slot>
    </AsyncLoading>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  loading: boolean | null;
  loadText?: string;
}

defineProps<IProps>();
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.loading-wrap {
  position: relative;
  border-radius: 5px;

  .async-load-wrap {
    position: absolute;
    backdrop-filter: blur(5px);
    background-color: var(--loading-color);
    z-index: 99;

    .load-text {
      margin-top: 20px;
      color: var(--loading-text-color);
    }
  }
}
</style>
