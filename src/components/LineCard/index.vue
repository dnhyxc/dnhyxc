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
        <span class="edit" @click="(e) => toEdit(e, data.id!)">编辑</span>
        <span class="del" @click="(e) => onReomve(e, data.id!)">下架</span>
      </div>
    </div>
    <div class="content">
      <div class="art-info">
        <div class="desc">
          {{ data.abstract }}
        </div>
        <div class="tags">
          <div class="author" @click="(e) => toPersonal(e, 'author')">{{ data.authorName }}</div>
          <div class="right">
            <el-tooltip class="box-item" effect="light" :content="`分类：${data.classify}`" placement="bottom">
              <div class="classify" @click="(e) => toClassify(e, data.classify!)">{{ data.classify }}</div>
            </el-tooltip>
            <el-tooltip class="box-item" effect="light" :content="`标签：${data.tag}`" placement="bottom">
              <div class="tag" @click="(e) => toTag(e, data.tag!)">{{ data.tag }}dsadsa</div>
            </el-tooltip>
          </div>
        </div>
        <div class="actions">
          <div class="action like" @click="(e) => onLike(e, data.id!)">
            <i :class="`font like-icon iconfont ${data.isLike ? 'icon-24gf-thumbsUp2' : 'icon-24gl-thumbsUp2'}`" />
            <span>{{ data.likeCount || '点赞' }}</span>
          </div>
          <div class="action comment" @click="(e) => onComment(e, data.id!)">
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
        <img
          class="img"
          src="https://pic1.zhimg.com/80/v2-c2b64233c64c7703f4b84f8d839d0078_1440w.webp?source=1940ef5c"
          alt=""
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { TimelineArticles } from '@/typings/common';

const router = useRouter();

interface IProps {
  data: TimelineArticles;
}

const props = withDefaults(defineProps<IProps>(), {});

console.log(props, 'props');

// 编辑
const toEdit = (e: Event, id: string) => {
  e.stopPropagation();
  console.log(id, '编辑');
  router.push(`/create?id=${id}`);
};

// 删除
const onReomve = (e: Event, id: string) => {
  e.stopPropagation();
  console.log(id, '编辑');
};

// 去作者主页
const toPersonal = (e: Event, id: string) => {
  e.stopPropagation();
  console.log(id, 'item');
};

// 去分类页
const toClassify = (e: Event, classify: string) => {
  e.stopPropagation();
  console.log(classify, 'toClassify');
};

// 去标签
const toTag = (e: Event, tag: string) => {
  e.stopPropagation();
  console.log(tag, 'toTag');
  router.push(`/tag/list?tag=${tag}`);
};

// 点赞
const onLike = (e: Event, id: string) => {
  e.stopPropagation();
  console.log(id, 'onLike');
};

// 评论
const onComment = (e: Event, id: string) => {
  e.stopPropagation();
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
    margin-bottom: 5px;
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
      }
    }
  }
}
</style>
