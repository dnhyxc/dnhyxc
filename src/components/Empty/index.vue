<!--
 * 空状态页面
 * @author: dnhyxc
 * @since: 2023-03-29
 * index.vue
-->
<template>
  <div class="empty-wrap">
    <img :src="EMPTY" />
    <span class="empty-text">空空如也</span>
  </div>
</template>

<script setup lang="ts">
import { EMPTY } from '@/constant';
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.empty-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  transform: translate(-50%, -50%);
  display: flex;
  .clickNoSelectText();

  .empty-text {
    color: @font-3;
  }
}
</style>
