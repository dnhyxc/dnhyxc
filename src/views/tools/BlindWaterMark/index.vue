<!--
 * 水印工具
 * @author: dnhyxc
 * @since: 2023-09-08
 * index.vue
-->
<template>
  <div class="watermark-wrap">
    <div class="title">
      <span class="left">图片加水印</span>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <div :class="`${checkOS() !== 'mac' && 'content-win'} content`">
      <div class="img-wrap">
        <div class="prev">
          <DragUpload v-if="!base64Url" class="drag-upload" :on-upload="onUpload">
            <template #info>
              <div class="drag-info">图片上传之后，拖动图片中的文字，可更改水印位置</div>
            </template>
          </DragUpload>
          <div class="upload-img-wrap">
            <span
              v-if="base64Url && markType === 'line'"
              ref="markTextRef"
              v-draggable.getData="getData"
              class="mark-text"
            >
              {{ markText }}
            </span>
            <img v-if="base64Url" ref="uploadImgRef" :src="watermarkUrl || base64Url" alt="" class="upload-img" />
          </div>
        </div>
      </div>
      <div class="action-list">
        <div class="setting">
          <div class="title">水印设置</div>
          <div class="mark-inp">
            <span class="label">水印文字：</span>
            <el-input v-model="markText" maxlength="20" placeholder="请输入水印文字" />
          </div>
          <div class="mark-inp">
            <span class="label">文字颜色：</span>
            <div class="color-wrap">
              <el-color-picker v-model="markColor" />
            </div>
          </div>
          <div class="mark-inp">
            <span class="label">文字大小：</span>
            <div class="color-wrap">
              <el-input-number v-model="markSize" :min="12" :max="100" />
            </div>
          </div>
          <div v-if="markType !== 'line'" class="mark-inp">
            <span class="label">多行水印垂直位置调整：</span>
            <div class="color-wrap">
              <el-input-number v-model="markOffsetTop" />
            </div>
          </div>
        </div>
        <div class="action-btns">
          <el-button class="btn" type="primary" :disabled="!base64Url" @click="addWatermark('line')"
            >设置单行水印</el-button
          >
          <el-button class="btn" type="primary" :disabled="!base64Url" @click="addWatermark('more')"
            >设置多行水印</el-button
          >
          <el-button class="btn" :disabled="!watermarkUrl" @click="onPreview">预览水印</el-button>
          <el-button class="btn" type="success" :disabled="!watermarkUrl" @click="onDownload">下载图片</el-button>
          <el-button class="btn" type="info" @click="onReset">重置</el-button>
        </div>
      </div>
    </div>
    <ImagePreview
      v-model:previewVisible="previewVisible"
      :show-water-modal="showWaterModal"
      :select-image="{ url: watermarkUrl || base64Url }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { convas2ImgAddWatermark, onDownloadFile, checkOS } from '@/utils';

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

const emit = defineEmits<Emits>();

const markTextRef = ref<HTMLDivElement | null>(null);
const uploadImgRef = ref<HTMLImageElement | null>(null);
const watermarkUrl = ref<string>('');
// 压缩前的图片路径
const base64Url = ref<string>('');
const markText = ref<string>('@dnhyxc');
const markType = ref<string>('line');
const markColor = ref<string>('#EAEAEA');
const markSize = ref<number>(20);
const markOffsetTop = ref<number>(0);
// 水印文字移动的信息
const moveInfo = ref<{ top: number; left: number }>({ top: 0, left: 0 });
// 水印初始化位置
const markInitTop = ref<string>('0');
const markInitLeft = ref<string>('0');
const previewVisible = ref<boolean>(false);

const markFontSize = computed(() => `${markSize.value}px`);

// 动态计算初始化水印文字的位置
watch(base64Url, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (!markTextRef.value) return;
      const { height, width } = uploadImgRef.value!;
      const { offsetHeight, offsetWidth } = markTextRef.value!;
      markInitTop.value = height - offsetHeight - 5 + 'px';
      markInitLeft.value = width - offsetWidth - 5 + 'px';
    });
  }
});

// 监听水印颜色、文字大小、水印文字的变化
watch([markColor, markSize, markText, markType, markOffsetTop], (newVal, oldVal) => {
  let timer = null;
  if (base64Url.value) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      addWatermark();
      if (newVal[3] !== oldVal[3] && moveInfo.value.top !== 0 && moveInfo.value.left !== 0) {
        markInitTop.value = moveInfo.value.top + 'px';
        markInitLeft.value = moveInfo.value.left + 'px';
      }
    }, 500);
  }
});

