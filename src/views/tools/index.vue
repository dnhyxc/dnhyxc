<!--
 * 实用工具
 * @author: dnhyxc
 * @since: 2023-05-29
 * index.vue
-->
<template>
  <Loading :loading="toolsStore.loading" class="tools-wrap">
    <template #default>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div class="tools">
          <div class="tool-title">资源处理</div>
          <div class="tool-list">
            <NavCard
              v-for="item in [{ toolName: '图片压缩', id: `${Math.random()}`, toolUrl: COMPRESS_SVG }]"
              :key="item.id"
              :data="item"
              :on-click="() => onClickNavIcon(item)"
            >
            </NavCard>
          </div>
        </div>
        <div class="tools">
          <div class="tool-title">前端编程导航</div>
          <div class="navigation-list">
            <NavCard
              v-for="item in toolsStore.toolList"
              :key="item.id"
              :data="item"
              :on-click="() => onClickNavIcon(item)"
            />
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
            <el-image v-if="previewUrls?.[1]" class="prew-img prev-after-img" :src="previewUrls?.[1]">
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
import { shell } from 'electron';
import { onMounted, ref } from 'vue';
import { COMPRESS_SVG } from '@/constant';
import { toolsStore } from '@/store';
import { ToolsItem } from '@/typings/common';
import Modal from './Modal/index.vue';
import NavCard from './NavCard/index.vue';

// 图片压缩弹窗
const compressVisible = ref<boolean>(false);
// 图片预览弹窗
const previewVisible = ref<boolean>(false);
// 预览图片
const previewUrls = ref<string[]>([]);

onMounted(() => {
  // 获取工具列表
  toolsStore.getToolList();
});

// 点击导航图标
const onClickNavIcon = (item: ToolsItem) => {
  if (item?.toolHref) {
    shell.openExternal(item.toolHref);
  } else {
    compressVisible.value = true;
  }
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
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 10px;
      padding: 0 5px;
      color: var(--font-1);
    }

    .tool-list,
    .navigation-list {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      box-sizing: border-box;
      width: 100%;
      height: auto;
      border-radius: 5px;
      .clickNoSelectText();
      margin-bottom: 20px;
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

    .prew-img {
      display: block;
      border-radius: 5px;
      width: 100%;
      height: auto;

      .image-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: var(--font-1);
      }
    }

    .prev-after-img {
      margin-bottom: 20px;
    }
  }
}
</style>
