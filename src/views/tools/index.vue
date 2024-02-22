<!--
 * 实用工具
 * @author: dnhyxc
 * @since: 2023-05-29
 * index.vue
-->
<template>
  <Loading :loading="toolsStore.loading" :class="`tools-wrap ${visible && 'board-wrap'}`">
    <template #default>
      <Cropper v-if="cropperVisible" v-model:modal-visible="cropperVisible" />
      <DrawBoard v-if="boardVisible" v-model:board-visible="boardVisible" />
      <TextToSpeech v-if="convertVisible" v-model:modal-visible="convertVisible" />
      <Watermark v-if="watermarkVisible" v-model:modal-visible="watermarkVisible" />
      <Compress v-if="compressVisible" v-model:modal-visible="compressVisible" />
      <CodeRun v-if="codeRunVisible" v-model:modal-visible="codeRunVisible" />
      <EpubPreview v-if="epubVisible" v-model:modal-visible="epubVisible" />
      <PdfPreview v-if="pdfVisible" v-model:modal-visible="pdfVisible" />
      <Transcribe v-if="transcribeVisible" v-model:modal-visible="transcribeVisible" />
      <Unknown v-if="unknownVisible" v-model:modal-visible="unknownVisible" />
      <div v-if="!visible" class="navs-wrap">
        <div class="tools">
          <div>
            <div class="tool-title">资源处理</div>
            <div class="tool-list">
              <NavCard v-for="item in TOOL_LIST" :key="item.id" :data="item" :on-click="() => onClickNavIcon(item)" />
            </div>
          </div>
          <Links :on-click-nav-icon="onClickNavIcon" />
        </div>
      </div>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { shell } from 'electron';
import { onMounted, ref, computed } from 'vue';
import { TOOL_LIST } from '@/constant';
import { toolsStore } from '@/store';
import { ToolsItem } from '@/typings/common';
import Compress from './Compress/index.vue';
import Cropper from './Cropper/index.vue';
import TextToSpeech from './TextToSpeech/index.vue';
import NavCard from './NavCard/index.vue';
import Watermark from './Watermark/index.vue';
import DrawBoard from './DrawBoard/index.vue';
import CodeRun from './CodeRun/index.vue';
import Links from './Links/index.vue';
import EpubPreview from './EpubPreview/index.vue';
import PdfPreview from './PdfPreview/index.vue';
import Transcribe from './Transcribe/index.vue';
import Unknown from './Unknown/index.vue';

// 图片压缩弹窗
const compressVisible = ref<boolean>(false);
// 图片裁剪弹窗
const cropperVisible = ref<boolean>(false);
// 文本转语音弹窗
const convertVisible = ref<boolean>(false);
// 文本转语音弹窗
const watermarkVisible = ref<boolean>(false);
// 是否显示画板
const boardVisible = ref<boolean>(false);
// 是否显示代码测试
const codeRunVisible = ref<boolean>(false);
// 是否显示电子书
const epubVisible = ref<boolean>(false);
// 是否显示pdf预览
const pdfVisible = ref<boolean>(false);
// 是否显示屏幕录制
const transcribeVisible = ref<boolean>(false);
// 是否显示百度翻译
const unknownVisible = ref<boolean>(false);

onMounted(() => {
  // 获取工具列表
  toolsStore.getToolList();
});

const visible = computed(() => {
  return (
    boardVisible.value ||
    convertVisible.value ||
    cropperVisible.value ||
    watermarkVisible.value ||
    compressVisible.value ||
    codeRunVisible.value ||
    epubVisible.value ||
    pdfVisible.value ||
    transcribeVisible.value ||
    unknownVisible.value
  );
});

// 显示图片压缩
const showCompress = (item: ToolsItem) => {
  compressVisible.value = true;
};

// 显示图片裁剪
const showCropper = (item: ToolsItem) => {
  cropperVisible.value = true;
};

// 显示文字转语音
const onTextToSpeech = (item: ToolsItem) => {
  convertVisible.value = true;
};

// 添加水印
const onAddwatermark = (item: ToolsItem) => {
  watermarkVisible.value = true;
};

// 浏览器打开链接
const openWithBrowser = (item: ToolsItem) => {
  shell.openExternal(item.toolHref!);
};

// 跳转至画板
const toDrawBoard = () => {
  boardVisible.value = true;
};

// 跳转至代码运行
const showCodeRun = () => {
  codeRunVisible.value = true;
};

// 查看电子书
const showEpub = () => {
  epubVisible.value = true;
};

// 查看pdf
const showPdf = () => {
  pdfVisible.value = true;
};

// 显示屏幕录制
const showTranscribe = () => {
  transcribeVisible.value = true;
};

// 显示未知页
const showUnknown = () => {
  unknownVisible.value = true;
};

// 策略模式实现点击每个nav card的效果
const onClickNavIcon = (item: ToolsItem) => {
  const actions = {
    compress: showCompress,
    cropper: showCropper,
    textToSpeech: onTextToSpeech,
    watermark: onAddwatermark,
    tool: openWithBrowser,
    board: toDrawBoard,
    codeRun: showCodeRun,
    epub: showEpub,
    pdf: showPdf,
    transcribe: showTranscribe,
    unknown: showUnknown,
  };
  actions[item.key](item);
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

  .navs-wrap {
    height: 100%;
    box-sizing: border-box;

    .tools {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      height: 100%;

      .tool-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 10px;
        padding: 0 5px;
        color: var(--font-1);
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
        margin-bottom: 20px;
      }
    }
  }

  :deep {
    .scrollbar-wrapper {
      box-sizing: border-box;
      border-radius: 5px;
    }

    .el-dialog__body {
      padding: 10px 20px 20px;
    }

    .el-color-picker {
      flex: 1;
    }
    .el-color-picker__trigger {
      width: 100%;
      border: 1px solid var(--card-border);
      padding: 0;
    }

    .el-input__wrapper {
      color: var(--font-1);
      background-color: var(--input-bg-color);
    }

    .el-input__inner {
      color: var(--font-1);
      background-color: transparent;
    }

    .el-color-picker__color {
      border: none;
    }

    .el-color-picker__color-inner {
      border-radius: 4px;
    }

    .el-color-picker__icon {
      color: var(--font-1);
    }

    .el-input-number {
      width: 100%;
    }

    .el-switch__label {
      color: var(--font-5);
    }

    .el-switch__label.is-active {
      color: var(--theme-blue);
    }
  }
}

.board-wrap {
  margin-left: 5px;
  width: calc(100% - 9px);
  box-shadow: 0 0 8px 0 var(--shadow-mack);
  background-color: var(--pre-hover-bg);
}
</style>
