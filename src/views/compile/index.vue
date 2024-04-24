<!--
 * 代码调试
 * @author: dnhyxc
 * @since: 2024-03-15
 * index.vue
-->
<template>
  <div class="compile-wrap">
    <div class="container">
      <div :class="`${checkOS() === 'mac' && 'mac-header-wrap'} header-wrap`" @dblclick="onDblclick">
        <div :class="`left ${checkOS() === 'mac' && 'mac-left'}`">
          <div class="icon-wrap">
            <i class="page-icon iconfont icon-haidao_" />
          </div>
          <div class="title">{{ title }}</div>
        </div>
        <div class="right">
          <div class="sticky">
            <el-tooltip effect="light" content="置顶" placement="bottom" popper-class="custom-dropdown-styles">
              <i
                :class="`${articleStore.stickyStatus && 'active'} font iconfont ${
                  checkOS() === 'mac' ? 'icon-pin-full' : 'icon-pin1'
                }`"
                @click="onSticky"
              />
            </el-tooltip>
          </div>
          <span v-if="checkOS() === 'mac'" class="mac-tool-title">{{ title }}</span>
          <div v-if="checkOS() !== 'mac'" class="page-actions">
            <div v-for="svg in ACTION_SVGS" :key="svg.title" class="icon" @click="onClick(svg)">
              <el-tooltip
                effect="light"
                :content="svg.title === '最大化' ? (toggle ? '还原' : svg.title) : svg.title"
                placement="bottom"
                popper-class="custom-dropdown-styles"
              >
                <div
                  :class="`icon-text iconfont ${
                    svg.title === '最大化' ? (toggle ? 'icon-3zuidahua-3' : 'icon-3zuidahua-1') : svg.icon
                  }`"
                />
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
      <div :class="`${checkOS() === 'mac' && 'mac-content-wrap'} content-wrap`">
        <Compress v-if="route.query?.from === 'tools_compress' && userId" hide-header />
        <Cropper v-if="route.query?.from === 'tools_cropper' && userId" hide-header />
        <CodeRun v-if="route.query?.from === 'tools_codeRun' && userId" hide-header />
        <TextToSpeech v-if="route.query?.from === 'tools_textToSpeech' && userId" hide-header />
        <Watermark v-if="route.query?.from === 'tools_watermark' && userId" hide-header />
        <DrawBoard v-if="route.query?.from === 'tools_board' && userId" hide-header />
        <Transcribe v-if="route.query?.from === 'tools_transcribe' && userId" hide-header />
        <WordPreview v-if="route.query?.from === 'tools_word' && userId" hide-header />
        <PdfPreview v-if="route.query?.from === 'tools_pdf' && userId" hide-header />
        <EpubPreview v-if="route.query?.from === 'tools_epub' && userId" hide-header />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { onMounted, nextTick, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { articleStore, bookStore, commonStore } from '@/store';
import { checkOS, locSetItem, ipcRenderers, Message, modifyTheme } from '@/utils';
import { ACTION_SVGS, TOOL_LIST } from '@/constant';
import Compress from '@/views/tools/Compress/index.vue';
import Cropper from '@/views/tools/Cropper/index.vue';
import TextToSpeech from '@/views/tools/TextToSpeech/index.vue';
import Watermark from '@/views/tools/Watermark/index.vue';
import DrawBoard from '@/views/tools/DrawBoard/index.vue';
import CodeRun from '@/views/tools/CodeRun/index.vue';
import EpubPreview from '@/views/tools/EpubPreview/index.vue';
import PdfPreview from '@/views/tools/PdfPreview/index.vue';
import Transcribe from '@/views/tools/Transcribe/index.vue';
import WordPreview from '@/views/tools/WordPreview/index.vue';

const route = useRoute();

// 窗口大小控制状态
const toggle = ref<boolean>(false);
const userId = ref<string>('');

const title = computed(() => {
  return TOOL_LIST.find((i) => route.query?.from!.includes(i.id))?.toolName;
});

onMounted(() => {
  nextTick(() => {
    // 判断页面是否加载完成
    commonStore.updatePageLoadStatus();
  });

  // 监听更换主题
  ipcRenderer.on('set-theme', (_, theme) => {
    modifyTheme(theme);
  });

  // 渲染进程监听窗口是否最大化
  ipcRenderer.on('newWin-max', (_, status) => {
    toggle.value = status;
  });

  // 登录或者退出时刷新页面
  ipcRenderer.invoke('userInfo', route.query?.from);

  // 接受主进程传送的用户信息
  ipcRenderer.once('userInfo', (_, data) => {
    const info = data && JSON.parse(data);
    if (info.token) {
      locSetItem('userInfo', JSON.stringify(info.userInfo));
      locSetItem('token', info.token);
      userId.value = info.userInfo.userId;
    }
  });
});

// 置顶
const onSticky = () => {
  articleStore.stickyStatus = !articleStore.stickyStatus;
  ipcRenderers.sendNewWinSticky(articleStore.stickyStatus, route.query?.from as string);
};

// 双击放大窗口
const onDblclick = () => {
  const { id } = route.params;
  toggle.value = !toggle.value;
  ipcRenderers.sendNewWinMax(id as string);
};

// 点击右侧窗口控制按钮
const onClick = async (item: { title: string; svg: string }) => {
  if (item.title === '最大化') {
    toggle.value = !toggle.value;
    ipcRenderers.sendNewWinMax(route.query?.from as string);
  }

  if (item.title === '最小化') {
    ipcRenderers.sendNewWinMin(route.query?.from as string);
  }

  if (item.title === '关闭') {
    if (route.query?.from === 'tools_epub') {
      new Promise((resolve) => {
        bookStore.epubInfo.createRecord(true);
        bookStore.epubInfo.onAbort();
        resolve(1);
      }).then(() => {
        ipcRenderers.sendNewWinOut(route.query?.from as string);
      });
    } else if (route.query?.from === 'tools_pdf') {
      const { loading, iframeUrl, onAbort } = bookStore.pdfInfo;

      if (iframeUrl && !loading) {
        try {
          const res = await Message('', '是否保存阅读记录后再离开？', 'info');
          if (res === 'confirm') {
            bookStore.pdfInfo.addTagVisible = true;
            bookStore.pdfInfo.canClose = false;
          }
        } catch (error) {
          // 页面关闭时停止加载资源
          onAbort?.();
          ipcRenderers.sendNewWinOut(route.query?.from as string);
        }
      } else {
        // 页面关闭时停止加载资源
        onAbort?.();
        ipcRenderers.sendNewWinOut(route.query?.from as string);
      }
    } else {
      ipcRenderers.sendNewWinOut(route.query?.from as string);
    }
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.compile-wrap {
  display: flex;
  justify-content: center;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  background-image: var(--bg-image-url);
  background-position: var(--bg-position);
  background-repeat: var(--bg-repeat);
  background-size: var(--bg-img-size);
  animation: var(--bg-animation);
  .bgKeyframes(bgmove);

  .container {
    height: 100%;
    backdrop-filter: var(--backdrop-filter);

    .header-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 55px;
      padding: 0 16px 0 16px;
      -webkit-app-region: drag;
      .clickNoSelectText;

      .left {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        color: var(--font-1);

        .icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;

          .page-icon {
            display: inline-block;
            min-height: 40px;
            line-height: 40px;
            font-size: 35px;
            margin-bottom: 2px;
            margin-right: 20px;
            color: var(--theme-blue);
            cursor: pointer;
            -webkit-app-region: no-drag;
            .textLg();
          }
        }

        .title {
          font-size: 18px;
          font-weight: 700;
          color: var(--font-color);
          .headerTextLg();
        }
      }

      .right {
        display: flex;
        align-items: center;
        color: var(--font-1);

        .sticky {
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-app-region: no-drag;

          .font {
            font-size: 16px;
            cursor: pointer;
            margin-left: 15px;
            margin-top: 2px;
            color: var(--font-color);
            font-weight: var(--font-weight);
            .headerTextLg();
          }

          .active {
            color: var(--theme-blue);
          }
        }

        .mac-tool-title {
          font-size: 16px;
          font-weight: 700;
          height: 35px;
          line-height: 32px;
          margin-left: 19px;
          color: var(--font-color);
          .headerTextLg();
        }

        .page-actions {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
        }

        .icon {
          -webkit-app-region: no-drag;
          cursor: pointer;
          color: var(--font-color);
          font-weight: var(--font-weight);
          .headerTextLg();

          .icon-text {
            margin-left: 15px;
            font-size: 16px;
          }
        }
      }

      .dl-content {
        .actions {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding-left: 20px;
        }

        .radio-close {
          padding: 0;
          margin-left: 0;
          margin-top: 20px;
          font-size: 16px;

          .font {
            margin-right: 10px;
            color: var(--theme-blue);
          }

          .out-icon {
            color: @font-warning;
          }
        }
      }
    }

    .mac-header-wrap {
      position: relative;
      display: flex;
      justify-content: start;
      align-items: flex-start;
      height: 35px;
      padding: 0 5px 0 68px;
      box-sizing: border-box;

      .mac-left {
        display: none;
      }

      .right {
        position: relative;

        .sticky {
          position: absolute;
          top: 8px;
          left: 0;
          width: 12px;
          height: 12px;
          border-radius: 12px;
          background-color: @yellow-1;

          &:hover {
            .font {
              display: inline-block;
            }
          }

          .font {
            font-size: 10px;
            margin: auto;
            display: none;

            &:hover {
              color: var(--active);
            }
          }

          .active {
            display: inline-block;
          }
        }
      }
    }

    .content-wrap {
      display: flex;
      justify-content: center;
      box-sizing: border-box;
      height: calc(100% - 55px);

      .content {
        position: relative;
        flex: 1;
        display: flex;
        justify-content: center;
        box-sizing: border-box;
        margin-right: 10px;
        height: calc(100vh - 76px);
        border-radius: 5px;
        box-shadow: 0 0 5px 0 var(--card-shadow);
        background-color: var(--pre-hover-bg);

        :deep {
          .el-scrollbar {
            border-radius: 5px;
            width: 100%;
          }

          .scrollbar-wrapper {
            box-sizing: border-box;
            height: 100%;
            border-radius: 5px;
          }
        }

        .preview-content {
          :deep {
            .vuepress-markdown-body {
              max-width: calc(100vw - 308px);
            }
          }
        }
      }

      .mac-content {
        height: calc(100vh - 98px);
      }

      .right {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        max-width: 260px;
        width: 30%;
        box-sizing: border-box;
        border-radius: 5px;
        max-height: calc(100vh - 76px);

        .toc-list {
          box-sizing: border-box;
          flex: 1;
          background-color: var(--pre-hover-bg);
        }

        & > :last-child {
          margin-bottom: 0;
        }
      }

      .mac-right {
        max-height: calc(100vh - 93px);
      }
    }

    .mac-content-wrap {
      height: calc(100% - 34px);
      // height: calc(100% - 95px);

      :deep {
        .drag-upload-mac {
          height: calc(100vh - 86px);
        }
      }
    }
  }

  :deep {
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
</style>
