<!--
 * 时间轴
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <Loading :loading="timelineStore.loading" class="timeline-wrap">
    <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
      <ElTimeline
        :timeline-list="timelineStore.timelineList"
        :delete-time-line-article="deleteTimeLineArticle"
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
import { scrollTo, showMessage } from '@/utils';
import { timelineStore, articleStore } from '@/store';
import ToTopIcon from '@/components/ToTopIcon/index.vue';
import Loading from '@/components/Loading/index.vue';
import Empty from '@/components/Empty/index.vue';
import { WinRefreshParams, ArticleItem, TimelineArticles } from '@/typings/common';

const reload = inject<Function>('reload');

const route = useRoute();
// scrollRef：el-scrollbar ref，scrollTop：滚动距离
const { scrollRef, scrollTop } = useScroller();

const showEmpty = computed(
  () => timelineStore.loading !== null && !timelineStore.loading && !timelineStore.timelineList?.length,
);

onMounted(async () => {
  // 监听详情点赞状态，实时更改列表对应文章的点赞状态
  ipcRenderer.on('refresh', (_, params: WinRefreshParams) => {
    const { pageType, isLike = true } = params;
    // 需要判断是否是属于当前活动页面，并且只是点击点赞而不是收藏或评论防止重复触发
    if (route.name === 'timeline' && pageType !== 'list' && isLike) {
      reload && reload();
    }
  });

  await timelineStore.getTimelineList();
});

// 删除
const deleteTimeLineArticle = async (data: ArticleItem | TimelineArticles) => {
  if ((data as ArticleItem)?.isDelete) {
    return showMessage();
  }
  await timelineStore.deleteTimelineArticle(data.id!);
};

// 文章点赞
const likeListArticle = async (id: string, data: ArticleItem | TimelineArticles) => {
  await articleStore.likeListArticle({ id, isTimeLine: true, data } as ArticleItem);
};

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.timeline-wrap {
  border-radius: 5px;
  box-shadow: 0 0 8px 0 var(--shadow-mack);
  background-color: var(--pre-hover-bg);
  box-sizing: border-box;
  height: calc(100% - 8px);
  margin: 8px 5px 0;
  padding: 10px 5px 10px 0;

  :deep {
    .async-loading {
      margin-top: -9px;
    }
  }

  .timeline-card {
    position: relative;
    display: flex;
    justify-content: space-between;
    box-shadow: 0 0 8px 0 var(--shadow-mack);
    background-color: var(--pre-hover-bg);
    padding: 15px;
    box-sizing: border-box;
    margin-bottom: 15px;
    border-radius: 5px;
    cursor: pointer;

    &:last-child {
      margin-bottom: 0;
    }

    .icon-zhiding {
      position: absolute;
      top: -1px;
      left: -1px;
      font-size: 35px;
      z-index: 10;
      .textLg();
    }

    .left {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      flex: 1;
      color: var(--font-1);
      margin-right: 15px;

      .date,
      .title {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 10px;
      }

      .date {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .edit {
          margin-right: 10px;
          color: var(--card-action-font-color);
          font-size: 16px;
        }

        .del {
          font-size: 16px;
          color: @font-danger;
        }

        .edit,
        .del {
          font-weight: normal;
          &:hover {
            color: var(--active-color);
          }
        }
      }

      .title {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .author {
          font-size: 16px;
          .ellipsisMore(1);
          cursor: pointer;
          &:hover {
            color: @sub-2-blue;
          }
        }
      }

      .abstract {
        margin-right: 10px;
        .ellipsisMore(1);
        margin-bottom: 10px;
        font-size: 14px;
        color: var(--font-3);
      }

      .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;

        .action-item {
          flex: 1;
          display: flex;
          align-items: center;

          .action {
            display: flex;
            align-items: center;
            margin-right: 15px;

            .font {
              font-size: 15px;
              margin-right: 5px;
            }

            .like-icon {
              margin-bottom: 2px;
            }

            .icon-24gf-thumbsUp2 {
              color: var(--theme-blue);
            }

            .comment-icon {
              font-size: 16px;
            }

            .read-icon {
              font-size: 17px;
            }

            .text {
              margin-top: 2px;
            }

            .read {
              margin-top: 0;
            }
          }
        }

        .tag-list {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          font-size: 14px;

          .classify {
            margin-right: 20px;
          }

          .classify,
          .tag {
            .ellipsisMore(1);
            cursor: pointer;

            &:hover {
              color: @sub-2-blue;
            }
          }
        }

        .like,
        .comment,
        .read-count {
          cursor: pointer;
          &:hover {
            color: @sub-2-blue;
          }
        }
      }
    }

    .right {
      max-width: 200px;
      box-sizing: border-box;
      display: flex;
      // max-height: 130px;

      .img {
        display: block;
        height: 100%;
        width: 100%;
        // max-height: 85px;
        border-radius: 5px;
        .imgStyle();

        :deep {
          .image-item {
            border-radius: 5px;
          }
        }
      }
    }
  }

  .to-top {
    right: 40px;
    bottom: 40px;
  }

  .no-more {
    text-align: center;
    color: var(--font-4);
    margin: 18px 0 12px;
  }
}
</style>
