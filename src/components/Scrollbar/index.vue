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
    <div v-show="showToTop" class="to-top" @click="onScrollTop">
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
  dataSource: any; // 数据源
  onFetchData: Function; // 请求数据的方法
  showToTop?: boolean; // 是否显示滚动到顶部
  loadText?: string; // loading 文案
  triggerText?: string; // 所有数据加载完毕时的文案
}

const props = withDefaults(defineProps<IProps>(), {
  dataSource: () => [],
  onFetchData: () => {},
  showToTop: true,
  loadText: 'Loading...',
  triggerText: '没有更多了',
});

onMounted(() => {
  initScroll();
});

// 初始化滚动条
const initScroll = () => {
  if (scrollRef.value) {
    BSC = new BScroll(scrollRef.value, {
      /**
       *  1. probeType 为 0，在任何时候都不派发 scroll 事件，
       *  2. probeType 为 1，仅仅当手指按在滚动区域上，每隔 momentumLimitTime 毫秒派发一次 scroll 事件，
       *  3. probeType 为 2，仅仅当手指按在滚动区域上，一直派发 scroll 事件，
       *  4. probeType 为 3，任何时候都派发 scroll 事件，包括调用 scrollTo 或者触发 momentum 滚动动画
       */
      probeType: 2,
      // 可以控制下拉加载的阈值 threshold: 0，1，2 等
      pullUpLoad: {
        threshold: 1,
      },
      mouseWheel: true, // 鼠标滚动配置
      momentumLimitDistance: 200,
      bounce: false, // 关闭回弹效果
    });
  }
  BSC.on('pullingUp', onLoadData);
};

const onLoadData = async () => {
  isPullUpLoad.value = true;
  await props.onFetchData();
  BSC.finishPullUp(); // 结束上拉加载行为。
  BSC.refresh();
  isPullUpLoad.value = false;
};

// 滚动到某位置（toY：纵向滚动距离，time：滚动动画时长）
const onScrollTo = (toY: number, time: number = 300) => {
  // scrollTo(0, -60, 300, undefined, extraTransform) 参数
  BSC.scrollTo(0, toY, time);
};

// 滚动到顶部
const onScrollTop = () => {
  BSC.scrollTo(0, 0, 300);
};

// 向外暴露onScrollTo
defineExpose({
  onScrollTo,
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.pullup-wrapper {
  position: relative;
  height: calc(100% - 240px);
  overflow: hidden;
  .pullup-content {
    display: flex;
    flex-wrap: wrap;
    .pullup-list-item {
      border-radius: 5px;
      list-style: none;
      width: calc(33.33333% - 4px);
      margin-right: 6px;
      margin-bottom: 6px;
      &:nth-child(3n + 3) {
        margin-right: 0;
      }
    }
    .pullup-tips {
      padding: 6px 0 2px 0;
      width: 100%;
      text-align: center;
      color: @font-4;
    }
  }
  .to-top {
    position: absolute;
    right: 12px;
    bottom: 12px;
    background-color: rgba(225, 225, 225, 0.8);
    box-shadow: 0 0 10px @theme-blue;
    padding: 10px 5px 0 5px;
    border-radius: 8px;
    cursor: pointer;
    .to-icon {
      font-size: 30px;
      color: @active;
    }
  }
}
</style>
