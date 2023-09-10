<!--
 * 拖拽上传
 * @author: dnhyxc
 * @since: 2023-09-09
 * index.vue
-->
<template>
  <div class="container">
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
      <slot name="info"></slot>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import type { UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { FILE_TYPE, FILE_UPLOAD_MSG } from '@/constant';

interface IProps {
  onUpload: (event: { file: File }) => void;
}

const props = defineProps<IProps>();

// 上传校验
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!FILE_TYPE.includes(rawFile.type)) {
    ElMessage.error(FILE_UPLOAD_MSG);
    return false;
  } else if (rawFile.size / 1024 / 1024 > 20) {
    ElMessage.error('图片不能超过20M');
    return false;
  }
  return true;
};

// 自定义上传
const onUpload = async (event: { file: File }) => {
  props?.onUpload(event);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.container {
  padding: 10px;

  :deep {
    .el-dialog__body {
      padding: 10px 20px 0 !important;
      height: 100%;
    }
    .el-upload-dragger {
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      height: 100%;
      width: 100%;
      padding: 10px 0 20px 0;
      background-color: var(--input-bg-color);
    }

    .upload {
      height: 100%;
    }

    .el-upload {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    .el-input__wrapper {
      height: 100%;
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

  &:hover {
    .el-icon--upload,
    .el-upload__text {
      color: @theme-blue;
    }
  }
}
</style>
