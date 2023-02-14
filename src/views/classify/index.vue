<!--
 * 文章分类
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="classify-wap">
    <Reel :on-check-classify="onCheckClassify" :data-source="[]" />
    <div class="content">
      <div class="current">
        <i class="left-line iconfont icon-fenlei2" />
        <span class="text">分类一JAVASCRIPT</span>
        <span class="line" />
      </div>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div
          v-infinite-scroll="onFetchData"
          :infinite-scroll-delay="300"
          :infinite-scroll-disabled="disabled"
          :infinite-scroll-distance="2"
          class="pullup-content"
        >
          <div v-for="i of dataSource" :key="i" class="pullup-list-item">
            <Card :data="i" />
          </div>
          <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" class="to-top" />
        </div>
        <div v-if="loading" class="loading">Loading...</div>
        <div v-if="noMore" class="no-more">没有更多了～～～</div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { scrollTo } from '@/utils';
import { useScroller } from '@/hooks';
import Reel from '@/components/Reel/index.vue';
import Card from '@/components/Card/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';

const dataSource = ref<any>(20);
const loading = ref<boolean>(false);

const { scrollRef, scrollTop } = useScroller();

const noMore = computed(() => dataSource.value > 31);
const disabled = computed(() => loading.value || noMore.value);

// 请求数据
const onFetchData = async () => {
  console.log('正在加载更多');

  try {
    loading.value = true;
    const newData: any = await ajaxGet(/* url */);
    loading.value = false;
    if (dataSource.value > 31) return;
    dataSource.value += newData;
  } catch (err) {
    // handle err
    console.log(err);
  }
};

const ajaxGet = async (/* url */) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(20);
    }, 1000);
  });
};

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};

// 点击卡片事件
const onCheckClassify = (id: number) => {
  console.log(id, 'id');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.classify-wap {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  border-radius: 5px;
  overflow: hidden;
  box-sizing: border-box;

  .content {
    height: calc(100% - 150px);

    .current {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 0 11px;

      .left-line {
        display: inline-block;
        font-size: 20px;
        margin-bottom: 2px;
        margin-right: 10px;
        color: @theme-blue;
      }

      .text {
        display: inline-block;
        font-size: 18px;
        font-weight: 700;
        color: @active;
        padding-right: 10px;
      }

      .line {
        display: inline-block;
        flex: 1;
        border-radius: 3px;
        border: 5px double @card-border;
      }
    }
  }

  :deep {
    .scrollbar-wrapper(12px);

    .scrollbar-wrapper {
      height: calc(100% - 34px);
    }
  }

  .to-top {
    bottom: 47px;
  }

  .loading,
  .no-more {
    text-align: center;
    color: @font-4;
  }
}
</style>
