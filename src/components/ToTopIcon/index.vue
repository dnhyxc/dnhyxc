<!--
 * 滚动置顶图标
 * @author: dnhyxc
 * @since: 2023-02-09
 * index.vue
-->
<template>
  <div class="to-top" @click="onScroll">
    <i class="to-icon iconfont icon-huojian"></i>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  onScrollTo: Function;
}

const props = withDefaults(defineProps<IProps>(), {
  onScrollTo: () => {},
});

const onScroll = () => {
  props.onScrollTo();
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.to-top {
  position: absolute;
  right: 10px;
  bottom: 10px;
  // background-color: rgba(225, 225, 225, 0.1);
  box-shadow: 0 0 10px @theme-blue;
  padding: 5px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 999;

  .to-icon {
    font-size: 30px;
    color: @active;
    .textLg();
  }
}
</style>
