<!--
 * 工具卡片
 * @author: dnhyxc
 * @since: 2023-05-29
 * index.vue
-->
<template>
  <div class="card" @click="onClick">
    <div class="compress-item">
      <div class="left">
        <i class="icon iconfont icon-yasuo" />
        <span class="tool-name">图片压缩</span>
      </div>
      <div class="right">
        <span class="desc">可压缩 jpg、png、jpeg、webp 格式的图片</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  onClick: () => void;
}

const props = defineProps<IProps>();

// 卡片点击事件
const onClick = () => {
  props?.onClick();
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.card {
  box-sizing: border-box;
  width: 25%;
  padding: 5px;

  .compress-item {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    border-radius: 5px;
    height: 100px;
    padding: 5px;
    box-shadow: 0 0 5px 0 var(--shadow-mack);
    cursor: pointer;
    overflow: hidden;

    .left {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      width: 65px;
      min-width: 65px;
      transition: transform 0.2s ease-in-out;
      .textLg();

      .icon {
        font-size: 38px;
      }

      .tool-name {
        font-size: 15px;
        margin-top: 10px;
      }
    }

    .right {
      width: calc(100% - 65px);
      font-size: 14px;
      margin-left: 10px;
      .ellipsisMore(4);
      transition: transform 0.3s ease-in-out;
      color: var(--font-1);
    }

    &:hover {
      .left {
        position: absolute;
        transform: translateX(-70px);
        transition: transform 0.2s ease-in-out;
      }

      .right {
        position: absolute;
        transform: translateX(-8px);
        width: 95%;
        transition: transform 0.3s ease-in-out;
      }
    }
  }

  &:nth-child(odd) {
    .compress-item {
      background-image: linear-gradient(-225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
    }
  }

  &:nth-child(even) {
    .compress-item {
      background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
    }
  }
}
</style>
