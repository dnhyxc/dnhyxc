<!--
 * 主题设置页面
 * @author: dnhyxc
 * @since: 2023-02-20
 * index.vue
-->
<template>
  <div class="theme-wrap">
    <div class="content">尽情期待</div>
    <el-button @click="changeTheme">更改背景</el-button>
  </div>
</template>

<script setup lang="ts">
import { modifyTheme } from '@/utils';

const changeTheme = () => {
  modifyTheme();
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.theme-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  .content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 25px;
    font-weight: 700;
    color: var(--active-color);
  }
}
</style>
