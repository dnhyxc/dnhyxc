<!--
 * 图片裁剪工具
 * @author: dnhyxc
 * @since: 2023-09-15
 * index.vue
-->
<template>
  <div class="container">
    <div class="title">
      <div class="left">
        <span>图片剪裁</span>
        <span class="title-info">
          （当前采用<span v-if="option.fixed" class="type">固定裁剪</span>
          <span v-else class="type">自定义裁剪</span>比例进行裁剪）
        </span>
        <span class="left-action">
          <el-switch
            v-model="imgFrom"
            style="--el-switch-off-color: var(--theme-blue); --el-switch-on-color: var(--active)"
            size="small"
            active-text="在线图片"
            inactive-text="本地图片"
          />
        </span>
      </div>
      <span class="close" @click="onClose">关闭</span>
    </div>
    <div ref="cropperContent" class="cropper-content">
      <div v-if="cropperVisible" :class="`${checkOS() === 'mac' && 'cropper-mac'} cropper`">
        <VueCropper
          ref="cropper"
          :img="cropperUrl || sourceUrl"
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
    <div class="content">
      <DragUpload
        v-if="!cropperUrl && !sourceUrl && !imgFrom"
        :class="`${checkOS() === 'mac' && 'drag-upload-mac'} drag-upload`"
        :on-upload="onUpload"
      />
      <OnlineImage v-if="!cropperUrl && !sourceUrl && imgFrom" :on-use-online-url="onUseOnlineUrl" />
    </div>
    <div class="footer">
      <el-button type="primary" class="btn roportion" @click="onCropFixed">
        {{ option.fixed ? '自定义比例' : '固定比例' }}
      </el-button>
      <el-button type="primary" class="btn" plain :disabled="!sourceUrl" @click="onScaleMax">放大</el-button>
      <el-button type="primary" class="btn" plain :disabled="!sourceUrl" @click="onScaleMin">缩小</el-button>
      <el-button type="primary" class="btn" plain :disabled="!sourceUrl" @click="onRotate">旋转</el-button>
      <el-dropdown>
        <el-button type="primary" class="btn" :disabled="!sourceUrl || !option.fixed" plain>比例</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="item in IMG_ROPORTIONS" :key="item.key" @click="onRoportion(item.value)">
              <span class="dropdown-item">{{ item.key }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-tooltip
        class="box-item"
        effect="dark"
        content="需要优先点击截取按钮之后才能下载最新设置的图片"
        placement="top"
      >
        <el-button type="primary" :disabled="!cropperUrl" class="btn" plain @click="onDownload">下载</el-button>
      </el-tooltip>
      <el-button type="warning" :disabled="!sourceUrl" class="btn" @click="onRefresh">重置</el-button>
      <el-button type="success" :disabled="!sourceUrl" class="btn" @click="onFinish">截取</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, watch } from 'vue';
import { VueCropper } from 'vue-cropper';
import { getImgInfo, onDownloadFile, checkOS } from '@/utils';
import { IMG_ROPORTIONS } from '@/constant';
import OnlineImage from '../OnlineImage/index.vue';
import 'vue-cropper/dist/index.css';

const emit = defineEmits(['update:modalVisible']);

// 裁剪器状态
const cropperVisible = ref<boolean>(false);
// 截图器容器
const cropperContent = ref<HTMLDivElement | null>(null);
// 需要裁剪的图片路径
const sourceUrl = ref<string>(''); // 上传的原图url
const cropperUrl = ref<string>('');
const cropperHeight = ref<string>('');
// 截图器dom
const cropper = ref<ReturnType<any>>();
// 缩放默认值
const scaleNum = ref<number>(1);
// 保存上传的fileInfo
const fileInfo = ref<File | null>(null);
// 图片高度
const imgHeight = ref<number>(0);
// 标识是否设置过了比例
const isRoportioned = ref<boolean>(false);
// 图片来源
const imgFrom = ref<boolean>(false);
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
  fixedNumber: [600, 338], // 截图框的宽高比例
  full: false, // 是否输出原图比例的截图
  original: false, // 上传图片按照原始比例渲染
  centerBox: true, // 截图框是否被限制在图片里面
  infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
});

// 切换图片来源时,重置
watch(imgFrom, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    onRefresh();
  }
});

