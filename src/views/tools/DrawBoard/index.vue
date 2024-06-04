<!--
 * 画板工具
 * @author: dnhyxc
 * @since: 2023-09-18
 * index.vue
-->
<template>
  <div :class="`container ${hideHeader && 'hide-container'}`">
    <div ref="titleRef" class="title">
      <div class="left">
        <div class="tools">
          <div
            v-for="btn in BOARD_ACTIONS"
            :key="btn.key"
            :class="`tool ${currentTool === btn.key && ACTIVE_DRAW_ACTIONS.includes(btn.key) && 'active-tool'}`"
            @click="onClickTools(btn.key)"
          >
            <div v-if="currentTool === btn.key">
              <el-popover
                v-if="btn.key === 'arrowLine'"
                placement="top"
                effect="dark"
                popper-class="draw-pop"
                trigger="hover"
              >
                <div class="tools-content">
                  <el-slider
                    v-model="lineWidth"
                    class="slider"
                    vertical
                    height="100px"
                    :step="1"
                    :min="1"
                    :max="50"
                    :show-tooltip="false"
                  />
                  <span class="line-width">{{ lineWidth }}</span>
                </div>
                <template #reference>
                  <span class="btn-text">
                    <i :class="`iconfont ${btn.icon}`"></i>
                    <span class="name">{{ btn.name }}</span>
                  </span>
                </template>
              </el-popover>
              <el-popover
                v-if="btn.key === 'eraser'"
                placement="top"
                effect="dark"
                popper-class="draw-pop"
                trigger="hover"
              >
                <div class="tools-content">
                  <el-slider
                    v-model="eraserWidth"
                    class="slider"
                    vertical
                    height="100px"
                    :step="1"
                    :min="1"
                    :max="50"
                    :show-tooltip="false"
                  />
                  <span class="line-width">{{ eraserWidth }}</span>
                </div>
                <template #reference>
                  <span class="btn-text">
                    <i :class="`iconfont ${btn.icon}`"></i>
                    <span class="name">{{ btn.name }}</span>
                  </span>
                </template>
              </el-popover>
            </div>
            <span class="btn-text">
              <i
                v-if="(btn.key !== 'arrowLine' && btn.key !== 'eraser') || currentTool !== btn.key"
                :class="`iconfont ${btn.icon}`"
              />
              <span v-if="(btn.key !== 'arrowLine' && btn.key !== 'eraser') || currentTool !== btn.key" class="name">
                {{ btn.name }}
              </span>
            </span>
          </div>
        </div>
      </div>
      <span v-if="!hideHeader" class="right" @click="onClose">关闭</span>
    </div>
    <div ref="boardWrapRef" class="board-wrap">
      <canvas ref="canvas" class="draw-board" @mousedown="onMousedown" />
      <div class="color-group">
        <el-tooltip placement="top" popper-class="custom-dropdown-styles">
          <template #content>
            <span v-if="colorType" class="tip-text">切换为画笔颜色设置</span>
            <span v-else class="tip-text">切换为画布颜色设置</span>
          </template>
          <div class="change" @click="onSetColorType" />
        </el-tooltip>
        <div v-for="color in BOARD_COLORS" :key="color">
          <el-tooltip placement="left" popper-class="custom-dropdown-styles">
            <template #content>
              <span v-if="colorType" class="tip-text">画布颜色</span>
              <span v-else class="tip-text">画笔颜色</span>
            </template>
            <div class="paint-color" :style="{ backgroundColor: color }" @click="onColorChange(color, true)"></div>
          </el-tooltip>
        </div>
        <el-tooltip placement="left" popper-class="custom-dropdown-styles">
          <template #content>
            <span v-if="colorType" class="tip-text">画布颜色</span>
            <span v-else class="tip-text">画笔颜色</span>
          </template>
          <div class="costom-color">
            <el-color-picker v-model="markColor" @change="onColorChange" />
          </div>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, onUnmounted, watch, computed } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { onDownloadFile } from '@/utils';
