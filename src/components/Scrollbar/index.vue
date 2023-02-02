<!--
 * 滚动组件
 * @author: dnhyxc
 * @since: 2023-02-02
 * index.vue
-->
<template>
  <div ref="scrollRef" class="pullup-wrapper">
    <div class="pullup-content">
      <div v-for="(i, index) of dataSource" :key="i" class="pullup-list-item">
        <slot :data="{ i, index }"></slot>
      </div>
      <div class="pullup-tips">
        <div v-if="!isPullUpLoad" class="before-trigger">
          <span class="pullup-txt">{{ triggerText }}</span>
        </div>
        <div v-else class="after-trigger">
          <span class="pullup-txt">{{ loadText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BScroll from '@better-scroll/core';

const scrollRef = ref<HTMLDivElement | null>(null);
const BSC = ref<any>({});
const isPullUpLoad = ref<boolean>(false);

interface IProps {
  dataSource: any; // 数据源
  onFetchData: Function; // 请求数据的方法
  loadText?: string; // loading 文案
  triggerText?: string; // 所有数据加载完毕时的文案
}

const props = withDefaults(defineProps<IProps>(), {
  dataSource: () => [],
  onFetchData: () => {},
  loadText: 'Loading...',
  triggerText: '没有更多了',
});

onMounted(() => {
  initScroll();
});

// 初始化滚动条
const initScroll = () => {
  BSC.value =
    (scrollRef.value &&
      new BScroll(scrollRef.value, {
        /**
         *  1. probeType 为 0，在任何时候都不派发 scroll 事件，
         *  2. probeType 为 1，仅仅当手指按在滚动区域上，每隔 momentumLimitTime 毫秒派发一次 scroll 事件，
         *  3. probeType 为 2，仅仅当手指按在滚动区域上，一直派发 scroll 事件，
         *  4. probeType 为 3，任何时候都派发 scroll 事件，包括调用 scrollTo 或者触发 momentum 滚动动画
         */
        probeType: 3,
        // 可以控制下拉加载的阈值 threshold: 0，1，2 等
        pullUpLoad: {
          threshold: 1,
        },
        // 鼠标滚动配置
        mouseWheel: true,
      })) ||
    {};
  BSC.value?.on('pullingUp', onLoadData);
};

const onLoadData = async () => {
  isPullUpLoad.value = true;
  await props.onFetchData();
  BSC.value.finishPullUp(); // 结束上拉加载行为。
  BSC.value.refresh();
  isPullUpLoad.value = false;
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.pullup-wrapper {
  height: calc(100% - 240px);
  overflow: hidden;

  .pullup-content {
    .pullup-list-item {
      padding-bottom: 1px;
      border-radius: 5px;
      list-style: none;
    }
    .pullup-tips {
      padding: 20px 0 5px 0;
      text-align: center;
      color: #999;
    }
  }
}
</style>
