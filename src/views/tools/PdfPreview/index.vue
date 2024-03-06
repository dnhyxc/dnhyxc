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
        <div class="actions">
          <span class="title">PDF 预览</span>
          <el-button
            type="primary"
            link
            :class="`book-btn ${checkOS() !== 'mac' && 'mac-book-btn'}`"
            @click="showBookList"
            >在线 PDF 列表</el-button
          >
          <el-upload
            class="uploader"
            accept=".pdf"
            :disabled="loading"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="onUpload"
          >
            <el-button :disabled="loading" type="primary" link class="book-btn upload-text">
              {{ iframeUrl ? '重新选择 PDF 文件' : '选择 PDF 文件' }}
            </el-button>
          </el-upload>
        </div>
        <span class="pdf-name">{{ fileName }}</span>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <Loading
      :loading="loading"
      :load-text="`${fileName ? `正在快马加鞭的加载《${fileName}》` : '正在快马加鞭的加载'}`"
      class="content"
    >
      <template #abort>
        <div v-if="loadType === 'line' && progress < 100 && !isSaved" class="abort" @click="onAbort">停止加载</div>
      </template>
      <template #loadInfo>
        <div v-if="loadType === 'line' && progress < 100 && !isSaved" class="load-info">
          <el-progress :show-text="false" :stroke-width="12" :percentage="progress" class="progress-bar" />
          <div class="load-time">
            <span class="progress">
              已加载 {{ progress }}% ({{ loadPdfSize.toFixed(2) }}MB / {{ pdfSize.toFixed(2) }}MB)
            </span>
          </div>
        </div>
      </template>
      <div v-if="!iframeUrl" class="preview-wrap">
        <DragUpload
          class="drag-upload"
          :on-upload="onUpload"
          accept=".pdf"
          file-type="pdf"
          upload-info-text="pdf 格式的文件"
        />
      </div>
      <div v-else class="preview-wrap">
        <iframe :src="iframeUrl" frameborder="0" class="iframe" />
        <div class="actions" @click="addTagVisible = true">
          <i class="iconfont icon-biaoqian" title="保存书签" />
        </div>
      </div>
    </Loading>
    <BookList v-model:visible="visible" v-model:loadStatus="loading" :read-book="previewPdf" load-type="pdf" />
    <div class="add-tag-wrap">
      <el-dialog v-model="addTagVisible" title="保存书签" align-center draggable width="400px">
        <el-form ref="formRef" :model="tagForm" label-width="82px" class="form-wrap" @submit.native.prevent>
          <el-form-item prop="tocName" label="章节名称" class="form-item">
            <el-input v-model="tagForm.tocName" placeholder="请输入章节名称" />
          </el-form-item>
          <el-form-item
            prop="tocId"
            label="章节页码"
            class="form-item"
            :rules="[
              {
                required: true,
                message: '请输入章节页码',
              },
            ]"
          >
            <el-input v-model="tagForm.tocId" placeholder="请输入章节页码" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="onCancel">取消</el-button>
            <el-button type="primary" @click="onSubmit">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { UploadProps, FormInstance } from 'element-plus';
import { loginStore, uploadStore, bookStore } from '@/store';
import { DOMAIN_URL } from '@/constant';
import { calculateLoadProgress, Message, getUniqueFileName, checkOS } from '@/utils';
import { AtlasItemParams, BookRecord } from '@/typings/common';
import BookList from '../BookList/index.vue';

interface IProps {
  modalVisible: boolean;
}

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

const router = useRouter();

defineProps<IProps>();

const emit = defineEmits<Emits>();

const iframeUrl = ref<string>('');
const fileName = ref<string>('');
const loading = ref<boolean>(false);
const visible = ref<boolean>(false);
// 选择渠道
const loadType = ref<string>('upload');
// 加载进度
const progress = ref<number>(0);
// 当前选择的书籍大小
const pdfSize = ref<number>(0);
// 当前加载书籍的大小
const loadPdfSize = ref<number>(0);
const addTagVisible = ref<boolean>(false);
const formRef = ref<FormInstance>();
const tagForm = reactive<{
  tocId: string;
  tocHref: string;
  bookId: string;
  tocName: string;
}>({
  tocId: '',
  tocHref: '',
  bookId: '',
  tocName: '',
});
const activePdf = ref<AtlasItemParams | null>(null);
const toPath = ref<string>('');
const canGo = ref<boolean>(false);
const canClose = ref<boolean>(true);
const canLoadPdf = ref<boolean>(true);
const canUpload = ref<boolean>(true);
const rawFile = ref<File | null>(null);
// 定时器
let timer: ReturnType<typeof setTimeout> | null = null;
// 用于存储上一个 ReadableStreamDefaultReader 对象
let previousReader: any = null;