import { BOARD_ACTIONS, BOARD_COLORS, ACTIVE_DRAW_ACTIONS, ERASER_SVG } from '@/constant';
import { DrawLine, DrawRect, DrawEraser, DrawCircle, DrawEllipse } from './drawTypes';

interface IProps {
  boardVisible?: boolean;
  hideHeader?: boolean;
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
// 历史操作步骤
const drawHistory = ref<ImageData[]>([]);
// 画笔及橡皮差大小
const lineWidth = ref<number>(2);
const eraserWidth = ref<number>(2);
// 画笔颜色
const activeColor = ref<string>('#000');
// 画布颜色
const drawBgColor = ref<string>('#fff');
const markColor = ref<string>('');
// 当前选中的工具
const currentTool = ref<string>('arrowLine');
// 标识背景颜色设置还是画笔颜色设置
const colorType = ref<boolean>(false);
// 当前绘制的画布
const drawLayer = ref<ImageData | null>(null);
// 是否按下shift键
const isPressShift = ref<boolean>(false);
const isDragging = ref<boolean>(false);
const isScaling = ref<boolean>(false);
const scalePos = ref<string>('');

let previousSelectedCircle: any = null;

// 绘制的所有图形
let drawShapes: any[] = [];
let selectedCornerShapes: any[] = [];

let drawer: DrawLine | DrawCircle | DrawRect | DrawCircle | DrawEllipse | DrawEraser | null = null;

// 监听画板大小变化
const observer = new ResizeObserver(() => {
  init();
});

onMounted(() => {
  createCanvas();
  observer?.observe(boardWrapRef.value!);
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('mousedown', onDocMousedown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  document.removeEventListener('keyup', onKeyUp);
  document.removeEventListener('mousedown', onDocMousedown);
});

onBeforeRouteLeave(() => {
  observer.unobserve(boardWrapRef.value!);
});

const cursor = computed(() => {
  if (currentTool.value === 'eraser') {
    return 'url(' + ERASER_SVG + '), auto';
  } else if (currentTool.value === 'select') {
    return 'pointer';
  } else {
    return 'crosshair';
  }
});

// 监听是否按下shift键，切换绘制圆形或椭圆
watch(isPressShift, () => {
  if (currentTool.value === 'circle') {
    const params = {
      ctx: ctx.value!,
      color: activeColor.value,
      startX: drawer?.startX!,
      startY: drawer?.startY!,
      isPressShift: isPressShift.value,
    };
    const circle = new DrawCircle(params);
    const ellipse = new DrawEllipse(params);
    // 初始化圆形
    drawer = isPressShift.value ? circle : ellipse;
    drawShapes.push(drawer);
  }
});

const init = () => {
  nextTick(() => {
    initCanvasSize();
    setCanvasBg(drawBgColor.value);
  });
};

// 创建 ctx 对象
const createCanvas = () => {
  ctx.value = canvas.value?.getContext('2d', { willReadFrequently: true })!;
  ctx.value!.fillStyle = activeColor.value;
  ctx.value!.strokeStyle = activeColor.value;
};

const initCanvasSize = () => {
  if (!boardWrapRef.value) return;
  const { width, height } = boardWrapRef.value?.getBoundingClientRect()!;
  canvas.value!.width = width * devicePixelRatio;
  canvas.value!.height = height * devicePixelRatio;
};

const getSize = (node: any) => {
  const { startX, startY, endX, endY } = node;
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);

  return {
    minX,
    minY,
    maxX,
    maxY,
  };
};

// 判断区域内是否有选中的角标
const getSelectedCornerShape = (e: MouseEvent) => {
  const { offsetX, offsetY, clientX, clientY } = e;
  const { left, top } = canvas.value?.getBoundingClientRect()!;
  const outSize = 10; // 鼠标点击范围
  const shape = selectedCornerShapes.find((node) => {
    const { minX, maxX, minY, maxY } = getSize(node);

    const inRectOrEllipse =
      offsetX > minX - outSize / 2 &&
      clientX - left <= maxX + outSize &&
      offsetY > minY - outSize / 2 &&
      clientY - top <= maxY + outSize;

    return inRectOrEllipse;
  });

  return shape;
};

// 判断区域内是否有图形
const getShape = (e: MouseEvent) => {
  const { offsetX, offsetY, clientX, clientY } = e;
  const { left, top } = canvas.value?.getBoundingClientRect()!;
  const outSize = 10; // 鼠标点击范围
  const shape = drawShapes.find((node) => {
    const { minX, maxX, minY, maxY } = getSize(node);
    const inRectOrEllipse =
      offsetX > minX - outSize &&
      clientX - left <= maxX + outSize &&
      offsetY > minY - outSize &&
      clientY - top <= maxY + outSize;
    // 计算鼠标与圆心的距离
    const distance = Math.sqrt((offsetX - minX) ** 2 + (offsetY - minY) ** 2);
    return inRectOrEllipse || distance <= node?._radius + (node?._radius - node?._radius / 3 + outSize);
  });

  if (shape) {
    // 清除之前的选择
    if (previousSelectedCircle) {
      previousSelectedCircle.isSelected = false;
    }
    previousSelectedCircle = shape;
    shape.isSelected = true;
  }

  return shape;
};

// 橡皮擦工具擦除效果
const delSelectedShape = (e: MouseEvent) => {
  const { clientX, clientY, offsetX, offsetY } = e;
  const { left, top } = canvas.value?.getBoundingClientRect()!;
  drawShapes = drawShapes.filter((node) => {
    const { minX, maxX, minY, maxY } = getSize(node);
    const inRectOrEllipse = offsetX > minX && clientX - left <= maxX && offsetY > minY && clientY - top <= maxY;
    // 计算鼠标与圆心的距离
    const distance = Math.sqrt((offsetX - minX) ** 2 + (offsetY - minY) ** 2);
    return !inRectOrEllipse || distance > node?._radius;
  });
  onRedraw();
};

// document 鼠标按下事件
const onDocMousedown = (e: MouseEvent) => {
  if (currentTool.value !== 'select' || !previousSelectedCircle) return;

  const { offsetX, offsetY } = e;

  const { minX, maxX, minY, maxY } = getSize(previousSelectedCircle);

  const { startX, startY, endX, endY } = previousSelectedCircle;

  window.onmousemove = (e) => {
    // 判断圆圈是否开始拖拽
    if (isDragging.value) {
      // 判断拖拽对象是否存在
      if (previousSelectedCircle) {
        const { left, top } = canvas.value?.getBoundingClientRect()!;
        const { clientX, clientY } = e;

        const disX = clientX - left - offsetX;
        const disY = clientY - top - offsetY;

        // 缩放策略
        const scaleTypes = {
          leftTop: () => {
            previousSelectedCircle.startX = minX + disX;
            previousSelectedCircle.startY = minY + disY;
          },
          rightTop: () => {
            previousSelectedCircle.endX = maxX + disX;
            previousSelectedCircle.startY = minY + disY;
          },
          leftBottom: () => {
            previousSelectedCircle.startX = minX + disX;
            previousSelectedCircle.endY = maxY + disY;
          },
          rightBottom: () => {
            previousSelectedCircle.endX = maxX + disX;
            previousSelectedCircle.endY = maxY + disY;
          },
        };

        if (isScaling.value) {
          scaleTypes[scalePos.value]();
          onRedraw(false);
        } else {
          previousSelectedCircle.startX = startX + disX;
          previousSelectedCircle.startY = startY + disY;
          previousSelectedCircle.endX = endX + disX;
          previousSelectedCircle.endY = endY + disY;
          onRedraw(false);
        }
      }
    }
  };

  window.onmouseup = () => {
    window.onmousemove = null;
    window.onmouseup = null;
    isDragging.value = false;
  };
};

// canvas 鼠标按下事件
const onMousedown = (e: MouseEvent) => {
  // 如果是选择工具，则不绘制，按下为选中图形进行拖拽
  if (currentTool.value === 'select') {
    const findNode = getShape(e);

    if (findNode) {
      isDragging.value = true;
      onRedraw(false);
    } else {
      onRedraw();
    }

    // 查找鼠标点击区域内是否有角标志
    const findCornerNode = getSelectedCornerShape(e);

    if (findCornerNode) {
      isScaling.value = true;
      scalePos.value = findCornerNode.position;
    } else {
      isScaling.value = false;
      scalePos.value = '';
    }

    return;
  }

  // 不是选中状态时则为绘制工具
  const { offsetX, offsetY } = e;
  /**
   * 开始绘制新的形状或路径时，在每次绘制之前调用 beginPath() 方法，
   * 以确保您绘制的是一个新的、独立的路径。防止在撤销或者清空之后，
   * 再次绘制时，之前绘制的内容重新出现在画布上。
   */
  // ctx.value?.save();
  // ctx.value?.beginPath();

  const drawImg = ctx.value?.getImageData(0, 0, canvas.value?.width!, canvas.value?.height!); // 在这里储存绘图表面
  // drawLayer.value = drawImg!;
  if (drawImg) {
    drawHistory.value.length === 100 && drawHistory.value.shift();
    drawHistory.value.push(drawImg);
  }

  const initDraw = {
    arrowLine: {
      init: () => {
        // 初始化线
        drawer = new DrawLine({
          ctx: ctx.value!,
          color: activeColor.value,
          startX: offsetX,
          startY: offsetY,
          lineSize: lineWidth.value,
          needsArrow: true,
        });
        drawShapes.push(drawer);
      },
      draw: onDrawArrowLineSegment,
      // draw: onDrawLine,
    },
    line: {
      init: () => {
        // 初始化线
        drawer = new DrawLine({
          ctx: ctx.value!,
          color: activeColor.value,
          startX: offsetX,
          startY: offsetY,
          lineSize: lineWidth.value,
        });
        drawShapes.push(drawer);
      },
      draw: onDrawLineSegment,
    },
    rect: {
      init: () => {
        // 初始化矩形
        drawer = new DrawRect({
          ctx: ctx.value!,
          color: activeColor.value,
          startX: offsetX,
          startY: offsetY,
          lineSize: lineWidth.value,
        });
        drawShapes.push(drawer);
      },
      draw: onDrawRect,
    },
    circle: {
      radius: 0,
      init: () => {
        const params = {
          ctx: ctx.value!,
          color: activeColor.value,
          startX: offsetX,
          startY: offsetY,
          isPressShift: isPressShift.value,
          lineSize: lineWidth.value,
        };
        const circle = new DrawCircle(params);
        const ellipse = new DrawEllipse(params);
        // 初始化圆形
        drawer = isPressShift.value ? circle : ellipse;
        drawShapes.push(drawer);
      },
      draw: onDrawCircle,
    },
    eraser: {
      init: () => {
        // 初始化橡皮檫
        drawer = new DrawEraser({
          ctx: ctx.value!,
          color: drawBgColor.value,
          startX: offsetX,
          startY: offsetY,
          lineSize: eraserWidth.value,
        });
      },
      draw: onDrawEraser,
    },
  };

  initDraw[currentTool.value].init();

  window.onmousemove = (e) => {
    const { clientX, clientY } = e;
    const canvasInfo = canvas.value?.getBoundingClientRect()!;
    // 判断画布边界，除了边界不再绘制
    if (
      clientX >= canvasInfo.right ||
      clientY >= canvasInfo.bottom ||
      clientX < canvasInfo.left ||
      clientY < canvasInfo.top
    )
      return;
    initDraw[currentTool.value].draw(drawer, e, canvasInfo);
  };

  window.onmouseup = () => {
    window.onmousemove = null;
    window.onmouseup = null;
  };
};

// 设置画板背景颜色
const setCanvasBg = (color = '#fff') => {
  ctx.value!.fillStyle = color;
  ctx.value!.fillRect(0, 0, canvas.value?.width!, canvas.value?.height!);
  ctx.value!.fillStyle = 'black';
};

// 选中框绘制辅助工具
const onDrawHelperRect = (
  startX: number,
  startY: number,
  width: number,
  height: number,
  fill: boolean = true,
  dash: boolean = false,
  color: string = activeColor.value,
  fillStyle: string = activeColor.value,
) => {
  const rect = new DrawRect({
    ctx: ctx.value!,
    color,
    startX,
    startY,
    width,
    height,
    lineSize: 2,
    fill,
    dash,
    fillStyle,
  });
  rect.draw();
  return rect;
};

// 绘制选中框
const onDrawSelectRect = (findNode: any) => {
  const outSize = 10;
  const { startX, startY, endX, endY, _radius } = findNode!;

  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);

