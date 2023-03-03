<!--
 * 文章详情
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <Loading :loading="articleStore.loading" class="detail-wrap">
    <div class="content">
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <Preview
          v-if="articleStore.articleDetail.content"
          :mackdown="articleStore.articleDetail.content"
          class="preview-content"
        />
        <Comment v-if="articleStore.articleDetail.authorId" :author-id="articleStore.articleDetail.authorId!" />
      </el-scrollbar>
      <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
    </div>
    <div class="right">
      <Multibar class="action-list" />
      <Toc class="toc-list" />
      <AnotherArticle
        v-if="articleStore.articleDetail.content"
        :id="(route.params.id as string)"
        class="another-list"
      />
    </div>
  </Loading>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useScroller } from '@/hooks';
import { scrollTo } from '@/utils';
import { articleStore, commonStore } from '@/store';
import Preview from '@/components/Preview/index.vue';
import Multibar from '@/components/Multibar/index.vue';
import Toc from '@/components/Toc/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';
import AnotherArticle from '@/components/AnotherArticle/index.vue';
import Comment from '@/components/Comment/index.vue';
import Loading from '@/components/Loading/index.vue';

const route = useRoute();

// scrollRef：el-scrollbar ref，scrollTop：滚动距离
const { scrollRef, scrollTop } = useScroller();

onMounted(async () => {
  nextTick(() => {
    commonStore.detailScrollRef = scrollRef.value;
  });
  await articleStore.getArticleDetail(route.params.id as string);
});

// 组件卸载前，清楚store中的详情信息
onUnmounted(() => {
  articleStore.articleDetail = { id: '' };
});

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.detail-wrap {
  display: flex;
  justify-content: center;
  box-sizing: border-box;

  .content {
    position: relative;
    flex: 1;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    margin-right: 10px;
    .pageHeight();
    border-radius: 5px;
    box-shadow: @shadow-mack;

    :deep {
      .el-scrollbar {
        border-radius: 5px;
        width: 100%;
      }
      .scrollbar-wrapper {
        box-sizing: border-box;
        height: 100%;
        border-radius: 5px;
      }
    }
    .preview-content {
      max-width: calc(100vw - 352px);
    }
  }
  .right {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 260px;
    box-sizing: border-box;
    border-radius: 5px;
    max-height: calc(100vh - 75px);

    .action-list {
      margin-bottom: 10px;
    }

    .toc-list {
      box-sizing: border-box;
      flex: 1;
    }
  }
}
</style>
