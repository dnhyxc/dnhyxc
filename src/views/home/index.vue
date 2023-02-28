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
        v-if="isMounted"
        v-infinite-scroll="onFetchData"
        :infinite-scroll-delay="300"
        :infinite-scroll-disabled="disabled"
        :infinite-scroll-distance="2"
        class="pullup-content"
      >
        <div v-for="i of articleStore.articleList" :key="i.id" class="pullup-list-item">
          <Card :data="i" />
        </div>
        <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
      </div>
      <div v-if="articleStore.loading" class="loading">Loading...</div>
      <div v-if="noMore" class="no-more">没有更多了～～～</div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { ATRICLE_TYPE } from '@/constant';
import { scrollTo } from '@/utils';
import { useScroller } from '@/hooks';
import { articleStore } from '@/store';
import Carousel from '@/components/Carousel/index.vue';
import Card from '@/components/Card/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';

const searchType = ref<number>(1); // 1：推荐，2：最新，3：最热

const { scrollRef, scrollTop } = useScroller();
const isMounted = ref<boolean>(false);
const noMore = computed(() => articleStore.articleList.length >= articleStore.total);
const disabled = computed(() => articleStore.loading || noMore.value);

onMounted(() => {
  isMounted.value = true;
  onFetchData();
});

watchEffect(() => {
  console.log(articleStore.articleList, 'articleStore');
});

// 请求数据
const onFetchData = async () => {
  await articleStore.getArticleList();
};

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
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

  :deep {
    .scrollbar-wrapper();
  }

  .loading,
  .no-more {
    text-align: center;
    padding-top: 2px;
    color: @font-4;
  }
}
</style>
