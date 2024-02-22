<!--
 * 标签文章列表
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <Loading :loading="tagStore.loading" class="articles-wrap">
    <div class="left">
      <span class="title">
        <span>文章标签列表</span>
        <i
          :class="`font iconfont ${scrollChildTop > 10 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
          @click="onScrollTagMenuTo"
        />
      </span>
      <el-scrollbar v-if="tagStore.tags.length > 0" ref="scrollChildRef" wrap-class="scrollbar-wrapper">
        <div v-for="i in tagStore.tags" :key="i.name" class="tag-wrap">
          <div
            :id="(tagStore.currentTag || route.query?.tag || tagStore.tags[0]?.name) === i.name ? 'ACTIVE_TAG' : ''"
            :class="`${(tagStore.currentTag || route.query?.tag || tagStore.tags[0]?.name) === i.name && 'active'} tag`"
            @click="onCheckTag(i.name)"
          >
            <div class="tag-name">{{ i.name }}</div>
            <div class="tag-count">包含（{{ i.value }}） 篇</div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="right">
      <div v-if="tagStore.tags.length > 0" class="header">
        {{ tagStore.currentTag || route.query?.tag || tagStore.tags[0]?.name }}
      </div>
      <div class="content">
        <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
          <div
            v-if="isMounted"
            v-infinite-scroll="onFetchData"
            :infinite-scroll-delay="300"
            :infinite-scroll-disabled="disabled"
            :infinite-scroll-distance="2"
            class="article-list"
          >
            <LineCard
              v-for="data in tagStore.articleList"
              :key="data.id"
              :data="data"
              class="author-line-card"
              :delete-article="deleteArticle"
              :like-list-article="likeListArticle"
            />
            <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" class="to-top" />
          </div>
          <div v-if="noMore" class="no-more">没有更多了～～～</div>
          <Empty v-if="showEmpty" />
        </el-scrollbar>
      </div>
    </div>
  </Loading>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref, Ref, computed, onMounted, onUnmounted, watch, watchEffect, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { scrollTo } from '@/utils';
import { useScroller, useChildScroller, useDeleteArticle } from '@/hooks';
import { tagStore, articleStore, commonStore } from '@/store';
import Loading from '@/components/Loading/index.vue';
import { ArticleItem, WinRefreshParams } from '@/typings/common';

const reload = inject<Function>('reload');

const route = useRoute();
const router = useRouter();

const scrollbar = ref<HTMLDivElement | null>(null);
const isMounted = ref<boolean>(false);
const noMore = computed(() => {
  const { articleList, total } = tagStore;
  return articleList.length >= total && articleList.length;
});
const disabled = computed(() => tagStore.loading || noMore.value);
const showEmpty = computed(() => tagStore.loading !== null && !tagStore.loading && !tagStore.articleList?.length);
const { scrollRef, scrollTop } = useScroller();
const { scrollChildRef, scrollChildTop } = useChildScroller();

onMounted(async () => {
  // 计算当前选中的标签位置，自动滑动到当前选中的标签位置
  watchEffect(() => {
    scrollbar.value = scrollChildRef.value?.wrapRef as HTMLDivElement;
    if (scrollChildRef.value?.wrapRef) {
      const activeTag = document.querySelector('#ACTIVE_TAG') as HTMLDivElement;
      scrollTo(scrollChildRef, activeTag?.offsetTop - 5);
    }
  });
  isMounted.value = true;
  // 获取标签信息
  await tagStore.getTags();
  onFetchData();

  // 监听详情点赞状态，实时更改列表对应文章的点赞状态
  ipcRenderer.on('refresh', (_, params: WinRefreshParams) => {
    const { pageType, isLike = true } = params;
    // 需要判断是否是属于当前活动页面，并且只是点击点赞而不是收藏或评论防止重复触发
    if (route.name === 'tagList' && pageType !== 'list' && isLike) {
      reload && reload();
    }
  });
});

const { deleteArticle } = useDeleteArticle({
  pageType: 'tag',
  tagName: route.query?.tag as string,
  router,
  scrollbar: scrollbar as Ref<HTMLDivElement>,
});

onUnmounted(() => {
  tagStore.clearArticleList();
  // 离开当前页面时清空头部输入框内容
  commonStore.keyword = '';
  tagStore.currentTag = '';
  tagStore.tags = [];
});

