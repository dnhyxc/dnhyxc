<!--
 * 左侧菜单
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="left-menu-wrap">
    <div class="icon-wrap">
      <img :src="PAGEICON" class="page-icon" />
    </div>
    <div v-for="menu in MENULIST" :key="menu.key" class="menu-list">
      <img :src="menu.icon" class="menu-img" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MENULIST } from '@/constant';
import PAGEICON from '@/assets/svg/page_icon.svg';
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.left-menu-wrap {
  box-sizing: border-box;
  width: 60px;
  height: 100vh;
  padding: 15px 0;
  overflow: auto;

  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;

    .page-icon {
      width: 45px;
      height: 45px;
    }
  }

  .menu-list {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 60px;

    .menu-img {
      display: block;
      width: 30px;
      height: 30px;
    }
  }
}
</style>
