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
          <el-button
            type="primary"
            link
            :class="`book-btn ${checkOS() !== 'mac' && 'mac-book-btn'}`"
            @click="showBookList"
          >
            在线 Word
          </el-button>
          <el-upload
            class="uploader"
            accept=".doc,.docx"
            :disabled="loading"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="onUpload"
          >
            <el-button :disabled="loading" type="primary" link class="book-btn upload-text">
              {{ docUrl ? '重新选择' : '选择文件' }}
            </el-button>
          </el-upload>
          <el-button
            v-if="loginStore.userInfo.auth === 1 && loadType === 'upload' && docUrl"
            type="primary"
            link
            :class="`upload-btn ${checkOS() !== 'mac' && 'mac-upload-btn'}`"
            @click="onSaveWord"
          >
            {{ saveStatus ? '重新保存 Word' : '保存 Word' }}
          </el-button>
        </div>
        <span class="pdf-name">{{ docFile?.name }}</span>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <Loading
      :loading="loading"
      :load-text="`${docFile?.name ? `正在快马加鞭的加载《${docFile?.name}》` : '正在快马加鞭的加载'}`"
      class="wrap"
    >
      <template #abort>
        <div v-if="loadType === 'line' && progress < 100 && !isSaved" class="abort" @click="onAbort">停止加载</div>
      </template>
      <template #loadInfo>
        <div v-if="loadType === 'line' && progress < 100 && !isSaved" class="load-info">
          <el-progress :show-text="false" :stroke-width="12" :percentage="progress" class="progress-bar" />
          <div class="load-time">
            <span class="progress">
              已加载 {{ progress }}% ({{ loadWordSize.toFixed(2) }}MB / {{ wordSize.toFixed(2) }}MB)
            </span>
          </div>
        </div>
      </template>
      <div ref="docxRef" class="content">
        <DragUpload class="drag-upload" :on-upload="onUpload" accept=".doc,.docx" :file-type="['doc', 'docx']" />
      </div>
    </Loading>
    <BookList
      v-model:visible="visible"
      v-model:loadStatus="loading"
      :read-book="previewWord"
      load-type="word"
      :book-id="currentWordId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadProps } from 'element-plus';
import { renderAsync } from 'docx-preview';
import { WORD_TYPES } from '@/constant';
import { checkOS, calculateLoadProgress } from '@/utils';
import { loginStore, uploadStore, bookStore } from '@/store';
import { AtlasItemParams } from '@/typings/common';
import BookList from '../BookList/index.vue';

interface IProps {
  modalVisible: boolean;
}

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

defineProps<IProps>();

const emit = defineEmits<Emits>();

const docxRef = ref<HTMLDivElement | null>(null);
const docFile = ref<File | Blob | null>(null);
const loading = ref<boolean>(false);
const docUrl = ref<string>('');
const visible = ref<boolean>(false);
// 当前 wordId
const currentWordId = ref<string>('');
// 加载进度
const progress = ref<number>(0);
// 当前选择的书籍大小
const wordSize = ref<number>(0);
// 当前加载书籍的大小
const loadWordSize = ref<number>(0);
// 选择渠道
const loadType = ref<string>('upload');
// 保存状态
const saveStatus = ref<boolean>(false);

// 用于存储上一个 ReadableStreamDefaultReader 对象
let previousReader: any = null;

// 判断是否保存过书籍
const isSaved = computed(() => {
  return bookStore.blobs.find((i) => i.id === currentWordId.value);
});

// 上传校验
const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
  loadType.value = 'upload';
  if (!WORD_TYPES.includes(file.type)) {
    ElMessage.error('只允许上传 doc, docx 格式的文件');
    return false;
  }
  return true;
};

const onUpload = async ({ file }: { file: File }) => {
  // 每次上传重置currentWordId
  currentWordId.value = '';
  saveStatus.value = false;
  if (!file) return;
  docFile.value = file;
  renderWord(file);
};

// 渲染 word
const renderWord = async (file: File | Blob) => {
  docUrl.value = URL.createObjectURL(file);
  await renderAsync(file, docxRef.value!);
  loading.value = false;
};

// 显示书籍列表
const showBookList = () => {
  visible.value = true;
};

// 保存word
const onSaveWord = async () => {
  if (!docFile.value) return;
  const res = await uploadStore.uploadOtherFile(docFile.value as File);
  if (res) {
    const status = await bookStore.addBook(res.filePath, docFile.value, 'word');
    if (status.success) {
      saveStatus.value = true;
    } else {
      saveStatus.value = false;
    }
  }
};

// 获取加载进度
const getProgress = (num: number) => {
  progress.value = num;
  loadWordSize.value = wordSize.value * (num / 100);
};

// 重置阅读属性设置
const resetRendition = () => {
  loadType.value = 'upload';
  loading.value = false;
  progress.value = 0;
  loadWordSize.value = 0;
  wordSize.value = 0;
  currentWordId.value = '';
};

const addPreviousReader = (render: any) => {
  previousReader = render;
};

// 停止加载
const onAbort = () => {
  if (previousReader) {
    previousReader.cancel();
    resetRendition();
  }
};

// 加载 word blob
const loadWordBlob = async (id: string, url: string) => {
  loading.value = true;
  loadType.value = 'line';
  // 获取加载进度
  const blob = await calculateLoadProgress({
    url,
    getProgress,
    needFileType: 'blob',
    previousReader,
    addPreviousReader,
  }).catch(() => {
    loading.value = false;
  });
  if (blob) {
    renderWord(blob);
    // 保存书籍blob
    bookStore.saveBlob({ id, blob });
  } else {
    loading.value = false;
  }
};

const previewWord = (data: AtlasItemParams) => {
  resetRendition();
  visible.value = false;
  currentWordId.value = data.id;
  if (isSaved.value) {
    renderWord(isSaved.value?.blob);
  } else {
    loadWordBlob(data.id, data.url);
  }
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

        .book-btn,
        .upload-btn {
          color: var(--theme-blue);
          font-size: 16px;
          padding-top: 2px;
          margin-left: 11px;

          &:hover {
            color: var(--el-color-primary-light-5);
          }
        }

        .upload-btn {
          margin-left: 10px;
        }

        .mac-book-btn,
        .mac-upload-btn {
          padding-top: 5px;
        }

        .uploader {
          margin-left: 10px;
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

  .wrap {
    display: flex;
    flex: 1;

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
}
</style>
