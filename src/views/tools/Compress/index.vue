<!--
 * 图片压缩弹窗
 * @author: dnhyxc
 * @since: 2023-05-29
 * index.vue
-->
<template>
  <div class="compress-wrap">
    <div class="content">
      <div class="header">
        <div class="left">
          <span>图片压缩</span>
          <span class="left-action">
            <el-switch
              v-model="imgFrom"
              size="small"
              style="--el-switch-off-color: var(--theme-blue); --el-switch-on-color: var(--active)"
              active-text="在线图片"
              inactive-text="本地图片"
            />
          </span>
        </div>
        <span class="close" @click="onClose">关闭</span>
      </div>
      <el-scrollbar ref="scrollRef" max-height="calc(100vh - 182px)" wrap-class="scrollbar-wrapper">
        <DragUpload v-if="!imgFrom" class="compress-upload" :on-upload="onUpload" />
        <OnlineImage v-else :on-use-online-url="onUseOnlineUrl" />
        <div v-if="sourceUrl" class="image-container">
          <div class="contrast">
            <span class="title">压缩前后对比</span>
            <span class="center">点击图片可进行预览</span>
          </div>
          <div class="img-list">
            <div v-if="sourceUrl" class="before">
              <span class="info">
                压缩前：{{ selectFile?.size ? (selectFile?.size! / 1024).toFixed(2) : '-' }} KB
              </span>
              <img :src="sourceUrl" alt="" class="compress-image" @click="onPreview" />
            </div>
            <div v-if="base64Url" ref="imageRef" class="after">
              <span class="info">
                压缩后：{{ compressFile?.size ? (compressFile?.size! / 1024).toFixed(2) : '-' }} KB
              </span>
              <img :src="base64Url" alt="" class="compress-image" @click="onPreview" />
            </div>
          </div>
          <div v-if="base64Url" class="compress-info">
            <span class="title">压缩比例：{{ sliderValue }}%</span>
            <div class="compress-size">
              <div class="size-item">
                <span class="comp-width">原始宽度：{{ sourceFileInfo.width }}</span>
                <span class="comp-height">原始高度：{{ sourceFileInfo.height }}</span>
              </div>
              <div class="size-item">
                <span class="comp-width">压缩宽度：{{ compresWidth }}</span>
                <span class="comp-height"
                  >压缩高度：{{
                    Number(compressHeight) > Number(sourceFileInfo.height) ? sourceFileInfo.height : compressHeight
                  }}</span
                >
              </div>
              <div class="size-item">
                <span class="comp-width">宽度相差：{{ sourceFileInfo.width - (compresWidth as number) }}</span>
                <span class="comp-height"> 高度相差：{{ sourceFileInfo.height - (compressHeight as number) }} </span>
              </div>
              <div class="size-item">
                <span class="comp-width">
                  压缩后文件大小相差：{{
                    selectFile?.size && compressFile?.size
                      ? (selectFile.size / 1024 - compressFile.size / 1024).toFixed(2)
                      : '-'
                  }}
                  KB
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!base64Url" class="slider-wrap">
          <span class="title">压缩品质</span>
          <span class="center">压缩等级越小，文件越小，品质越高，文件越大</span>
          <div class="slider-info">
            <span class="left">最大压缩(文件越小)</span>
            <span class="right">品质最高(文件越大)</span>
          </div>
          <div class="slide-line">
            <el-slider v-model="sliderValue" :marks="marks" />
          </div>
        </div>
        <div class="image-size">
          <span v-if="!base64Url" class="title">图片尺寸</span>
          <span v-if="!base64Url" class="center">
            尺寸越小，压缩后体积越小
            <span class="enter-size-info">（宽高只需输入其中一项，另一项将按比例计算）</span>
          </span>
          <div class="inp-wrap">
            <el-form v-if="!base64Url" ref="formRef" :rules="rules" :model="imgSize" class="form-wrap">
              <el-form-item prop="imgWidth" label="图片宽度" class="form-item form-item-width">
                <el-input
                  v-model="imgSize.imgWidth"
                  placeholder="请输入图片宽度"
                  :disabled="!sourceUrl || disabledEnter === 'width'"
                />
              </el-form-item>
              <el-form-item prop="imgHeight" label="图片高度" class="form-item">
                <el-input
                  v-model="imgSize.imgHeight"
                  placeholder="请输入图片高度"
                  :disabled="!sourceUrl || disabledEnter === 'height'"
                />
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="footer">
      <el-button type="primary" :disabled="!sourceUrl" @click="onCompress">压缩</el-button>
      <el-button type="primary" :disabled="!compressFile" @click="onDownload">下载</el-button>
      <el-button type="warning" :disabled="!base64Url" @click="onRefresh">重置</el-button>
    </div>
    <el-dialog v-model="previewVisible" draggable align-center title="图片预览" width="80%" @close="onClosePreview">
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onUnmounted, watch } from 'vue';
import type { CSSProperties } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import {
  compressImage,
  getImgInfo,
  Verify,
  checkNumber,
  checkMin,
  checkMax,
  onlineImgToFile,
  onDownloadFile,
} from '@/utils';
import OnlineImage from '../OnlineImage/index.vue';

