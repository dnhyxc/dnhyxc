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
          <div class="image-container">
            <div class="before">
              <span class="info">压缩前</span>
              <img :src="IMG1" alt="" class="compress-image-origin" />
            </div>
            <div ref="imageRef" class="after">
              <span class="info">压缩后</span>
            </div>
          </div>
        </el-scrollbar>
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
import { FILE_TYPE, IMG1 } from '@/constant';
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
  overflow: hidden;

  :deep {
    .el-dialog__body {
      padding: 10px;
    }
    .el-upload-dragger {
      padding: 10px 0 20px 0;
    }
  }

  .content {
    height: 280px;

    .upload-info {
      margin-bottom: 10px;
      color: var(--font-5);
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
        padding-right: 20px;

        .compress-image-origin {
          width: 100%;
          height: auto;
          border-radius: 5px;
          .imgStyle();
        }

        :deep {
          .compress-image {
            width: 100%;
            height: auto;
            border-radius: 5px;
            .imgStyle();
          }
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
