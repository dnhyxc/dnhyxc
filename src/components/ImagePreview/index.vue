<!--
 * 图片预览组件
 * @author: dnhyxc
 * @since: 2023-07-21
 * index.vue
-->
<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" align-center width="88vw">
    <template #header>
      <div class="actions">
        <span class="title">图片预览</span>
        <div class="icon-list">
          <el-tooltip effect="light" content="放大" placement="top">
            <i class="font iconfont icon-fangda" @click="onScaleMax" />
          </el-tooltip>
          <el-tooltip effect="light" content="缩小" placement="top">
            <i class="font iconfont icon-suoxiao" @click="onScaleMin" />
          </el-tooltip>
          <el-tooltip effect="light" content="旋转" placement="top">
            <i class="font iconfont icon-rotate" @click="onRotate" />
          </el-tooltip>
          <el-tooltip effect="light" content="下载" placement="top">
            <i class="font iconfont icon-xiazai1" @click="onDownload" />
          </el-tooltip>
          <el-tooltip effect="light" content="重置" placement="top">
            <i class="font iconfont icon-zhongzhi1" @click="onRefresh" />
          </el-tooltip>
          <el-tooltip effect="light" content="上一张" placement="top">
            <i class="font iconfont icon-arrow-left-bold" @click="onPrev" />
          </el-tooltip>
          <el-tooltip effect="light" content="下一张" placement="top">
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
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect, nextTick } from 'vue';
import { pictureStore } from '@/store';
import { AtlasItemParams } from '@/typings/common';

interface IProps {
  selectImage: AtlasItemParams;
  previewVisible: boolean;
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

const emit = defineEmits(['update:previewVisible']);

const visible = computed({
  get() {
    return props.previewVisible;
  },
  set(visible: boolean) {
    emit('update:previewVisible', visible);
    onRefresh();
  },
});

watchEffect(() => {
  currentImage.value = props.selectImage;
});

watch(
  () => [imageInfo.scale, imageInfo.rotate],
  (newVal) => {
    if (newVal[0] > 1) {
      console.log(newVal, 'nessss');
      nextTick(() => {
        imgRef.value!.style.cursor = 'move';
      });
    } else {
      imgRef.value!.style.cursor = 'default';
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

// 放大
const onScaleMax = () => {
  if (imageInfo.scale >= 2) return;
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
  if (imageInfo.scale <= 0.5) return;
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
  console.log('下载');
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
  const findIndex = pictureStore.atlasList.findIndex((i) => i.id === currentImage?.value?.id);
  if (findIndex === 0) {
    prevIndex = pictureStore.atlasList.length - 1;
  } else {
    prevIndex = findIndex - 1;
  }
  currentImage.value = pictureStore.atlasList[prevIndex];
};

// 后一张
const onNext = () => {
  onRefresh();
  let nextIndex;
  const findIndex = pictureStore.atlasList.findIndex((i) => i.id === currentImage?.value?.id);
  if (findIndex === pictureStore.atlasList.length - 1) {
    nextIndex = 0;
  } else {
    nextIndex = findIndex + 1;
  }
  currentImage.value = pictureStore.atlasList[nextIndex];
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.image-preview-wrap {
  position: relative;
  width: 100%;
  height: 72.5vh;
  overflow: hidden;

  .preview-img {
    width: 100%;
    height: auto;
    // object-fit: cover;
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
    }

    .icon-arrow-right-bold {
      margin-left: 10px;
    }
  }
}
</style>
