<!--
 * Card组件
 * @author: dnhyxc
 * @since: 2023-02-04
 * index.vue
-->
<template>
  <ContextMenu class="block" :menu="CARD_CONTEXT_MENU" @select="onSelectMenu">
    <div class="card-wrap" @click.stop="toDetail(data)">
      <div class="card">
        <div class="card-top">
          <i v-if="data.isTop" class="font iconfont icon-zhiding" />
          <div v-if="data?.isDelete" class="mask">
            <span class="mask-text">已下架</span>
          </div>
          <div class="art-action">
            <slot name="actions">
              <div v-if="loginStore?.userInfo?.userId === data.authorId">
                <span class="edit" @click.stop="toEdit(data)">编辑</span>
                <span class="del" @click.stop="onReomve(data)">下架</span>
              </div>
            </slot>
          </div>
          <Image :url="data.coverImage || IMG1" :transition-img="IMG1" class="img" />
          <div class="info">
            <div class="desc" v-html="data.abstract" />
          </div>
        </div>
        <div
          class="card-bottom"
          :style="{
            backgroundImage: gradients,
          }"
        >
          <slot>
            <div class="header">
              <div class="title" v-html="data.title" />
            </div>
            <div class="art-info">
              <div class="create-info">
                <span class="author" @click.stop="toPersonal(data.authorId!)" v-html="data.authorName" />
                <span class="date">{{ data.createTime ? formatDate(data.createTime, 'YYYY/MM/DD') : '-' }}</span>
              </div>
              <div class="classifys">
                <span class="classify" @click.stop="toClassify(data.classify!)">
                  <span v-html="data.classify" />
                </span>
                <span class="tag" @click.stop="toTag(data.tag!)">
                  <span v-html="data.tag" />
                </span>
              </div>
              <div class="actions">
                <div class="action-icons">
                  <div class="action like" @click.stop="onLike(data)">
                    <i
                      :class="`font like-icon iconfont ${data.isLike ? 'icon-24gf-thumbsUp2' : 'icon-24gl-thumbsUp2'}`"
                    />
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
          </slot>
        </div>
      </div>
    </div>
  </ContextMenu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { formatDate, message, ipcRenderers, getGradient } from '@/utils';
import { ArticleItem } from '@/typings/common';
import { IMG1, CARD_CONTEXT_MENU } from '@/constant';
import { loginStore } from '@/store';
import Image from '@/components/Image/index.vue';
import ContextMenu from '@/components/ContextMenu/index.vue';

const router = useRouter();
const route = useRoute();

interface IProps {
  data: ArticleItem;
  deleteArticle?: Function;
  likeListArticle?: Function;
  withoutToDetail?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  deleteArticle: () => {
  },
  likeListArticle: () => {
  },
  withoutToDetail: false,
});

const timer = ref<boolean>(false);

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
      type: 'warning'
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
      type: 'warning'
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
      type: 'warning'
    });
    return;
  }
  router.push(`/create?id=${ data.id }`);
};

// 下架
const onReomve = async (data: ArticleItem) => {
  if (data?.isDelete) {
    message({
      title: '文章已下架，无法操作',
      type: 'warning'
    });
    return;
  }
  props.deleteArticle(data.id);
};

// 选中菜单
const onSelectMenu = (menu: { label: string; value: number }) => {
  if (props.withoutToDetail) return;
  if (props.data?.isDelete) {
    message({
      title: '文章已下架，无法操作',
      type: 'warning'
    });
    return;
  }
  if (menu.value === 1) {
    onOpenNewWindow(props.data);
  } else {
    toDetail(props.data);
  }
};

// 新窗口打开
const onOpenNewWindow = async (data: ArticleItem) => {
  if (data?.isDelete) {
    message({
      title: '文章已下架，无法操作',
      type: 'warning'
    });
    return;
  }
  const {userInfo, token} = loginStore;
  ipcRenderers.sendNewWin({
    path: `article/${ data.id }?from=${ route.name as string }`,
    id: data.id, // articleId
    userInfo: JSON.stringify({userInfo, token}),
  });
};

