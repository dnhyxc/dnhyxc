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
  backdrop-filter: blur(2px);
  border-radius: 5px;
  padding: 5px;
  z-index: 92;
  background-color: var(--modal-bg-color);
  color: var(--font-1);

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    content: '';
    width: 100%;
    height: 100%;
    background: var(--shade-2);
    border-radius: 5px;
  }

  .menu-item {
    position: relative;
    font-size: 13px;
    padding: 8px;
    border-radius: 5px;
    z-index: 1;

    &:hover {
      background-image: linear-gradient(135deg, var(--head-lg-color1) 10%, var(--head-lg-color2) 100%);
      color: var(--theme-blue);
    }
  }
}
</style>
