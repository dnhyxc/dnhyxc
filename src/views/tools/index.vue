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
      <Modal
        v-model:modal-visible="compressVisible"
        v-model:previewVisible="previewVisible"
        v-model:previewUrls="previewUrls"
      />
      <el-dialog v-model="previewVisible" draggable align-center title="图片预览" width="80%" @close="onClose">
        <div class="preview-dialog">
          <el-scrollbar class="scroll-wrap" max-height="75vh">
            <div v-if="previewUrls?.[1]" class="after">压缩后图片预览</div>
            <el-image v-if="previewUrls?.[1]" class="prew-img" :src="previewUrls?.[1]">
              <template #placeholder>
                <div class="image-slot">Loading...</div>
              </template>
              <template #error>
                <div class="image-slot">图片加载失败</div>
              </template>
            </el-image>
            <div v-if="previewUrls?.[0]" class="before">压缩前图片预览</div>
            <el-image v-if="previewUrls?.[0]" class="prew-img" :src="previewUrls?.[0]">
              <template #placeholder>
                <div class="image-slot">Loading...</div>
              </template>
              <template #error>
                <div class="image-slot">图片加载失败</div>
              </template>
            </el-image>
          </el-scrollbar>
        </div>
      </el-dialog>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ToolsCard from './ToolsCard/index.vue';
import Modal from './Modal/index.vue';

// 图片压缩弹窗
const compressVisible = ref<boolean>(false);
// 图片预览弹窗
const previewVisible = ref<boolean>(false);
// 预览图片
const previewUrls = ref<string[]>([]);

const onCompress = () => {
  compressVisible.value = true;
};

// 关闭预览弹窗
const onClose = () => {
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

    .el-dialog__body {
      padding: 10px 20px 20px;
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

  .preview-dialog {
    .before,
    .after {
      color: var(--font-1);
      text-align: left;
      margin-bottom: 10px;
      font-size: 16px;
      font-weight: 700;
    }

    .before {
      margin-top: 20px;
    }

    .prew-img {
      display: block;
      border-radius: 5px;
    }
  }
}
</style>
