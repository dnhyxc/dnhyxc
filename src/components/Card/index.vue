<!--
 * Card
 * @author: dnhyxc
 * @since: 2024-04-19
 * index.vue
-->
<template>
  <ContextMenu class="block" :menu="CARD_CONTEXT_MENU" @select="onSelectMenu">
    <div class="card-wrap" @click.stop="toDetail(data)" @mouseenter.stop="onMouseEnter" @mouseleave.stop="onMouseLeave">
      <div ref="topRef" class="top">
        <div v-if="data?.isDelete" class="mask">
          <span class="mask-text">已下架</span>
        </div>
        <div v-for="i in ['markTop', 'markRight', 'markBottom', 'markLeft']" :key="i" :class="`${i} mark`">
          <div class="action">
            <span v-if="loginStore?.userInfo?.userId === data.authorId" @click.stop="toEdit(data)">编辑</span>
            <span
              v-if="loginStore?.userInfo?.userId === data.authorId" id="__DELETE__"
              @click.stop="onRemove(data)">删除</span>
          </div>
          <div>
            <div class="desc" :title="data.abstract" v-html="data.abstract" />
            <div class="tags">
              <span @click.stop="toClassify(data.classify!)" v-html="data.classify" />
              <span @click.stop="toTag(data.tag!)" v-html="data.tag" />
            </div>
          </div>
        </div>
        <i v-if="data.isTop" class="font iconfont icon-zhiding" />
        <Image :url="data.coverImage || IMG1" :transition-img="IMG1" class="card-img" radius="5px 5px 0 0" />
      </div>
      <div
        class="bottom"
        :style="{ backgroundImage: gradients }"
      >
        <div class="title" v-html="data.title" />
        <div class="author">
          <span @click.stop="toPersonal(data.authorId!)" v-html="data.authorName" />
          <span>{{ data.createTime ? formatDate(data.createTime, 'YYYY/MM/DD') : '-' }}</span>
        </div>
        <div class="actions">
          <div class="action-icons">
            <div class="action like" @click.stop="onLike(data)">
              <i :class="`font like-icon iconfont ${data.isLike ? 'icon-24gf-thumbsUp2' : 'icon-24gl-thumbsUp2'}`" />
              <span>{{ data.likeCount || '点赞' }}</span>
            </div>
            <div class="action comment" @click.stop="onComment(data)">
              <i class="font comment-icon iconfont icon-pinglun" />
              <span>{{ data.commentCount || '评论' }}</span>
            </div>
            <div class="action read-count">
              <i class="font read-icon iconfont icon-yanjing" />
              <span class="text">{{ data.readCount || '阅读' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ContextMenu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loginStore } from '@/store';
import { formatDate, message, ipcRenderers, getGradient } from '@/utils';
import Image from '@/components/Image/index.vue';
import { CARD_CONTEXT_MENU, IMG1 } from '@/constant';
import ContextMenu from '@/components/ContextMenu/index.vue';
import { ArticleItem } from '@/typings/common';

const router = useRouter();
const route = useRoute();

interface IProps {
  data: ArticleItem;
  radius?: string;
  deleteArticle?: Function | null;
  likeListArticle?: Function | null;
  withoutToDetail?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  radius: '5px',
  width: '',
  deleteArticle: null,
  likeListArticle: null,
});

const timer = ref<boolean>(false);
const topRef = ref<HTMLDivElement | null>(null);

const onMouseEnter = (e: MouseEvent) => {
  const target = e.target as HTMLDivElement;
  const rect = target.getBoundingClientRect();
  const theta = Math.atan2(rect.height, rect.width);
  const x = e.offsetX - rect.width / 2;
  const y = rect.height / 2 - e.offsetY;
  const angle = Math.atan2(y, x);
  const marks = topRef.value?.children;
  if (angle >= theta && angle < Math.PI - theta) {
    marks?.[0]?.classList.add('from-top');
  } else if (angle < theta && angle >= -theta) {
    marks?.[1]?.classList.add('from-right');
  } else if (angle >= Math.PI - theta || angle < -Math.PI + theta) {
    marks?.[3]?.classList.add('from-left');
  } else {
    marks?.[2]?.classList.add('from-bottom');
  }
};

const onMouseLeave = () => {
  const marks = topRef.value?.children;
  marks?.[0]?.classList?.remove('from-top');
  marks?.[1]?.classList?.remove('from-right');
  marks?.[3]?.classList?.remove('from-left');
  marks?.[2]?.classList?.remove('from-bottom');
};

// 拼接渐变色
const gradients = computed(() => {
  const gradient = props.data?.gradient;
  return getGradient(gradient);
});

// 点赞
const onLike = async (data: ArticleItem) => {
  if (timer.value) return;
  timer.value = true;
  if (data?.isDelete) {
    message({
      title: '文章已下架，无法操作',
      type: 'warning',
    });
    return;
  }
  await props.likeListArticle?.(data.id, data);
  timer.value = false;
};

// 评论
const onComment = (data: ArticleItem) => {
  if (data?.isDelete) {
    message({
      title: '文章已下架，无法操作',
      type: 'warning',
    });
    return;
  }
  router.push(`/detail/${ data.id }?scrollTo=1&from=${ route.name as string }`);
};

// 编辑
const toEdit = async (data: ArticleItem) => {
  if (data?.isDelete) {
    message({
      title: '文章已下架，无法操作',
      type: 'warning',
    });
    return;
  }
  router.push(`/create?id=${ data.id }`);
};

