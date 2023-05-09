<!--
 * 登录页
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="login">
    <div class="header" />
    <component :is="currentDom.dom" @switch-dom="switchDom"></component>
  </div>
</template>

<script setup lang="ts">
import { reactive, markRaw } from 'vue';
import Login from './Login/index.vue';
import Reset from './Reset/index.vue';

type domType = {
  name: string;
  dom: any;
};

type Dom = Pick<domType, 'dom'>;

const domList = reactive<domType[]>([
  {
    name: 'Login',
    dom: markRaw(Login),
  },
  {
    name: 'Reset',
    dom: markRaw(Reset),
  },
]);

// 当前显示组件
const currentDom = reactive<Dom>({
  dom: domList[0].dom,
});

// 切换组件
const switchDom = (type: string) => {
  currentDom.dom = type === 'Login' ? domList[0].dom : domList[1].dom;
};
</script>

<style lang="less" scoped>
@import '@/styles/index.less';

.login {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--font-1);
  background: rgba(0, 0, 0, 0.1);

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-image: url('@/assets/images/cywl.jpg');
    background-position: center;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .header {
    position: absolute;
    top: 0;
    left: 0;
    height: 35px;
    width: 100%;
    padding: 10px 18px 10px 12px;
    -webkit-app-region: drag;
  }
}
</style>
