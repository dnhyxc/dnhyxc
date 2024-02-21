<!--
 * 高级搜索
 * @author: dnhyxc
 * @since: 2023-03-28
 * index.vue
-->
<template>
  <Loading :loading="searchStore.loading" :class="`${checkOS() === 'mac' && 'mac-search-wrap'} search-wrap`">
    <div class="search-inp-wrap">
      <el-input
        v-model="searchStore.keyword"
        v-focus
        size="large"
        class="el-inp"
        placeholder="请输入搜索关键字"
        clearable
        @keyup.enter="onEnter"
      >
        <template #append>
          <el-button type="primary" class="el-inp-btn" @click="onSearch">
            <i class="iconfont icon-sousuo2" />
            <span class="text">搜索</span>
          </el-button>
        </template>
      </el-input>
    </div>
    <div class="search-tag-list">
      <div class="label" @click="onShowMore">
        <i :class="`iconfont ${!showMore ? 'icon-xiajiantou' : 'icon-shangjiantou'}`" />
        <span class="view-more-info">更多搜索条件</span>
      </div>
      <div class="radio-group">
        <div
          v-for="i in conditions"
          :key="i.key"
          :class="`tag ${searchStore.filterList.includes(i.type) && 'active'}`"
          @click="onSelectChange(i.type)"
        >
          {{ i.label }}
        </div>
      </div>
    </div>
    <div class="page-bottom">
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div
          v-if="isMounted"
          v-infinite-scroll="getSearchArticleList"
          :infinite-scroll-delay="300"
          :infinite-scroll-disabled="disabled"
          :infinite-scroll-distance="2"
          class="pullup-content"
        >
          <div v-for="i of searchStore.articleList" :key="i.id" class="pullup-list-item">
            <Card :data="i" :delete-article="deleteArticle" :like-list-article="likeListArticle" class="card" />
          </div>
          <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" class="to-top" />
        </div>
        <div v-if="noMore" class="no-more">没有更多了～～～</div>
        <Empty v-if="showEmpty" />
      </el-scrollbar>
    </div>
  </Loading>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { searchStore, articleStore } from '@/store';
import { SEARCH_TYPE } from '@/constant';
import { useScroller, useDeleteArticle } from '@/hooks';
import { checkOS, scrollTo } from '@/utils';
import { ArticleItem, WinRefreshParams } from '@/typings/common';
import Empty from '@/components/Empty/index.vue';

const reload = inject<Function>('reload');

const route = useRoute();
const { scrollRef, scrollTop } = useScroller();
const { deleteArticle } = useDeleteArticle({ pageType: 'search' });

const showMore = ref<boolean>(false);
const isMounted = ref<boolean>(false);

const noMore = computed(() => {
  const { articleList, total } = searchStore;
  return articleList.length >= total && articleList.length;
});
const disabled = computed(() => searchStore.loading || noMore.value);
const showEmpty = computed(() => !searchStore.loading && !searchStore.articleList?.length);
// 动态计算展示的筛选项
const conditions = computed(() => {
  if (showMore.value) {
    return SEARCH_TYPE;
  } else {
    return SEARCH_TYPE.slice(0, 5);
  }
});

onMounted(() => {
  // 监听详情点赞状态，实时更改列表对应文章的点赞状态
  ipcRenderer.on('refresh', (_, params: WinRefreshParams) => {
    const { pageType, isLike = true } = params;
    // 需要判断是否是属于当前活动页面，并且只是点击点赞而不是收藏或评论防止重复触发
    if (route.name === 'search' && pageType !== 'list' && isLike) {
      reload && reload();
    }
  });
  isMounted.value = true;
  getSearchArticleList();
});

onUnmounted(() => {
  searchStore.clearArticleList();
  searchStore.clearFilters();
});

// 监听搜索内容是否清空，如果清空了，就清除搜索到的文章列表
watch(
  () => searchStore.keyword,
  (newVal) => {
    if (!newVal) {
      searchStore.clearArticleList();
    }
  },
);

// 输入回车事件
const onEnter = (e: Event) => {
  searchStore.clearArticleList();
  const keyword = (e.target as HTMLInputElement).value;
  searchStore.keyword = keyword;
  if (keyword) {
    getSearchArticleList();
  } else {
    ElMessage({
      message: '请先输入搜索关键字',
      type: 'warning',
      offset: 80,
    });
  }
};

