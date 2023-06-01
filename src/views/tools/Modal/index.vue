<!--
 * 图片压缩弹窗
 * @author: dnhyxc
 * @since: 2023-05-29
 * index.vue
-->
<template>
  <div class="modal-wrap">
    <el-dialog v-model="visible" :close-on-click-modal="false" title="图片压缩" align-center width="650px">
      <div class="content">
        <el-scrollbar ref="scrollRef" max-height="75vh" wrap-class="scrollbar-wrapper">
          <el-upload
            class="upload"
            drag
            multiple
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="onUpload"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">拖拽或点击文件上传（仅支持 png、jpg、jpeg、gif 格式的图片）</div>
          </el-upload>
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
              <div v-if="base64Url" class="compress-info">
                <span class="title">压缩比例：{{ sliderValue }}%</span>
                <div class="compress-size">
                  <div class="size-item">
                    <span class="comp-width">原始宽度：{{ sourceFileInfo.width }}</span>
                    <span class="comp-height">原始高度：{{ sourceFileInfo.height }}</span>
                  </div>
                  <div class="size-item">
                    <span class="comp-width">压缩宽度：{{ compresWidth }}</span>
                    <span class="comp-height">压缩高度：{{ compressHeight }}</span>
                  </div>
                  <div class="size-item">
                    <span class="comp-width"> 宽度相差：{{ sourceFileInfo.width - (compresWidth as number) }} </span>
                    <span class="comp-height">
                      高度相差：{{ sourceFileInfo.height - (compressHeight as number) }}
                    </span>
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
          <div v-if="!base64Url" class="image-size">
            <span class="title">图片尺寸</span>
            <span class="center">尺寸越小，压缩后体积越小（宽高只需输入其中一项，另一项将按比例计算）</span>
            <div class="inp-wrap">
              <el-form ref="formRef" :rules="rules" :model="imgSize" class="form-wrap">
                <el-form-item prop="imgWidth" label="图片宽度" class="form-item form-item-width">
                  <el-input v-model="imgSize.imgWidth" placeholder="请输入图片宽度" />
                </el-form-item>
                <el-form-item prop="imgHeight" label="图片高度" class="form-item">
                  <el-input v-model="imgSize.imgHeight" placeholder="请输入图片高度" />
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :disabled="!sourceUrl" @click="onCompress">压缩</el-button>
          <el-button type="primary" :disabled="!compressFile" @click="onDownload">下载</el-button>
          <el-button type="warning" :disabled="!base64Url" @click="onRefresh">重置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { computed, ref, reactive } from 'vue';
import type { CSSProperties } from 'vue';
import type { FormInstance, UploadProps, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { FILE_TYPE } from '@/constant';
import { compressImage, getImgInfo } from '@/utils';

interface IProps {
  modalVisible: boolean;
  previewVisible?: boolean;
  previewUrls?: string[];
  title?: string;
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
const imageRef = ref<HTMLElement | null>(null);
const selectFile = ref<File | null>(null);
// 压缩前的图片路径
const sourceUrl = ref<string>('');
// 压缩完的图片路径
const base64Url = ref<string>('');
// 压缩后的文件
const compressFile = ref<File | null>(null);
const sourceFileInfo = reactive<{ width: number; height: number }>({ width: 0, height: 0 });
// 图片比例
const scale = computed(() => {
  return sourceFileInfo.width / sourceFileInfo.height;
});
// 压缩宽度
const compresWidth = computed(() => {
  if (imgSize.imgWidth) {
    return imgSize.imgWidth;
  } else {
    return imgSize.imgHeight ? (imgSize.imgHeight * scale.value).toFixed(0) : sourceFileInfo.width;
  }
});
// 压缩高度
const compressHeight = computed(() => {
  if (imgSize.imgHeight) {
    return imgSize.imgHeight;
  } else {
    return imgSize.imgWidth ? (imgSize.imgWidth / scale.value).toFixed(0) : sourceFileInfo.height;
  }
});

const props = withDefaults(defineProps<IProps>(), {
  previewVisible: false,
  previewUrls: () => [],
  title: '',
});

const emit = defineEmits(['update:modalVisible', 'update:previewUrls', 'update:previewVisible']);

const previewVisible = computed({
  get() {
    return props.previewVisible;
  },
  set(visible: boolean) {
    emit('update:previewVisible', visible);
  },
});

const visible = computed({
  get() {
    return props.modalVisible;
  },
  set(visible: boolean) {
    emit('update:modalVisible', visible);
    if (!visible && !previewVisible.value) {
      onRefresh();
    }
  },
});

computed({
  get() {
    return props.previewUrls;
  },
  set(urls: string[]) {
    emit('update:previewUrls', urls);
  },
});

// 校验输入的图片尺寸
const validateSize = (rule: any, value: any, callback: any) => {
  if (value && /[^\d]/g.test(value)) {
    callback(new Error('只能输入整数'));
  } else if (value && value < 100) {
    callback(new Error('不能小于 100'));
  } else if (value && value > 5000) {
    callback(new Error('不能超过 5000'));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  imgWidth: [{ validator: validateSize }],
  imgHeight: [{ validator: validateSize }],
});

// 上传校验
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!FILE_TYPE.includes(rawFile.type)) {
    ElMessage.error('请上传 png、jpg、jpeg、gif、webp 格式的图片');
    return false;
  } else if (rawFile.size / 1024 / 1024 > 20) {
    ElMessage.error('图片不能超过20M');
    return false;
  }
  return true;
};

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
  };
  reader.readAsDataURL(event.file);
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
  emit('update:previewVisible', true);
  emit('update:previewUrls', [sourceUrl.value, base64Url.value]);
  emit('update:modalVisible', false);
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
  ipcRenderer.send('download', url);
  // 设置一次性监听，防止重复触发
  ipcRenderer.once('download-file', (e, res: string) => {
    if (res) {
      window.URL.revokeObjectURL(url);
      ElMessage({
        message: '保存成功',
        type: 'success',
        offset: 80,
        duration: 2000,
      });
    }
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.modal-wrap {
  overflow: hidden;

  :deep {
    .el-dialog__body {
      padding: 10px 20px 0 !important;
    }
    .el-upload-dragger {
      padding: 10px 0 20px 0;
      background-color: var(--input-bg-color);
    }

    .el-input__wrapper {
      background-color: var(--input-bg-color);
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
        display: flex;
        justify-content: flex-start;
        padding: 0 10px;

        .form-wrap {
          display: flex;
          justify-content: space-between;

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
          color: var(--font-1);
          font-weight: initial;
        }
      }

      .img-list {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: auto;
        padding: 0 10px;
        box-sizing: border-box;

        .before,
        .after {
          width: 30%;
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
      }
    }

    .compress-info {
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
}
</style>
