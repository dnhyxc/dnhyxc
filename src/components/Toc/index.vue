<!--
 * 文章目录
 * @author: dnhyxc
 * @since: 2023-01-14
 * index.vue
-->
<template>
  <div ref="tocRef" class="toc-wrap">
    <div class="title">目录</div>
    <div class="content">
      <div v-for="i in 100" :key="i" class="item">{{ 'content' + i }}</div>
    </div>
    <!-- <div
      v-for="(anchor, index) in (detailStore.tocTitles as any)"
      :key="index"
      :style="{ padding: `10px 0 10px ${anchor.indent * 20 + 5}px` }"
      :class="checkTocTitle === anchor.title + index && 'toc-item'"
      @click="handleAnchorClick(anchor, index)"
    >
      <a style="cursor: pointer" :class="checkTocTitle === anchor.title + index && 'active'">{{ anchor.title }}</a>
    </div> -->
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="less">
@import '@/styles/index.less';

.toc-wrap {
  box-sizing: border-box;
  height: auto;
  height: calc(100vh - 122px);
  border-radius: 5px;
  padding: 0 10px;
  overflow: hidden;
  box-shadow: @shadow-mack;

  .title {
    padding: 15px 0 15px;
    font-size: 18px;
    font-weight: 700;
    border-bottom: 1px solid @card-border;
  }

  .content {
    box-sizing: border-box;
    height: calc(100vh - 185px);
    overflow: auto;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .toc-item {
    position: relative;
    width: 100%;

    &::before {
      position: absolute;
      left: -11px;
      top: 50%;
      transform: translateY(-50%);
      content: '';
      height: 65%;
      width: 5px;
      background-color: @theme-blue;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  }

  .active {
    color: @theme-blue;
  }
}
</style>