// 当前页打开
const toDetail = async (data: ArticleItem) => {
  if (data?.isDelete) {
    message({
      title: '文章已下架，无法操作',
      type: 'warning'
    });
    return;
  }
  router.push(`/detail/${ data.id }?from=${ route.name as string }`);
};

// 去我的主页
const toPersonal = (id: string) => {
  router.push(`/personal?authorId=${ id }`);
};

// 去分类
const toClassify = (name: string) => {
  router.push(`/classify?classify=${ name }`);
};

// 去标签列表
const toTag = (name: string) => {
  router.push(`/tag/list?tag=${ name }`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.card-wrap {
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  border-radius: 5px;
  box-shadow: 0 0 3px 0 var(--card-shadow) inset;

  .card {
    position: relative;
    width: 100%;
    border-radius: 5px;
    cursor: pointer;
    overflow: hidden;

    &:hover {
      .img {
        transform: scale(1.5);
        transition: scale 0.6s ease-in-out;
      }

      .card-top {
        .art-action {
          display: block;
        }

        .info {
          opacity: 1;
          transition: all 0.5s;
          background-color: @shade-3;
        }
      }
    }

    .card-top {
      position: relative;
      width: 100%;
      overflow: hidden;

      .art-action {
        position: absolute;
        top: 5px;
        right: 7px;
        z-index: 29;
        display: none;

        .edit {
          display: inline-block;
          margin-right: 10px;
          color: var(--theme-blue);
          font-size: 14px;
          backdrop-filter: blur(5px);
          padding: 0 5px 2px;
          border-radius: 5px;
          background-color: var(--card-btn-mark);
        }

        .del {
          display: inline-block;
          color: @font-danger;
          font-size: 14px;
          backdrop-filter: blur(5px);
          padding: 0 5px 2px;
          border-radius: 5px;
          background-color: var(--card-btn-mark);
        }

        .edit,
        .del {
          &:hover {
            color: var(--active-color);
          }
        }
      }

      .img {
        display: block;
        position: relative;
        width: 100%;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        .imgStyle();
      }

      .mask {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: @font-warning;
        z-index: 9;

        .mask-text {
          display: table-cell;
          vertical-align: middle;
          font-size: 16px;
          backdrop-filter: blur(10px);
          padding: 0 5px 2px 5px;
        }
      }

      .info {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        max-height: 42%;
        overflow: hidden;
        transition: all 0.5s;
        opacity: 0;

        .desc {
          display: table-cell;
          vertical-align: middle;
          .ellipsisMore(3);
          font-size: 13px;
          padding: 5px;
          line-height: 18px;
          color: @fff;
        }
      }

      .icon-zhiding {
        position: absolute;
        top: -2px;
        left: 0;
        font-size: 35px;
        z-index: 10;
        .textLg();
      }
    }

    .card-bottom {
      position: relative;
      background-blend-mode: multiply, multiply;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      padding: 5px;

      .header {
        display: flex;
        align-items: center;

        .title {
          width: 100%;
          font-size: 16px;
          .ellipsisMore(1);
          color: var(--font-2);
        }
      }

      .art-info {
        display: flex;
        flex-direction: column;

        .create-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 12px 0 9px;

          .author,
          .date {
            max-width: 50%;
            font-size: 14px;
            color: var(--font-2);
            .ellipsisMore(1);
          }

          .author {
            margin-right: 5px;
            font-size: 15px;

            &:hover {
              color: var(--theme-blue);
            }
          }
        }

        .classifys {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-top: 5px;
          margin-bottom: 6px;

          .classify,
          .tag {
            max-width: 100%;
            font-size: 14px;
            border-radius: 5px;
            color: var(--font-2);
            .ellipsisMore(1);

            &:hover {
              color: var(--theme-blue);
            }

            .label {
              color: var(--font-5);
            }
          }

          .classify {
            margin-right: 6px;
          }
        }

        .actions {
          display: flex;
          justify-content: space-between;
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
  }
}
</style>