// 监听页面搜索关键词，请求列表数据
watch(
  () => commonStore.keyword,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      tagStore.clearArticleList();
      onFetchData();
    }
  },
);

// 监听选中标签，请求列表数据
watch(
  () => tagStore.currentTag,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      tagStore.clearArticleList();
      onFetchData();
    }
  },
);

// 请求数据
const onFetchData = async () => {
  await tagStore.getArticleByTagName(route.query?.tag as string);
};

// 滚动标签菜单到位位置
const onScrollTagMenuTo = () => {
  const bottom = scrollChildRef.value?.wrapRef?.firstElementChild?.offsetHeight;
  scrollTo(scrollChildRef, scrollChildTop.value > 10 ? 0 : bottom);
};

// 滚动到某位置
const onScrollTo = () => {
  const bottom = scrollRef.value?.wrapRef?.firstElementChild?.offsetHeight;
  scrollTo(scrollRef, scrollTop.value > 0 ? 0 : bottom);
};

// 选中标签
const onCheckTag = (tag: string) => {
  tagStore.currentTag = tag;
};

// 文章点赞
const likeListArticle = async (id: string, data?: ArticleItem) => {
  await articleStore.likeListArticle({ id, pageType: 'tag', data });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.articles-wrap {
  display: flex;
  justify-content: flex-start;
  height: 100%;
  box-sizing: border-box;
  padding: 4px 5px 0 5px;

  .left {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 220px;
    height: 100%;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--pre-hover-bg);
    border-radius: 5px;
    padding: 5px;

    :deep {
      .scrollbar-wrapper {
        flex: 1;
      }
    }

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      color: var(--font-1);
      margin-bottom: 6px;
      padding-bottom: 9px;
      padding: 8px 5px 2px;

      .font {
        font-size: 18px;
        cursor: pointer;

        &:hover {
          color: var(--active-color);
        }
      }
    }

    .tag-wrap {
      margin-bottom: 10px;
      border-radius: 5px;
      color: var(--font-3);

      &:first-child {
        margin-top: 5px;
      }

      &:last-child {
        margin-bottom: 5px;
      }

      &:nth-child(odd) {
        .tag {
          background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
        }
      }

      &:nth-child(even) {
        .tag {
          background-image: linear-gradient(-225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
        }
      }

      &:hover {
        color: var(--active-color);
      }

      .tag {
        position: relative;
        box-sizing: border-box;
        width: calc(100% - 10px);
        padding: 5px;
        margin-left: 5px;
        border-radius: 5px;
        cursor: pointer;
        border-bottom: 1px solid var(--card-border);
        box-shadow: 0 0 5px var(--shadow-color);

        .tag-name {
          font-size: 16px;
          margin-bottom: 5px;
          .ellipsisMore(1);
        }

        .tag-count {
          font-size: 13px;
          .ellipsisMore(1);
        }
      }

      .active {
        color: var(--theme-blue);
        &::before {
          position: absolute;
          top: 50%;
          left: -5px;
          transform: translateY(-50%);
          content: '';
          width: 4px;
          height: 60%;
          border-top-right-radius: 5px;
          border-bottom-right-radius: 5px;
          background-color: var(--theme-blue);
        }
      }
    }
  }

  .right {
    flex: 1;
    margin-left: 10px;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--pre-hover-bg);
    border-radius: 5px;
    padding: 5px 5px;

    .header {
      display: inline-block;
      font-size: 18px;
      font-weight: 700;
      color: var(--font-1);
      padding-top: 2px;
      padding-left: 5px;
      padding-bottom: 8px;
      border-radius: 5px;
    }

    .content {
      height: calc(100% - 45px);
      margin-top: 6px;

      .article-list {
        position: relative;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;

        .author-line-card {
          width: calc(50% - 10px);
          padding: 10px;
          box-shadow: 0 0 5px var(--shadow-mack);
          border-radius: 5px;
          margin: 5px;

          &:nth-child(odd) {
            background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
          }

          &:nth-child(even) {
            background-image: linear-gradient(-225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
          }

          :deep {
            .art-info {
              flex: 0.6;
            }

            .img-wrap {
              flex: 0.4;
              min-width: initial;
            }
          }
        }
      }

      .loading,
      .no-more {
        text-align: center;
        color: var(--font-4);
        padding: 10px 0 5px 0;
      }
    }
  }
}
</style>
