<!--
 * 实用工具
 * @author: dnhyxc
 * @since: 2023-05-29
 * index.vue
-->
<template>
  <Loading :loading="false" class="tools-wrap">
    <template #default>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div class="tools">
          <div class="tool-title">资源处理</div>
          <div class="tool-list">
            <ToolsCard :on-click="onCompress" />
          </div>
        </div>
      </el-scrollbar>
      <Modal v-model:modal-visible="compressVisible" />
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ToolsCard from './ToolsCard/index.vue';
import Modal from './Modal/index.vue';

// 图片压缩弹窗
const compressVisible = ref<boolean>(false);

const onCompress = () => {
  console.log('aaaaa');

  compressVisible.value = true;
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.tools-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  border-radius: 5px;
  overflow: hidden;
  box-sizing: border-box;

  :deep {
    .scrollbar-wrapper {
      box-sizing: border-box;
      border-radius: 5px;
    }
  }

  .tools {
    .tool-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 10px;
      padding: 0 5px;
    }

    .tool-list {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      box-sizing: border-box;
      width: 100%;
      height: auto;
      border-radius: 5px;
      .clickNoSelectText();
    }
  }
}
</style>
