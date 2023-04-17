<!--
 * 时间轴
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <Loading :loading="timelineStore.loading" class="timeline-wrap">
    <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
      <Timeline
        :data-source="timelineStore.timelineList"
        :delete-article="deleteArticle"
        :like-list-article="likeListArticle"
      />
      <div v-if="timelineStore.timelineList?.length > 0" class="no-more">没有更多了～～～</div>
      <Empty v-if="showEmpty" />
    </el-scrollbar>
    <ToTopIcon v-if="scrollTop >= 500" class="to-top" :on-scroll-to="onScrollTo" />
  </Loading>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { onMounted, computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import { useScroller } from '@/hooks';
import { scrollTo } from '@/utils';
import { timelineStore, articleStore } from '@/store';
import Timeline from '@/components/Timeline/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';
import Loading from '@/components/Loading/index.vue';
import Empty from '@/components/Empty/index.vue';
import { ArticleItem } from '@/typings/common';

const reload = inject<Function>('reload');

const route = useRoute();
// scrollRef：el-scrollbar ref，scrollTop：滚动距离
const { scrollRef, scrollTop } = useScroller();

const showEmpty = computed(
  () => timelineStore.loading !== null && !timelineStore.loading && !timelineStore.timelineList?.length,
);

onMounted(async () => {
  // 监听详情点赞状态，实时更改列表对应文章的点赞状态
  ipcRenderer.on('refresh', (_, id, pageType, isLike = true) => {
    // 需要判断是否是属于当前活动页面，并且只是点击点赞而不是收藏或评论防止重复触发
    if (route.name === 'timeline' && pageType !== 'list' && isLike) {
      reload && reload();
    }
  });

  await timelineStore.getTimelineList();
});

// 文章点赞
const likeListArticle = (id: string, data?: ArticleItem) => {
  articleStore.likeListArticle({ id, isTimeLine: true, data });
};

// 删除文章
const deleteArticle = (id: string) => {
  timelineStore.deleteTimelineArticle(id);
};

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.timeline-wrap {
  width: 100%;
  height: 100%;

  :deep {
    .el-timeline {
      margin: 0 10px;
    }
  }

  .to-top {
    right: 40px;
    bottom: 40px;
  }

  .no-more {
    text-align: center;
    color: var(--font-4);
    margin: 15px 0 0;
  }
}
</style>
