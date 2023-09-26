<!--
 * 异步组件loading
 * @author: dnhyxc
 * @since: 2023-09-25
 * index.vue
-->
<template>
  <div class="async-loading">
    <div class="loader-wrapper">
      <div class="loader"></div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="less">
@import '@/styles/index.less';

.async-loading {
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: 5px;

  .loader-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
    height: 100%;
    background-size: 200% 200%;
    animation: bgmove 5s infinite;
    border-radius: 5px;

    .loader {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: var(--theme-blue);
      animation: spin 2s linear infinite;
      z-index: 99;

      &::before {
        content: '';
        position: absolute;
        top: 5px;
        left: 5px;
        right: 5px;
        bottom: 5px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: var(--theme-blue);
        animation: spin 3s linear infinite;
      }

      &::after {
        content: '';
        position: absolute;
        top: 15px;
        left: 15px;
        right: 15px;
        bottom: 15px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: var(--theme-blue);
        animation: spin 1.5s linear infinite;
      }
    }
  }
}

@-webkit-keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes bgmove {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}
</style>
