<!--
 * 图片裁剪工具
 * @author: dnhyxc
 * @since: 2023-09-15
 * index.vue
-->
<template>
  <el-dialog v-model="visible" title="图片剪裁" class="crop-dialog" align-center width="950px">
    <div class="cropper-upload-wrap">
      <div class="content">
        <div class="cropper-upload">
          <DragUpload v-if="!cropperUrl && !sourceUrl" class="drag-upload" :on-upload="onUpload" />
        </div>
        <div ref="cropperContent" class="cropper-content">
          <div v-if="cropperVisible" class="cropper">
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
      </div>
      <div class="action-list">
        <el-button type="primary" plain @click="onScaleMax">放大</el-button>
        <el-button type="primary" plain @click="onScaleMin">缩小</el-button>
        <el-button type="primary" plain @click="onRotate">旋转</el-button>
        <el-button type="primary" plain @click="onRoportion">比例</el-button>
        <el-button type="primary" plain @click="onDownload">下载</el-button>
        <el-button type="warning" @click="onRefresh">重置</el-button>
        <el-button type="success" @click="onFinish">完成</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, computed } from 'vue';
import { VueCropper } from 'vue-cropper';
import { getImgInfo } from '@/utils';
import 'vue-cropper/dist/index.css';

interface IProps {
  modalVisible: boolean;
}

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
  fixed: false, // 是否开启截图框宽高固定比例
  fixedNumber: [600, 338], // 截图框的宽高比例
  full: false, // 是否输出原图比例的截图
  original: false, // 上传图片按照原始比例渲染
  centerBox: true, // 截图框是否被限制在图片里面
  infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
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
const onRoportion = () => {
  if (isRoportioned.value) {
    // 先初始化比例
    cropper.value.refresh();
  } else {
    isRoportioned.value = true;
  }
  initCropSize(3, 4);
};

// 完成截图事件
const onFinish = () => {
  cropper.value?.getCropBlob(async (blob: any) => {
    const reader = new FileReader();
    reader.onload = (e: Event) => {
      cropperUrl.value = (e.target as FileReader).result as string;
      option.fixedNumber = [600, 338];
      setCropSize();
    };
    reader.readAsDataURL(blob);
  });
};

// 下载
const onDownload = async () => {
  console.log(cropperUrl, 'cropperUrl');
};

// 重置
const onRefresh = () => {
  cropperUrl.value = '';
  cropper.value.refresh();
  initCropSize();
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.cropper-upload-wrap {
  display: flex;
  justify-content: space-between;

  .cropper {
    height: v-bind(cropperHeight);
  }

  .content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 540px;
    flex: 1;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--pre-hover-bg);
    margin-right: 10px;
    border-radius: 5px;

    .drag-upload {
      width: 100%;
      height: 520px;
    }
  }

  .action-list {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    width: 220px;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--pre-hover-bg);
    border-radius: 5px;
    padding: 10px;

    .action-btns {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;

      .btn {
        flex: 1;
        margin-left: 0;
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
