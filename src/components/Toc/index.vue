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
        :class="`font iconfont ${scrollChildTop > 0 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
        @click="onScrollTo"
      />
    </div>
    <el-scrollbar ref="scrollChildRef" wrap-class="scrollbar-wrapper">
      <div class="item-wrap">
        <div
          v-for="(anchor, index) in commonStore.tocTitles"
          :key="index"
          :style="{ padding: `2px 10px 2px ${anchor.indent * 20 + 15}px`, margin: '10px 0' }"
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
import { useChildScroller } from '@/hooks';
import { commonStore } from '@/store';
import { TocTitlesParams } from '@/typings/common';

const { scrollChildRef, scrollChildTop } = useChildScroller();

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
  const el = scrollChildRef.value?.wrapRef as HTMLDivElement;
  if (el) {
    el.scrollTop = (scale * scrollChildRef.value?.wrapRef?.scrollHeight) as number;
  }
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
  const bottom = scrollChildRef.value?.wrapRef?.firstElementChild?.firstElementChild?.offsetHeight;
  scrollTo(scrollChildRef, scrollChildTop.value > 0 ? 0 : bottom);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.toc-wrap {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 0 5px 0 var(--card-shadow);
  padding-bottom: 10px;
  margin-bottom: 10px;
  color: var(--font-2);

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    font-size: 18px;
    font-weight: 700;
    border-bottom: 1px solid var(--card-border);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    .font {
      font-size: 20px;
      font-weight: 700;
      cursor: pointer;

      &:hover {
        color: var(--active);
      }
    }
  }

  :deep {
    .scrollbar-wrapper {
      box-sizing: border-box;
    }

    .el-scrollbar__view {
      box-sizing: border-box;
      height: 100%;
      border: 1px solid transparent;
    }
  }

  .item {
    .ellipsisMore(1);

    &:hover {
      color: var(--theme-blue);
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
      background-color: var(--theme-blue);
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  }

  .active {
    color: var(--theme-blue);
  }
}
</style>
