<!--
 * 图片组件
 * @author: dnhyxc
 * @since: 2023-03-03
 * index.vue
-->
<template>
  <div class="image-wrap-style" @click="onClickImg">
    <img v-if="url" :src="loaded ? loadUrl : transitionImg" alt="" class="image-item" />
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

interface IProps {
  url: string;
  urls?: string[];
  onClick?: Function;
  transitionImg?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  urls: () => [],
  onClick: () => {},
  transitionImg: '',
});

onMounted(() => {
  watchEffect(() => {
    loadImage();
  });
});

// 初始化图片
const loadImage = () => {
  let timer: any = null;
  const img = new window.Image();
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

// 点击图片
const onClickImg = () => {
  console.log('dianjitupian');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.image-wrap-style {
  width: 100%;
  height: auto;

  .image-item {
    height: 100%;
    width: 100%;
    .imgStyle();
  }
}
</style>
