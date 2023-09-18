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
        <div class="paint-color">画笔颜色</div>
      </div>
      <div class="range-wrap">
        <input id="range" type="range" min="1" max="30" value="5" title="调整笔刷粗细" />
      </div>
      <div class="tools">
        <div v-for="btn in ACTIONS" :key="btn">{{ btn }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, reactive } from 'vue';

const ACTIONS = ['撤销', '画笔', '橡皮擦', '清空', '保存'];

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

onMounted(() => {
  nextTick(() => {
    createCanvas();
    canvasSetSize();
    setCanvasBg('transparent');
  });
});

// 关闭画板
const onClose = () => {
  emit('update:boardVisible', false);
};

const createCanvas = () => {
  // 创建 ctx 对象
  ctx.value = canvas.value?.getContext('2d')!;
  console.log(ctx.value, 'ctx.value');
  ctx.value!.fillStyle = activeColor.value;
  ctx.value!.strokeStyle = activeColor.value;
};

const canvasSetSize = () => {
  const pageMenu = document.querySelector('#__LEFT_MENU__') as HTMLDivElement;
  const pageHead = document.querySelector('#__HEADER__') as HTMLDivElement;
  pageSizeInfo.top = pageHead.offsetHeight + titleRef.value?.offsetHeight!;
  pageSizeInfo.left = pageMenu.offsetWidth;
  const pageWidth = boardWrapRef.value?.offsetWidth!;
  const pageHeight = boardWrapRef.value?.offsetHeight!;
  canvas.value!.width = pageWidth!;
  canvas.value!.height = pageHeight!;
};

const setCanvasBg = (color: string) => {
  ctx.value!.fillStyle = color;
  ctx.value!.fillRect(0, 0, canvas.value?.width!, canvas.value?.height!);
  ctx.value!.fillStyle = 'black';
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
  }

  .range-wrap {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  .tools {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 50px;
  }
}
</style>
