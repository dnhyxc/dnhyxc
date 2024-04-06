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
      <WordPreview v-if="wordVisible" v-model:modal-visible="wordVisible" />
      <div v-if="!visible" class="navs-wrap">
        <div class="tools">
          <div class="tool-list-wrap">
            <div class="tool-title">资源处理</div>
            <div class="tool-list">
              <ContextMenu
                v-for="item in TOOL_LIST"
                :key="item.id"
                class="block"
                :menu="CARD_CONTEXT_MENU"
                @select="(e) => onSelectMenu(e, item)"
              >
                <NavCard :data="item" :on-click="() => onClickNavIcon(item)" />
              </ContextMenu>
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
import { TOOL_LIST, CARD_CONTEXT_MENU } from '@/constant';
import { toolsStore, loginStore } from '@/store';
import { ToolsItem } from '@/typings/common';
import { ipcRenderers } from '@/utils';
import ContextMenu from '@/components/ContextMenu/index.vue';
import Loading from '@/components/Loading/index.vue';
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
import WordPreview from './WordPreview/index.vue';

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
const wordVisible = ref<boolean>(false);

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
    wordVisible.value
  );
});

// 选中菜单
const onSelectMenu = (menu: { label: string; value: number }, item: ToolsItem) => {
  if (menu.value === 1) {
    const { userInfo, token } = loginStore;
    ipcRenderers.sendNewWin({
      path: `compile?from=tools_${item.id}`,
      id: `tools_${item.id}`,
      userInfo: JSON.stringify({ userInfo, token }),
    });
  } else {
    onClickNavIcon(item);
  }
};

// 显示图片压缩
const showCompress = () => {
  compressVisible.value = true;
};

// 显示图片裁剪
const showCropper = () => {
  cropperVisible.value = true;
};

// 显示文字转语音
const onTextToSpeech = () => {
  convertVisible.value = true;
};

// 添加水印
const onAddWatermark = () => {
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
const showWord = () => {
  wordVisible.value = true;
};

// 策略模式实现点击每个nav card的效果
const onClickNavIcon = (item: ToolsItem) => {
  const actions = {
    compress: showCompress,
    cropper: showCropper,
    textToSpeech: onTextToSpeech,
    watermark: onAddWatermark,
    tool: openWithBrowser,
    board: toDrawBoard,
    codeRun: showCodeRun,
    epub: showEpub,
    pdf: showPdf,
    transcribe: showTranscribe,
    word: showWord,
  };
  actions[item.key](item);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.tools-wrap {
  display: flex;
  flex-direction: column;
  height: calc(100% - 8px);
  margin-top: 2px;
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

      .tool-list-wrap {
        .block {
          border-radius: 5px;
          box-sizing: border-box;
          width: 10%;
        }

        .tool-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 10px;
          padding: 2px 5px 0;
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
  margin: 8px 5px 0;
  box-shadow: 0 0 8px 0 var(--shadow-mack);
  background-color: var(--pre-hover-bg);
}
</style>
