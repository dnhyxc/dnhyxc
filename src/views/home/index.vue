<!--
 * 文章列表
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <Loading :loading="articleStore.loading" class="home-wrap">
    <template #default>
      <div class="carousel-content">
        <Carousel :data="articleStore.recommendArticleList" />
        <div class="search-btns">
          <el-button type="primary" link :class="searchType === 1 && 'active'" @click="searchNewArticles">
            推荐文章
          </el-button>
          <el-button type="danger" link :class="searchType === 2 && 'active'" @click="searchHotArticles">
            最热文章
          </el-button>
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
            <Card :data="i" :delete-article="deleteArticle" :like-list-article="likeListArticle" />
          </div>
          <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
        </div>
        <div v-if="noMore" class="no-more">没有更多了～～～</div>
        <Empty v-if="!articleStore.loading && !articleStore.articleList?.length" />
      </el-scrollbar>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue';
import { useRoute } from 'vue-router';
import { ATRICLE_TYPE } from '@/constant';
import { scrollTo } from '@/utils';
import { useScroller, useDeleteArticle } from '@/hooks';
import { articleStore, commonStore } from '@/store';
import Carousel from '@/components/Carousel/index.vue';
import Card from '@/components/Card/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';
import Empty from '@/components/Empty/index.vue';
import { ArticleItem, WinRefreshParams } from '@/typings/common';

const reload = inject<Function>('reload');

const searchType = ref<number>(1); // 1：推荐，2：最新，3：最热
const isMounted = ref<boolean>(false);

const noMore = computed(() => {
  const { articleList, total } = articleStore;
  return articleList.length >= total && articleList.length;
});
const disabled = computed(() => articleStore.loading || noMore.value);

const { scrollRef, scrollTop } = useScroller();
const route = useRoute();

const { deleteArticle } = useDeleteArticle({ pageType: 'home' });

onMounted(() => {
  isMounted.value = true;
  articleStore.getArticleByRandom();
  onFetchData();
  // 监听详情点赞状态，实时更改列表对应文章的点赞状态
  ipcRenderer.on('refresh', (_, params: WinRefreshParams) => {
    const { pageType, isLike = true } = params;
    // 需要判断是否是属于当前活动页面，并且只是点击点赞而不是收藏或评论防止重复触发
    if (route.name === 'home' && pageType !== 'list' && isLike) {
      reload && reload();
    }
  });
});

// 监听页面搜索关键词，请求列表数据
watch(
  () => commonStore.keyword,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      articleStore.clearArticleList();
      onFetchData();
    }
  },
);

onUnmounted(() => {
  articleStore.clearArticleList();
  // 离开当前页面时清空头部输入框内容
  commonStore.keyword = '';
});

// 请求数据
const onFetchData = async () => {
  await articleStore.getArticleList();
};

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};

// 搜索推荐文章
const searchNewArticles = () => {
  // 搜索推荐文章时，把设置的所有筛选项清除
  articleStore.hot = false;
  commonStore.keyword = '';
  searchType.value = 1;
  articleStore.clearArticleList();
  onFetchData();
};

// 搜索最热文章
const searchHotArticles = () => {
  articleStore.hot = true;
  searchType.value = 2;
  articleStore.clearArticleList();
  onFetchData();
};

// 文章点赞
const likeListArticle = async (id: string, data: ArticleItem) => {
  await articleStore.likeListArticle({ id, pageType: 'home', data });
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
        color: var(--active-color);
      }
    }

    .recommend {
      position: absolute;
      right: 11px;
      bottom: 16px;
      color: var(--active-color);
    }
  }

  :deep {
    .scrollbar-wrapper();
  }

  .no-more {
    text-align: center;
    padding-top: 12px;
    color: var(--font-4);
  }
}
</style>