// 点击搜索
const onSearch = () => {
  searchStore.clearArticleList();
  if (searchStore.keyword) {
    getSearchArticleList();
  } else {
    ElMessage({
      message: '请先输入搜索关键字',
      type: 'warning',
      offset: 80,
    });
  }
};

// 获取搜索文章列表
const getSearchArticleList = () => {
  searchStore.advancedSearch();
};

// 展示更多过滤项
const onShowMore = () => {
  showMore.value = !showMore.value;
};

// 选择过滤项
const onSelectChange = (value: string) => {
  // 清空搜索缓存数据
  searchStore.clearArticleList();
  if (value === 'all') {
    searchStore.filterList = ['all'];
  } else {
    const noAll = searchStore.filterList.filter((i) => i !== 'all');
    const filter = noAll.find((i) => i === value);
    if (filter) {
      const values = noAll.filter((i) => i !== value);
      if (values?.length) {
        searchStore.filterList = values;
      } else {
        searchStore.filterList = ['all'];
      }
    } else {
      noAll.push(value);
      searchStore.filterList = [...noAll];
    }
  }
  searchStore.advancedSearch();
};

// 文章点赞
const likeListArticle = async (id: string, data?: ArticleItem) => {
  await articleStore.likeListArticle({ id, pageType: 'search', data });
};

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.search-wrap {
  position: relative;
  display: flex;
  flex-direction: column;

  .search-inp-wrap {
    position: fixed;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    -webkit-app-region: no-drag;

    .el-inp {
      width: 45vw;
      -webkit-app-region: no-drag;
    }

    .el-inp-btn {
      -webkit-app-region: no-drag;
    }

    .icon-sousuo2,
    .text {
      color: @fff;
      font-size: 14px;
    }

    .text {
      margin-left: 10px;
    }
  }

  :deep {
    .el-input-group__append {
      background-color: @theme-blue;
      box-shadow: 0 1px 0 0 @theme-blue inset, 0 -1px 0 0 @theme-blue inset, -1px 0 0 0 @theme-blue inset;
    }

    .scrollbar-wrapper(12px);

    .el-input__wrapper {
      color: var(--font-1);
      background-color: var(--input-bg-color);
      box-shadow: 0 0 0 1px var(--card-border) inset;
    }

    .el-input__inner {
      color: var(--font-color);

      &::-webkit-input-placeholder {
        color: var(--placeholder-color);
      }
    }
  }

  .search-tag-list {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 20px;
    width: calc(100% - 9px);
    padding-left: 5px;

    .label {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 5px;
      text-align: center;
      background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
      min-width: 140px;
      border-radius: 5px;
      cursor: pointer;
      border: 1px solid var(--card-border);
      color: var(--font-2);

      .view-more-info {
        text-align: center;
        margin-left: 5px;
      }
    }

    .radio-group {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      max-width: 860px;
    }

    .tag {
      width: calc(20% - 4px);
      margin-top: 5px;
      margin-right: 5px;
      padding: 5px 0;
      text-align: center;
      border: none;
      border-radius: 3px;
      background-color: var(--fff);
      border: 1px solid var(--card-border);
      color: var(--font-2);
      box-sizing: border-box;
      cursor: pointer;

      &:not(:first-child)::before {
        background-color: transparent !important;
      }

      &:first-child {
        border-radius: 3px;
      }

      &:nth-child(-n + 5) {
        margin-top: 0;
      }

      &:nth-child(5n) {
        margin-right: 0;
      }
    }

    .active {
      background-color: @theme-blue;
      color: @fff;
    }
  }

  .page-bottom {
    flex: 1;
    border-radius: 5px;
    box-shadow: 0 0 5px 0 var(--card-shadow);
    margin: 0 5px;
    padding: 5px 0;
    overflow: auto;

    :deep {
      .scrollbar-wrapper {
        .scrollbar-wrapper();

        .pullup-list-item {
          &:nth-child(-n + 4) {
            padding-top: 0;
          }
        }
      }
    }
  }

  .no-more {
    text-align: center;
    color: var(--font-4);
    padding: 10px 0 12px;
    .clickNoSelectText();
  }
}

.mac-search-wrap {
  .search-inp-wrap {
    top: 20px;
  }

  .search-tag-list {
    width: calc(100% - 8px);
    padding-left: 3px;
  }
}
</style>
