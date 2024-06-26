<!--
 * pdf 预览
 * @author: dnhyxc
 * @since: 2024-01-04
 * index.vue
-->
<template>
  <div class="pdf-preview-wrap">
    <PreviewHeader
      title="PDF 预览"
      load-line-text="在线 PDF"
      accept=".pdf"
      :file-name="fileName"
      :save-loading="saveLoading"
      :loading="bookStore.pdfInfo.loading"
      :save-status="saveStatus"
      :url="bookStore.pdfInfo.iframeUrl"
      :load-type="loadType"
      :on-close="onClose"
      :on-save="onSave"
      :before-upload="beforeUpload"
      :on-upload="onUpload"
      :show-book-list="showBookList"
      :hide-header="hideHeader"
    />
    <Loading
      :loading="bookStore.pdfInfo.loading"
      f
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
      <div v-if="!bookStore.pdfInfo.iframeUrl" class="preview-wrap">
        <DragUpload
          class="drag-upload"
          :on-upload="onUpload"
          accept=".pdf"
          file-type="pdf"
          upload-info-text="pdf 格式的文件"
        />
      </div>
      <div v-else class="preview-wrap">
        <iframe :src="bookStore.pdfInfo.iframeUrl" frameborder="0" class="iframe" />
        <div class="actions" @click="bookStore.pdfInfo.addTagVisible = true">
          <i class="iconfont icon-biaoqian" title="保存书签" />
        </div>
      </div>
    </Loading>
    <BookList
      v-model:visible="visible"
      v-model:loadStatus="bookStore.pdfInfo.loading"
      :read-book="previewPdf"
      load-type="pdf"
      :book-id="currentBookId"
    />
    <div class="add-tag-wrap">
      <el-dialog v-model="bookStore.pdfInfo.addTagVisible" title="保存书签" align-center draggable width="400px">
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
import { ref, reactive, computed, onUnmounted } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import type { UploadProps, FormInstance } from 'element-plus';
import { uploadStore, bookStore } from '@/store';
import { DOMAIN_URL } from '@/constant';
import { calculateLoadProgress, Message, getUniqueFileName, ipcRenderers, message } from '@/utils';
import { AtlasItemParams, BookRecord } from '@/typings/common';
import BookList from '../BookList/index.vue';
import PreviewHeader from '../PreviewHeader/index.vue';

interface IProps {
  hideHeader?: boolean;
}

interface Emits {
  (e: 'update:modalVisible', visible: boolean): void;
}

const props = defineProps<IProps>();

const emit = defineEmits<Emits>();

const router = useRouter();

const fileName = ref<string>('');
const visible = ref<boolean>(false);
// 选择渠道
const loadType = ref<string>('upload');
// 加载进度
const progress = ref<number>(0);
// 当前选择的书籍大小
const pdfSize = ref<number>(0);
// 当前加载书籍的大小
const loadPdfSize = ref<number>(0);
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
const canLoadPdf = ref<boolean>(true);
const canUpload = ref<boolean>(true);
const rawFile = ref<File | null>(null);
// 当前阅读书籍id
const currentBookId = ref<string>('');
// 保存状态
const saveStatus = ref<boolean>(false);
// 保存loading
const saveLoading = ref<boolean>(false);

// 定时器
let timer: ReturnType<typeof setTimeout> | null = null;
// 用于存储上一个 ReadableStreamDefaultReader 对象
let previousReader: any = null;

// 判断是否保存过书籍
const isSaved = computed(() => {
  return bookStore.blobs.find((i) => i.id === tagForm.bookId);
});

// 组件卸载时，清空，防止在独立窗口打开时一直缓存了这些属性
onUnmounted(() => {
  bookStore.pdfInfo = {
    canClose: true,
    addTagVisible: false,
    loading: false,
    iframeUrl: '',
  };
});

