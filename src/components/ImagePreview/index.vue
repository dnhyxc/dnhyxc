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
          <i class="font iconfont icon-fangda" @click="onScaleMax" />
          <i class="font iconfont icon-suoxiao" @click="onScaleMin" />
          <i class="font iconfont icon-rotate" @click="onRotate" />
          <i class="font iconfont icon-xiazai1" @click="onDownload" />
          <i class="font iconfont icon-zhongzhi1" @click="onRefresh" />
        </div>
      </div>
    </template>
    <div class="image-preview-wrap">
      <img
        ref="imgRef"
        v-move.imageInfo="imageInfo"
        :src="selectImage.url"
        alt=""
        class="preview-img"
        :style="{ transform: `rotate(${imageInfo.rotate}deg) scale(${imageInfo.scale})` }"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { AtlasItemParams } from '@/typings/common';

interface IProps {
  selectImage: AtlasItemParams;
  previewVisible: boolean;
}

const props = defineProps<IProps>();

const imgRef = ref<HTMLImageElement | null>(null);
const imageInfo = reactive<{ scale: number; rotate: number }>({ scale: 1, rotate: 0 });

const emit = defineEmits(['update:previewVisible']);

const visible = computed({
  get() {
    return props.previewVisible;
  },
  set(visible: boolean) {
    emit('update:previewVisible', visible);
  },
});

watch(
  () => imageInfo.scale,
  (newVal) => {
    if (newVal > 1) {
      imgRef.value!.style.cursor = 'move';
    } else {
      imgRef.value!.style.cursor = 'default';
    }
  },
);

watch(
  () => imageInfo.rotate,
  (newVal) => {
    if (newVal !== 0) {
      imgRef.value!.style.cursor = 'move';
    } else {
      imgRef.value!.style.cursor = 'default';
    }
  },
);

// 放大
const onScaleMax = () => {
  if (imageInfo.scale >= 2) return;
  imageInfo.scale += 0.2;
};

// 缩小
const onScaleMin = () => {
  if (imageInfo.scale <= 1.2) {
    imgRef.value!.style.top = '0';
    imgRef.value!.style.left = '0';
  }
  if (imageInfo.scale <= 0.5) return;
  imageInfo.scale -= 0.2;
};

// 旋转
const onRotate = () => {
  if (imageInfo.rotate >= 360) {
    imageInfo.rotate = 0;
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
    height: 100%;
    object-fit: cover;
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
  }
}
</style>