// 判断是否保存过书籍
const isSaved = computed(() => {
  return bookStore.blobs.find((i) => i.id === tagForm.bookId);
});

onBeforeRouteLeave(async (to, from, next) => {
  // 页面离开时时，保存上一次阅读的位置
  if (!tagForm.bookId || (loadType.value === 'line' && !iframeUrl.value && progress.value < 100)) {
    // 页面离开时停止加载资源
    onAbort();
    next();
  } else {
    if (!canGo.value && !loading.value) {
      try {
        const res = await Message('', '是否保存阅读记录后再离开？', 'info');
        if (res === 'confirm') {
          addTagVisible.value = true;
          toPath.value = to.path;
          canGo.value ? next(true) : next(false);
        }
      } catch (error) {
        // 页面离开时停止加载资源
        onAbort();
        next(true);
      }
    } else {
      // 页面离开时停止加载资源
      onAbort();
      next(true);
    }
  }
});

const onUploadFile = async () => {
  if (!rawFile.value) return;
  resetRendition();
  loading.value = true;
  fileName.value = rawFile.value.name;
  const { auth } = loginStore?.userInfo;
  const fileURL = URL.createObjectURL(rawFile.value);
  if (auth === 1) {
    const res = await uploadStore.uploadOtherFile(rawFile.value);
    if (res) {
      await bookStore.addBook(res.filePath, rawFile.value);
      tagForm.bookId = bookStore.currentUploadId;
      getReadBookRecords(fileURL);
    } else {
      iframeUrl.value = fileURL;
      clearLoading();
    }
  } else {
    // 如果不是博主，则只保存选择的书籍
    const { newFile } = await getUniqueFileName(rawFile.value);
    const filePath = getFilePath(newFile.name);
    await bookStore.addBook(filePath, rawFile.value);
    tagForm.bookId = bookStore.currentUploadId;
    getReadBookRecords(fileURL);
  }
};

const getFilePath = (fileName: string) => {
  const isDev = import.meta.env.DEV;
  const filePath = isDev ? `http://localhost:9112/files/${fileName}` : `http://${DOMAIN_URL}/files/${fileName}`;
  return filePath;
};

// 上传校验
const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
  loadType.value = 'upload';
  if (file.type !== 'application/pdf') {
    ElMessage.error('只允许上传 epub 格式的文件');
    return false;
  }
  return true;
};

// 自定义上传
const onUpload = async ({ file }: { file: File }) => {
  rawFile.value = file;
  if (!iframeUrl.value || !tagForm.bookId) {
    onUploadFile();
  } else {
    try {
      const res = await Message('', '是否保存阅读记录后再重新选择？', 'info');
      if (res === 'confirm') {
        addTagVisible.value = true;
        canUpload.value = false;
      }
    } catch (error) {
      onUploadFile();
    }
  }
};

// 显示书籍列表
const showBookList = () => {
  visible.value = true;
};

// 获取加载进度
const getProgress = (num: number) => {
  progress.value = num;
  loadPdfSize.value = pdfSize.value * (num / 100);
};

// 重置阅读属性设置
const resetRendition = () => {
  fileName.value = '';
  loading.value = false;
  progress.value = 0;
  loadPdfSize.value = 0;
  pdfSize.value = 0;
};

const addPreviousReader = (render: any) => {
  previousReader = render;
};

// 停止加载
const onAbort = () => {
  if (previousReader) {
    previousReader.cancel();
  }
};

// 加载书籍blob
const loadBookBlob = async (id: string, url: string) => {
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
    const fileURL = URL.createObjectURL(blob);
    getReadBookRecords(fileURL);
    // 保存书籍blob
    bookStore.saveBlob({ id, blob });
  } else {
    loading.value = false;
  }
};

const loadPdf = () => {
  if (!activePdf.value || loading.value) return;
  resetRendition();
  visible.value = false;
  loading.value = true;
  loadType.value = 'line';
  const { url, size, fileName: name, id } = activePdf.value;
  tagForm.bookId = id;
  pdfSize.value = size / 1024 / 1024;
  fileName.value = name;
  // 如果从缓存中找到了该书籍的数据，则不从线上加载
  if (isSaved.value) {
    const fileURL = URL.createObjectURL(isSaved.value?.blob);
    getReadBookRecords(fileURL);
  } else {
    loadBookBlob(id, url);
  }
};

