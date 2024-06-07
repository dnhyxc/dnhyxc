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
                v-if="btn.key === 'brush'"
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
                v-if="(btn.key !== 'brush' && btn.key !== 'eraser') || currentTool !== btn.key"
                :class="`iconfont ${btn.icon}`"
              />
              <span v-if="(btn.key !== 'brush' && btn.key !== 'eraser') || currentTool !== btn.key" class="name">
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
import { onMounted, ref, nextTick, onUnmounted, computed } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { onDownloadFile, getEraserSvg } from '@/utils';
import { BOARD_ACTIONS, BOARD_COLORS, ACTIVE_DRAW_ACTIONS } from '@/constant';
import { DrawLine, DrawEraser } from './drawTypes';

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
// const drawHistory = ref<ImageData[]>([]);
// 画笔及橡皮差大小
const lineWidth = ref<number>(2);
const eraserWidth = ref<number>(5);
// 画笔颜色
const activeColor = ref<string>('#000');
// 画布颜色
const drawBgColor = ref<string>('#fff');
const markColor = ref<string>('');
// 当前选中的工具
const currentTool = ref<string>('brush');
// 标识背景颜色设置还是画笔颜色设置
const colorType = ref<boolean>(false);
// 是否按下shift键
const isPressShift = ref<boolean>(false);

let points: any[] = [];

let drawer: DrawLine | DrawEraser | null = null;

let disX = 0;
let disY = 0;
const speed = 15;

// 监听画板大小变化
const observer = new ResizeObserver(() => {
  init();
});

const cursor = computed(() => {
  if (currentTool.value === 'eraser') {
    const url = `url(${getEraserSvg(eraserWidth.value)}) ${eraserWidth.value < 16 ? 8 : eraserWidth.value / 2} ${
      eraserWidth.value < 16 ? 16 : eraserWidth.value
    }, auto`;
    URL.revokeObjectURL(getEraserSvg(eraserWidth.value));
    return url;
  } else if (currentTool.value === 'select') {
    return 'grab';
  } else {
    return 'crosshair';
  }
});

onMounted(() => {
  createCanvas();
  observer?.observe(boardWrapRef.value!);
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('keyup', onKeyUp);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  document.removeEventListener('keyup', onKeyUp);
});

onBeforeRouteLeave(() => {
  observer.unobserve(boardWrapRef.value!);
});

const init = () => {
  nextTick(() => {
    onClear();
    initCanvasSize();
    setCanvasBg(drawBgColor.value);
    points = [];
  });
};

// 创建 ctx 对象
const createCanvas = () => {
  ctx.value = canvas.value?.getContext('2d', { willReadFrequently: true })!;
  ctx.value!.fillStyle = activeColor.value;
  ctx.value!.strokeStyle = activeColor.value;
};

const initCanvasSize = () => {
  const { width, height } = boardWrapRef.value?.getBoundingClientRect()!;
  canvas.value!.width = width * devicePixelRatio;
  canvas.value!.height = height * devicePixelRatio;
};

