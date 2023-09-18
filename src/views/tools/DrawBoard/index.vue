<!--
 * 画板工具
 * @author: dnhyxc
 * @since: 2023-09-18
 * index.vue
-->
<template>
  <div class="container">
    <div ref="titleRef" class="title">
      <span class="left">画板</span>
      <span class="right" @click="onClose">关闭画板</span>
    </div>
    <div ref="boardWrapRef" class="board-wrap">
      <canvas
        ref="canvas"
        class="draw-board"
        @mousedown="onMousedown"
        @mousemove="onMousemove"
        @mouseleave="onMouseleave"
        @mouseup="onMouseup"
      />
      <div class="color-group">
        <div v-for="color in COLORS" :key="color" class="paint-color" :style="{ backgroundColor: color }" @click="onColorChange(color)"></div>
        <el-color-picker v-model="markColor" @change="onColorChange" />
      </div>
      <div class="range-wrap">
        <input id="range" type="range" min="1" max="30" value="5" title="调整笔刷粗细" />
      </div>
      <div class="tools">
        <div v-for="btn in ACTIONS" :key="btn" class="tool">{{ btn }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, reactive, watch } from 'vue';

const ACTIONS = ['撤销', '画笔', '橡皮', '清空', '保存'];

const COLORS = ['#000', '#fff', '#FF0000', '#FFA500', '#FFFF00', '#008000', '#00FFFF', '#0000FF', '#800080'];

interface IProps {
  boardVisible: boolean;
}

interface Emits {
  (e: 'update:boardVisible', visible: boolean): void;
}

defineProps<IProps>();

const emit = defineEmits<Emits>();

// 容器
const boardWrapRef = ref<HTMLDivElement | null>(null);
const titleRef = ref<HTMLDivElement | null>(null);
// canvas 容器
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
// 第一个点
const firstDot = ref<ImageData>();
// 标识是否正在绘制
const painting = ref<boolean>(false);
// 最后一个点
const lastPoint = ref();
const clear = ref<boolean>(false);
// 历史操作步骤
const historyDeta = ref<ImageData[]>([]);
// 线宽
const lineWidth = ref<number>(1);
// 画笔颜色
const activeColor = ref<string>('#000');
// 画图时需要减去的宽高
const pageSizeInfo = reactive({
  left: 0,
  top: 0,
});
const markColor = ref<string>('');

onMounted(() => {
  nextTick(() => {
    createCanvas();
    initCanvasSize();
    setCanvasBg('transparent');
  });
});

watch(activeColor, (newVal) => {
  setLineColor(newVal);
});

// 关闭画板
const onClose = () => {
  emit('update:boardVisible', false);
};

// 画板颜色变化
const onColorChange = (color: string) => {
  activeColor.value = color;
};

// 创建 ctx 对象
const createCanvas = () => {
  ctx.value = canvas.value?.getContext('2d', { willReadFrequently: true })!;
  ctx.value!.fillStyle = activeColor.value;
  ctx.value!.strokeStyle = activeColor.value;
};

const initCanvasSize = () => {
  // 获取左侧页面左侧菜单
  const pageMenu = document.querySelector('#__LEFT_MENU__') as HTMLDivElement;
  // 获取页面头部
  const pageHead = document.querySelector('#__HEADER__') as HTMLDivElement;
  pageSizeInfo.top = pageHead.offsetHeight + titleRef.value?.offsetHeight!;
  pageSizeInfo.left = pageMenu.offsetWidth;
  const pageWidth = boardWrapRef.value?.offsetWidth!;
  const pageHeight = boardWrapRef.value?.offsetHeight!;
  canvas.value!.width = pageWidth!;
  canvas.value!.height = pageHeight!;
};

// 设置画板背景颜色
const setCanvasBg = (color: string) => {
  ctx.value!.fillStyle = color;
  ctx.value!.fillRect(0, 0, canvas.value?.width!, canvas.value?.height!);
  ctx.value!.fillStyle = 'black';
};

// 设置画笔颜色
const setLineColor = (color: string) => {
  ctx.value!.fillStyle = color;
  ctx.value!.strokeStyle = color;
};