const previewPdf = async (data: AtlasItemParams) => {
  activePdf.value = data;
  if (!iframeUrl.value) {
    loadPdf();
  } else {
    try {
      const res = await Message('', '是否保存阅读记录后再离开？', 'info');
      if (res === 'confirm') {
        addTagVisible.value = true;
        canLoadPdf.value = false;
      }
    } catch (error) {
      loadPdf();
    }
  }
};

// 获取读书记录
const getReadBookRecords = async (fileURL: string) => {
  if (!tagForm.bookId || !location.pathname.includes('tools') || !fileURL) return;
  await bookStore.getReadBookRecords(tagForm.bookId);
  if (bookStore.bookRecordInfo) {
    const { tocName, tocId, tocHref, bookId } = bookStore.bookRecordInfo;
    tagForm.tocHref = tocHref!;
    tagForm.tocId = tocId!;
    tagForm.tocName = tocName!;
    tagForm.bookId = bookId!;
    try {
      const res = await Message(`第 ${tocId} 页 ${tocName || ''}`, '是否跳转到历史阅读目录？', 'info');
      if (res === 'confirm') {
        iframeUrl.value = `${fileURL}#page=${tocId}`;
        clearLoading();
      }
    } catch (error) {
      iframeUrl.value = fileURL;
      clearLoading();
    }
  } else {
    iframeUrl.value = fileURL;
    clearLoading();
  }
};

const clearLoading = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  timer = setTimeout(() => {
    loading.value = false;
  }, 10000);
};

const onCancel = () => {
  addTagVisible.value = false;
  if (toPath.value) {
    canGo.value = true;
    // 页面离开时停止加载资源
    onAbort();
    router.push(toPath.value);
  }
  if (!canClose.value) {
    // 页面关闭时停止加载资源
    onAbort();
    emit('update:modalVisible', false);
    canClose.value = true;
  }
  if (!canLoadPdf.value) {
    loadPdf();
  }
  if (!canUpload.value) {
    onUploadFile();
  }
};

const onSubmit = async () => {
  if (!tagForm.bookId || !tagForm.tocId) {
    ElMessage.error('请填写页码');
    return;
  }
  const params: BookRecord = {
    bookId: tagForm.bookId,
    tocHref: tagForm.tocHref,
    tocId: tagForm.tocId,
    tocName: tagForm.tocName.trim(),
  };
  await bookStore.createReadBookRecords(params);
  addTagVisible.value = false;
  if (toPath.value) {
    canGo.value = true;
    // 页面离开时停止加载资源
    onAbort();
    router.push(toPath.value);
  }
  if (!canClose.value) {
    // 页面关闭时停止加载资源
    onAbort();
    emit('update:modalVisible', false);
    canClose.value = true;
  }
  if (!canLoadPdf.value) {
    loadPdf();
  }
  if (!canUpload.value) {
    onUploadFile();
  }
};

const onClose = async () => {
  if (iframeUrl.value && !loading.value) {
    try {
      const res = await Message('', '是否保存阅读记录后再离开？', 'info');
      if (res === 'confirm') {
        addTagVisible.value = true;
        canClose.value = false;
      }
    } catch (error) {
      // 页面关闭时停止加载资源
      onAbort();
      emit('update:modalVisible', false);
    }
  } else {
    // 页面关闭时停止加载资源
    onAbort();
    emit('update:modalVisible', false);
  }
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

  .content {
    display: flex;
    width: 100%;
    flex: 1;
    overflow: auto;
    box-sizing: border-box;
    border-radius: 0;

    :deep {
      .async-loading {
        border-radius: 0;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;

        .loader-wrapper {
          border-radius: 0;
          border-bottom-left-radius: 5px;
          border-bottom-right-radius: 5px;
        }
      }

      .load-text {
        margin-top: 15px;
      }
    }

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

    .preview-wrap {
      position: relative;
      flex: 1;

      .iframe {
        display: flex;
        width: 100%;
        height: 100%;
      }

      .actions {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 10px;
        right: 137px;
        width: 36px;
        height: 36px;
        box-sizing: border-box;
        cursor: pointer;

        &:hover {
          border-radius: 36px;
          background: #424649;
        }

        .iconfont {
          font-size: 15px;
          color: @fff;
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

  .add-tag-wrap {
    :deep {
      .el-form-item__label {
        color: var(--font-3);
      }
      .el-dialog__body {
        padding: 20px 20px 0 20px !important;
      }
    }
  }
}
</style>