onBeforeRouteLeave(async (to, from, next) => {
  // 页面离开时时，保存上一次阅读的位置
  if (!tagForm.bookId || (loadType.value === 'line' && !bookStore.pdfInfo.iframeUrl && progress.value < 100)) {
    // 页面离开时停止加载资源
    onAbort();
    next();
  } else {
    if (!canGo.value && !bookStore.pdfInfo.loading) {
      try {
        const res = await Message('', '是否保存阅读记录后再离开？', 'info');
        if (res === 'confirm') {
          bookStore.pdfInfo.addTagVisible = true;
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
  bookStore.pdfInfo.loading = true;
  fileName.value = rawFile.value.name;
  const fileURL = URL.createObjectURL(rawFile.value);
  // getUniqueFileName 获取唯一文件信息
  const {newFile} = await getUniqueFileName(rawFile.value);
  const filePath = getFilePath(newFile.name);
  // 根据url及userId查找书籍信息，获取书籍 ID，便于查找当前书籍的阅读记录
  await bookStore.findBook(filePath);
  if (bookStore.currentUploadId) {
    tagForm.bookId = bookStore.currentUploadId;
    getReadBookRecords(fileURL, bookStore.currentUploadId);
  } else {
    bookStore.pdfInfo.iframeUrl = fileURL;
    clearLoading();
  }
};

// 保存
const onSave = async () => {
  if (!rawFile.value) return;
  saveLoading.value = true;
  const res = await uploadStore.uploadOtherFile(rawFile.value).finally(() => {
    saveLoading.value = false;
  });
  if (res) {
    await bookStore.addBook(res.filePath, rawFile.value);
    saveStatus.value = true;
  }
};

const getFilePath = (fileName: string) => {
  const isDev = import.meta.env.DEV;
  const filePath = isDev ? `http://localhost:9112/files/${ fileName }` : `http://${ DOMAIN_URL }/files/${ fileName }`;
  return filePath;
};

// 上传校验
const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
  loadType.value = 'upload';
  if (file.type !== 'application/pdf') {
    message({
      title: '只允许上传 epub 格式的文件！',
      type: 'error',
    });
    return false;
  }
  return true;
};

// 自定义上传
const onUpload = async ({file}: { file: File }) => {
  rawFile.value = file;
  if (!bookStore.pdfInfo.iframeUrl || !tagForm.bookId) {
    onUploadFile();
  } else {
    try {
      const res = await Message('', '是否保存阅读记录后再重新选择？', 'info');
      if (res === 'confirm') {
        bookStore.pdfInfo.addTagVisible = true;
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
  bookStore.pdfInfo.loading = false;
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

bookStore.pdfInfo.onAbort = onAbort;

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
    bookStore.pdfInfo.loading = false;
  });
  if (blob) {
    const fileURL = URL.createObjectURL(blob);
    getReadBookRecords(fileURL, id);
    // 保存书籍blob
    bookStore.saveBlob({id, blob});
  } else {
    bookStore.pdfInfo.loading = false;
  }
};

const loadPdf = () => {
  if (!activePdf.value || bookStore.pdfInfo.loading) return;
  resetRendition();
  visible.value = false;
  bookStore.pdfInfo.loading = true;
  loadType.value = 'line';
  const {url, size, fileName: name, id} = activePdf.value;
  tagForm.bookId = id;
  pdfSize.value = size / 1024 / 1024;
  fileName.value = name;
  // 如果从缓存中找到了该书籍的数据，则不从线上加载
  if (isSaved.value) {
    const fileURL = URL.createObjectURL(isSaved.value?.blob);
    getReadBookRecords(fileURL, id);
  } else {
    loadBookBlob(id, url);
  }
};

const previewPdf = async (data: AtlasItemParams) => {
  activePdf.value = data;
  if (!bookStore.pdfInfo.iframeUrl) {
    loadPdf();
  } else {
    try {
      const res = await Message('', '是否保存阅读记录后再离开？', 'info');
      if (res === 'confirm') {
        bookStore.pdfInfo.addTagVisible = true;
        canLoadPdf.value = false;
      }
    } catch (error) {
      loadPdf();
    }
  }
};

// 获取读书记录
const getReadBookRecords = async (fileURL: string, curBookId: string) => {
  if (!tagForm.bookId || !['/tools', '/compile'].includes(location.pathname) || !fileURL) return;
  await bookStore.getReadBookRecords(tagForm.bookId);
  if (bookStore.bookRecordInfo) {
    const {tocName, tocId, tocHref, bookId} = bookStore.bookRecordInfo;
    tagForm.tocHref = tocHref!;
    tagForm.tocId = tocId!;
    tagForm.tocName = tocName!;
    tagForm.bookId = bookId!;
    try {
      const res = await Message(`第 ${ tocId } 页 ${ tocName || '' }`, '是否跳转到历史阅读目录？', 'info');
      if (res === 'confirm') {
        bookStore.pdfInfo.iframeUrl = `${ fileURL }#page=${ tocId }`;
        currentBookId.value = curBookId;
        clearLoading();
      }
    } catch (error) {
      bookStore.pdfInfo.iframeUrl = fileURL;
      currentBookId.value = curBookId;
      clearLoading();
    }
  } else {
    bookStore.pdfInfo.iframeUrl = fileURL;
    currentBookId.value = curBookId;
    clearLoading();
  }
};

const clearLoading = () => {
  const size = pdfSize.value || rawFile.value?.size! / 1024 / 1024;
  const time = size > 10 ? 10000 : 2000;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  timer = setTimeout(() => {
    bookStore.pdfInfo.loading = false;
  }, time);
};

const onCancel = () => {
  bookStore.pdfInfo.addTagVisible = false;
  if (toPath.value) {
    canGo.value = true;
    // 页面离开时停止加载资源
    onAbort();
    router.push(toPath.value);
  }
  if (!bookStore.pdfInfo.canClose) {
    // 页面关闭时停止加载资源
    onAbort();
    bookStore.pdfInfo.canClose = true;
    if (props.hideHeader) {
      ipcRenderers.sendNewWinOut('tools_pdf');
    } else {
      emit('update:modalVisible', false);
    }
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
    message({
      title: '请填写页码！',
      type: 'error',
    });
    return;
  }
  const params: BookRecord = {
    bookId: tagForm.bookId,
    tocHref: tagForm.tocHref,
    tocId: tagForm.tocId,
    tocName: tagForm.tocName.trim(),
  };
  await bookStore.createReadBookRecords(params);
  bookStore.pdfInfo.addTagVisible = false;
  if (toPath.value) {
    canGo.value = true;
    // 页面离开时停止加载资源
    onAbort();
    router.push(toPath.value);
  }
  if (!bookStore.pdfInfo.canClose) {
    // 页面关闭时停止加载资源
    onAbort();
    bookStore.pdfInfo.canClose = true;
    if (props.hideHeader) {
      ipcRenderers.sendNewWinOut('tools_pdf');
    } else {
      emit('update:modalVisible', false);
    }
  }
  if (!canLoadPdf.value) {
    loadPdf();
  }
  if (!canUpload.value) {
    onUploadFile();
  }
};

const onClose = async () => {
  // 关闭时重置canUpload及canLoadPdf属性，防止关闭时再次触发onUploadFile方法
  canUpload.value = true;
  canLoadPdf.value = true;
  if (bookStore.pdfInfo.iframeUrl && !bookStore.pdfInfo.loading) {
    try {
      const res = await Message('', '是否保存阅读记录后再离开？', 'info');
      if (res === 'confirm') {
        bookStore.pdfInfo.addTagVisible = true;
        bookStore.pdfInfo.canClose = false;
      }
    } catch (error) {
      // 页面关闭时停止加载资源
      onAbort();
      if (props.hideHeader) {
        ipcRenderers.sendNewWinOut('tools_pdf');
      } else {
        emit('update:modalVisible', false);
      }
    }
  } else {
    // 页面关闭时停止加载资源
    onAbort();
    if (props.hideHeader) {
      ipcRenderers.sendNewWinOut('tools_pdf');
    } else {
      emit('update:modalVisible', false);
    }
  }
};

bookStore.pdfInfo.onClose = onClose;
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.pdf-preview-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;

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
