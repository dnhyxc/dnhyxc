<!--
 * 百度翻译
 * @author: dnhyxc
 * @since: 2024-01-22
 * index.vue
-->
<template>
  <div class="translate-wrap">
    <div class="header">
      <div class="left">
        <div class="actions">
          <span class="title">Word 预览</span>
          <el-upload
            class="uploader"
            accept=".doc,.docx"
            :disabled="loading"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="onUpload"
          >
            <el-button :disabled="loading" type="primary" link class="book-btn upload-text">
              {{ docUrl ? '重新选择 word 文件' : '选择 word 文件' }}
            </el-button>
          </el-upload>
        </div>
        <span class="pdf-name">{{ docFile?.name }}</span>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <div ref="docxRef" class="content">
      <DragUpload class="drag-upload" :on-upload="onUpload" accept=".doc,.docx" :file-type="['doc', 'docx']" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadProps } from 'element-plus';
import { renderAsync } from 'docx-preview';
import { WORD_TYPES } from '@/constant';

interface IProps {
  modalVisible: boolean;
}

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

defineProps<IProps>();

const emit = defineEmits<Emits>();

const docxRef = ref<HTMLDivElement | null>(null);
const docFile = ref<File | null>(null);
const loading = ref<boolean>(false);
const docUrl = ref<string>('');

// 上传校验
const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
  if (!WORD_TYPES.includes(file.type)) {
    ElMessage.error('只允许上传 doc, docx 格式的文件');
    return false;
  }
  return true;
};

const onUpload = async ({ file }: { file: File }) => {
  docFile.value = file;
  if (!file) return;
  docUrl.value = URL.createObjectURL(docFile.value);
  await renderAsync(file, docxRef.value!);
};
// 关闭屏幕录制页面
const onClose = () => {
  emit('update:modalVisible', false);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.translate-wrap {
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
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;

      .actions {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .title {
          color: var(--font-1);
          min-width: 86px;
        }

        .book-btn {
          color: var(--theme-blue);
          font-size: 16px;
          padding-top: 2px;

          &:hover {
            color: var(--el-color-primary-light-5);
          }
        }

        .mac-book-btn {
          padding-top: 5px;
        }

        .uploader {
          margin-left: 12px;
          font-size: 14px;
          padding-top: 2px;

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

      .pdf-name {
        font-size: 16px;
        margin: 0 10px 0 13px;
        color: var(--font-1);
        padding-top: 1px;
        .ellipsisMore(1);
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
    background: transparent;
    box-sizing: border-box;

    :deep {
      .docx-wrapper {
        padding: 0;
        overflow: auto;
        height: calc(100vh - 130px);
        background: transparent;

        .docx {
          padding: 0 5px 10px 10px;
          margin-bottom: 0;
          overflow-y: auto;
          background: transparent;
          color: var(--font-1);

          .docx_heading1 {
            margin-top: 10px;
            margin-bottom: 20px;
          }
        }
      }
    }

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
  }
}
</style>
