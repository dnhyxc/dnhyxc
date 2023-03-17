<!--
 * Card组件
 * @author: dnhyxc
 * @since: 2023-02-04
 * index.vue
-->
<template>
  <div class="card-wrap" @click="toDetail(data.id)">
    <div class="card">
      <div class="card-top">
        <div v-if="data?.isDelete" class="mask">
          <span class="mask-text">已下架</span>
        </div>
        <Image :url="data.coverImage || IMG1" :transition-img="IMG1" class="img" />
        <div class="info">
          <div class="desc">
            {{ data.abstract }}
          </div>
        </div>
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
              <span class="date">{{ data.createTime ? formatDate(data.createTime) : '-' }}</span>
            </div>
            <div class="tags">
              <span class="classify" @click.stop="toClassify(data.classify!)">分类: {{ data.classify }}</span>
              <span class="tag" @click.stop="toTag(data.tag!)">标签: {{ data.tag }}</span>
            </div>
            <div class="actions">
              <div class="action-icons">
                <div class="action like" @click.stop="onLike(data.id)">
                  <i
                    :class="`font like-icon iconfont ${data.isLike ? 'icon-24gf-thumbsUp2' : 'icon-24gl-thumbsUp2'}`"
                  />
                  <span>{{ data.likeCount || '点赞' }}</span>
                </div>
                <div class="action comment" @click.stop="onComment(data.id)">
                  <i class="font comment-icon iconfont icon-pinglun" />
                  <span>{{ data.commentCount || '评论' }}</span>
                </div>
                <div class="action read-count">
                  <i class="font read-icon iconfont icon-yanjing" />
                  <span class="text">{{ data.readCount || '阅读' }}</span>
                </div>
              </div>
              <div v-if="loginStore?.userInfo?.userId === data.authorId" class="action art-action">
                <span class="edit" @click.stop="toEdit(data.id)">编辑</span>
                <span class="del" @click.stop="onReomve(data.id)">下架</span>
              </div>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { formatDate } from '@/utils';
import { ArticleItem } from '@/typings/common';
import IMG1 from '@/assets/images/1.jpg';
import { loginStore, articleStore } from '@/store';
import Image from '@/components/Image/index.vue';

const router = useRouter();

interface IProps {
  data: ArticleItem;
  deleteArticle?: Function;
}

const props = withDefaults(defineProps<IProps>(), {
  deleteArticle: () => {},
});

// 点赞
const onLike = (id: string) => {
  articleStore.likeListArticle({ id });
};

// 评论
const onComment = (id: string) => {
  router.push(`/detail/${id}?scrollTo=1`);
};

// 编辑
const toEdit = (id: string) => {
  router.push(`/create?id=${id}`);
};

// 下架
const onReomve = async (id: string) => {
  props.deleteArticle(id);
};

// 去详情
const toDetail = (id: string) => {
  router.push(`/detail/${id}`);
};

// 去我的主页
const toPersonal = (id: string) => {
  router.push(`/personal?id=${id}`);
};

// 去分类
const toClassify = (name: string) => {
  router.push(`/classify?name=${name}`);
};

// 去标签列表
const toTag = (name: string) => {
  router.push(`/tag/list?tag=${name}`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.card-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  border-radius: 5px;

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
    }

    .card-top {
      position: relative;
      width: 100%;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      overflow: hidden;

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
        right: 5px;
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
        color: @fff;
        overflow: hidden;

        .desc {
          display: table-cell;
          vertical-align: middle;
          .ellipsisMore(3);
          font-size: 14px;
          backdrop-filter: blur(2px);
          padding: 0 5px 2px 5px;
        }
      }
    }

    .card-bottom {
      padding: 8px 10px;
      box-shadow: 0 0 2px @shadow-color inset;
      background-blend-mode: multiply, multiply;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      background-image: @card-lg-2;

      .header {
        display: flex;
        align-items: center;

        .title {
          font-size: 16px;
          .ellipsisMore(1);
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
            color: @font-2;
            .ellipsisMore(1);
          }

          .author {
            margin-right: 5px;

            &:hover {
              color: @theme-blue;
            }
          }
        }

        .tags {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .classify,
          .tag {
            max-width: 50%;
            font-size: 13px;
            border-radius: 5px;
            color: @font-2;
            .ellipsisMore(1);

            &:hover {
              color: @theme-blue;
            }
          }

          .classify {
            margin-right: 5px;
          }
        }

        .actions {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-top: 8px;
          color: @font-2;

          .action-icons {
            display: flex;
            align-items: center;
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
              color: @theme-blue;
            }

            .comment-icon {
              font-size: 16px;
            }

            .read-icon {
              font-size: 18px;
            }

            .edit {
              margin-right: 10px;
              color: @theme-blue;
              font-size: 14px;
            }

            .del {
              color: @font-danger;
              font-size: 14px;
            }

            .edit,
            .del {
              &:hover {
                color: @active;
              }
            }

            &:last-child {
              margin-right: 0;
            }
          }

          .like,
          .comment {
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
