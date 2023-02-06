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
    <Scrollbar ref="scRef" class="scrollbar" :data-source="dataSource" :on-fetch-data="onFetchData">
      <template #default="{ data }">
        <Card :data="data" />
      </template>
    </Scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ATRICLE_TYPE } from '@/constant';
import Carousel from '@/components/Carousel/index.vue';
import Scrollbar from '@/components/Scrollbar/index.vue';
import Card from '@/components/Card/index.vue';

interface ScrollbarParams {
  onScrollTo: (to: number, time?: number) => void;
}

const dataSource = ref<number>(20);
const searchType = ref<number>(1); // 1：推荐，2：最新，3：最热
const scRef = ref<ScrollbarParams>({ onScrollTo: () => {} });

// 请求数据
const onFetchData = async () => {
  try {
    const newData: any = await ajaxGet(/* url */);
    if (dataSource.value > 61) return;
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
}
</style>
