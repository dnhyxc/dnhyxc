<!--
 * 文章列表
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="home-wrap">
    <div class="carousel-content">
      <Carousel />
      <div class="search-btns">
        <el-button type="success" link :class="searchType === 2 && 'active'" @click="searchNewArticles"
          >最新文章</el-button
        >
        <el-button type="warning" link :class="searchType === 3 && 'active'" @click="searchHotArticles"
          >最热文章</el-button
        >
      </div>
      <div class="recommend">{{ ATRICLE_TYPE[searchType] }}</div>
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
        <ToTopIcon :on-scroll-to="onScrollTo" />
      </div>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-if="noMore" class="no-more">没有更多了～～～</div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ATRICLE_TYPE } from '@/constant';
import { scrollTo } from '@/utils';
import Carousel from '@/components/Carousel/index.vue';
import Card from '@/components/Card/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';

const dataSource = ref<any>(20);
const searchType = ref<number>(1); // 1：推荐，2：最新，3：最热
const scrollRef = ref<any>(null);
const loading = ref<boolean>(false);
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

// 搜索最新文章
const searchNewArticles = () => {
  searchType.value = 2;
};

// 搜索最热文章
const searchHotArticles = () => {
  searchType.value = 3;
};

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.home-wrap {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
  height: 100%;
  .carousel-content {
    position: relative;
    .search-btns {
      position: absolute;
      left: 11px;
      bottom: 16px;

      .active {
        color: @active;
      }
    }
    .recommend {
      position: absolute;
      right: 11px;
      bottom: 16px;
      color: @active;
    }
  }
  :deep {
    .scrollbar-wrapper {
      box-sizing: border-box;
      height: 100%;
      .pullup-content {
        display: flex;
        flex-wrap: wrap;
        .pullup-list-item {
          border-radius: 5px;
          list-style: none;
          width: calc(33.33333% - 4px);
          margin-right: 6px;
          margin-bottom: 6px;
          &:nth-child(3n + 3) {
            margin-right: 0;
          }
        }
      }
    }
  }

  .loading,
  .no-more {
    text-align: center;
    padding-top: 6px;
    padding-bottom: 3px;
    color: @font-4;
  }
}
</style>
