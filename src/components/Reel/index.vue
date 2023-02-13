<!--
 * 文章分类
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div ref="scrollWrap" class="scroll">
    <el-scrollbar ref="scrollRef">
      <div ref="cardList" class="card-list">
        <slot name="card">
          <div v-for="i in 20" :key="i" class="card" @click="onClick(i)">分类{{ i }}{{ moveInfo.scrollWidth }}</div>
        </slot>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';

interface IProps {
  dataSource: any[];
  onCheckClassify: (id: number) => void;
  width?: string;
}

const moveInfo = reactive<{ x: number; scrollWidth: number }>({ x: 0, scrollWidth: 0 });
const scrollWrap = ref<any>(null);
const cardList = ref<HTMLDivElement | null>(null);
const scrollRef = ref<any>(null);

const props = withDefaults(defineProps<IProps>(), {
  dataSource: () => [],
  onCheckClassify: () => {},
  width: 'calc(100vw - 82px)',
});

onMounted(() => {
  onMouseDown();
  onMouseUp();
  onMouseLeave();
  onSwill();
});

// 监听鼠标滚轮事件
const onSwill = () => {
  scrollWrap.value?.addEventListener('wheel', wheelEvent);
};

// 滚轮事件
const wheelEvent = (e: WheelEvent) => {
  e.preventDefault();
  const startLeft = Math.ceil(scrollRef.value?.wrapRef?.scrollLeft);
  // 如果滚动距离小于0，则将值赋值成0
  moveInfo.scrollWidth = startLeft + Math.ceil(e.deltaY) < 0 ? 0 : startLeft + Math.ceil(e.deltaY);
  scrollRef.value?.setScrollLeft(moveInfo.scrollWidth);
};

// 监听鼠标按下事件
const onMouseDown = () => {
  scrollWrap.value?.addEventListener('mousedown', (e: MouseEvent) => {
    e.preventDefault();
    const { clientX } = e;
    moveInfo.x = clientX;
    scrollWrap.value?.addEventListener('mousemove', onMouseMove);
  });
};

// 监听鼠标滑动事件
const onMouseMove = (e: MouseEvent) => {
  e.preventDefault();
  const scrollWrapWidth = Math.ceil(scrollWrap.value?.offsetWidth);
  const startLeft = Math.ceil(scrollRef.value?.wrapRef?.scrollLeft);
  const cardListWidth = Math.ceil(scrollRef.value?.wrapRef?.scrollWidth);

  const { clientX } = e;
  if (clientX < moveInfo.x) {
    if (startLeft + scrollWrapWidth >= cardListWidth) return;
    moveInfo.scrollWidth = startLeft + (moveInfo.x - clientX);
    scrollRef.value?.setScrollLeft(moveInfo.scrollWidth);
  } else {
    if (startLeft <= 0) return;
    // 如果滚动距离小于0，则将值赋值成0
    moveInfo.scrollWidth = startLeft - (clientX - moveInfo.x) < 0 ? 0 : startLeft - (clientX - moveInfo.x);
    scrollRef.value?.setScrollLeft(moveInfo.scrollWidth);
  }
};

// 鼠标弹起及离开时间
const mouseAction = (e: MouseEvent) => {
  e.preventDefault();
  scrollWrap.value?.removeEventListener('mousemove', onMouseMove);
};

// 监听鼠标弹起事件
const onMouseUp = () => {
  scrollWrap.value?.addEventListener('mouseup', mouseAction);
};

// 监听鼠标离开事件
const onMouseLeave = () => {
  scrollWrap.value?.addEventListener('mouseleave', mouseAction);
  scrollWrap.value?.addEventListener('wheel', wheelEvent);
};

// 点击卡片事件
const onClick = (id: number) => {
  const { onCheckClassify } = props;
  onCheckClassify && onCheckClassify(id);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.scroll {
  width: v-bind(width);
  box-sizing: border-box;
  border-radius: 5px;
  -webkit-user-drag: none;

  .card-list {
    box-sizing: border-box;
    width: 100%;
    height: 150px;
    border-radius: 5px;
    white-space: nowrap;
    padding: 0 0 12px;
    -webkit-user-drag: none;

    .card {
      box-sizing: border-box;
      display: inline-block;
      width: calc((100vw - 118px) / 4);
      height: 100%;
      margin-right: 12px;
      box-shadow: @shadow-mack;
      background-image: @card-lg;
      border-radius: 5px;
      -webkit-user-drag: none;
      .clickNoSelectText();
      &:last-child {
        margin-right: 0;
      }
    }
  }
}

@media screen and (min-width: 1082px) {
  .scroll {
    .card-list {
      .card {
        width: 241px;
      }
    }
  }
}
</style>
