<!--
 * Card组件
 * @author: dnhyxc
 * @since: 2023-02-04
 * index.vue
-->
<template>
  <div class="card-wrap" @click.stop="toDetail(data)" @mousedown.stop="(e) => onMouseDown(e, data)">
    <div class="card">
      <div class="card-top">
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
          <div class="desc">
            {{ data.abstract }}
          </div>
        </div>
        <ContentMenu
          v-show="commonStore.showContextmenu && commonStore.currentArticleId === data.id"
          :data="data"
          :on-open-new-window="onOpenNewWindow"
          :to-detail="toDetail"
        />
      </div>
      <div class="card-bottom">
        <slot>
          <div class="header">
            <div class="title">
              {{ data.title }}
            </div>
          </div>
          <div class="art-info">
            <div class="create-info">
              <span class="author" @click.stop="toPersonal(data.authorId!)">{{ data.authorName }}</span>
              <span class="date">{{ data.createTime ? formatDate(data.createTime, 'YYYY/MM/DD') : '-' }}</span>
            </div>
            <div class="classifys">
              <span class="classify" @click.stop="toClassify(data.classify!)">
                <span class="label">分类: </span>
                {{ data.classify }}
              </span>
            </div>
            <div class="tags">
              <span class="tag" @click.stop="toTag(data.tag!)">
                <span class="label">标签: </span>
                {{ data.tag }}
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
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { useRouter, useRoute } from 'vue-router';
import { formatDate, chackIsDelete } from '@/utils';
import { ArticleItem } from '@/typings/common';
import { IMG1 } from '@/constant';
import { commonStore, loginStore } from '@/store';
import Image from '@/components/Image/index.vue';
import ContentMenu from '@/components/ContentMenu/index.vue';

const router = useRouter();
const route = useRoute();

interface IProps {
  data: ArticleItem;
  deleteArticle?: Function;
  likeListArticle?: Function;
}

const props = withDefaults(defineProps<IProps>(), {
  deleteArticle: () => {},
  likeListArticle: () => {},
});

// 点赞
const onLike = async (data: ArticleItem) => {
  await chackIsDelete(data);
  props.likeListArticle?.(data.id, data);
};

// 评论
const onComment = async (data: ArticleItem) => {
  await chackIsDelete(data);
  router.push(`/detail/${data.id}?scrollTo=1&from=${route.name as string}`);
};

// 编辑
const toEdit = async (data: ArticleItem) => {
  await chackIsDelete(data);
  router.push(`/create?id=${data.id}`);
};

// 下架
const onReomve = async (data: ArticleItem) => {
  await chackIsDelete(data);
  props.deleteArticle(data.id);
};

// 监听鼠标右键，分别进行不同的操作
const onMouseDown = async (e: MouseEvent, data: ArticleItem) => {
  await chackIsDelete(data);
  // 使用新窗口打开
  if (e.button === 2) {
    commonStore.showContextmenu = true;
    commonStore.currentArticleId = data.id;
  }
};

// 新窗口打开
const onOpenNewWindow = (data: ArticleItem) => {
  const { userInfo, token } = loginStore;
  ipcRenderer.send(
    'new-win',
    `article/${data.id}?from=${route.name as string}`,
    data.id, // articleId
    JSON.stringify({ userInfo, token }), // 用户信息
  );
  // 清除右键菜单选项
  commonStore.clearContentmenuInfo();
};

// 当前页打开
const toDetail = (data: ArticleItem) => {
  router.push(`/detail/${data.id}?from=${route.name as string}`);
  // 清除右键菜单选项
  commonStore.clearContentmenuInfo();
};

// 去我的主页
const toPersonal = (id: string) => {
  router.push(`/personal?authorId=${id}`);
};

// 去分类
const toClassify = (name: string) => {
  router.push(`/classify?classify=${name}`);
};

// 去标签列表
const toTag = (name: string) => {
  router.push(`/tag/list?tag=${name}`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.card-wrap {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  border-radius: 5px;
  box-shadow: 0 0 8px 0 var(--shadow-mack);

  .card {
    position: relative;
    width: 100%;
    cursor: pointer;
    overflow: hidden;

    &:hover {
      .img {
        transform: scale(1.3);
        transition: all 0.3s;
      }

      .card-top {
        .art-action {
          display: block;
        }
      }
    }

    .card-top {
      position: relative;
      width: 100%;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      overflow: hidden;

      .art-action {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 29;
        display: none;

        .edit {
          display: inline-block;
          margin-right: 10px;
          color: @fff;
          font-size: 14px;
          backdrop-filter: blur(10px);
          padding: 0px 5px 2px;
          border-radius: 5px;
          background-color: @card-action-color;
        }

        .del {
          display: inline-block;
          color: @font-danger;
          font-size: 14px;
          backdrop-filter: blur(10px);
          padding: 0px 5px 2px;
          border-radius: 5px;
          background-color: @card-action-color;
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
        top: 10px;
        left: 5px;
        color: @font-warning;
        z-index: 9;

        .mask-text {
          display: table-cell;
          vertical-align: middle;
          font-size: 14px;
          backdrop-filter: blur(3px);
          padding: 0 5px 2px 5px;
        }
      }

      .info {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        position: absolute;
        bottom: 5px;
        left: 0;
        width: 100%;
        max-height: 42%;
        padding: 5px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        overflow: hidden;

        .desc {
          display: table-cell;
          vertical-align: middle;
          .ellipsisMore(3);
          font-size: 13px;
          backdrop-filter: blur(2px);
          padding: 0 5px 2px 5px;
          color: @fff;
        }
      }
    }

    .card-bottom {
      padding: 8px 10px;
      // box-shadow: 0 0 1px var(--shadow-color) inset;
      background-blend-mode: multiply, multiply;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      background-image: linear-gradient(to bottom, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);

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
          margin: 8px 0;

          .author,
          .date {
            max-width: 50%;
            font-size: 13px;
            color: var(--font-2);
            .ellipsisMore(1);
          }

          .author {
            margin-right: 5px;
            font-size: 14px;

            &:hover {
              color: var(--theme-blue);
            }
          }
        }

        .classifys {
          margin-bottom: 10px;
        }

        .tags,
        .classifys {
          display: flex;
          align-items: center;
          width: 100%;

          .classify,
          .tag {
            max-width: 100%;
            font-size: 13px;
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
              color: @sub-2-blue;
            }
          }
        }
      }
    }
  }
}
</style>
