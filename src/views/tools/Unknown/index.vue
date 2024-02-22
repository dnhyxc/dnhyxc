<!--
 * 百度翻译
 * @author: dnhyxc
 * @since: 2024-01-22
 * index.vue
-->
<template>
  <div class="translate-wrap">
    <div class="header">
      <div class="left">
        <span class="title">求知</span>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <div class="content">
      <iframe src="https://chat18.aichatos.xyz/" width="100%" height="100%" frameborder="0" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  modalVisible: boolean;
}

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

defineProps<IProps>();

const emit = defineEmits<Emits>();

// 关闭屏幕录制页面
const onClose = () => {
  emit('update:modalVisible', false);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.translate-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 18px;
    height: 45px;
    min-height: 45px;
    padding: 0 10px;
    border-bottom: 1px solid var(--card-border);
    box-sizing: border-box;
    color: var(--font-1);

    .left {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    .close {
      color: var(--theme-blue);
      font-size: 16px;
      cursor: pointer;

      &:hover {
        color: @active;
      }
    }
  }

  .content {
    flex: 1;
    background-color: @fff;
  }
}
</style>