interface IProps {
  modalVisible: boolean;
  title?: string;
}

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

interface Mark {
  style: CSSProperties;
  label: string;
}

type Marks = Record<number, Mark | string>;

const sliderValue = ref<number>(60);

const marks = reactive<Marks>({
  10: '10%',
  20: '20%',
  30: '30%',
  40: '40%',
  50: '50%',
  60: '60%',
  70: '70%',
  80: '80%',
  90: '90%',
});

const formRef = ref<FormInstance>();
const imgSize = reactive<{
  imgWidth: number | null;
  imgHeight: number | null;
}>({
  imgWidth: null,
  imgHeight: null,
});
// 图片来源
const imgFrom = ref<boolean>(false);
// 预览图片
const previewUrls = ref<string[]>([]);
// 图片预览弹窗
const previewVisible = ref<boolean>(false);
const imageRef = ref<HTMLElement | null>(null);
const selectFile = ref<File | null>(null);
// 压缩前的图片路径
const sourceUrl = ref<string>('');
// 压缩完的图片路径
const base64Url = ref<string>('');
// 压缩后的文件
const compressFile = ref<File | null>(null);
const sourceFileInfo = reactive<{ width: number; height: number }>({ width: 0, height: 0 });
// 校验规则实例
const verifys = ref<{ addRule: Function; end: Function; check: Function }>();
// 图片比例
const scale = computed(() => {
  return sourceFileInfo.width / sourceFileInfo.height;
});
// 压缩宽度
const compresWidth = computed(() => {
  if (imgSize.imgWidth) {
    return imgSize.imgWidth > sourceFileInfo.width ? sourceFileInfo.width : imgSize.imgWidth;
  } else {
    return imgSize.imgHeight ? (imgSize.imgHeight * scale.value).toFixed(0) : sourceFileInfo.width;
  }
});
// 压缩高度
const compressHeight = computed(() => {
  if (imgSize.imgHeight) {
    return imgSize.imgHeight > sourceFileInfo.height ? sourceFileInfo.height : imgSize.imgHeight;
  } else {
    return imgSize.imgWidth ? (imgSize.imgWidth / scale.value).toFixed(0) : sourceFileInfo.height;
  }
});
// 是否禁用尺寸输入框
const disabledEnter = computed(() => {
  if (imgSize.imgWidth) {
    return 'height';
  } else if (imgSize.imgHeight) {
    return 'width';
  } else {
    return false;
  }
});

withDefaults(defineProps<IProps>(), {
  title: '',
});

const emit = defineEmits<Emits>();

watch(imgFrom, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    onRefresh();
  }
});

onUnmounted(() => {
  onRefresh();
});

// 校验输入的图片尺寸
const validateSize = (rule: any, value: any, callback: any) => {
  verifys.value?.addRule(checkNumber).addRule(checkMin).addRule(checkMax).end(callback);
  verifys.value?.check(value, callback);
};

const rules = reactive<FormRules>({
  imgWidth: [{ validator: validateSize }],
  imgHeight: [{ validator: validateSize }],
});

// 自定义上传
const onUpload = async (event: { file: File }) => {
  selectFile.value = event.file;
  const reader = new FileReader();
  reader.onload = async (e: Event) => {
    sourceUrl.value = (e.target as FileReader).result as string;
    // 获取上传的图片宽高
    const imgInfo = (await getImgInfo((e.target as FileReader).result as string)) as { width: number; height: number };
    sourceFileInfo.width = imgInfo.width;
    sourceFileInfo.height = imgInfo.height;
    // 清空压缩后的图片路径
    base64Url.value = '';
    // 清空上次上传的图片
    imgSize.imgWidth = null;
    imgSize.imgHeight = null;
    verifys.value = new Verify({
      maxSize: Math.max(sourceFileInfo.width, sourceFileInfo.height) || 5000,
      minSize: 100,
    });
  };
  reader.readAsDataURL(event.file);
};

// 使用在线链接
const onUseOnlineUrl = async (url: string) => {
  const file = await onlineImgToFile(url);
  selectFile.value = file;
  sourceUrl.value = url;
  // 获取上传的图片宽高
  const imgInfo = (await getImgInfo(url)) as { width: number; height: number };
  sourceFileInfo.width = imgInfo.width;
  sourceFileInfo.height = imgInfo.height;
  // 清空压缩后的图片路径
  base64Url.value = '';
  // 清空上次上传的图片
  imgSize.imgWidth = null;
  imgSize.imgHeight = null;
  verifys.value = new Verify({
    maxSize: Math.max(sourceFileInfo.width, sourceFileInfo.height) || 5000,
    minSize: 100,
  });
};

