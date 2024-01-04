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
          <span type="primary" link class="book-btn upload-text">选择本地书籍</span>
        </el-upload>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <div class="content">pdfjs无法渲染啊</div>
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

const iframeUrl = ref<string>('');

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
  const reader = new FileReader();
  reader.onload = async (e: Event) => {
    const buffer = (e.target as FileReader).result as string;
    console.log(file.type, 'file.type');

    const fileBlob = new Blob([buffer], { type: file.type });
    console.log(fileBlob, 'fileBlob');
    iframeUrl.value = URL.createObjectURL(fileBlob);
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
  border: 1px solid red;
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
    padding: 10px;

    iframe {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
