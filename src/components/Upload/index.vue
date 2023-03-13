<!--
 * 图片裁剪组件
 * @author: dnhyxc
 * @since: 2023-02-10
 * index.vue
-->
<template>
  <div class="upload-wrap">
    <el-dialog v-model="previewVisible" title="图片预览" width="600px">
      <div class="preview-dialog">
        <img :src="imageUrl || defaultUrl" alt="" class="prew-img" />
      </div>
    </el-dialog>
    <el-upload
      v-if="(!imageUrl && !defaultUrl) || !showImg"
      class="uploader"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="onUpload"
    >
      <slot>
        <el-icon class="uploader-icon"><Plus /></el-icon>
      </slot>
    </el-upload>
    <div v-if="imageUrl || defaultUrl" class="preview">
      <div v-if="preview" class="mack">
        <i v-if="imageUrl" class="shot iconfont icon-line-screenshotpingmujietu-01" @click="onRestoreShot" />
        <i class="download iconfont icon-xiazai1" @click="(e) => onDownload(e, imageUrl || defaultUrl)" />
        <i class="view iconfont icon-browse" @click="onPreview" />
        <i class="del iconfont icon-shanchu" @click="onDelImage" />
      </div>
      <img v-if="showImg" :src="imageUrl || defaultUrl" class="cover-img" />
    </div>
    <el-dialog v-model="shotVisible" title="图片剪裁" class="crop-dialog" width="600px">
      <div ref="cropperContent" class="cropper-content">
        <div v-if="shotVisible && (imageUrl || defaultUrl)" class="cropper">
          <VueCropper
            ref="cropper"
            :img="imageUrl || defaultUrl"
            :output-size="option.outputSize"
            :output-type="option.outputType"
            :info="option.info"
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
        <el-button type="primary" plain @click="onScaleMax">放大</el-button>
        <el-button type="primary" plain @click="onScaleMin">缩小</el-button>
        <el-button type="primary" plain @click="onRotate">旋转</el-button>
        <el-button type="primary" plain @click="onDownload">下载</el-button>
        <el-button type="warning" @click="onRefresh">重置</el-button>
        <el-button type="success" @click="onFinish">完成</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref, reactive, onDeactivated, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { UploadProps } from 'element-plus';
import { VueCropper } from 'vue-cropper';
import { createStore, uploadStore } from '@/store';
import { FILE_TYPE } from '@/constant';
import { getImgInfo } from '@/utils';

import 'vue-cropper/dist/index.css';

interface IProps {
  getCoverImage?: (url: string) => void;
  preview?: boolean;
  defaultUrl?: string;
  showImg?: boolean;
  fixedNumber?: number[];
}

const props = withDefaults(defineProps<IProps>(), {
  preview: true,
  defaultUrl: '',
  showImg: true,
  getCoverImage: () => {},
  fixedNumber: () => [600, 338],
});

const imageUrl = ref<string>('');
const sourceUrl = ref<string>(''); // 上传的原图url
const previewVisible = ref<boolean>(false);
const shotVisible = ref<boolean>(false);
const cropperHeight = ref<string>('');
// 截图器容器
const cropperContent = ref<HTMLDivElement | null>(null);
// 截图器dom
const cropper = ref<ReturnType<typeof VueCropper>>();
// 缩放默认值
const scaleNum = ref<number>(1);

// 截图器配置
const option = reactive({
  img: '',
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
  fixedNumber: props.fixedNumber, // 截图框的宽高比例
  full: false, // 是否输出原图比例的截图
  original: false, // 上传图片按照原始比例渲染
  centerBox: true, // 截图框是否被限制在图片里面
  infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
});

// 组件弃用时，清除上传的图片
onDeactivated(() => {
  imageUrl.value = '';
});

// 上传校验
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
const onUpload = (event: { file: Blob }) => {
  const reader = new FileReader();
  reader.onload = async (e: Event) => {
    shotVisible.value = true;
    sourceUrl.value = (e.target as FileReader).result as string;
    imageUrl.value = (e.target as FileReader).result as string;
    // 获取上传的图片宽高
    const imgInfo = (await getImgInfo((e.target as FileReader).result as string)) as { width: number; height: number };
    // 设置截图框的宽高
    nextTick(() => {
      // 计算截图弹窗的高度
      const height = (cropperContent.value?.offsetWidth! * imgInfo!.height) / imgInfo!.width;
      // 存储截图弹窗的高度
      cropperHeight.value = `${height}px`;
      // 动态计算截图框的宽度
      const cropWidth = (props.fixedNumber[0] / props.fixedNumber[1]) * height;
      option.autoCropWidth = cropWidth;
      option.autoCropHeight = height;
    });
    props.getCoverImage && props.getCoverImage((e.target as FileReader).result as string);
  };

  reader.readAsDataURL(event.file);
};

// 放大
const onScaleMax = () => {
  scaleNum.value += 0.2;
  cropper.value.changeScale(scaleNum.value);
};

// 缩小
const onScaleMin = () => {
  scaleNum.value -= 0.2;
  cropper.value.changeScale(-scaleNum.value);
};

// 旋转
const onRotate = () => {
  cropper.value.rotateRight();
};

// 下载
const onDownload = async (e: Event, loadUrl?: string) => {
  if (loadUrl) {
    ipcRenderer.send('download', loadUrl);
  } else {
    cropper.value.getCropBlob((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      ipcRenderer.send('download', url);
    });
  }

  // 设置一次性监听，防止重复触发
  ipcRenderer.once('download-file', (e, res: string) => {
    ElMessage({
      message: res ? '保存成功' : '保存失败',
      type: res ? 'success' : 'error',
      offset: 80,
      duration: 2000,
    });
  });
};

// 重置
const onRefresh = () => {
  cropper.value.refresh();
};

// 完成截图事件
const onFinish = () => {
  cropper.value?.getCropBlob(async (blob: any) => {
    const reader = new FileReader();
    reader.onload = (e: Event) => {
      imageUrl.value = (e.target as FileReader).result as string;
      props.getCoverImage && props.getCoverImage((e.target as FileReader).result as string);
      shotVisible.value = false;
    };
    reader.readAsDataURL(blob);
    await uploadStore.uploadFile(blob);
  });
};

// 重新截图
const onRestoreShot = async () => {
  // 重新截图时，将原图赋值给截图输入框
  imageUrl.value = sourceUrl.value;
  shotVisible.value = true;
};

// 预览图片
const onPreview = () => {
  previewVisible.value = true;
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
    height: v-bind(cropperHeight);
  }

  .footer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
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

      .view {
        font-size: 22px;
        cursor: pointer;
      }

      .shot,
      .download,
      .del {
        font-size: 20px;
        cursor: pointer;
      }

      .download,
      .shot,
      .view {
        margin-right: 20px;
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
