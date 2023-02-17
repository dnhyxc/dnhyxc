<!--
 * 时间轴
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="timeline-wrap">
    <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
      <Timeline :data-source="dataSource" />
    </el-scrollbar>
    <ToTopIcon v-if="scrollTop >= 500" class="to-top" :on-scroll-to="onScrollTo" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useScroller } from '@/hooks';
import { scrollTo } from '@/utils';
import { TimelineResult } from '@/typings/common';
import Timeline from '@/components/Timeline/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';

const dataSource = ref<TimelineResult[]>([
  {
    count: 1,
    articles: [
      {
        title: 'react webpac5 项目搭建',
        id: '63e3187be2d6bf53efaa6a3c',
        classify: '架构',
        tag: '前端框架',
        abstract: '项目搭建',
        authorId: '63e24c3be2d6bf53efaa69a9',
        authorName: 'dnhyxc',
        isLike: false,
        likeCount: 0,
        createTime: 1675827289879,
        readCount: 6,
        commentCount: 0,
      },
    ],
    date: '2023',
  },
  {
    count: 2,
    articles: [
      {
        title: 'react webpac5 项目搭建',
        id: '63e3187be2d6bf53efaa6a3c',
        classify: '架构',
        tag: '前端框架',
        abstract: '项目搭建项目搭建项目搭建项目搭建项目搭建项目搭建项目搭建项目搭建项目搭建项目搭建项目搭建',
        authorId: '63e24c3be2d6bf53efaa69a9',
        authorName: 'dnhyxc',
        isLike: false,
        likeCount: 0,
        createTime: 1675827289879,
        readCount: 6,
        commentCount: 0,
      },
      {
        title: 'react',
        id: '63e3187be2d6bf53efaa6a3t',
        classify: '架构',
        tag: '前端框架',
        abstract: '项目搭建',
        authorId: '63e24c3be2d6bf53efaa69a8',
        authorName: 'dnhyxc',
        isLike: false,
        likeCount: 0,
        createTime: 1675827289890,
        readCount: 0,
        commentCount: 0,
      },
    ],
    date: '2022',
  },
]);

// scrollRef：el-scrollbar ref，scrollTop：滚动距离
const { scrollRef, scrollTop } = useScroller();

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
}
</style>
