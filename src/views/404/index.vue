<!--
 * 404
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="not-found-wrap">
    <div class="header" />
    <div class="number">404</div>
    <div class="back" @click="backHome">返回首页</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// 返回首页
const backHome = () => {
  router.push('/home');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.not-found-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  flex-direction: column;
  background: url('@/assets/images/404.webp');
  height: 100%;
  background-size: cover;
  background-repeat: repeat;
  background-position: center;

  .header {
    position: absolute;
    top: 0;
    left: 0;
    height: 35px;
    width: 100%;
    padding: 10px 18px 10px 12px;
    -webkit-app-region: drag;
  }

  .number {
    position: absolute;
    top: 10%;
    left: 20%;
    font-size: 1000%;
    font-weight: 700;
    display: inline-block;
    .textLg();
  }

  .back {
    position: absolute;
    bottom: 20%;
    right: 20%;
    font-size: 25px;
    font-weight: 700;
    color: @theme-blue;
    cursor: pointer;
    text-shadow: 0 0 0.5em #e0c3fc, 0 0 0.2em #d7fffe;
  }
}
</style>