// 自定义上传
const onUpload = (event: { file: Blob }) => {
  fileInfo.value = event.file as File;
  const reader = new FileReader();
  reader.onload = async (e: Event) => {
    cropperVisible.value = true;
    sourceUrl.value = (e.target as FileReader).result as string;
    setCropSize();
  };
  reader.readAsDataURL(event.file);
};

// 设置在线链接
const onUseOnlineUrl = (url: string) => {
  cropperVisible.value = true;
  sourceUrl.value = url;
  setCropSize();
};

// 初始化裁剪比例
const initCropSize = (number1 = 600, number2 = 338) => {
  option.fixedNumber = [number1, number2];
  option.autoCropHeight = imgHeight.value;
  option.autoCropWidth = (imgHeight.value * number1) / number2;
};

// 设置裁剪框宽高
const setCropSize = async () => {
  const imgInfo = (await getImgInfo(sourceUrl.value)) as { width: number; height: number };
  nextTick(() => {
    // 计算截图弹窗的高度
    const height = (cropperContent.value?.offsetWidth! * imgInfo!.height) / imgInfo!.width;
    imgHeight.value = height;
    // 存储截图弹窗的高度
    cropperHeight.value = `${height}px`;
    // 动态计算截图框的宽度
    const cropWidth = (option.fixedNumber[0] / option.fixedNumber[1]) * height;
    option.autoCropWidth = cropWidth;
    option.autoCropHeight = height;
  });
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

// 切换比例
const onRoportion = (value: number[]) => {
  if (isRoportioned.value) {
    // 先初始化比例
    cropper.value.refresh();
  } else {
    isRoportioned.value = true;
  }
  initCropSize(value[0], value[1]);
};

// 是否开启自由比例
const onCropFixed = () => {
  option.fixed = !option.fixed;
};

// 完成截图事件
const onFinish = () => {
  cropper.value?.getCropBlob(async (blob: any) => {
    const reader = new FileReader();
    reader.onload = (e: Event) => {
      cropperUrl.value = (e.target as FileReader).result as string;
    };
    reader.readAsDataURL(blob);
  });
};

// 下载
const onDownload = async () => {
  onDownloadFile({ url: cropperUrl.value });
};

// 重置
const onRefresh = () => {
  cropperUrl.value = '';
  sourceUrl.value = '';
  cropperVisible.value = false;
};

// 关闭
const onClose = () => {
  emit('update:modalVisible', false);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.container {
  position: relative;
  height: 100%;
  padding: 0 0 10px;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 18px;
    height: 45px;
    padding: 0 10px;
    border-bottom: 1px solid var(--card-border);
    color: var(--font-1);

    .left {
      display: flex;
      align-items: center;

      .title-info {
        font-size: 14px;
        color: var(--font-5);

        .type {
          color: @active;
        }
      }
    }

    .close {
      color: var(--theme-blue);
      font-size: 16px;
      cursor: pointer;

      &:hover {
        color: @active;
      }
    }
  }

  .cropper {
    height: v-bind(cropperHeight);
    height: calc(100vh - 182px);
  }

  .cropper-mac {
    height: v-bind(cropperHeight);
    height: calc(100vh - 192px);
  }

  .content {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    border-bottom: 1px solid var(--card-border);
    // background-color: var(--pre-hover-bg);
    overflow: auto;
    height: calc(100% - 88px);
    box-sizing: border-box;

    .drag-upload {
      height: calc(100vh - 182px);
      display: block;
      padding: 0;
      border-radius: 0;

      &:hover {
        border: 1px dashed var(--theme-blue);
      }

      :deep {
        .el-upload-dragger {
          border-radius: 0;
          border: none;
          background-color: transparent;

          &:hover {
            background-color: var(--upload-hover-bg-color);
          }
        }
      }
    }

    .drag-upload-mac {
      height: calc(100vh - 192px);
    }
  }

  .footer {
    position: absolute;
    bottom: 0;
    right: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    margin-top: 20px;
    text-align: right;

    .btn {
      margin-left: 0;
      margin-bottom: 10px;
      margin-left: 10px;
    }

    .roportion {
      width: 88px;
    }
  }
}

:deep {
  .dropdown-item {
    width: 100%;
    text-align: center;
  }
}
</style>
