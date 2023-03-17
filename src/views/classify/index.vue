<!--
 * 文章分类
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <Loading :loading="classifyStore.loading" class="classify-wap">
    <template #default>
      <Reel
        :on-check-classify="onCheckClassify"
        :classifys="classifyStore.classifys"
        :current-classify="classifyStore.currentClassify || classifyStore.classifys[0]?.name"
      />
      <div class="content">
        <div class="line-wrap">
          <i class="left-line iconfont icon-fenlei2" />
          <span class="current-classify">
            <span class="label">当前分类：</span>
            <span>{{ classifyStore.currentClassify || classifyStore.classifys[0]?.name }}</span>
          </span>
          <span class="line" />
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
        </el-scrollbar>
      </div>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { scrollTo } from '@/utils';
import { useScroller, useDeleteArticle } from '@/hooks';
import { classifyStore, commonStore, articleStore } from '@/store';
import Reel from '@/components/Reel/index.vue';
import Card from '@/components/Card/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';

const { scrollRef, scrollTop } = useScroller();
const { deleteArticle } = useDeleteArticle({});

const isMounted = ref<boolean>(false);
const noMore = computed(() => classifyStore.articleList.length >= classifyStore.total);
const disabled = computed(() => classifyStore.loading || noMore.value);

onMounted(async () => {
  isMounted.value = true;
  await classifyStore.getClassifys();
  onFetchData();
});

onUnmounted(() => {
  classifyStore.clearArticleList();
  // 离开当前页面时清空头部输入框内容
  commonStore.keyword = '';
});

// 请求数据
const onFetchData = async () => {
  await classifyStore.getClassifyList();
};

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};

// 点击卡片事件
const onCheckClassify = (name: string) => {
  classifyStore.currentClassify = name;
  classifyStore.clearArticleList();
  onFetchData();
};

// 文章点赞
const likeListArticle = (id: string) => {
  articleStore.likeListArticle({ id, pageType: 'classify' });
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

    .line-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 0 11px;
      height: 25px;
      line-height: 24px;

      .left-line {
        display: inline-block;
        font-size: 20px;
        margin-right: 10px;
        color: @theme-blue;
      }

      .current-classify {
        display: flex;
        align-items: center;
        font-size: 18px;
        font-weight: 700;
        color: @active;
        padding-right: 10px;

        .label {
          font-size: 13px;
          font-weight: 300;
          color: @font-3;
        }
      }

      .line {
        display: inline-block;
        flex: 1;
        border-radius: 3px;
        height: 6px;
        .clickNoSelectText();
        .bgMoveColor(135deg);
        .bgKeyframes(bgmove);
        box-shadow: 0 0 3px @shadow-color;
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
