<!--
 * 图片集
 * @author: dnhyxc
 * @since: 2023-07-18
 * index.vue
-->
<template>
  <Loading :key="winSize" :loading="false" class="atlas-wrap">
    <template #default>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div :infinite-scroll-delay="300" :infinite-scroll-distance="2" class="pullup-content">
          <div v-masonry transition-duration="0.2s" fit-width="true" item-selector=".img-item" class="img-list">
            <div v-for="(item, index) in images" :key="index" v-masonry-tile class="img-item">
              <span class="count">{{ index + 1 }}</span>
              <img :src="item" alt="http://43.143.27.249:9216" class="img" />
            </div>
          </div>
          <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
        </div>
      </el-scrollbar>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useScroller } from '@/hooks';
import { scrollTo, debounce } from '@/utils';

const { scrollRef, scrollTop } = useScroller();

const winSize = ref<number>(0);

let previousWidth: number | null = window.innerWidth;

const onResize = () => {
  if (previousWidth! > window.innerWidth) {
    console.log(previousWidth, 'aaaaaa', window.innerWidth);
    winSize.value = window.innerWidth;
  }
  previousWidth = window.innerWidth;
};

const images = [
  'https://pica.zhimg.com/80/v2-f167a66b1de479dc4a2b19d46701ad06_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-779770684deae7ca6a9279909573ba65_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-3cb57dd017a65b0d526c3e53f1258e20_720w.webp?source=1940ef5c',
  'https://pica.zhimg.com/80/v2-1c56872d6db7f6abb1f0ed0f217dcd8b_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-4faaf6c8394c3fec83ffd36aa182efa9_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-4aec13609438cb7333e998efe2b6320b_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-bd8a5a507821105321dbeff322fccd25_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-52165e265072bdbd871fed8a569aa124_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-7332f2c479ffcbcdd095666841cf69c9_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-9ec71d6e870f42b2151e4cb72c4282a9_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-f2ababed8b41526f6a15fa01e1781b47_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-fe528b8923ccaf3ec29fc35ae94207a6_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-2c55e37995a6705dd94b96f7af1b7ee5_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-45c520a0b502bf0bfff5801523177aee_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-827c538a2826badeac957132dd47206d_720w.webp?source=1940ef5c',
  'https://pica.zhimg.com/80/v2-50e6ef96c9cfb4ad66891b23b6ec0c4f_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-e8d15e00479ae72eba988f88b94aa71b_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-c79151a0795c6542922c1be433b626c8_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-7f7ce4c8c8f0197a1cc0e34048518e26_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-f7a66328a0470f73c523e4957f48a3f5_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-39f808371dc21a064fc5900be6438f3e_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-3a7baf2bc3db376be7fd216e25a2c3d1_720w.webp?source=1940ef5c',
  'https://pica.zhimg.com/80/v2-cf663a78b57d3f0ec2519d9b6b786c60_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-dce89ae04b9a6c87d83277e8359d6973_720w.webp?source=1940ef5c',
  'https://pica.zhimg.com/80/v2-1c56872d6db7f6abb1f0ed0f217dcd8b_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-4faaf6c8394c3fec83ffd36aa182efa9_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-4aec13609438cb7333e998efe2b6320b_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-bd8a5a507821105321dbeff322fccd25_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-52165e265072bdbd871fed8a569aa124_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-7332f2c479ffcbcdd095666841cf69c9_720w.webp?source=1940ef5c',
  'https://picx.zhimg.com/80/v2-9ec71d6e870f42b2151e4cb72c4282a9_720w.webp?source=1940ef5c',
  'https://pic1.zhimg.com/80/v2-f2ababed8b41526f6a15fa01e1781b47_720w.webp?source=1940ef5c',
];

onMounted(() => {
  window.addEventListener('resize', debounce(onResize, 300));
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  previousWidth = null;
});

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.atlas-wrap {
  box-sizing: border-box;
  height: 100%;
  box-shadow: 0 0 8px 0 var(--shadow-mack);
  background-color: var(--pre-hover-bg);
  padding: 5px 0;
  margin-left: 5px;
  margin-right: 4px;

  :deep {
    .scrollbar-wrapper();
  }

  .img-list {
    margin: 0 auto;
    width: 100%;

    .img-item {
      position: relative;
      width: 100%;
      max-width: 180px;
      margin: 0.2em;
      box-shadow: 0px 2px 10px 1px rgba(0, 0, 0, 0.1);
      border-radius: 5px;

      .count {
        position: absolute;
        top: 10px;
        left: 10px;
      }

      .img {
        width: 100%;
        display: block;
        border-radius: 5px;
      }
    }
  }
}
</style>
