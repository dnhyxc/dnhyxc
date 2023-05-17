<!--
 * 图片组件
 * @author: dnhyxc
 * @since: 2023-03-03
 * index.vue
-->
<template>
  <div class="image-wrap-style" @click="onClickImg">
    <img v-if="url" ref="imgRef" :src="loaded ? loadUrl : transitionImg" alt="" class="image-item" @error="onError" />
    <div v-else class="loading-img">
      <div class="loading">loading...</div>
    </div>
    <img v-for="i in urls" v-show="urls?.length! > 0" :key="i" :src="i" alt="" class="image-item" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';

const loadUrl = ref<string | undefined>('');
const loaded = ref<boolean>(false);
const imgRef = ref<HTMLImageElement | null>(null);

interface IProps {
  url: string;
  urls?: string[];
  onClick?: Function;
  transitionImg?: string;
  needColor?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  urls: () => [],
  onClick: () => {},
  transitionImg: '',
  needColor: false,
});

onMounted(() => {
  watchEffect(() => {
    loadImage();
  });
});

// 初始化图片
const loadImage = () => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const img = new Image();
  if (img.complete) {
    loaded.value = true;
    loadUrl.value = props.transitionImg;
  }
  img.onload = () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      loaded.value = true;
      loadUrl.value = props.url;
    });
  };
  img.src = props.url;
};

// 图片加载失败事件
const onError = () => {
  loadUrl.value = props.transitionImg;
};

// 点击图片
const onClickImg = () => {
  props?.onClick && props?.onClick();
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.image-wrap-style {
  box-sizing: border-box;
  width: 100%;
  height: auto;

  .image-item {
    display: block;
    height: 100%;
    width: 100%;
    .imgStyle();
  }
}
</style>
