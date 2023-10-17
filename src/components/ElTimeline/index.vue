<!--
 * element 时间轴
 * @author: dnhyxc
 * @since: 2023-10-17
 * index.vue
-->
<template>
  <div class="el-timeline-wrap">
    <el-timeline>
      <el-timeline-item v-for="item in timelineList" :key="item.date" :timestamp="`${item.date} 年`" placement="top">
        <div
          v-for="card in item.articles"
          :key="card.id"
          class="timeline-card"
          @click.stop="toDetail(card)"
          @mousedown.stop="(e: MouseEvent) => onMouseDown(e, card)"
        >
          <i v-if="!card.isTop" class="font iconfont icon-zhiding" />
          <div class="left">
            <div class="date">
              {{ card.createTime && formatDate(card.createTime) }}
              <div v-if="card.authorId === loginStore.userInfo?.userId" class="right">
                <span class="edit" @click.stop="toEdit(card)">编辑</span>
                <span class="del" @click.stop="onReomve(card)">下架</span>
              </div>
            </div>
            <div class="title">
              {{ card.title }}
              <div class="author" @click.stop="toPersonal(card.authorId!)">{{ card.authorName || '-' }}</div>
            </div>
            <div class="abstract">{{ card.abstract }}</div>
            <div class="actions">
              <div class="action-item">
                <div class="action like" @click.stop="likeListArticle(card)">
                  <i
                    :class="`font like-icon iconfont ${card.isLike ? 'icon-24gf-thumbsUp2' : 'icon-24gl-thumbsUp2'}`"
                  />
                  <span>{{ card.likeCount || '点赞' }}</span>
                </div>
                <div class="action comment" @click.stop="onComment(card)">
                  <i class="font comment-icon iconfont icon-pinglun" />
                  <span>{{ card.commentCount || '评论' }}</span>
                </div>
                <div class="action read-count">
                  <i class="font read-icon iconfont icon-yanjing" />
                  <span class="text read">{{ card.readCount || '阅读' }}</span>
                </div>
              </div>
              <div class="tag-list">
                <span class="classify" @click.stop="toClassify(card.classify!)">分类：{{ card.classify }}</span>
                <span class="tag" @click.stop="toTag(card.tag!)">标签：{{ card.tag }}</span>
              </div>
            </div>
          </div>
          <div class="right">
            <Image :url="card.coverImage || IMG1" :transition-img="IMG1" class="img" />
          </div>
          <ContentMenu
            v-show="commonStore.showContextmenu && commonStore.currentArticleId === card.id"
            :data="card"
            :on-open-new-window="onOpenNewWindow"
            :to-detail="toDetail"
          />
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatDate, showMessage, ipcRenderers } from '@/utils';
import { timelineStore, articleStore, loginStore, commonStore } from '@/store';
import { IMG1 } from '@/constant';
import { ArticleItem, TimelineArticles, TimelineResult } from '@/typings/common';

const reload = inject<Function>('reload');

const route = useRoute();
const router = useRouter();

interface IProps {
  timelineList: TimelineResult[];
}

defineProps<IProps>();

const isLike = ref<boolean>(false);

// 编辑
const toEdit = async (data: ArticleItem | TimelineArticles) => {
  if ((data as ArticleItem)?.isDelete) {
    return showMessage();
  }
  router.push(`/create?id=${data.id}`);
};

// 删除
const onReomve = async (data: ArticleItem | TimelineArticles) => {
  if ((data as ArticleItem)?.isDelete) {
    return showMessage();
  }
  timelineStore.deleteTimelineArticle(data.id!);
};

// 文章点赞
const likeListArticle = async (data: ArticleItem | TimelineArticles) => {
  if (isLike.value) return;
  isLike.value = true;
  await articleStore.likeListArticle({ id: data.id, isTimeLine: true, data } as ArticleItem);
  isLike.value = false;
};

// 去作者主页
const toPersonal = (id: string) => {
  router.push(`/personal?authorId=${id}`);
  let timer: ReturnType<typeof setTimeout> | null = null;
  if (route.path === '/personal') {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      reload?.();
      timer = null;
    }, 100);
  }
};

// 去分类页
const toClassify = (classify: string) => {
  router.push(`/classify?classify=${classify}`);
};

// 去标签
const toTag = (tag: string) => {
  if (route.path !== '/tag/list') {
    router.push(`/tag/list?tag=${tag}`);
  }
};

// 前往详情/编辑
const toDetail = (data: ArticleItem | TimelineArticles) => {
  if ((data as ArticleItem)?.isDelete) {
    return showMessage();
  }
  router.push(`/detail/${data?.id}`);
};

// 评论
const onComment = (data: ArticleItem | TimelineArticles) => {
  if ((data as ArticleItem)?.isDelete) {
    return showMessage();
  }
  router.push(`/detail/${data?.id}?scrollTo=1`);
};

// 监听鼠标右键，分别进行不同的操作
const onMouseDown = (e: MouseEvent, data: ArticleItem | TimelineArticles) => {
  // 使用新窗口打开
  if (e.button === 2) {
    commonStore.showContextmenu = true;
    commonStore.currentArticleId = data.id!;
  }
};

// 新窗口打开
const onOpenNewWindow = (data: ArticleItem) => {
  if ((data as ArticleItem)?.isDelete) {
    return showMessage();
  }
  const { userInfo, token } = loginStore;
  ipcRenderers.sendNewWin({
    path: `article/${data.id}?from=${route.name as string}`,
    id: data.id,
    userInfo: JSON.stringify({ userInfo, token }),
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.el-timeline-wrap {
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
      z-index: 99;
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

  :deep {
    .el-timeline {
      margin: 0 10px;
    }

    .el-timeline-item__wrapper {
      padding-left: 20px;
    }

    .el-timeline-item__timestamp {
      font-size: 20px;
      padding-top: 2px;
    }

    .el-timeline-item__tail {
      border: 1px solid;
      border-image: linear-gradient(to bottom, @colors) 1;
    }

    .el-timeline-item__node {
      background-image: linear-gradient(45deg, @colors);
    }

    .el-timeline-item__node--normal {
      left: -3px;
      width: 16px;
      height: 16px;
    }
  }
}
</style>
