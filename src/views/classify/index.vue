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
        分类一
      </div>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div
v-infinite-scroll="onFetchData" :infinite-scroll-delay="300" :infinite-scroll-disabled="disabled"
          :infinite-scroll-distance="2" class="pullup-content">
          <div v-for="i of dataSource" :key="i" class="pullup-list-item">
            <Card :data="i" />
          </div>
          <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
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
    height: calc(100% - 155px);

    .current {
      font-size: 16px;
      color: @active;
      margin: 0 0 10px;
    }
  }

  :deep {
    .scrollbar-wrapper(11px);

    .scrollbar-wrapper {
      height: calc(100% - 30px);
    }
  }

  .loading,
  .no-more {
    text-align: center;
    padding-top: 2px;
    color: @font-4;
  }
}
</style>
