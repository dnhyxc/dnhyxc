<!--
 * 空状态页面
 * @author: dnhyxc
 * @since: 2023-03-29
 * index.vue
-->
<template>
  <div class="empty-wrap">
    <img :src="EMPTY" />
    <span class="empty-text">{{ text || '空空如也' }}</span>
  </div>
</template>

<script setup lang="ts">
import { EMPTY } from '@/constant';

interface IProps {
  text?: string;
}

defineProps<IProps>();
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
  pointer-events: none;
  .clickNoSelectText();

  .empty-text {
    color: var(--font-6);
  }
}
</style>