// 压缩
const onCompress = async () => {
  if (!formRef.value || !selectFile.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      const { file, base64Url: url } = await compressImage({
        file: selectFile.value!,
        quality: sliderValue.value / 100,
        maxWidth: imgSize.imgWidth!,
        maxHeight: imgSize.imgHeight!,
      });
      base64Url.value = url;
      compressFile.value = file;
    } else {
      return false;
    }
  });
};

// 图片预览
const onPreview = () => {
  previewVisible.value = true;
  previewUrls.value = [sourceUrl.value, base64Url.value];
};

// 重置
const onRefresh = () => {
  sourceUrl.value = '';
  base64Url.value = '';
  selectFile.value = null;
  formRef.value?.resetFields();
  imgSize.imgWidth = null;
  imgSize.imgHeight = null;
  sliderValue.value = 60;
  compressFile.value = null;
};

// 下载
const onDownload = () => {
  if (!compressFile.value) return;
  const blob = new Blob([compressFile.value], { type: compressFile.value?.type });
  const url = window.URL.createObjectURL(blob);
  onDownloadFile({ url, type: 'blob' });
};

// 关闭图片压缩
const onClose = () => {
  emit('update:modalVisible', false);
};

// 关闭预览弹窗
const onClosePreview = () => {
  previewVisible.value = false;
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.compress-wrap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 10px 10px;
  height: 100%;
  overflow: hidden;

  :deep {
    .el-upload-dragger {
      padding: 10px 0 20px 0;
      background-color: var(--input-bg-color);

      &:hover {
        background-color: var(--upload-hover-bg-color);
      }
    }

    .el-slider__button {
      width: 16px;
      height: 16px;
    }

    .el-form-item__label {
      color: var(--font-1);
    }
  }

  .content {
    flex: 1;

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 45px;
      width: 100%;
      color: var(--font-1);

      .left {
        font-size: 18px;
      }

      .left-action {
        margin-left: 10px;
      }

      .close {
        color: var(--theme-blue);
        cursor: pointer;

        &:hover {
          color: @active;
        }
      }
    }

    .compress-upload {
      padding: 0 10px;
    }

    .upload-info {
      margin-top: 5px;
      margin-bottom: 10px;
      color: var(--font-5);
      font-size: 13px;
    }

    .slider-wrap {
      margin: 10px 0 30px;
      box-sizing: border-box;
      font-size: 13px;
      color: var(--font-1);

      :deep {
        .el-slider__marks-text {
          color: var(--font-1);
        }
      }

      .slider-info {
        display: flex;
        justify-content: space-between;
        padding: 0 10px;
      }

      .slide-line {
        padding: 0 10px;
      }
    }

    .title {
      display: inline-block;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--font-1);
    }

    .center {
      font-size: 13px;
      margin-left: 10px;
      color: var(--font-1);
    }

    .image-size {
      .inp-wrap {
        position: relative;
        display: flex;
        justify-content: flex-start;
        padding: 0 10px;
        margin-top: 10px;

        .form-wrap {
          display: flex;
          justify-content: space-between;
          margin-right: 20px;

          :deep {
            .el-input__wrapper {
              width: 200px;
            }
          }

          .form-item-width {
            margin-right: 20px;
          }
        }
      }

      .enter-size-info {
        color: @font-danger;
      }
    }

    .image-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: auto;

      .contrast {
        font-size: 14px;
        font-weight: 700;
        margin-top: 15px;
        color: var(--font-1);

        .center {
          font-size: 13px;
          margin-left: 10px;
          color: @font-danger;
          font-weight: initial;
        }
      }

      .img-list {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: auto;
        box-sizing: border-box;
        padding: 0 10px;

        .before,
        .after {
          width: 50%;
          color: var(--font-1);

          .compress-image {
            display: block;
            width: 100%;
            height: auto;
            border-radius: 5px;
            .imgStyle();
            cursor: pointer;
          }

          .info {
            display: inline-block;
            font-size: 14px;
            margin-bottom: 10px;
          }
        }

        .before {
          margin-right: 20px;
        }
      }
    }

    .compress-info {
      margin-top: 20px;
      padding: 0 10px;

      .title {
        display: inline-block;
        margin-bottom: 10px;
        font-weight: initial;
        color: var(--font-1);
      }

      .compress-size {
        color: var(--font-1);
        .size-item {
          margin-bottom: 10px;
          .comp-width {
            margin-right: 10px;
          }
        }
      }
    }
  }

  .footer {
    position: relative;
    text-align: right;
    z-index: 99;
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
