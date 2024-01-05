<!--
 * pdf 预览
 * @author: dnhyxc
 * @since: 2024-01-04
 * index.vue
-->
<template>
  <div class="pdf-preview-wrap">
    <div class="header">
      <div class="left">
        <span class="title">PDF 预览</span>
        <el-upload
          class="uploader"
          accept=".pdf"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :http-request="onUpload"
        >
          <span type="primary" link class="book-btn upload-text">
            {{ iframeUrl ? '重新选择 PDF 文件' : '选择 PDF 文件' }}
          </span>
        </el-upload>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <Loading v-if="!iframeUrl" :loading="loading" class="content">
      <DragUpload class="drag-upload" :on-upload="onUpload" accept=".pdf" upload-info-text="pdf 格式的文件" />
    </Loading>
    <Loading v-else class="content" :loading="loading">
      <iframe ref="iframeRef" :src="iframeUrl" frameborder="0" class="iframe" />
    </Loading>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadProps } from 'element-plus';

interface IProps {
  modalVisible: boolean;
}

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

defineProps<IProps>();

const emit = defineEmits<Emits>();

const iframeRef = ref<HTMLIFrameElement | null>(null);
const iframeUrl = ref<string>('');
const loading = ref<boolean>(false);

// 上传校验
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'application/pdf') {
    ElMessage.error('只允许上传 epub 格式的文件');
    return false;
  }
  return true;
};

// 自定义上传
const onUpload = ({ file }: { file: File }) => {
  loading.value = true;
  const reader = new FileReader();
  reader.onload = async (e: Event) => {
    const buffer = (e.target as FileReader).result as string;
    const fileBlob = new Blob([buffer], { type: file.type });
    iframeUrl.value = URL.createObjectURL(fileBlob);
    loading.value = false;
  };
  reader.readAsArrayBuffer(file);
};

const onClose = () => {
  emit('update:modalVisible', false);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.pdf-preview-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 18px;
    height: 45px;
    padding: 0 10px;
    border-bottom: 1px solid var(--card-border);
    box-sizing: border-box;
    color: var(--font-1);

    .left {
      display: flex;
      align-items: center;

      .title {
        color: var(--font-1);
      }

      .book-btn {
        color: var(--theme-blue);
        font-size: 16px;
        margin-left: 10px;
        cursor: pointer;

        &:hover {
          color: var(--el-color-primary-light-5);
        }
      }

      .uploader {
        margin-left: 10px;
        font-size: 14px;

        .upload-text {
          padding: 0;
          margin-left: 0;
          .icon-upload {
            margin-right: 5px;
            font-size: 18px;
          }
        }
      }
    }

    .close {
      color: var(--theme-blue);
      font-size: 16px;
      cursor: pointer;

      &:hover {
        color: @active;
      }
    }
  }

  .content {
    flex: 1;
    overflow: auto;
    box-sizing: border-box;
    border-radius: 0;

    .drag-upload {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
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

    .iframe {
      display: flex;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