  const width = Math.abs(maxX - minX);
  const height = Math.abs(maxY - minY);

  let leftTop: DrawRect | null = null;
  let rightTop: DrawRect | null = null;
  let leftBottom: DrawRect | null = null;
  let rightBottom: DrawRect | null = null;

  if (findNode.type !== 'circle') {
    onDrawHelperRect(minX - outSize / 2, minY - outSize / 2, width + outSize, height + outSize, false, true);
    leftTop = onDrawHelperRect(minX - outSize, minY - outSize, outSize, outSize, true, false);
    rightTop = onDrawHelperRect(minX + width, minY - outSize, outSize, outSize, true, false);
    leftBottom = onDrawHelperRect(minX - outSize, minY + height, outSize, outSize, true, false);
    rightBottom = onDrawHelperRect(minX + width, minY + height, outSize, outSize, true, false);
  }

  if (findNode.type === 'circle') {
    const x = minX - _radius;
    const y = minY - _radius;
    onDrawHelperRect(x - outSize / 2, y - outSize / 2, _radius * 2 + outSize, _radius * 2 + outSize, false, true);
    leftTop = onDrawHelperRect(x - outSize, y - outSize, outSize, outSize, true, false);
    rightTop = onDrawHelperRect(x + _radius * 2, y - outSize, outSize, outSize, true, false);
    leftBottom = onDrawHelperRect(x - outSize, y + _radius * 2, outSize, outSize, true, false);
    rightBottom = onDrawHelperRect(x + _radius * 2, y + _radius * 2, outSize, outSize, true, false);
  }

