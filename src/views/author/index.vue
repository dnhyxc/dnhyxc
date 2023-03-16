<!--
 * 关于博主
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="author-wrap">
    <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
      <div class="cover">
        <div class="img-wrap">
          <img
            src="https://pic2.zhimg.com/80/v2-ff0d35d4dcad8e7e1623ef1c294651c1_1440w.webp"
            alt=""
            class="cover-img"
          />
        </div>
        <div class="author-info">
          <div class="head-img-wrap">
            <img :src="HEAD_IMG" alt="" class="head-img" />
          </div>
          <div class="infos">
            <div class="username">dnhyxc</div>
            <div class="job">前端工程师</div>
            <div v-if="viewMore" class="user-detail">
              <div class="motto">
                座右铭：
                <span class="desc-text">行到水穷处，坐看云起时！</span>
              </div>
              <div class="desc">
                个人介绍：
                <span class="desc-text">
                  我希望有个如你一般的人，如山间清爽的风，如古城温暖的光，从清晨到夜晚，由山野到书房，等待，不怕岁月蹉跎，不怕路途遥远，只要最后是你就好！
                  明天会更好
                </span>
              </div>
              <div class="github">
                github：
                <span class="link">https://github.com/dnhyxc</span>
              </div>
              <div class="juejin">
                知乎：
                <span class="link">https://github.com/dnhyxc</span>
              </div>
              <div class="zhihu">
                知乎：
                <span class="link">https://github.com/dnhyxc</span>
              </div>
              <div class="blog">
                博客：
                <span class="link">https://github.com/dnhyxc</span>
              </div>
            </div>
            <div class="view-more" @click="onShowMore">
              <i :class="`font iconfont ${viewMore ? 'icon-arrow-up-bold' : 'icon-arrow-down-bold'}`" />
              <span>查看更多资料</span>
            </div>
          </div>
        </div>
      </div>
      <div class="content">
        <el-tabs type="border-card" class="el-tabs">
          <el-tab-pane v-for="tab in AUTHOR_TABS" :key="tab.value" :label="tab.name">
            <div class="list-wrap">
              <LineCard
                v-for="data in dataSource"
                :key="data.id"
                :data="data"
                class="author-line-card"
                @click="(e) => onClickCard(e, data.id!)"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { HEAD_IMG, AUTHOR_TABS } from '@/constant';
import { TimelineArticles } from '@/typings/common';
import LineCard from '@/components/LineCard/index.vue';

const router = useRouter();

const dataSource = ref<TimelineArticles[]>([
  {
    title: 'react webpac5 项目搭建',
    id: '63e3187be2d6bf53efaa6a3c',
    classify: '架构',
    tag: '前端框架',
    abstract: '项目搭建',
    authorId: '63e24c3be2d6bf53efaa69a9',
    authorName: 'dnhyxc',
    isLike: false,
    likeCount: 0,
    createTime: 1675827289879,
    readCount: 6,
    commentCount: 0,
  },
  {
    title: 'react webpac5 项目搭建',
    id: '63e3187be2d6bf53efaa6a3d',
    classify: '架构',
    tag: '前端框架',
    abstract: '项目搭建',
    authorId: '63e24c3be2d6bf53efaa69a9',
    authorName: 'dnhyxc',
    isLike: false,
    likeCount: 0,
    createTime: 1675827289879,
    readCount: 6,
    commentCount: 0,
  },
  {
    title: 'react webpac5 项目搭建',
    id: '63e3187be2d6bf53efaa6a3a',
    classify: '架构',
    tag: '前端框架',
    abstract: '项目搭建',
    authorId: '63e24c3be2d6bf53efaa69a9',
    authorName: 'dnhyxc',
    isLike: false,
    likeCount: 0,
    createTime: 1675827289879,
    readCount: 6,
    commentCount: 0,
  },
]);

const viewMore = ref<boolean>(false);

// 点击卡片
const onClickCard = (e: Event, id: string) => {
  e.stopPropagation();
  router.push(`/detail/${id}`);
};

// 查看更多信息
const onShowMore = () => {
  viewMore.value = !viewMore.value;
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.author-wrap {
  width: 100%;
  height: 100%;

  .cover {
    width: 100%;
    height: auto;
    background-image: @bg-lg-2;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    padding-bottom: 20px;
    .img-wrap {
      width: 100%;
      height: 200px;

      .cover-img {
        width: 100%;
        height: 100%;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        .imgStyle();
      }
    }

    .author-info {
      position: relative;
      display: flex;
      justify-content: flex-start;
      width: 100%;
      .head-img-wrap {
        position: absolute;
        top: -70px;
        left: 15px;
        width: 150px;
        height: 150px;
        border-radius: 5px;
        padding: 5px;
        background-image: @card-lg;
        box-shadow: 0 0 10px @shadow-color;

        .head-img {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 5px;
          .imgStyle();
        }
      }

      .infos {
        flex: 1;
        padding-left: 190px;
        padding-right: 15px;

        .username {
          font-size: 18px;
          font-weight: 700;
          margin-top: 10px;
        }

        .job {
          padding: 5px 0 3px 0;
          font-size: 14px;
          color: @font-1;
        }

        .user-detail {
          font-size: 14px;
          color: @font-4;
        }

        .view-more {
          font-size: 14px;
          color: @font-4;
          width: 110px;
          margin-top: 5px;
          cursor: pointer;
          .font {
            margin-right: 5px;
          }
        }

        .user-detail {
          .motto,
          .desc,
          .github,
          .juejin,
          .zhihu,
          .blog {
            padding: 3px 0;
            display: flex;
            flex-direction: column;

            .desc-text,
            .link {
              text-indent: 28px;
            }

            .desc-text {
              color: @font-1;
            }

            .link {
              color: @theme-blue;
            }
          }
        }
      }
    }
  }

  .content {
    margin-top: 10px;
    border-radius: 5px;

    .el-tabs {
      border: 1px solid @card-border;
      border-radius: 5px;

      :deep {
        .el-tabs__content {
          padding: 10px;
        }

        .el-tabs__header,
        .el-tabs__nav-wrap {
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
        }

        .el-tabs__header {
          border-bottom: 1px solid @card-border;
          .el-tabs__item.is-active {
            border-left-color: @card-border;
          }
          .el-tabs__item.is-active {
            border-right-color: @card-border;
          }
        }
      }

      .list-wrap {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;

        .author-line-card {
          width: calc(50% - 5px);
          padding: 10px 10px;
          box-shadow: 0 0 5px @shadow-color;
          background-image: @bg-lg-2;
          margin-bottom: 10px;
          border-radius: 5px;
          margin-right: 10px;

          :deep {
            .art-info {
              flex: 1;
            }
          }

          &:nth-child(odd) {
            &:last-child {
              margin-bottom: 0;
            }
          }

          &:nth-child(even) {
            margin-right: 0;
            &:last-child {
              margin-bottom: 0;
            }
          }

          .img-wrap {
            box-sizing: border-box;
            display: flex;
            width: 150px;

            .img {
              display: block;
              width: 100%;
              height: auto;
              border-radius: 5px;
              .imgStyle();
            }
          }
        }
      }
    }
  }
}
</style>