const onMousedown = (e: MouseEvent) => {
  const { offsetX, offsetY } = e;

  const initDraw = {
    brush: {
      init: () => {
        // 初始化线
        drawer = new DrawLine({
          ctx: ctx.value!,
          color: activeColor.value,
          startX: offsetX,
          startY: offsetY,
          lineSize: lineWidth.value,
        });
        points.push({
          moveToPoints: { x: offsetX, y: offsetY },
          lineToPoints: [],
          color: activeColor.value,
          lineSize: lineWidth.value,
        });
      },
      draw: onDrawLine,
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
        points.push({
          moveToPoints: { x: offsetX, y: offsetY },
          lineToPoints: [],
          color: drawBgColor.value,
          lineSize: eraserWidth.value,
        });
      },
      draw: onDrawEraser,
    },
  };

  if (currentTool.value !== 'select') {
    initDraw[currentTool.value].init();
    // const drawImg = ctx.value?.getImageData(0, 0, canvas.value?.width!, canvas.value?.height!); // 在这里储存绘图表面
    // drawHistory.value.length === 100 && drawHistory.value.shift();
    // drawImg && drawHistory.value.push(drawImg);
  }

  window.onmousemove = (e) => {
    const { clientX, clientY } = e;
    const canvasInfo = canvas.value?.getBoundingClientRect()!;
    if (currentTool.value === 'select') {
      disX = Math.floor((clientX - canvasInfo.left - offsetX) / speed);
      disY = Math.floor((clientY - canvasInfo.top - offsetY) / speed);
      ctx.value?.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
      setCanvasBg(drawBgColor.value);
      onRedraw(disX, disY);
    } else {
      initDraw[currentTool.value].draw(drawer, clientX, clientY, canvasInfo);
    }
  };

  window.onmouseup = () => {
    window.onmousemove = null;
    window.onmouseup = null;
  };
};

// 重新绘制所有路径
const onRedraw = (disX: number, disY: number) => {
  points.forEach((path) => {
    ctx.value?.save();
    ctx.value!.beginPath();
    ctx.value!.fillStyle = path.color;
    ctx.value!.strokeStyle = path.color;
    ctx.value!.lineWidth = path.lineSize * devicePixelRatio;
    const { moveToPoints, lineToPoints } = path;
    moveToPoints.x = moveToPoints.x + disX;
    moveToPoints.y = moveToPoints.y + disY;
    ctx.value!.moveTo(moveToPoints.x * devicePixelRatio, moveToPoints.y * devicePixelRatio);
    lineToPoints.forEach((point: any) => {
      point.x = point.x + disX;
      point.y = point.y + disY;
      ctx.value!.lineTo(point.x * devicePixelRatio, point.y * devicePixelRatio);
    });
    ctx.value!.stroke();
    ctx.value!.closePath();
  });
};

// 设置画板背景颜色
const setCanvasBg = (color = '#fff') => {
  ctx.value!.fillStyle = color;
  ctx.value!.fillRect(0, 0, canvas.value?.width!, canvas.value?.height!);
  ctx.value!.fillStyle = 'black';
};

// 画线
const onDrawLine = (line: DrawLine, clientX: number, clientY: number, canvasInfo: DOMRect) => {
  line.startX = line.endX;
  line.startY = line.endY;
  line.endX = clientX - canvasInfo.left;
  line.endY = clientY - canvasInfo.top;
  const lineToPoints = points[points.length - 1].lineToPoints;
  lineToPoints.push({ x: line.endX, y: line.endY });
  line.draw();
};

// 橡皮檫
const onDrawEraser = (eraser: DrawEraser, clientX: number, clientY: number, canvasInfo: DOMRect) => {
  eraser.startX = eraser.endX;
  eraser.startY = eraser.endY;
  eraser.endX = clientX - canvasInfo.left;
  eraser.endY = clientY - canvasInfo.top;
  const lineToPoints = points[points.length - 1].lineToPoints;
  lineToPoints.push({ x: eraser.endX, y: eraser.endY });
  eraser.draw();
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
  points = [];
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
  points = [];
};

// 撤销
const onUndo = () => {
  // if (drawHistory.value.length < 1) return false;
  // ctx.value?.putImageData(drawHistory.value[drawHistory.value.length - 1], 0, 0);
  // drawHistory.value.pop();
  if (points.length > 0) {
    points.pop();
    ctx.value?.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
    setCanvasBg(drawBgColor.value);
    onRedraw(disX, disY);
  }
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

        .icon-zhizhen {
          font-size: 16px;
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
    position: relative;
    top: 0;
    left: 0;
    height: calc(100% - var(--title-h));
    position: relative;
    box-sizing: border-box;
    cursor: v-bind(cursor);

    .draw-board {
      position: absolute;
      top: 0;
      left: 0;
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