  leftTop!.position = 'leftTop';
  rightTop!.position = 'rightTop';
  leftBottom!.position = 'leftBottom';
  rightBottom!.position = 'rightBottom';
  // 保存选中框的四个角标志
  selectedCornerShapes = [leftTop, rightTop, leftBottom, rightBottom];
};

// 重新绘制
const onRedraw = (init: boolean = true) => {
  setCanvasBg(drawBgColor.value);
  drawShapes.forEach((shape) => {
    if (!init) {
      if (shape.isSelected && currentTool.value === 'select') {
        onDrawSelectRect(shape);
      }
    }
    if (shape.type === 'line') {
      drawLayer.value && ctx.value?.putImageData(drawLayer.value, 0, 0);
    }
    shape.draw();
  });
};

// 这种方式用于绘制带箭头指向性的线段
const onDrawArrowLineSegment = (line: DrawLine, e: MouseEvent, canvasInfo: DOMRect) => {
  line.endX = e.clientX - canvasInfo.left;
  line.endY = e.clientY - canvasInfo.top;
  setCanvasBg(drawBgColor.value);
  drawShapes.forEach((shape) => {
    shape.draw();
  });
};

// 这种方式用于绘制指向性的线段
const onDrawLineSegment = (line: DrawLine, e: MouseEvent, canvasInfo: DOMRect) => {
  line.endX = e.clientX - canvasInfo.left;
  line.endY = e.clientY - canvasInfo.top;
  setCanvasBg(drawBgColor.value);
  drawShapes.forEach((shape) => {
    shape.draw();
  });
};

