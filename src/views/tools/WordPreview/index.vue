<!--
 * word 预览
 * @author: dnhyxc
 * @since: 2024-01-22
 * index.vue
-->
<template>
  <div :class="`translate-wrap ${hideHeader && 'hide-translate-wrap'}`">
    <PreviewHeader
      title="Word 预览"
      load-line-text="在线 Word"
      accept=".doc,.docx"
      :file-name="docFile?.name || ''"
      :save-loading="saveLoading"
      :loading="loading"
      :save-status="saveStatus"
      :url="docUrl"
      :load-type="loadType"
      :on-close="onClose"
      :on-save="onSave"
      :before-upload="beforeUpload"
      :on-upload="onUpload"
      :show-book-list="showBookList"
      :hide-header="hideHeader"
    />
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
import { calculateLoadProgress } from '@/utils';
import { uploadStore, bookStore } from '@/store';
import { AtlasItemParams } from '@/typings/common';
import BookList from '../BookList/index.vue';
import PreviewHeader from '../PreviewHeader/index.vue';

interface IProps {
  hideHeader?: boolean;
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
// 保存loading
const saveLoading = ref<boolean>(false);

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
const onSave = async () => {
  if (!docFile.value) return;
  saveLoading.value = true;
  const res = await uploadStore.uploadOtherFile(docFile.value as File);
  if (res) {
    await bookStore.addBook(res.filePath, docFile.value, 'word');
    saveStatus.value = true;
    saveLoading.value = false;
  } else {
    saveLoading.value = false;
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
  width: 100%;
  height: 100%;

  .wrap {
    display: flex;
    flex: 1;

    .abort {
      font-size: 15px;
      margin-top: 20px;
      cursor: pointer;
      color: var(--active);

      &:hover {
        color: @font-danger;
      }
    }

    .load-info {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      align-items: center;
      margin-top: 10px;
      color: var(--loading-text-color);

      .progress-bar {
        width: 230px;
      }

      .load-time {
        font-size: 12px;
        margin-top: 9px;
      }

      .abort {
        font-size: 15px;
        margin-top: 5px;
        cursor: pointer;
        color: var(--active);

        &:hover {
          color: @font-danger;
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
}

.hide-translate-wrap {
  .wrap {
    .content {
      :deep {
        .docx-wrapper {
          height: calc(100vh - 110px);
          box-sizing: border-box;
        }
      }
    }
  }
}
</style>
