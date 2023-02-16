<!--
 * 时间轴卡片
 * @author: dnhyxc
 * @since: 2023-02-16
 * index.vue
-->
<template>
  <div class="timeline-card">
    <div class="title">Electron</div>
    <div class="content">
      <div class="art-info">
        <div class="desc">
          撒旦好看就撒回到家喀什肯德基哈是可见的哈萨克就的话咯技术的喀什的就卡刷道具卡是的接口和阿大撒
          看来撒就大撒加快了的静安寺看多久啊是考虑到就啊看拉萨就打开拉萨就的克拉斯的简历咖世家
        </div>
        <div class="tags">
          <div class="author" @click="(e) => toPersonal(e, 'author')">作者</div>
          <div class="right">
            <div class="classify" @click="(e) => toClassify(e, 'classify')">分类</div>
            <div class="tag" @click="(e) => toTag(e, 'tag')">标签</div>
          </div>
        </div>
        <div class="actions">
          <div class="action like" @click="(e) => onLike(e, '点赞')">点赞</div>
          <div class="action comment" @click="(e) => onComment(e, '评论')">评论</div>
          <div class="action read-count">阅读数</div>
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
            color: @theme-blue;
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
              color: @theme-blue;
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
          margin-right: 15px;
        }

        .like,
        .comment {
          cursor: pointer;
          &:hover {
            color: @theme-blue;
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
        object-fit: cover;
        border-radius: 5px;
      }
    }
  }
}
</style>
