<!--
 * 文章目录
 * @author: dnhyxc
 * @since: 2023-01-14
 * index.vue
-->
<template>
  <div ref="tocRef" class="toc-wrap">
    <div class="title">
      <span>目录</span>
      <i :class="`font iconfont ${scrollTop > 0 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
        @click="onScrollTo" />
    </div>
    <div class="content">
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div class="item-wrap">
          <div v-for="i in 100" :key="i" class="item">{{ 'content' + i }}</div>
        </div>
      </el-scrollbar>
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

<script setup lang="ts">
import { ref } from 'vue';
import { scrollTo } from '@/utils';
import { useScrollDown } from '@/hooks'

const scrollRef = ref<any>(null);
const scrollTop = ref<number>(0);

useScrollDown(scrollRef, scrollTop)

// 滚动到某位置
const onScrollTo = () => {
  const bottom = scrollRef.value?.wrapRef?.firstElementChild?.offsetHeight;
  scrollTo(scrollRef, scrollTop.value > 0 ? 0 : bottom);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.toc-wrap {
  box-sizing: border-box;
  height: calc(100vh - 122px);
  border-radius: 5px;
  padding-left: 10px;
  overflow: hidden;
  box-shadow: @shadow-mack;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0 15px;
    margin-right: 10px;
    font-size: 18px;
    font-weight: 700;
    border-bottom: 1px solid @card-border;

    .font {
      font-size: 20px;
      font-weight: 700;
      cursor: pointer;
    }
  }

  .content {
    box-sizing: border-box;
    height: calc(100vh - 185px);

    .item {
      margin-right: 10px;

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
