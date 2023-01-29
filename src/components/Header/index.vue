<!--
 * Header组件
 * @author: dnhyxc
 * @since: 2023-01-28
 * index.vue
-->
<template>
  <div class="header-wrap">
    <div class="left">left</div>
    <div class="right">
      <div
        v-for="svg in ACTION_SVGS"
        :key="svg.title"
        class="icon"
        :title="svg.title === '最大化' ? (toggle ? '还原' : svg.title) : svg.title"
        @click="onClick(svg)"
      >
        <div
          :class="`icon-text iconfont ${
            svg.title === '最大化' ? (toggle ? 'icon-3zuidahua-3' : 'icon-3zuidahua-1') : svg.icon
          }`"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ACTION_SVGS } from '@/constant';
import { ipcRenderer } from 'electron';

const toggle = ref<boolean>(false);

const onClick = (item: { title: string; svg: string }) => {
  if (item.title === '最大化') {
    toggle.value = !toggle.value;
    console.log(toggle.value, '最大化');
    ipcRenderer.send('window-max');
  }

  if (item.title === '最小化') {
    ipcRenderer.send('window-min');
  }

  if (item.title === '关闭') {
    ipcRenderer.send('window-close');
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.header-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 10px 15px;
  border: 1px solid red;
  -webkit-app-region: drag;

  .right {
    display: flex;
    align-items: center;
    .icon {
      -webkit-app-region: no-drag;
      cursor: pointer;
      .icon-text {
        margin-left: 15px;
        font-size: 18px;
      }
    }
  }
}
</style>
