<!--
 * 滚动条组件
 * @author: dnhyxc
 * @since: 2023-02-09
 * index.vue
-->
<template>
  <div ref="scrollRef" class="pullup-wrapper">
    <slot name="scroll"></slot>
    <slot name="pullup" :is-pull-up-load="isPullUpLoad"></slot>
    <div v-show="showToTop && toTop" class="to-top" @click="onScrollTop">
      <i class="to-icon iconfont icon-huojian"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import BScroll from '@better-scroll/core';

let BSC = reactive<BScroll>({} as BScroll);
const scrollRef = ref<HTMLDivElement | null>(null);
const isPullUpLoad = ref<boolean>(false);

interface IProps {
  height?: string;
  dataSource?: any[];
  onFetchData?: Function;
  showToTop?: boolean; // 是否显示滚动到顶部
  loadText?: string; // loading 文案
  triggerText?: string; // 所有数据加载完毕时的文案
}

const toTop = ref<boolean>(false);

const props = withDefaults(defineProps<IProps>(), {
  height: 'cala(100vh - 62px)',
  showToTop: true,
  loadText: 'Loading...',
  triggerText: '没有更多了',
  dataSource: () => [],
  onFetchData: () => {},
});

onMounted(() => {
  initScroll();
});

// 初始化滚动条
const initScroll = () => {
  if (scrollRef.value) {
    BSC = new BScroll(scrollRef.value, {
      pullUpLoad: { threshold: 1 },
      click: true,
      scrollbar: {
        interactive: true,
        scrollbarTrackClickable: true,
        fadeOutTime: 1000,
      },
      // 是否派发 scroll 事件，3：当手指按在滚动区域上，一直派发 scroll 事件
      probeType: 3,
      // 可以控制下拉加载的阈值 threshold: 0，1，2 等
      // pullUpLoad: {
      //   threshold: 0,
      // },
      mouseWheel: true, // 鼠标滚动配置
      momentumLimitDistance: 200,
      bounce: false, // 关闭回弹效果
    });
  }
  // 监听滚动加载事件
  BSC?.on('pullingUp', onLoadData);
  // 监听滚动事件
  BSC?.on('scroll', onScroll);
};

// 滚动事件
const onScroll = (pos: { x: number; y: number }) => {
  if (pos.y <= -500) {
    toTop.value = true;
  } else {
    toTop.value = false;
  }
};

// 滚动加载事件
const onLoadData = async () => {
  isPullUpLoad.value = true;
  await props.onFetchData();
  BSC.finishPullUp(); // 结束上拉加载行为。
  BSC.refresh();
  isPullUpLoad.value = false;
};

// 滚动到顶部
const onScrollTop = () => {
  BSC.scrollTo(0, 0, 300);
};

// 向外暴露onScrollTo
defineExpose({
  onScrollTop,
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.pullup-wrapper {
  position: relative;
  height: v-bind(height);
  overflow: hidden;
  border: 1px solid red;
}
</style>