// 画线
// const onDrawLine = (line: DrawLine, e: MouseEvent, canvasInfo: DOMRect) => {
//   line.startX = line.endX;
//   line.startY = line.endY;
//   line.endX = e.clientX - canvasInfo.left;
//   line.endY = e.clientY - canvasInfo.top;
//   line.draw();
//   // const drawImg = ctx.value?.getImageData(0, 0, canvas.value?.width!, canvas.value?.height!); // 在这里储存绘图表面
//   // drawLayer.value = drawImg!;
// };

// 绘制矩形
const onDrawRect = (rect: DrawRect, e: MouseEvent, canvasInfo: DOMRect) => {
  rect.endX = e.clientX - canvasInfo.left;
  rect.endY = e.clientY - canvasInfo.top;
  onRedraw();
};

const onDrawCircle = (circle: DrawCircle, e: MouseEvent, canvasInfo: DOMRect) => {
  circle.endX = e.clientX - canvasInfo.left;
  circle.endY = e.clientY - canvasInfo.top;
  onRedraw();
};

// 橡皮檫
const onDrawEraser = (eraser: DrawEraser, e: MouseEvent, canvasInfo: DOMRect) => {
  // eraser.startX = eraser.endX;
  // eraser.startY = eraser.endY;
  // eraser.endX = e.clientX - canvasInfo.left;
  // eraser.endY = e.clientY - canvasInfo.top;
  // eraser.draw();
  // const drawImg = ctx.value?.getImageData(0, 0, canvas.value?.width!, canvas.value?.height!); // 在这里储存绘图表面
  // drawLayer.value = drawImg!;
  delSelectedShape(e);
};

