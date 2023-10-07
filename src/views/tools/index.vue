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
      <div v-if="!visible">
        <div class="tools">
          <div class="tool-title">资源处理</div>
          <div class="tool-list">
            <NavCard v-for="item in TOOL_LIST" :key="item.id" :data="item" :on-click="() => onClickNavIcon(item)" />
          </div>
          <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
            <div class="tools">
              <div class="tool-title">
                前端编程导航
                <div class="sort">
                  <el-button type="primary" link @click="onSort">{{ enabled ? '关闭排序' : '开启排序' }}</el-button>
                  <el-button v-show="enabled" type="primary" link @click="onSaveSort">保存排序</el-button>
                </div>
              </div>
              <draggable
                v-model="toolsStore.toolList"
                item-key="id"
                draggable=".item"
                class="navigation-list"
                ghost-class="ghost"
                :disabled="!enabled"
              >
                <template #item="{ element }">
                  <div class="item" @click="onClickNavIcon({ ...element, key: 'tool' })">
                    <div class="navigation-item">
                      <div class="item-top">
                        <Image :url="element?.toolUrl || TOOL_SVG" :transition-img="TOOL_SVG" class="prew-img" />
                      </div>
                      <el-tooltip effect="light" :content="element?.toolName" placement="bottom" :enterable="false">
                        <div class="item-bottom">{{ element?.toolName }}</div>
                      </el-tooltip>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { shell } from 'electron';
import { onMounted, ref, computed } from 'vue';
import draggable from 'vuedraggable';
import { TOOL_LIST, TOOL_SVG } from '@/constant';
import { toolsStore } from '@/store';
import { useGetRouteAuthInfo } from '@/hooks';
import { ToolsItem } from '@/typings/common';
import Compress from './Compress/index.vue';
import Cropper from './Cropper/index.vue';
import TextToSpeech from './TextToSpeech/index.vue';
import NavCard from './NavCard/index.vue';
import Watermark from './Watermark/index.vue';
import DrawBoard from './DrawBoard/index.vue';
import CodeRun from './CodeRun/index.vue';

// 图片压缩弹窗
const compressVisible = ref<boolean>(false);
// 图片裁剪弹窗
const cropperVisible = ref<boolean>(false);
// 文本转语音弹窗
const convertVisible = ref<boolean>(false);
// 文本转语音弹窗
const watermarkVisible = ref<boolean>(false);
// 控制是否开启排序
const enabled = ref<boolean>(false);
// 是否显示画板
const boardVisible = ref<boolean>(false);
// 是否显示代码测试
const codeRunVisible = ref<boolean>(false);

// 判断是否有路由权限
useGetRouteAuthInfo();

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
    codeRunVisible.value
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
  };
  actions[item.key](item);
};

// 开启排序
const onSort = () => {
  enabled.value = !enabled.value;
};

// 保存排序
const onSaveSort = () => {
  const params = toolsStore.toolList.map((i, index) => {
    return {
      sort: index + 1,
      id: i.id,
    };
  });
  toolsStore.createToolSort({
    sortInfo: params,
  });
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
      display: flex;
      justify-content: space-between;
      align-items: center;
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

      .ghost {
        opacity: 0.3;
        background: var(--theme-blue);
        border-radius: 5px;
      }

      .item {
        box-sizing: border-box;
        width: 10%;
        padding: 5px;

        .navigation-item {
          box-shadow: 0 0 5px 0 var(--shadow-mack);
          cursor: pointer;
          overflow: hidden;
          border-radius: 5px;
          background-color: var(--pre-hover-bg);

          .item-top {
            padding: 5px;

            .prew-img {
              display: block;

              :deep {
                .image-item {
                  max-height: 80px;
                  border-radius: 5px;
                }
              }
            }
          }

          .item-bottom {
            text-align: center;
            padding: 0 5px 6px;
            .ellipsis();
            color: var(--font-1);
          }
        }

        &:hover {
          .navigation-item {
            box-shadow: 0 0 5px 0 var(--theme-blue);
          }
        }
      }
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
