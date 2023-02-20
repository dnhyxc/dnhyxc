<!--
 * 图片裁剪组件
 * @author: dnhyxc
 * @since: 2023-02-10
 * index.vue
-->
<template>
  <div class="upload-wrap">
    <el-dialog v-model="dialogVisible" title="图片预览" width="50%">
      <div class="preview-dialog">
        <img :src="imageUrl" alt="" class="prew-img" />
      </div>
    </el-dialog>
    <el-upload
      v-if="!imageUrl || !showImg"
      class="uploader"
      :show-file-list="false"
      :on-preview="handlePreview"
      :before-upload="beforeUpload"
      :http-request="onUpload"
    >
      <slot>
        <el-icon class="uploader-icon"><Plus /></el-icon>
      </slot>
    </el-upload>
    <div v-if="imageUrl" class="preview">
      <div v-if="preview" class="mack">
        <i class="view iconfont icon-browse" @click="onPreview" />
        <i class="del iconfont icon-shanchu" @click="onDelImage" />
      </div>
      <img v-if="showImg" :src="imageUrl" class="cover-img" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { UploadProps } from 'element-plus';
import { FILE_TYPE } from '@/constant';

interface IProps {
  getCoverImage: (url: string) => void;
  preview?: boolean;
  defaultUrl?: string;
  showImg?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  preview: true,
  defaultUrl: '',
  showImg: true,
});

const imageUrl = ref<string>(props?.defaultUrl);
const dialogVisible = ref<boolean>(false);

// 监听imageUrl，实时传递给父元素
watch(imageUrl, (newVal, oldVal) => {
  console.log(newVal, oldVal);
  if (newVal) {
    console.log(newVal, 'newVal>>>>watch');

    // props.getCoverImage(newVal);
  }
});

const handlePreview: UploadProps['onPreview'] = (file) => {
  console.log(file, 'uploadFile');

  imageUrl.value = file.url!;
};

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!FILE_TYPE.includes(rawFile.type)) {
    ElMessage.error('请上传 png、jpg、jpeg、gif 格式的图片');
    return false;
  } else if (rawFile.size / 1024 / 1024 > 20) {
    ElMessage.error('图片不能超过20M');
    return false;
  }
  return true;
};

// 自定义上传
const onUpload = (event: any) => {
  console.log(event.file.path, 'file');
  const reader = new FileReader();
  reader.onload = (e: Event) => {
    imageUrl.value = (e.target as FileReader).result as string;
    props.getCoverImage((e.target as FileReader).result as string);
  };
  reader.readAsDataURL(event.file);
};

// 预览图片
const onPreview = () => {
  console.log(imageUrl.value, 'onPreview');
  dialogVisible.value = true;
};

// 清除图片
const onDelImage = () => {
  imageUrl.value = '';
  props.getCoverImage('');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.upload-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 100%;

  .uploader {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 100%;
    box-sizing: border-box;
    :deep {
      .el-upload {
        width: 100%;
        height: 100%;
      }
    }
    .uploader-icon {
      font-size: 20px;
      width: 100%;
      height: 100%;
      color: @font-4;
      text-align: center;
      box-sizing: border-box;
      border: 1px dashed @border;
      border-radius: 4px;

      &:hover {
        color: @theme-blue;
        border: 1px dashed @theme-blue;
      }
    }
  }

  .preview {
    position: relative;
    height: 100%;
    width: 100%;
    border-radius: 4px;
    box-sizing: border-box;

    .mack {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      background-color: @shade-1;
      color: @fff;
      display: none;

      .view,
      .del {
        font-size: 22px;
        cursor: pointer;
      }

      .del {
        margin-left: 20px;
      }
    }

    .cover-img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 4px;
      .imgStyle();
    }

    &:hover {
      .mack {
        display: flex;
      }
      .cover-img {
        object-position: bottom right;
      }
    }
  }

  .preview-dialog {
    width: 100%;
    height: auto;
    box-sizing: border-box;

    .prew-img {
      display: block;
      width: 100%;
      height: auto;
    }
  }

  :deep {
    .el-dialog__header {
      padding: 15px 15px 11px 20px;
    }
    .el-dialog__body {
      padding: 0 20px 20px 20px;
    }
  }
}
</style>
