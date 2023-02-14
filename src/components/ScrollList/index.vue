<!--
 * 滚动列表组件
 * @author: dnhyxc
 * @since: 2023-02-14
 * index.vue
-->
<template>
  <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
    <div class="item-wrap">
      <slot></slot>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { scrollTo } from '@/utils';
import { useScroller } from '@/hooks';

const { scrollRef, scrollTop } = useScroller();

// 滚动到某位置
const onScrollTo = () => {
  const bottom = scrollRef.value?.wrapRef?.firstElementChild?.offsetHeight;
  scrollTo(scrollRef, scrollTop.value > 0 ? 0 : bottom);
};

defineExpose({
  onScrollTo,
  scrollTop
})
</script>

<style scoped lang="less">
@import '@/styles/index.less';
</style>
