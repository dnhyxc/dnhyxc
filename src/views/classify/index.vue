<!--
 * 文章分类
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="classify-wap">
    <Roll :on-check-classify="onCheckClassify" :data-source="[]" />
  </div>
</template>

<script setup lang="ts">
import Roll from '@/components/Roll/index.vue';

// 点击卡片事件
const onCheckClassify = (id: number) => {
  console.log(id, 'id');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.classify-wap {
  height: 100%;
  width: 100%;
  border-radius: 5px;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
