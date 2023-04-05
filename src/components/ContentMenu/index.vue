<!--
 * 右键菜单
 * @author: dnhyxc
 * @since: 2023-04-05
 * index.vue
-->
<template>
  <div class="contentmenu-wrap">
    <span class="menu-item" @click.stop="onOpenNewWindow(data)">新窗口打开</span>
    <span class="menu-item" @click.stop="toDetail(data)">当前页打开</span>
  </div>
</template>

<script setup lang="ts">
import { ArticleItem } from '@/typings/common';

interface IProps {
  data: ArticleItem;
  onOpenNewWindow: (data: ArticleItem) => void;
  toDetail: (data: ArticleItem) => void;
}

defineProps<IProps>();
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.contentmenu-wrap {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  background-color: @theme;
  backdrop-filter: blur(2px);
  border-radius: 5px;
  padding: 5px;

  .menu-item {
    font-size: 13px;
    padding: 8px;
    border-radius: 5px;

    &:hover {
      background-image: @head-lg;
      color: @theme-blue;
    }
  }
}
</style>
