<!--
 * 图片压缩弹窗
 * @author: dnhyxc
 * @since: 2023-05-29
 * index.vue
-->
<template>
  <div class="modal-wrap">
    <el-dialog v-model="visible" :close-on-click-modal="false" title="图片压缩" align-center width="600px" draggable>
      <div class="content">
        <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
          <el-upload
            class="upload"
            drag
            multiple
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="onUpload"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">拖拽或点击文件上传</div>
          </el-upload>
          <div class="upload-info">仅支持 png、jpg、jpeg、gif 格式的图片</div>
          <div class="slider-wrap">
            <span class="title">压缩品质：</span>
            <span class="center">压缩等级越小，文件越小，品质越高，文件越大</span>
            <div class="slider-info">
              <span class="left">最大压缩(文件越小)</span>
              <span class="right">品质最高(文件越大)</span>
            </div>
            <div class="slide-line">
              <el-slider v-model="value" :marks="marks" />
            </div>
          </div>
          <div class="image-container">
            <div class="before">
              <span class="info">压缩前：{{ (selectFile?.size! / 1024).toFixed(2) }} KB</span>
              <img :src="sourceUrl" alt="" class="compress-image" />
            </div>
            <div ref="imageRef" class="after">
              <span class="info">压缩后：{{ (compressFile?.size! / 1024).toFixed(2) }} KB</span>
              <img :src="base64Url" alt="" class="compress-image" />
            </div>
          </div>
        </el-scrollbar>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="onCompress">压缩</el-button>
          <el-button type="warning" @click="onRefresh">重置</el-button>
          <el-button type="primary" @click="onDownload">下载</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import type { CSSProperties } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import type { UploadProps } from 'element-plus';
import { uploadStore } from '@/store';
import { FILE_TYPE } from '@/constant';
import { compressImage } from '@/utils';

interface IProps {
  modalVisible: boolean;
  title?: string;
}

interface Mark {
  style: CSSProperties;
  label: string;
}

type Marks = Record<number, Mark | string>;

const value = ref([0, 100]);

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

const imageRef = ref<HTMLElement | null>(null);
const selectFile = ref<File | null>(null);
// 压缩完的图片路径
const base64Url = ref<string>('');
// 压缩后的文件
const compressFile = ref<File>();
const sourceUrl = ref<string>('');

const props = defineProps<IProps>();

const emit = defineEmits(['update:modalVisible']);

const visible = computed({
  get() {
    return props.modalVisible;
  },
  set(visible: boolean) {
    emit('update:modalVisible', visible);
  },
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
  console.log(event.file, 'event.file');
  selectFile.value = event.file;
  const reader = new FileReader();
  reader.onload = async (e: Event) => {
    sourceUrl.value = (e.target as FileReader).result as string;
  };
  reader.readAsDataURL(event.file);
};

// 压缩
const onCompress = async () => {
  console.log('压缩');
  if (!selectFile.value) return;
  const { file, base64Url: url } = await compressImage({
    file: selectFile.value,
  });
  base64Url.value = url;
  compressFile.value = file;

  console.log(file, url, 'newFile');
  if (file) {
    // 上传文件
    const res = await uploadStore.uploadFile(file);
    if (res) {
      console.log(res, 'res');
    }
  }
};

// 重置
const onRefresh = () => {
  console.log('重置');
  sourceUrl.value = '';
  base64Url.value = '';
  selectFile.value = null;
};

// 下载
const onDownload = () => {
  console.log('下载');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.modal-wrap {
  overflow: hidden;

  :deep {
    .el-dialog__body {
      padding: 10px 20px 0;
    }
    .el-upload-dragger {
      padding: 10px 0 20px 0;
    }

    .el-slider__button {
      width: 16px;
      height: 16px;
    }
  }

  .content {
    height: 300px;

    .upload-info {
      margin-bottom: 10px;
      color: var(--font-5);
    }

    .slider-wrap {
      margin: 10px 0 30px;
      box-sizing: border-box;
      font-size: 13px;

      .title {
        display: inline-block;
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 10px;
      }

      .slider-info {
        display: flex;
        justify-content: space-between;
      }

      .slide-line {
        padding: 0 10px;
      }
    }

    .image-container {
      height: 1000px;
      display: flex;
      justify-content: flex-start;
      width: 100%;
      height: auto;

      .before,
      .after {
        width: 25%;
        padding-right: 10px;

        .compress-image {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 5px;
          .imgStyle();
        }

        .info {
          display: inline-block;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 10px;
        }
      }
    }
  }
}
</style>