// 监听快捷键操作
const onKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    onUndo();
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    onSave();
  }

  if (event.shiftKey) {
    isPressShift.value = true;
  }

  if (event.key === 'Backspace') {
    drawShapes = drawShapes.filter((node) => !node.isSelected);
    onRedraw(false);
  }
};

// 监听鼠标按下事件
const onKeyUp = (event: KeyboardEvent) => {
  if (!event.shiftKey && event.key === 'Shift') {
    isPressShift.value = false;
  }
};

// 切换颜色设置
const onSetColorType = () => {
  colorType.value = !colorType.value;
  markColor.value = '';
};

// 关闭画板
const onClose = () => {
  emit('update:boardVisible', false);
};

// 画板颜色变化
const onColorChange = (color: string, isCustom: boolean) => {
  isCustom && markColor.value && (markColor.value = '');
  if (colorType.value) {
    drawBgColor.value = color;
    setCanvasBg(color);
    onClear();
  } else {
    activeColor.value = color;
    setLineColor(color);
    updateShapeColor(color);
  }
};

// 更新图形线条颜色
const updateShapeColor = (color: string) => {
  if (previousSelectedCircle) {
    previousSelectedCircle.color = color;
    onRedraw(false);
  }
};

// 设置画笔颜色
const setLineColor = (color: string) => {
  ctx.value!.fillStyle = color;
  ctx.value!.strokeStyle = color;
};

// 清空
const onClear = () => {
  ctx.value?.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
  setCanvasBg(drawBgColor.value);
  drawShapes = [];
};

// 撤销
const onUndo = () => {
  if (drawHistory.value.length < 1) return false;
  ctx.value?.putImageData(drawHistory.value[drawHistory.value.length - 1], 0, 0);
  drawHistory.value.pop();
  drawShapes.pop();
};

// 保存
const onSave = () => {
  const imgUrl = canvas.value!.toDataURL('image/png');
  onDownloadFile({ url: imgUrl, fileName: 'drawing.png' });
};

