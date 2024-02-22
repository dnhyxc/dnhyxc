<!--
 * 图片预览组件
 * @author: dnhyxc
 * @since: 2023-07-21
 * index.vue
-->
<template>
  <div class="prev-dialog-wrap">
    <el-dialog v-model="visible" :close-on-click-modal="false" align-center width="88vw" @close="onClose">
      <template #header>
        <div class="actions">
          <span class="title">{{ title || '图片预览' }}</span>
          <div class="icon-list">
            <el-tooltip effect="light" :content="isMaxed ? '不能再大了' : '放大'" placement="top" popper-class="custom-dropdown-styles">
              <i class="font iconfont icon-fangda" @click="onScaleMax" />
            </el-tooltip>
            <el-tooltip effect="light" :content="isMined ? '不能再小了' : '缩小'" placement="top" popper-class="custom-dropdown-styles">
              <i class="font iconfont icon-suoxiao" @click="onScaleMin" />
            </el-tooltip>
            <el-tooltip effect="light" content="旋转" placement="top" popper-class="custom-dropdown-styles">
              <i class="font iconfont icon-rotate" @click="onRotate" />
            </el-tooltip>
            <el-tooltip effect="light" content="下载" placement="top" popper-class="custom-dropdown-styles">
              <i class="font iconfont icon-xiazai1" @click="onDownload" />
            </el-tooltip>
            <el-tooltip effect="light" content="重置" placement="top" popper-class="custom-dropdown-styles">
              <i class="font iconfont icon-zhongzhi1" @click="onRefresh" />
            </el-tooltip>
            <el-tooltip v-if="showPrevAndNext && prevImages.length > 1" effect="light" content="上一张" placement="top" popper-class="custom-dropdown-styles">
              <i class="font iconfont icon-arrow-left-bold" @click="onPrev" />
            </el-tooltip>
            <el-tooltip v-if="showPrevAndNext && prevImages.length > 1" effect="light" content="下一张" placement="top" popper-class="custom-dropdown-styles">
              <i class="font iconfont icon-arrow-right-bold" @click="onNext" />
            </el-tooltip>
          </div>
        </div>
      </template>
      <div class="image-preview-wrap">
        <img
          ref="imgRef"
          v-move.imageInfo="imageInfo"
          :src="currentImage.url"
          alt=""
          class="preview-img"
          :style="{ transform: `rotate(${imageInfo.rotate}deg) scale(${imageInfo.scale})` }"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect, nextTick } from 'vue';
import { pictureStore } from '@/store';
import { onDownloadFile } from '@/utils';
import { AtlasItemParams } from '@/typings/common';

interface IProps {
  selectImage: AtlasItemParams;
  previewVisible: boolean;
  showPrevAndNext?: boolean;
  showWaterModal?: Function;
  title?: string;
  prevImgs?: { id: string; url: string }[];
}

const props = defineProps<IProps>();

const currentImage = ref<AtlasItemParams>(props.selectImage);

const imgRef = ref<HTMLImageElement | null>(null);
const imageInfo = reactive<{ scale: number; rotate: number; boundary: boolean; imgWidth: number; imgHeight: number }>({
  scale: 1,
  rotate: 0,
  boundary: true, // 控制是否需要控制边界
  imgWidth: 0,
  imgHeight: 0,
});
const isMaxed = ref<boolean>(false);
const isMined = ref<boolean>(false);

const emit = defineEmits(['update:previewVisible']);

const visible = computed({
  get() {
    return props.previewVisible;
  },
  set(visible: boolean) {
    emit('update:previewVisible', visible);
    currentImage.value = props.selectImage;
    onRefresh();
  },
});

const prevImages = computed(() => {
  return props.prevImgs || pictureStore.atlasList;
});

watchEffect(() => {
  currentImage.value = props.selectImage;
});

watch(
  () => [imageInfo.scale, imageInfo.rotate],
  (newVal) => {
    if (newVal[0] !== 1) {
      nextTick(() => {
        imgRef.value!.style.cursor = 'move';
      });
    }
    if (newVal[1] !== 0) {
      nextTick(() => {
        imgRef.value!.style.cursor = 'move';
      });
    } else {
      imgRef.value!.style.cursor = 'default';
    }
  },
);

// 关闭弹窗时，开启父弹窗
const onClose = () => {
  props?.showWaterModal?.();
};

// 放大
const onScaleMax = () => {
  if (imageInfo.scale >= 5) {
    isMaxed.value = true;
    return;
  }
  isMined.value = false;
  imageInfo.scale += 0.2;
  imageInfo.imgWidth = Math.round(imgRef.value!.width * imageInfo.scale);
  imageInfo.imgHeight = Math.round(imgRef.value!.height * imageInfo.scale);
};

// 缩小
const onScaleMin = () => {
  if (imageInfo.scale <= 1.2) {
    imgRef.value!.style.top = '0';
    imgRef.value!.style.left = '0';
  }
  if (imageInfo.scale <= 0.4) {
    isMined.value = true;
    return;
  }
  isMaxed.value = false;
  imageInfo.scale -= 0.2;
  imageInfo.imgWidth = Math.round(imgRef.value!.width * imageInfo.scale);
  imageInfo.imgHeight = Math.round(imgRef.value!.height * imageInfo.scale);
};

// 旋转
const onRotate = () => {
  if (imageInfo.rotate >= 315) {
    imageInfo.rotate = 0;
    imgRef.value!.style.top = '0';
    imgRef.value!.style.left = '0';
  } else {
    imageInfo.rotate += 45;
  }
};

// 下载
const onDownload = () => {
  onDownloadFile(currentImage.value);
};

// 重置
const onRefresh = () => {
  imageInfo.scale = 1;
  imageInfo.rotate = 0;
  imgRef.value!.style.top = '0';
  imgRef.value!.style.left = '0';
};

// 前一张
const onPrev = () => {
  onRefresh();
  let prevIndex;
  const findIndex = prevImages.value.findIndex((i) => i?.id === currentImage?.value?.id);
  if (findIndex === 0) {
    prevIndex = prevImages.value.length - 1;
  } else {
    prevIndex = findIndex - 1;
  }
  currentImage.value = prevImages.value[prevIndex] as AtlasItemParams;
};

// 后一张
const onNext = () => {
  onRefresh();
  let nextIndex;
  const findIndex = prevImages.value?.findIndex((i) => i.id === currentImage?.value?.id);
  if (findIndex === prevImages.value?.length - 1) {
    nextIndex = 0;
  } else {
    nextIndex = findIndex + 1;
  }
  currentImage.value = prevImages.value[nextIndex] as AtlasItemParams;
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.prev-dialog-wrap {
  :deep {
    .el-dialog__body {
      padding: 10px 20px 20px;
    }
  }
}

.image-preview-wrap {
  position: relative;
  width: 100%;
  height: 71.5vh;
  max-height: 71.5vh;
  overflow: hidden;
  .clickNoSelectText();

  .preview-img {
    // 设置图片展示不变性且完整显示图像
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
}

.actions {
  display: flex;
  align-items: center;

  .title {
    font-size: 18px;
    color: var(--font-1);
    margin-right: 20px;
  }

  .icon-list {
    margin-top: 3px;
    .font {
      font-size: 18px;
      color: var(--font-1);
      margin-left: 15px;
      cursor: pointer;

      &:hover {
        color: var(--theme-blue);
      }
    }

    .icon-arrow-right-bold {
      margin-left: 10px;
    }
  }
}
</style>
