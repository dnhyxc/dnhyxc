<!--
 * 文章分类
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <Loading :loading="classifyStore.loading" :class="`${checkOS() === 'mac' && 'mac-classify-wrap'} classify-wrap`">
    <template #default>
      <Reel
        v-if="classifyStore.articleList?.length"
        ref="reelRef"
        :on-check-classify="onCheckClassify"
        :classifys="classifyStore.classifys"
        :current-classify="classifyStore.currentClassify || route.query?.classify as string || classifyStore.classifys[0]?.name"
      />
      <div :class="`content ${!classifyStore.articleList?.length && 'empty-content'}`">
        <div v-if="classifyStore.articleList?.length" class="line-wrap">
          <i class="left-line iconfont icon-fenlei2" />
          <span class="current-classify">
            <span class="label">当前分类：</span>
            <span>
              {{ classifyStore.currentClassify || route.query?.classify || classifyStore.classifys[0]?.name }}
            </span>
          </span>
          <span ref="lineRef" class="line">
            <span ref="dotRef" class="dot" />
          </span>
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
            <div v-for="i of classifyStore.articleList" :key="i.id" class="pullup-list-item">
              <Card :data="i" :delete-article="deleteArticle" :like-list-article="likeListArticle" />
            </div>
            <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" class="to-top" />
          </div>
          <div v-if="noMore" class="no-more">没有更多了～～～</div>
          <Empty v-if="showEmpty" />
        </el-scrollbar>
      </div>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref, computed, onMounted, onUnmounted, watch, nextTick, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { checkOS, scrollTo } from '@/utils';
import { useScroller, useDeleteArticle } from '@/hooks';
import { classifyStore, commonStore, articleStore } from '@/store';
import { ArticleItem, WinRefreshParams } from '@/typings/common';
import Reel from '@/components/Reel/index.vue';
import Card from '@/components/Card/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';
import Empty from '@/components/Empty/index.vue';

const reload = inject<Function>('reload');

const route = useRoute();
const router = useRouter();

const { scrollRef, scrollTop } = useScroller();
const { deleteArticle } = useDeleteArticle({ pageType: 'classify', classify: route.query?.classify as string, router });

const isMounted = ref<boolean>(false);
const noMore = computed(() => {
  const { articleList, total } = classifyStore;
  return articleList.length >= total && articleList.length;
});
const disabled = computed(() => classifyStore.loading || noMore.value);
const showEmpty = computed(() => !classifyStore.loading && !classifyStore.articleList?.length);
const lineRef = ref<any>(null);
const dotRef = ref<any>(null);
const scrollLeft = ref<string>('');

onMounted(async () => {
  // 监听详情点赞状态，实时更改列表对应文章的点赞状态
  ipcRenderer.on('refresh', (_, params: WinRefreshParams) => {
    const { pageType, isLike = true } = params;
    // 需要判断是否是属于当前活动页面，并且只是点击点赞而不是收藏或评论防止重复触发
    if (route.name === 'classify' && pageType !== 'list' && isLike) {
      reload && reload();
    }
  });
  // 初始化时，将scrollLeft设置为0px
  isMounted.value = true;
  // 获取分类信息
  await classifyStore.getClassifys();
  onFetchData();
});

onUnmounted(() => {
  classifyStore.clearArticleList();
  // 离开当前页面时清空头部输入框内容
  commonStore.keyword = '';
  classifyStore.currentClassify = '';
  classifyStore.classifys = [];
});

// 计算lineRef的左边偏移量
watch(
  () => commonStore.reelScrollScale,
  (newVal) => {
    nextTick(() => {
      const width = lineRef.value.offsetWidth * newVal!;
      // 判断是否到顶，如果到顶需要减去滑块的宽度，防止滑块画出父元素
      scrollLeft.value = width >= lineRef.value.offsetWidth ? `${width - dotRef.value.offsetWidth}px` : `${width}px`;
    });
  },
);

// 监听页面搜索关键词，请求列表数据
watch(
  () => commonStore.keyword,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      classifyStore.clearArticleList();
      onFetchData();
    }
  },
);

// 监听页面搜索关键词，请求列表数据
watch(
  () => classifyStore.currentClassify,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      classifyStore.clearArticleList();
      onFetchData();
    }
  },
);

// 请求数据
const onFetchData = async () => {
  await classifyStore.getClassifyList(route.query?.classify as string);
};

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};

// 点击卡片事件
const onCheckClassify = (name: string) => {
  classifyStore.currentClassify = name;
};

// 文章点赞
const likeListArticle = (id: string, data?: ArticleItem) => {
  articleStore.likeListArticle({ id, pageType: 'classify', data });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.classify-wrap {
  display: flex;
  flex-direction: column;
  height: calc(100% - 8px) !important;
  border-radius: 5px;
  margin: 8px 5px 0;
  box-shadow: 0 0 5px var(--card-shadow);
  padding-bottom: 7px;

  .content {
    height: calc(100% - 150px);

    .line-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 0 11px;
      height: 25px;
      line-height: 24px;
      padding-left: 2px;
      padding-right: 5px;

      .left-line {
        display: inline-block;
        font-size: 20px;
        margin-right: 10px;
        color: var(--theme-blue);
      }

      .current-classify {
        display: flex;
        align-items: center;
        font-size: 18px;
        font-weight: 700;
        color: var(--active-color);
        padding-right: 10px;

        .label {
          font-size: 13px;
          font-weight: 300;
          color: var(--font-3);
        }
      }

      .line {
        position: relative;
        display: inline-block;
        flex: 1;
        border-radius: 3px;
        height: 6px;
        .clickNoSelectText();
        .bgLgColor(126deg);
        box-shadow: 0 0 3px var(--shadow-color);

        .dot {
          box-sizing: border-box;
          position: absolute;
          left: v-bind(scrollLeft);
          bottom: -4px;
          width: 15px;
          height: 15px;
          .clickNoSelectText();
          .bgLgColor();
          border-radius: 10px;
          border: 1px solid var(--shadow-color);
        }
      }
    }
  }

  .empty-content {
    height: 100%;
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

  .no-more {
    padding: 10px 0 12px;
    text-align: center;
    color: var(--font-4);
  }
}

.mac-classify-wrap {
  width: calc(100% - 2px);
}
</style>
