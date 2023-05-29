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
        <el-upload
          class="upload"
          drag
          multiple
          :show-file-list="false"
          :before-upload="beforeUpload"
          :http-request="onUpload"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
          <template #tip>
            <div class="el-upload__tip">jpg/png files with a size less than 500kb</div>
          </template>
        </el-upload>
        <div ref="imageRef" class="image-container" />
        <div ref="imageRef" class="berore" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="warning" @click="onRefresh">重置</el-button>
          <el-button type="primary" plain @click="onDownload">下载</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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

const imageRef = ref<HTMLElement | null>(null);

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
const onUpload = async (event: { file: Blob }) => {
  console.log(event.file, 'event.file');

  const newFile = await compressImage({ file: event.file as File, container: imageRef.value as HTMLElement });

  console.log(newFile, 'newFile');

  // 上传文件
  const res = await uploadStore.uploadFile(event.file as File);
  if (res) {
    console.log(res, 'res');
  }
};

// 重置
const onRefresh = () => {
  console.log('重置');
};

// 下载
const onDownload = () => {
  console.log('下载');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.modal-wrap {
  .content {
    .image-container {
      width: 50%;
      height: auto;

      :deep {
        .compress-image {
          width: 100%;
          height: auto;
          .imgStyle();
        }
      }
    }
  }
}
</style>
