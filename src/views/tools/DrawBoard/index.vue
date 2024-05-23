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
            :class="`tool ${currentTool === btn.key && (btn.key === 'brush' || btn.key === 'eraser') && 'active-tool'}`"
            @click="onClickTools(btn.key)"
          >
            <div v-if="currentTool === btn.key">
              <el-popover placement="top" effect="dark" popper-class="draw-pop" trigger="hover">
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
                    <i v-if="btn.key === 'brush' || btn.key === 'eraser'" :class="`iconfont ${btn.icon}`"></i>
                    <span v-if="btn.key === 'brush' || btn.key === 'eraser'" class="name">{{ btn.name }}</span>
                  </span>
                </template>
              </el-popover>
            </div>
            <span class="btn-text">
              <i
                v-if="(btn.key !== 'brush' && btn.key !== 'eraser') || currentTool !== btn.key"
                :class="`iconfont ${btn.icon}`"
              />
              <span v-if="(btn.key !== 'brush' && btn.key !== 'eraser') || currentTool !== btn.key" class="name">{{
                btn.name
              }}</span>
            </span>
          </div>
        </div>
      </div>
      <span v-if="!hideHeader" class="right" @click="onClose">关闭</span>
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
import { onMounted, ref, nextTick, reactive, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { onDownloadFile, checkOS } from '@/utils';
import { BOARD_ACTIONS, BOARD_COLORS } from '@/constant';

interface IProps {
  boardVisible?: boolean;
  hideHeader?: boolean;
}

interface Emits {
  (e: 'update:boardVisible', visible: boolean): void;
}

const props = defineProps<IProps>();

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
const historyData = ref<ImageData[]>([]);
// 画笔及橡皮差大小
const lineWidth = ref<number>(1);
// 画笔颜色
const activeColor = ref<string>('#000');
// 画布颜色
const drawBgColor = ref<string>('#fff');
// 画图时需要减去的宽高
const pageSizeInfo = reactive({
  left: 0,
  top: 0,
});
const markColor = ref<string>('');
// 当前选中的工具
const currentTool = ref<string>('brush');
// 标识背景颜色设置还是画笔颜色设置
const colorType = ref<boolean>(false);

// 监听画板大小变化
const observer = new ResizeObserver(() => {
  init();
});

onMounted(() => {
  observer?.observe(boardWrapRef.value!);
  nextTick(() => {
    createCanvas();
    initCanvasSize();
    setCanvasBg();
  });
  document.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
});

onBeforeRouteLeave(() => {
  observer.unobserve(boardWrapRef.value!);
});

const init = () => {
  nextTick(() => {
    createCanvas();
    initCanvasSize();
    setCanvasBg();
  });
};

// 监听快捷键操作
const onKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    onUndo();
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    onSave();
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
  } else {
    activeColor.value = color;
    setLineColor(color);
  }
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

  if (!props?.hideHeader) {
    pageSizeInfo.top = pageHead?.offsetHeight + titleRef.value?.offsetHeight!;
  } else {
    pageSizeInfo.top = checkOS() === 'mac' ? 100 : 100;
  }

  pageSizeInfo.left = !props?.hideHeader ? pageMenu?.offsetWidth + 10 : 0;
  const pageWidth = boardWrapRef.value?.offsetWidth!;
  const pageHeight = boardWrapRef.value?.offsetHeight!;
  canvas.value!.width = pageWidth!;
  canvas.value!.height = pageHeight!;
};

// 设置画板背景颜色
const setCanvasBg = (color = '#fff') => {
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
    // 当是橡皮檫时，将画笔颜色改成画布颜色，以达到擦除笔迹的效果
    setLineColor(drawBgColor.value);
  } else {
    setLineColor(activeColor.value);
  }
  ctx.value?.moveTo(x1, y1);
  ctx.value?.lineTo(x2, y2);
  ctx.value?.stroke();
  ctx.value?.closePath();
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
  historyData.value.length === 100 && historyData.value.shift();
  historyData.value.push(data);
};

// 画笔
const onBrush = () => {
  clear.value = false;
};

// 橡皮擦
const onEraser = () => {
  clear.value = true;
};

// 清空
const onClear = () => {
  ctx.value?.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
  setCanvasBg();
};

// 撤销
const onUndo = () => {
  if (historyData.value.length < 1) return false;
  ctx.value?.putImageData(historyData.value[historyData.value.length - 1], 0, 0);
  historyData.value.pop();
};

// 保存
const onSave = () => {
  const imgUrl = canvas.value!.toDataURL('image/png');
  onDownloadFile({ url: imgUrl });
};

// 点击工具
const onClickTools = (key: string) => {
  if (key !== 'brush' && key !== 'eraser') {
    currentTool.value = 'brush';
    clear.value = false;
  } else {
    currentTool.value = key;
  }
  const actions = {
    brush: onBrush,
    eraser: onEraser,
    clear: onClear,
    undo: onUndo,
    save: onSave,
  };
  actions[key]();
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
    cursor: crosshair;

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
}
</style>
