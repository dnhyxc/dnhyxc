<!--
 * 文章列表
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="home-wrap">
    <div class="carousel-wrap">
      <Carousel />
    </div>
    <div class="list-wrap">
      <div class="list-item">文章列表</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Carousel from '@/components/Carousel/index.vue';
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.home-wrap {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
  height: 100%;
  .list-wrap {
    height: calc(100% - 240px);
    overflow: auto;

    .list-item {
      height: 2000px;
    }
  }
}
</style>
