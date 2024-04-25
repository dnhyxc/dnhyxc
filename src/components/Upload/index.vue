<!--
 * 图片裁剪组件
 * @author: dnhyxc
 * @since: 2023-02-10
 * index.vue
-->
<template>
  <div class="upload-wrap">
    <ImagePreview v-model:previewVisible="previewVisible" :select-image="{ url: filePath }" />
    <el-upload
      v-if="!filePath || !showImg"
      class="uploader"
      :multiple="multiple"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="onUpload"
      :accept="accept"
    >
      <slot>
        <el-icon class="uploader-icon">
          <Plus />
        </el-icon>
      </slot>
    </el-upload>
    <div v-if="filePath && preview" class="preview">
      <div v-if="preview" class="mack">
        <i v-if="sourceUrl" class="shot iconfont icon-line-screenshotpingmujietu-01" @click="onRestoreShot" />
        <i class="download iconfont icon-xiazai1" @click.stop="(e) => onDownload(e, cropperUrl || filePath)" />
        <i class="view iconfont icon-browse" @click="onPreview" />
        <i class="del iconfont icon-shanchu" @click="onDelImage" />
      </div>
      <slot name="preview" :data="{ onRestoreShot, onDownload, onPreview, onDelImage }" />
    </div>
    <el-dialog v-model="shotVisible" title="图片剪裁" class="crop-dialog" width="80vw" align-center>
      <div ref="cropperContent" class="cropper-content">
        <div v-if="shotVisible" class="cropper">
          <VueCropper
            ref="cropper"
            :img="filePath"
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
import { ref, reactive, onDeactivated, nextTick, onUnmounted, computed } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import type { UploadProps } from 'element-plus';
import { VueCropper } from 'vue-cropper';
import { uploadStore, pictureStore } from '@/store';
import { FILE_TYPE, FILE_UPLOAD_MSG } from '@/constant';
import { getImgInfo, url2Base64, ipcRenderers, message } from '@/utils';

import 'vue-cropper/dist/index.css';

interface IProps {
  filePath?: string;
  preview?: boolean;
  showImg?: boolean;
  fixedNumber?: number[];
  getUploadUrl?: (url: string, name?: string) => void;
  needCropper?: boolean;
  delete?: boolean; // 控制点击删除图标时，是否删除数据库中的图片
  isAtlas?: boolean; // 是否是图片集上传
  multiple?: boolean; // 是否支持多文件上传
  quality?: number; // 图片压缩比，如果传 0 表示不需要压缩
  accept?: string; // 限制类型
}

const props = withDefaults(defineProps<IProps>(), {
  filePath: '',
  preview: true,
  showImg: true,
  fixedNumber: () => [600, 338],
  getUploadUrl: () => {
  },
  needCropper: true,
  delete: false,
  isAtlas: false,
  multiple: false,
  quality: 0.5,
  accept: '*',
});

const emit = defineEmits(['update:filePath']);
const cropperUrl = ref<string>('');
const sourceUrl = ref<string>(''); // 上传的原图url
const previewVisible = ref<boolean>(false);
const shotVisible = ref<boolean>(false);
const cropperHeight = ref<string>('');
// 截图器容器
const cropperContent = ref<HTMLDivElement | null>(null);
// 截图器dom
const cropper = ref<ReturnType<any>>();
// 缩放默认值
const scaleNum = ref<number>(1);
// 保存上传的fileInfo
const fileInfo = ref<File | null>(null);
// 保存的下载时传给主进程的 URL
const createdUrl = ref<string>('');

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
  sourceUrl.value = '';
});

// 组件卸载时，清除上传的图片
onUnmounted(() => {
  sourceUrl.value = '';
});

// 动态获取 filePath
const filePath = computed({
  get() {
    return props.filePath;
  },
  set(url: string) {
    emit('update:filePath', url);
  },
});

// 上传校验
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!FILE_TYPE.includes(rawFile.type)) {
    message({
      title: FILE_UPLOAD_MSG,
      type: 'error',
    });
    return false;
  } else if (rawFile.size / 1024 / 1024 > 20) {
    message({
      title: '图片不能超过20M',
      type: 'error',
    });
    return false;
  }
  return true;
};