const onMousedown = (e: MouseEvent) => {
  firstDot.value = ctx.value?.getImageData(0, 0, canvas.value?.width!, canvas.value?.height!); // 在这里储存绘图表面
  firstDot.value && saveActions(firstDot.value);
  painting.value = true;
  const x = e.clientX - pageSizeInfo.left; // 需要减去左侧菜单的宽度
  const y = e.clientY - pageSizeInfo.top; // 需要减去头部高度度及画板标题的高度
  lastPoint.value = { x, y };
  ctx.value?.save();
  drawCircle(x, y, 0);
};

const onMousemove = (e: MouseEvent) => {
  if (painting.value) {
    const x = e.clientX - pageSizeInfo.left; // 需要减去左侧菜单的宽度
    const y = e.clientY - pageSizeInfo.top; // 需要减去头部高度度及画板标题的高度
    const newPoint = { x, y };
    drawLine(lastPoint.value.x, lastPoint.value.y, newPoint.x, newPoint.y);
    lastPoint.value = newPoint;
  }
};

const onMouseleave = () => {
  painting.value = false;
};

const onMouseup = () => {
  painting.value = false;
};

const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
  ctx.value!.lineWidth = lineWidth.value;
  ctx.value!.lineCap = 'round';
  ctx.value!.lineJoin = 'round';
  if (clear.value) {
    ctx.value?.save();
    ctx.value!.globalCompositeOperation = 'destination-out';
    ctx.value?.moveTo(x1, y1);
    ctx.value?.lineTo(x2, y2);
    ctx.value?.stroke();
    ctx.value?.closePath();
    ctx.value?.clip();
    ctx.value?.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
    ctx.value?.restore();
  } else {
    ctx.value?.moveTo(x1, y1);
    ctx.value?.lineTo(x2, y2);
    ctx.value?.stroke();
    ctx.value?.closePath();
  }
};

const drawCircle = (x: number, y: number, radius: number) => {
  ctx.value?.save();
  ctx.value?.beginPath();
  ctx.value?.arc(x, y, radius, 0, Math.PI * 2);
  ctx.value?.fill();
  if (clear.value) {
    ctx.value?.clip();
    ctx.value?.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
    ctx.value?.restore();
  }
};

// 保存操作步骤
const saveActions = (data: ImageData) => {
  historyDeta.value.length === 10 && historyDeta.value.shift();
  historyDeta.value.push(data);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  width: calc(100% - 4px);
  padding-left: 5px;
  box-sizing: border-box;
  overflow: auto;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;
    font-size: 16px;
    color: var(--font-1);
    .left,
    .right {
      cursor: pointer;
    }

    .right {
      color: var(--theme-blue);
      .clickNoSelectText();
    }
  }

  .board-wrap {
    flex: 1;
    position: relative;
    box-sizing: border-box;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--pre-hover-bg);
    border-radius: 5px;

    .draw-board {
      width: 100%;
      height: 100%;
      border-radius: 5px;
      display: block;
    }
  }

  .color-group {
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);

    .paint-color {
      width: 30px;
      height: 30px;
      margin-bottom: 15px;
      border-radius: 30px;
      cursor: pointer;
      box-shadow: 0 0 5px#999;
    }
  }

  .range-wrap {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  .tools {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    width: auto;
    height: 50px;

    .tool {
      width: 30px;
      height: 30px;
      line-height: 30px;
      border-radius: 30px;
      margin-right: 15px;
      text-align: center;
      padding: 10px;
      box-shadow: 0 0 8px 0 #999, 0 0 2px 0 #ccc inset;
      background-color: var(--pre-hover-bg);
      cursor: pointer;

      &:last-child {
        margin-right: 0;
      }

      &:hover {
        color: var(--theme-blue);
      }
    }
  }

  :deep {
    .el-color-picker__trigger {
      width: 30px;
      height: 30px;
      border-radius: 30px;
      padding: 0;
    }

    .el-color-picker__color {
      width: 30px;
      height: 30px;
      border-radius: 30px;
      border: none;
    }

    .el-color-picker__color-inner {
      border-radius: 30px;
      width: 30px;
      height: 30px;
      box-shadow: 0 0 5px#999;
    }

    .el-color-picker__icon {
      display: none !important;
    }

    .el-icon-arrow-down {
      display: none !important;
    }

    .el-color-picker__empty {
      display: none !important;
    }

    .el-color-picker__color::before {
      content: 'A';
      color: #181515;
      font-size: 17px;
    }

    .el-color-picker__color::before {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      height: 60%;
      width: 60%;
      content: '';
      background-image: url('@/assets/svg/color.svg');
      background-size: 100% 100%;
    }
  }
}
</style>