// 点击工具
const onClickTools = (key: string) => {
  if (ACTIVE_DRAW_ACTIONS.includes(key)) {
    currentTool.value = key;
  } else {
    const actions = {
      clear: onClear,
      undo: onUndo,
      save: onSave,
    };
    actions[key]();
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: auto;
  border-radius: 5px;

  --title-h: 45px;
  --color-action-size: 30px;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: var(--title-h);
    font-size: 16px;
    box-sizing: border-box;
    border-bottom: 1px solid var(--card-border);
    padding: 10px 10px 10px 2px;
    color: var(--font-1);
    user-select: none;

    .left {
      cursor: pointer;
      .clickNoSelectText();

      .tools {
        display: flex;
        justify-content: center;
        align-items: center;
        width: auto;
        height: 50px;

        .tool {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          padding: 5px;
          box-sizing: border-box;
          border-radius: 5px;
          margin-right: 15px;
          text-align: center;
          cursor: pointer;
          .clickNoSelectText();

          &:last-child {
            margin-right: 0;
          }

          &:hover {
            color: var(--theme-blue);
          }
        }

        .active-tool {
          color: var(--theme-blue);
        }
      }
    }

    .right {
      color: var(--theme-blue);
      cursor: pointer;
      .clickNoSelectText();

      &:hover {
        color: @active;
      }
    }
  }

  .board-wrap {
    height: calc(100% - var(--title-h));
    position: relative;
    box-sizing: border-box;
    cursor: v-bind(cursor);

    .draw-board {
      width: 100%;
      height: 100%;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      display: block;
    }
  }

  .color-group {
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);

    .change {
      width: var(--color-action-size);
      height: var(--color-action-size);
      margin-bottom: 15px;
      border-radius: var(--color-action-size);
      box-sizing: border-box;
      background-image: url('@/assets/svg/change.svg');
      background-size: 85% 85%;
      background-position: center;
      background-repeat: no-repeat;
      box-shadow: 0 0 5px 0 @font-5, 0 0 2px 0 @font-6 inset;
      border: 2px solid @fff;
      background-color: v-bind(activeColor);
      cursor: pointer;
    }

    .paint-color {
      width: var(--color-action-size);
      height: var(--color-action-size);
      margin-bottom: 15px;
      border-radius: var(--color-action-size);
      cursor: pointer;
      box-shadow: 0 0 5px 0 @font-5, 0 0 2px 0 @font-6 inset;
      border: 2px solid @fff;
      box-sizing: border-box;
    }
  }

  .range-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 50%;
    right: 1px;
    height: 200px;
    transform: translateY(-50%);

    .slider {
      flex: 1;
    }
  }

  :deep {
    .el-color-picker__trigger {
      width: var(--color-action-size);
      height: var(--color-action-size);
      border-radius: var(--color-action-size);
      padding: 0;
    }

    .el-color-picker__color {
      width: var(--color-action-size);
      height: var(--color-action-size);
      border-radius: var(--color-action-size);
      border: none;
    }

    .el-color-picker__color-inner {
      border-radius: 30px !important;
      width: var(--color-action-size);
      height: var(--color-action-size);
      box-shadow: 0 0 5px #999;
      border: 2px solid @fff;
      box-sizing: border-box;
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
      content: '';
      font-size: 16px;
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

    .el-slider__runway {
      background-color: #d5efff;
    }
  }
}

.hide-container {
  border-top: 1px solid var(--card-border);
  border-radius: 0;
}

.tools-content {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;

  .line-width {
    color: var(--theme-blue);
    margin-top: 10px;
    .clickNoSelectText();
  }
}

.btn-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .name {
    font-size: 12px;
  }

  .icon-huajuxingdeqiang,
  .icon-a-huayuanCopy {
    font-size: 14px;
    margin-bottom: 2px;
  }
}
</style>
