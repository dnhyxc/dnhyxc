<!--
 * 时间轴卡片
 * @author: dnhyxc
 * @since: 2023-02-16
 * index.vue
-->
<template>
  <div class="timeline-card">
    <div class="title">
      <div class="left">{{ data.title }}</div>
      <div class="right">
        <span class="edit" @click.stop="toEdit(data.id!)">编辑</span>
        <span class="del" @click.stop="onReomve(data.id!)">下架</span>
      </div>
    </div>
    <div class="content">
      <div class="art-info">
        <div class="desc">
          {{ data.abstract }}
        </div>
        <div class="tags">
          <div class="author" @click.stop="toPersonal(data.authorId!)">{{ data.authorName }}</div>
          <div class="right">
            <el-tooltip class="box-item" effect="light" :content="`分类：${data.classify}`" placement="bottom">
              <div class="classify" @click.stop="toClassify(data.classify!)">{{ data.classify }}</div>
            </el-tooltip>
            <el-tooltip class="box-item" effect="light" :content="`标签：${data.tag}`" placement="bottom">
              <div class="tag" @click.stop="toTag(data.tag!)">{{ data.tag }}</div>
            </el-tooltip>
          </div>
        </div>
        <div class="actions">
          <div class="action like" @click.stop="onLike(data.id!)">
            <i :class="`font like-icon iconfont ${data.isLike ? 'icon-24gf-thumbsUp2' : 'icon-24gl-thumbsUp2'}`" />
            <span>{{ data.likeCount || '点赞' }}</span>
          </div>
          <div class="action comment" @click.stop="onComment(data.id!)">
            <i class="font comment-icon iconfont icon-pinglun" />
            <span>{{ data.replyCount || '评论' }}</span>
          </div>
          <div class="action read-count">
            <i class="font read-icon iconfont icon-yanjing" />
            <span class="text">{{ data.readCount || '阅读' }}</span>
          </div>
        </div>
      </div>
      <div class="img-wrap">
        <Image :url="data.coverImage || IMG1" :transition-img="IMG1" class="img" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { IMG1 } from '@/constant';
import { TimelineArticles } from '@/typings/common';
import Image from '@/components/Image/index.vue';

const router = useRouter();
const route = useRoute();

interface IProps {
  data: TimelineArticles;
  likeListArticle?: (id: string) => void;
  deleteArticle?: (id: string) => void;
}

const props = withDefaults(defineProps<IProps>(), {
  likeListArticle: () => {},
  deleteArticle: () => {},
});

// 编辑
const toEdit = (id: string) => {
  console.log(id, '编辑');
  router.push(`/create?id=${id}`);
};

// 删除
const onReomve = (id: string) => {
  console.log(id, '删除');
  props?.deleteArticle?.(id);
};

// 去作者主页
const toPersonal = (id: string) => {
  router.push(`/personal?authorId=${id}`);
};

// 去分类页
const toClassify = (classify: string) => {
  console.log(classify, 'toClassify');
  router.push(`/classify?classify=${classify}`);
};

// 去标签
const toTag = (tag: string) => {
  if (route.path !== '/tag/list') {
    console.log(tag, 'toTag', route.path);
    router.push(`/tag/list?tag=${tag}`);
  }
};

// 点赞
const onLike = (id: string) => {
  console.log(id, 'onLike');
  props?.likeListArticle?.(id);
};

// 评论
const onComment = (id: string) => {
  console.log(id, 'onComment');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.timeline-card {
  box-sizing: border-box;
  color: @font-3;
  cursor: pointer;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    margin-bottom: 10px;
    color: @font-1;

    .left {
      font-weight: 700;
      .ellipsisMore(1);
    }

    .right {
      display: flex;
      align-items: center;
      font-size: 14px;

      .edit {
        margin-right: 10px;
        color: @theme-blue;
      }

      .del {
        color: @font-danger;
      }

      .edit,
      .del {
        &:hover {
          color: @active;
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
          flex: 0.5;
          .ellipsisMore(1);
          margin-right: 15px;
          min-width: 100px;
          cursor: pointer;
          &:hover {
            color: @sub-2-blue;
          }
        }

        .right {
          flex: 0.5;
          display: flex;
          justify-content: flex-end;

          .classify,
          .tag {
            background-image: @bg-lg-2;
            box-shadow: 0 0 3px @shadow-color;
            padding: 1px 5px 3px;
            border-radius: 5px;
            min-width: 28px;
            .ellipsisMore(1);
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
      box-sizing: border-box;
      display: flex;
      width: 20%;
      min-width: 135px;
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
