<!--
 * 文章分类
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div ref="scrollWrap" class="scroll">
    <el-scrollbar ref="scrollRef">
      <div ref="cardList" :class="`card-list ${checkOS() === 'mac' && 'mac-card-list'}`">
        <slot name="card">
          <div
            v-for="(i, index) in classifys"
            :key="index"
            :class="`${currentClassify === i.name && 'active'} card`"
            @click="onClick(i.name!)"
          >
            <div class="content">
              <span class="name">{{ i.name || '-' }}</span>
              <div class="count"><span class="text text-left">共</span>{{ i.value }}<span class="text">篇</span></div>
            </div>
          </div>
        </slot>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watchEffect, onUnmounted } from 'vue';
import { Classifys } from '@/typings/common';
import { commonStore } from '@/store';
import { checkOS } from '@/utils';

interface IProps {
  classifys: Classifys[]; // 分类
  onCheckClassify: (name: string) => void;
  reelGradient: string;
  width?: string;
  currentClassify?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  dataSource: () => [],
  onCheckClassify: () => {},
  width: 'calc(100vw - 80px)',
  currentClassify: '',
});

const moveInfo = reactive<{ x: number; scrollWidth: number }>({ x: 0, scrollWidth: 0 });
const scrollWrap = ref<any>(null);
const cardList = ref<HTMLDivElement | null>(null);
const scrollRef = ref<any>(null);

onMounted(() => {
  // 保存滚动容器
  watchEffect(() => {
    commonStore.reelScrollRef = scrollRef.value?.wrapRef;
  });
  onMouseDown();
  onMouseUp();
  onMouseLeave();
  onSwill();
});

onUnmounted(() => {
  commonStore.reelScrollRef = null;
  commonStore.reelScrollScale = 0;
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
  // 计算滚动比例
  commonStore.reelScrollScale = Number(
    ((startLeft * 1.0) / (scrollRef.value?.wrapRef?.scrollWidth - scrollRef.value?.wrapRef?.offsetWidth)).toFixed(2),
  );
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
    // 计算滚动比例
    commonStore.reelScrollScale = Number(
      ((startLeft * 1.0) / (scrollRef.value?.wrapRef?.scrollWidth - scrollRef.value?.wrapRef?.offsetWidth)).toFixed(2),
    );
    scrollRef.value?.setScrollLeft(moveInfo.scrollWidth);
  } else {
    if (startLeft <= 0) return;
    // 如果滚动距离小于0，则将值赋值成0
    moveInfo.scrollWidth = startLeft - (clientX - moveInfo.x) < 0 ? 0 : startLeft - (clientX - moveInfo.x);
    // 计算滚动比例
    commonStore.reelScrollScale = Number(
      ((startLeft * 1.0) / (scrollRef.value?.wrapRef?.scrollWidth - scrollRef.value?.wrapRef?.offsetWidth)).toFixed(2),
    );
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
const onClick = (name: string) => {
  const { onCheckClassify } = props;
  onCheckClassify && onCheckClassify(name);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.scroll {
  width: calc(100vw - 95px);
  box-sizing: border-box;
  border-radius: 5px;
  -webkit-user-drag: none;

  .card-list {
    box-sizing: border-box;
    width: 100%;
    height: 150px;
    border-radius: 5px;
    white-space: nowrap;
    padding: 5px 0 12px;
    -webkit-user-drag: none;

    .card {
      box-sizing: border-box;
      display: inline-block;
      width: calc((100vw - 90px) / 4);
      height: 100%;
      padding: 0 5px;
      border-radius: 5px;
      -webkit-user-drag: none;
      cursor: pointer;

      &:last-child {
        margin-right: 0;
      }

      .content {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        border-radius: 5px;
        padding: 10px 15px 8px;
        color: var(--font-1);
        box-shadow: 0 0 3px var(--shadow-mack) inset;
        background-image: linear-gradient(to bottom, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);

        .name {
          font-size: 18px;
          .ellipsis();
        }

        .count {
          font-size: 28px;
          font-weight: 700;
          color: var(--theme-blue);
          text-align: right;

          .text {
            display: inline-block;
            font-size: 16px;
            font-weight: 300;
            color: var(--font-3);
            vertical-align: middle;
            margin-left: 5px;
          }

          .text-left {
            margin-left: 0;
            margin-right: 5px;
          }
        }
      }
    }

    .active {
      .content {
        .clickNoSelectText();
        background-image: v-bind(reelGradient);
      }
    }
  }

  .mac-card-list {
    .card {
      width: calc((100vw - 97px) / 4);
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