// 获取水印文字移动的位置信息
const getData = (params: { top: number; left: number }) => {
  moveInfo.value = params;
};

// 自定义上传
const onUpload = async (event: { file: Blob }) => {
  const reader = new FileReader();
  reader.onload = async (e: Event) => {
    base64Url.value = (e.target as FileReader).result as string;
  };
  reader.readAsDataURL(event.file);
};

// 图片预览
const onPreview = () => {
  previewVisible.value = true;
};

const showWaterModal = () => {
  emit('update:modalVisible', true);
};

// 图片路径转成canvas并加水印
const addWatermark = async (type?: string) => {
  type && (markType.value = type);
  const markUrl = await convas2ImgAddWatermark({
    ...moveInfo.value,
    width: uploadImgRef.value?.width as number,
    height: uploadImgRef.value?.height as number,
    imgUrl: base64Url.value,
    size: markSize.value,
    text: markText.value,
    color: markColor.value,
    markTextWidth: markTextRef.value?.offsetWidth as number,
    markTextHeight: markTextRef.value?.offsetHeight as number,
    markType: markType.value,
    markOffsetTop: markOffsetTop.value,
  });
  watermarkUrl.value = markUrl;
};

// 下载
const onDownload = () => {
  onDownloadFile({ url: watermarkUrl.value });
};

// 重置
const onReset = () => {
  base64Url.value = '';
  watermarkUrl.value = '';
  markText.value = '@dnhyxc';
  markColor.value = '#EAEAEA';
  markSize.value = 20;
  moveInfo.value = {
    top: 0,
    left: 0,
  };
  markType.value = 'line';
  markOffsetTop.value = 0;
};

// 关闭
const onClose = () => {
  emit('update:modalVisible', false);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.watermark-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 45px;
    padding: 0 10px;
    border-bottom: 1px solid var(--card-border);

    .close {
      color: var(--theme-blue);
      cursor: pointer;

      &:hover {
        color: @active;
      }
    }
  }

  .content {
    display: flex;
    justify-content: space-between;

    .img-wrap {
      flex: 1;
      background-color: var(--pre-hover-bg);

      .prev {
        display: flex;
        align-items: center;
        justify-content: center;
        height: calc(100vh - 136px);
        box-sizing: border-box;

        .upload-img-wrap {
          position: relative;

          .clickNoSelectText();
          .upload-img {
            display: block;
            width: 100%;
            height: auto;
            max-height: calc(100vh - 136px);
            margin-right: 0 !important;
            user-select: none;
            -webkit-user-drag: none;
            box-sizing: border-box;
          }

          .mark-text {
            position: absolute;
            top: v-bind(markInitTop);
            left: v-bind(markInitLeft);
            color: @fff;
            padding: 3px;
            border-radius: 5px;
            cursor: move;
            font-size: v-bind(markFontSize);
            text-align: right;
            height: v-bind(markFontSize);
            line-height: v-bind(markFontSize);
            font-family: sans-serif, Arial, Helvetica, sans-serif;
            white-space: nowrap;
            text-shadow: 0 0 0.5em var(--theme-blue), 0 0 0.2em var(--theme-blue);
          }
        }

        .drag-upload {
          width: 100%;
          height: calc(100vh - 135px);
          box-sizing: border-box;
          border-bottom-left-radius: 5px;
          padding: 0;

          &:hover {
            border: 1px dashed var(--theme-blue);
          }

          :deep {
            .el-upload-dragger {
              border: none;
              border-radius: 0;
              background-color: transparent;

              &:hover {
                background-color: var(--upload-hover-bg-color);
              }
            }
          }
        }

        .drag-info {
          color: @active;
          margin-top: 10px;
        }
      }
    }

    .action-list {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      width: 220px;
      height: calc(100% - 20px);
      background-color: var(--pre-hover-bg);
      border-left: 1px solid var(--card-border);
      padding: 10px;

      .setting {
        .title {
          font-size: 16px;
          font-weight: 700;
          color: var(--font-1);
          margin-bottom: 10px;

          .title-info {
            font-size: 12px;
          }
        }
        .mark-inp {
          display: flex;
          flex-direction: column;
          margin-bottom: 10px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            margin-bottom: 5px;
            color: var(--font-5);
          }

          .color-wrap {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .current-color {
              margin-left: 10px;
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
            }
          }
        }
      }

      .action-btns {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;

        .btn {
          flex: 1;
          margin-left: 0;
          margin-bottom: 10px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }

  .content-win {
    .img-wrap {
      .prev {
        height: calc(100vh - 128px);

        .drag-upload {
          height: calc(100vh - 128px);
        }
      }
    }
  }
}
</style>
