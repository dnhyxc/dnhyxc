<!--
 * 时间轴卡片
 * @author: dnhyxc
 * @since: 2023-02-16
 * index.vue
-->
<template>
  <div class="timeline-card" @click.stop="toDetail(data)">
    <ContextMenu
      class="block"
      :menu="[
        { label: '新窗口打开', value: 1 },
        { label: '当前页打开', value: 2 },
      ]"
      :no-menu="noMenu"
      @select="onSelectMenu"
    >
      <i v-if="data.isTop && !isTimeLine" class="font iconfont icon-zhiding" />
      <div class="title">
        <slot name="title">
          <div :class="`left ${data.isTop && !isTimeLine && 'is-top'}`" v-html="data.title" />
          <div v-if="data.authorId === loginStore.userInfo?.userId" class="right">
            <span class="edit" @click.stop="toEdit(data)">编辑</span>
            <span class="del" @click.stop="onReomve(data)">下架</span>
          </div>
        </slot>
      </div>
      <div class="content">
        <slot name="content">
          <div class="art-info">
            <div class="desc" v-html="data.abstract" />
            <div class="tags">
              <div class="author" @click.stop="toPersonal(data.authorId!)" v-html="data.authorName" />
              <div class="right">
                <el-tooltip class="box-item" effect="light" :content="`分类：${data.classify}`" placement="bottom" popper-class="custom-dropdown-styles">
                  <div class="classify" @click.stop="toClassify(data.classify!)" v-html="data.classify" />
                </el-tooltip>
                <el-tooltip class="box-item" effect="light" :content="`标签：${data.tag}`" placement="bottom" popper-class="custom-dropdown-styles">
                  <div class="tag" @click.stop="toTag(data.tag!)" v-html="data.tag" />
                </el-tooltip>
              </div>
            </div>
            <div class="actions">
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
                <span class="text read">{{ data.readCount || '阅读' }}</span>
              </div>
            </div>
          </div>
          <div class="img-wrap">
            <Image :url="data.coverImage || IMG1" :transition-img="IMG1" class="img" />
          </div>
        </slot>
      </div>
    </ContextMenu>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IMG1 } from '@/constant';
import { showMessage, ipcRenderers } from '@/utils';
import { loginStore } from '@/store';
import { TimelineArticles, ArticleItem } from '@/typings/common';
import Image from '@/components/Image/index.vue';

const reload = inject<Function>('reload');

const router = useRouter();
const route = useRoute();

interface IProps {
  data: TimelineArticles;
  likeListArticle?: (id: string, data?: ArticleItem) => void;
  deleteArticle?: (id: string) => void;
  toEdit?: (id: string, data: any) => void | null;
  toCollect?: () => void | null;
  isCollect?: boolean;
  isTimeLine?: boolean;
  noMenu?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  likeListArticle: () => {},
  deleteArticle: () => {},
  toEdit: undefined,
  toCollect: undefined,
  isCollect: false,
  isTimeLine: false,
  noMenu: false,
});

let timer: ReturnType<typeof setTimeout> | null = null;

const isLike = ref<boolean>(false);

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
});

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
  props?.deleteArticle?.(data?.id!);
};

// 去作者主页
const toPersonal = (id: string) => {
  router.push(`/personal?authorId=${id}`);
  if (route.path === '/personal') {
    if (timer) {
      clearTimeout(timer);
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

// 点赞
const onLike = async (data: ArticleItem | TimelineArticles) => {
  if (isLike.value) return;
  isLike.value = true;
  if ((data as ArticleItem)?.isDelete) {
    return showMessage();
  }
  await props?.likeListArticle?.(data?.id!, data as ArticleItem);
  isLike.value = false;
};

// 前往详情/编辑
const toDetail = async (data: ArticleItem | TimelineArticles) => {
  // props.isCollect 有值，说明是从我的收藏点击的，需要去收藏页详情
  if (props.isCollect) {
    props?.toCollect?.();
    return;
  }
  // 如果有props.toEdit，则说明是草稿箱点击的，需要去创建页进行编辑
  if (props.toEdit) {
    props.toEdit(data.id!, data);
    return;
  }
  if ((data as ArticleItem)?.isDelete) {
    return showMessage();
  }
  router.push(`/detail/${data?.id}`);
};

// 评论
const onComment = async (data: ArticleItem | TimelineArticles) => {
  if ((data as ArticleItem)?.isDelete) {
    return showMessage();
  }
  router.push(`/detail/${data?.id}?scrollTo=1`);
};

// 新窗口打开
const onOpenNewWindow = async (data: ArticleItem) => {
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

// 选中菜单
const onSelectMenu = (menu: { label: string; value: number }) => {
  if (menu.value === 1) {
    onOpenNewWindow(props.data as ArticleItem);
  } else {
    toDetail(props.data);
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.timeline-card {
  position: relative;
  box-sizing: border-box;
  color: var(--font-3);
  cursor: pointer;

  &:hover {
    .title {
      .right {
        display: block;
      }
    }
  }

  .icon-zhiding {
    position: absolute;
    top: -1px;
    left: -1px;
    font-size: 35px;
    z-index: 99;
    .textLg();
  }

  .title {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    margin-bottom: 10px;
    color: var(--font-1);

    .left {
      flex: 1;
      font-weight: 700;
      .ellipsisMore(1);
    }

    .is-top {
      margin-left: 20px;
    }

    .right {
      display: flex;
      align-items: center;
      font-size: 14px;
      margin-left: 10px;
      display: none;

      .edit {
        margin-right: 5px;
        color: var(--theme-blue);
      }

      .del {
        color: @font-danger;
      }

      .edit,
      .del {
        backdrop-filter: blur(10px);
        padding: 0px 5px 2px;
        border-radius: 5px;
        background-color: var(--hover-bg-color);

        &:hover {
          color: var(--active-color);
        }
      }
    }
  }

  .content {
    flex: 1;
    display: flex;
    justify-content: space-between;

    .art-info {
      flex: 1;
      margin-right: 10px;
      .desc {
        .ellipsisMore(1);
        margin-bottom: 10px;
        font-size: 14px;
      }

      .tags {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        font-size: 14px;

        .author {
          flex: 0.5;
          .ellipsisMore(1);
          margin-right: 15px;
          min-width: 100px;
          cursor: pointer;
          &:hover {
            color: var(--theme-blue);
          }
        }

        .right {
          flex: 0.5;
          display: flex;
          justify-content: flex-end;

          .classify,
          .tag {
            background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
            box-shadow: 0 0 3px var(--shadow-color);
            padding: 1px 5px 3px;
            border-radius: 5px;
            min-width: 28px;
            .ellipsisMore(1);
            cursor: pointer;

            &:hover {
              color: var(--theme-blue);
            }
          }

          .tag {
            margin-left: 10px;
          }
        }
      }

      .actions {
        display: flex;
        justify-content: flex-start;
        font-size: 14px;

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

    .img-wrap {
      box-sizing: border-box;
      display: flex;
      flex: 0.6;
      .img {
        display: block;
        width: 100%;
        height: auto;
        max-height: 85px;
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
}
</style>
