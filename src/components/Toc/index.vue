<!--
 * 文章目录
 * @author: dnhyxc
 * @since: 2023-01-14
 * index.vue
-->
<template>
  <div v-if="commonStore?.tocTitles?.length > 0" ref="tocRef" class="toc-wrap">
    <div class="title">
      <span>目录</span>
      <i
        :class="`font iconfont ${scrollTop > 0 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
        @click="onScrollTo"
      />
    </div>
    <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
      <div class="item-wrap">
        <div
          v-for="(anchor, index) in commonStore.tocTitles"
          :key="index"
          :style="{ padding: `3px 10px 3px ${anchor.indent * 20 + 15}px`, margin: '10px 0' }"
          :class="`${checkTocTitle === anchor.title + index && 'toc-item'} item`"
          @click="handleAnchorClick(anchor, index)"
        >
          <a style="cursor: pointer" :class="checkTocTitle === anchor.title + index && 'active'">{{ anchor.title }}</a>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, watchEffect, onUnmounted } from 'vue';
import { scrollTo } from '@/utils';
import { useScroller } from '@/hooks';
import { commonStore } from '@/store';
import { TocTitlesParams } from '@/typings/common';

const { scrollRef, scrollTop } = useScroller();

const checkTocTitle = ref<string>('');

onMounted(() => {
  watchEffect(() => {
    if (commonStore.tocTitles[0]) {
      checkTocTitle.value = commonStore.tocTitles[0]?.title + 0;
    }
    nextTick(() => {
      // 监听滚动条滚动事件
      commonStore.detailScrollRef?.wrapRef?.addEventListener('scroll', onDetailScroll);
    });
  });
});

onUnmounted(() => {
  // 卸载滚动条滚动事件
  commonStore.detailScrollRef?.wrapRef?.removeEventListener('scroll', onDetailScroll);
});

// 监听详情md预览组件滚动事件
const onDetailScroll = (e: any) => {
  const scale = e.target.scrollTop / commonStore.detailScrollRef?.wrapRef?.scrollHeight;
  const el = scrollRef.value?.wrapRef as HTMLDivElement;
  el.scrollTop = (scale * scrollRef.value?.wrapRef?.scrollHeight) as number;
};

// 选中某标题
const handleAnchorClick = (anchor: TocTitlesParams, index: number) => {
  const { lineIndex, title } = anchor;
  checkTocTitle.value = title + index;
  nextTick(() => {
    const heading = (commonStore.previewRef as any).$el?.querySelector(`[data-v-md-line="${lineIndex}"]`);
    if (heading) {
      heading.classList.add('header-active');
      (commonStore.previewRef as any).scrollToTarget({
        target: heading,
        scrollContainer: commonStore.detailScrollRef?.wrapRef, // 需要滚动组件容器（el-scrollbar）
        top: 15,
      });
    }
  });
};

// 滚动到某位置
const onScrollTo = () => {
  const bottom = scrollRef.value?.wrapRef?.firstElementChild?.offsetHeight;
  scrollTo(scrollRef, scrollTop.value > 0 ? 0 : bottom);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.toc-wrap {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  // height: calc(100vh - 345px);
  border-radius: 5px;
  overflow: hidden;
  box-shadow: @shadow-mack;
  padding-bottom: 10px;
  // margin-bottom: 10px;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    font-size: 18px;
    font-weight: 700;
    border-bottom: 1px solid @card-border;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    .font {
      font-size: 20px;
      font-weight: 700;
      cursor: pointer;
    }
  }

  :deep {
    .scrollbar-wrapper {
      box-sizing: border-box;
      height: 100%;
    }

    .el-scrollbar__view {
      height: 100%;
    }
  }

  .item {
    .ellipsisMore(1);

    &:hover {
      .textLg();
    }
  }

  .toc-item {
    box-sizing: border-box;
    position: relative;
    width: 100%;

    &::before {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      content: '';
      height: 65%;
      width: 4px;
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
