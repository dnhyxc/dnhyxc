<!--
 * 时间轴卡片
 * @author: dnhyxc
 * @since: 2023-02-16
 * index.vue
-->
<template>
  <div class="timeline-card">
    <div class="title">{{ data.title }}</div>
    <div class="content">
      <div class="art-info">
        <div class="desc">
          {{ data.abstract }}
        </div>
        <div class="tags">
          <div class="author" @click="(e) => toPersonal(e, 'author')">{{ data.authorName }}</div>
          <div class="right">
            <div class="classify" @click="(e) => toClassify(e, 'classify')">{{ data.classify }}</div>
            <div class="tag" @click="(e) => toTag(e, 'tag')">{{ data.tag }}</div>
          </div>
        </div>
        <div class="actions">
          <div class="action like" @click="(e) => onLike(e, '点赞')">
            <i :class="`font like-icon iconfont ${data.isLike ? 'icon-24gf-thumbsUp2' : 'icon-24gl-thumbsUp2'}`" />
            <span>{{ data.likeCount || '点赞' }}</span>
          </div>
          <div class="action comment" @click="(e) => onComment(e, '评论')">
            <i class="font comment-icon iconfont icon-pinglun" />
            <span>{{ data.replyCount || '评论' }}</span>
          </div>
          <div class="action read-count">
            <i class="font read-icon iconfont icon-yanjing" />
            <span class="text">{{ data.readCount || '阅读' }}</span>
          </div>
        </div>
      </div>
      <slot name="image">
        <div class="img-wrap">
          <img
            class="img"
            src="https://pic1.zhimg.com/80/v2-c2b64233c64c7703f4b84f8d839d0078_1440w.webp?source=1940ef5c"
            alt=""
          />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TimelineArticles } from '@/typings/common';

interface IProps {
  data: TimelineArticles;
}

const props = withDefaults(defineProps<IProps>(), {});

console.log(props, 'props');

// 去作者主页
const toPersonal = (e: Event, item: any) => {
  e.stopPropagation();
  console.log(item, 'item');
};

// 去分类页
const toClassify = (e: Event, item: any) => {
  e.stopPropagation();
  console.log(item, 'toClassify');
};

// 去标签
const toTag = (e: Event, item: any) => {
  e.stopPropagation();
  console.log(item, 'toTag');
};

// 点赞
const onLike = (e: Event, item: any) => {
  e.stopPropagation();
  console.log(item, 'onLike');
};

// 评论
const onComment = (e: Event, item: any) => {
  e.stopPropagation();
  console.log(item, 'onComment');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.timeline-card {
  box-sizing: border-box;
  color: @font-3;
  cursor: pointer;

  .title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
    color: @font-1;
  }

  .content {
    display: flex;
    justify-content: space-between;

    .art-info {
      flex: 0.6;
      margin-right: 10px;
      .desc {
        .ellipsisMore(1);
        margin-bottom: 5px;
        font-size: 14px;
      }

      .tags {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
        font-size: 14px;

        .author {
          flex: 1;
          .ellipsisMore(1);
          cursor: pointer;
          &:hover {
            color: @sub-2-blue;
          }
        }

        .right {
          display: flex;
          justify-content: space-between;
          margin-left: 20px;

          .classify,
          .tag {
            cursor: pointer;

            &:hover {
              color: @sub-2-blue;
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

          .comment-icon {
            font-size: 16px;
          }

          .read-icon {
            font-size: 18px;
          }

          .text {
            margin-top: 2px;
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

    .img-wrap {
      flex: 0.4;
      box-sizing: border-box;
      display: flex;
      width: 20%;

      .img {
        display: block;
        width: 100%;
        height: auto;
        max-height: 85px;
        object-fit: cover;
        border-radius: 5px;
      }
    }
  }
}
</style>
