<!--
 * 图片裁剪组件
 * @author: dnhyxc
 * @since: 2023-02-10
 * index.vue
-->
<template>
  <div class="upload-wrap">
    <!-- <el-dialog v-model="dialogVisible" title="图片预览" width="50%">
      <div class="preview-dialog">
        <img :src="imageUrl" alt="" class="prew-img" />
      </div>
    </el-dialog> -->
    <el-upload
      v-if="(!imageUrl && !defaultUrl) || !showImg"
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
    <div v-if="imageUrl || defaultUrl" class="preview">
      <div v-if="preview" class="mack">
        <i class="view iconfont icon-browse" @click="onPreview" />
        <i class="del iconfont icon-shanchu" @click="onDelImage" />
      </div>
      <img v-if="showImg" :src="imageUrl || defaultUrl" class="cover-img" />
    </div>
    <el-dialog v-model="dialogVisible" title="图片剪裁" class="crop-dialog" width="490px">
      <div class="cropper-content">
        <div class="cropper" style="text-align: center">
          <VueCropper
            v-if="dialogVisible"
            ref="cropper"
            :img="imageUrl"
            :output-size="option.outputSize"
            :output-type="option.outputType"
            :info="true"
            :full="option.full"
            :can-move-box="option.canMoveBox"
            :original="option.original"
            :auto-crop="option.autoCrop"
            :fixed="option.fixed"
            :fixed-number="option.fixedNumber"
            :center-box="option.centerBox"
            :info-true="option.infoTrue"
            :fixed-box="option.fixedBox"
            :auto-crop-width="option.autoCropWidth"
            :auto-crop-height="option.autoCropHeight"
          />
        </div>
      </div>
      <div class="footer">
        <el-button @click="onFinish">完成</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onDeactivated } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { UploadProps } from 'element-plus';
import { createStore, uploadStore } from '@/store';
import { FILE_TYPE } from '@/constant';
import 'vue-cropper/dist/index.css';

// 组件中使用
import { VueCropper } from 'vue-cropper';

interface IProps {
  getCoverImage?: (url: string) => void;
  preview?: boolean;
  defaultUrl?: string;
  showImg?: boolean;
}

const cropper = ref();

const option = reactive({
  img: 'https://pic1.zhimg.com/80/v2-366c0aeae2b4050fa2fcbfc09c74aad4_720w.jpg', // 裁剪图片的地址
  info: true, // 裁剪框的大小信息
  outputSize: 1, // 裁剪生成图片的质量
  outputType: 'png', // 裁剪生成图片的格式
  canScale: false, // 图片是否允许滚轮缩放
  autoCrop: true, // 是否默认生成截图框
  canMoveBox: true, // 截图框能否拖动
  autoCropWidth: 500, // 默认生成截图框宽度
  autoCropHeight: 300, // 默认生成截图框高度
  fixedBox: false, // 固定截图框大小 不允许改变
  fixed: true, // 是否开启截图框宽高固定比例
  fixedNumber: [600, 338], // 截图框的宽高比例
  full: false, // 是否输出原图比例的截图
  original: false, // 上传图片按照原始比例渲染
  centerBox: true, // 截图框是否被限制在图片里面
  infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
});

const onFinish = () => {
  cropper.value?.getCropBlob(async (blob: any) => {
    const reader = new FileReader();
    reader.onload = (e: Event) => {
      imageUrl.value = (e.target as FileReader).result as string;
      props.getCoverImage && props.getCoverImage((e.target as FileReader).result as string);
    };
    reader.readAsDataURL(blob);
    await uploadStore.uploadFile(blob);
    dialogVisible.value = false;
  });
};

const props = withDefaults(defineProps<IProps>(), {
  preview: true,
  defaultUrl: '',
  showImg: true,
  getCoverImage: () => {},
});

const imageUrl = ref<string>('');
const dialogVisible = ref<boolean>(false);

// 组件弃用时，清除上传的图片
onDeactivated(() => {
  imageUrl.value = '';
});

const handlePreview: UploadProps['onPreview'] = (file) => {
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
const onUpload = async (event: { file: Blob }) => {
  const reader = new FileReader();
  reader.onload = (e: Event) => {
    dialogVisible.value = true;
    imageUrl.value = (e.target as FileReader).result as string;
    props.getCoverImage && props.getCoverImage((e.target as FileReader).result as string);
  };

  reader.readAsDataURL(event.file);
};

// 预览图片
const onPreview = () => {
  dialogVisible.value = true;
};

// 清除图片
const onDelImage = () => {
  imageUrl.value = '';
  props.getCoverImage('');
  createStore.createInfo.coverImage = '';
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

  .cropper {
    height: 300px;
  }

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