// 自定义上传
const onUpload = async (event: { file: Blob }) => {
  fileInfo.value = event.file as File;
  // 不需要进行裁剪
  if (!props.needCropper) {
    const res = await uploadStore.uploadFile(event.file as File, props.isAtlas, props.quality);
    if (res) {
      props.getUploadUrl?.(res.filePath, event.file.name);
      // 更新父组件传递过来的filePath
      emit('update:filePath', res.filePath);
      if (props.isAtlas) {
        await pictureStore.addAtlasImages(res.filePath, res.compressFile);
      }
    }
    return;
  }
  // 需要裁剪
  const reader = new FileReader();
  reader.onload = async (e: Event) => {
    shotVisible.value = true;
    sourceUrl.value = (e.target as FileReader).result as string;
    emit('update:filePath', (e.target as FileReader).result as string);
    // 获取上传的图片宽高
    const imgInfo = (await getImgInfo((e.target as FileReader).result as string)) as { width: number; height: number };
    // 设置截图框的宽高
    nextTick(() => {
      // 计算截图弹窗的高度
      const height = (cropperContent.value?.offsetWidth! * imgInfo!.height) / imgInfo!.width;
      // 存储截图弹窗的高度
      cropperHeight.value = `${ height }px`;
      // 动态计算截图框的宽度
      const cropWidth = (props.fixedNumber[0] / props.fixedNumber[1]) * height;
      option.autoCropWidth = cropWidth;
      option.autoCropHeight = height;
    });
  };

  reader.readAsDataURL(event.file);
};

// 放大
const onScaleMax = () => {
  if (scaleNum.value > 5) return;
  scaleNum.value += 0.2;
  cropper.value.changeScale(scaleNum.value);
};

// 缩小
const onScaleMin = () => {
  if (scaleNum.value < 0.5) return;
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
    if (loadUrl.includes('data:image')) {
      ipcRenderers.sendDownload(loadUrl);
    } else {
      const url = await url2Base64(loadUrl);
      url && ipcRenderers.sendDownload(url as string);
    }
  } else {
    cropper.value.getCropBlob((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      createdUrl.value = url;
      ipcRenderers.sendDownload(url);
    });
  }

  // 设置一次性监听，防止重复触发
  ipcRenderer.once('download-file', (e, res: string) => {
    if (res) {
      window.URL.revokeObjectURL(createdUrl.value);
      message({
        title: '保存成功！',
        type: 'success',
      });
    }
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
      cropperUrl.value = (e.target as FileReader).result as string;
      // 更新父组件传递过来的filePath
      emit('update:filePath', (e.target as FileReader).result as string);
      shotVisible.value = false;
    };
    reader.readAsDataURL(blob);
    // 将 Blob 转成 File
    const file = new File([blob], fileInfo.value?.name || '', {type: fileInfo.value?.type}) as File;
    const res = await uploadStore.uploadFile(file, false, props.quality);
    if (res) {
      props.getUploadUrl?.(res.filePath);
      // 更新父组件传递过来的filePath
      emit('update:filePath', res.filePath);
      // 文件上传完毕之后，清除存储的文件信息
      fileInfo.value = null;
    }
  });
};

// 重新截图
const onRestoreShot = async () => {
  // 重新截图时，将原图赋值给截图输入框
  if (sourceUrl.value) {
    // 更新父组件传递过来的filePath
    emit('update:filePath', sourceUrl.value);
  }
  shotVisible.value = true;
};

// 预览图片
const onPreview = () => {
  previewVisible.value = true;
};

// 清除图片
const onDelImage = () => {
  // 清空父组件传递过来的filePath
  emit('update:filePath', '');
  // 删除上传的原图片
  if (props.delete) {
    uploadStore.removeFile(props.filePath);
  }
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
    max-height: 70vh;
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
      color: var(--font-4);
      text-align: center;
      box-sizing: border-box;
      border: 1px dashed @border;
      border-radius: 4px;

      &:hover {
        color: var(--theme-blue);
        border: 1px dashed var(--theme-blue);
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
      color: var(--fff);
      display: none;
      z-index: 99;

      .view {
        font-size: 22px;
        cursor: pointer;
      }

      .shot,
      .download,
      .del {
        font-size: 20px;
        cursor: pointer;
        color: @fff;
      }

      .download,
      .shot,
      .view {
        margin-right: 15px;
        color: @fff;
      }
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

    .el-dialog__close {
      color: var(--font-1);
    }
  }
}
</style>