// 下架
const onRemove = async (data: ArticleItem) => {
  if (data?.isDelete) {
    message({
      title: '文章已下架，无法操作',
      type: 'warning',
    });
    return;
  }
  props.deleteArticle?.(data.id);
};

// 选中菜单
const onSelectMenu = (menu: { label: string; value: number }) => {
  if (props.withoutToDetail) return;
  if (props.data?.isDelete) {
    message({
      title: '文章已下架，无法操作',
      type: 'warning',
    });
    return;
  }
  if (menu.value === 1) {
    onOpenNewWindow(props.data);
  } else {
    toDetail(props.data);
  }
};

// 当前页打开
const toDetail = async (data: ArticleItem) => {
  if (data?.isDelete) {
    message({
      title: '文章已下架，无法操作',
      type: 'warning',
    });
    return;
  }
  router.push(`/detail/${ data.id }?from=${ route.name as string }`);
};

// 新窗口打开
const onOpenNewWindow = async (data: ArticleItem) => {
  if (data?.isDelete) {
    message({
      title: '文章已下架，无法操作',
      type: 'warning',
    });
    return;
  }
  const { userInfo, token } = loginStore;
  ipcRenderers.sendNewWin({
    path: `article/${ data.id }?from=${ route.name as string }`,
    id: data.id, // articleId
    userInfo: JSON.stringify({ userInfo, token }),
  });
};

// 去我的主页
const toPersonal = (id: string) => {
  router.push(`/personal?authorId=${ id }`);
};

const toClassify = (classify: string) => {
  router.push(`/classify?classify=${ classify }`);
};

const toTag = (tag: string) => {
  router.push(`/tag/list?tag=${ tag }`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.textStyle {
  mix-blend-mode: difference; /* 使用差值混合模式 */
  text-shadow: @text-shadow;
  .ellipsis();
  color: var(--el-color-primary);
  cursor: pointer;
  font-size: 14px;

  &:hover {
    color: var(--hover-text-color);
  }

  &:first-child {
    margin-right: 5px;
  }
}

.card-wrap {
  width: 100%;
  height: auto;
  box-sizing: border-box;
  border-radius: v-bind(radius);
  transition: all 0.3s ease;
  text-shadow: var(--text-shadow);
  .clickNoSelectText();

  .top {
    position: relative;
    overflow: hidden;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    .icon-zhiding {
      position: absolute;
      top: -2px;
      left: 0;
      font-size: 35px;
      text-shadow: none;
      .textLg();
    }

    .mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: @font-warning;
      z-index: 9;

      .mask-text {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        backdrop-filter: blur(2px);
        padding: 0 5px 2px 5px;
      }
    }

    .mark {
      position: absolute;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      padding: 5px;
      box-sizing: border-box;
      border-radius: 5px 5px 0 0;
      backdrop-filter: blur(3px);
      color: @fff;

      .action {
        display: flex;
        justify-content: flex-end;

        span {
          .textStyle;

          &:last-child {
            color: @font-danger;

            &:hover {
              color: @font-warning;
            }
          }
        }
      }

      .desc {
        .ellipsisMore(2);
        font-size: 13px;
        mix-blend-mode: difference; /* 使用差值混合模式 */
        text-shadow: @text-shadow; /* 水平偏移、垂直偏移、模糊半径和阴影颜色 */
        margin-bottom: 5px;
      }

      .tags {
        display: flex;
        justify-content: flex-start;

        span {
          .textStyle;
        }
      }
    }

    .markTop {
      top: -100%;
      left: 0;
      transition: all 0.3s ease;
    }

    .markRight {
      top: 0;
      right: -100%;
      transition: all 0.3s ease;
    }

    .markLeft {
      top: 0;
      left: -100%;
      transition: all 0.3s ease;
    }

    .markBottom {
      left: 0;
      bottom: -100%;
      transition: all 0.3s ease;
    }

    .from-top {
      top: 0;
      transition: all 0.3s ease;
    }

    .from-right {
      right: 0;
      transition: all 0.3s ease;
    }

    .from-left {
      left: 0;
      transition: all 0.3s ease;
    }

    .from-bottom {
      bottom: 0;
      transition: all 0.3s ease;
    }
  }

  .bottom {
    padding: 5px;
    box-sizing: border-box;
    color: var(--font-1);
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    background-color: var(--card-bt-bg);

    .title {
      font-size: 15px;
      font-weight: 700;
      .ellipsisMore(1);
    }

    .author {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 5px 0;

      span {
        flex: 1;
        font-size: 14px;
        .ellipsisMore(1);

        &:first-child {
          color: var(--primary);
          cursor: pointer;

          &:hover {
            color: var(--active);
          }
        }

        &:last-child {
          text-align: right;
          font-size: 13px;
        }
      }
    }

    .actions {
      display: flex;
      justify-content: flex-start;

      .eye {
        height: 16px;
        line-height: 21px;
        margin-left: 15px;
      }
    }

    .actions {
      display: flex;
      justify-content: flex-start;
      font-size: 13px;
      margin-top: 8px;
      color: var(--font-2);

      .action-icons {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

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
          font-size: 18px;
        }

        &:last-child {
          margin-right: 0;
        }
      }

      .like,
      .comment,
      .read-count {
        cursor: pointer;

        &:hover {
          color: var(--theme-blue);
        }
      }
    }
  }
}
</style>
