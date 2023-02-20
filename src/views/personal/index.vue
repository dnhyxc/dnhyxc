<!--
 * 我的主页
 * @author: dnhyxc
 * @since: 2023-01-30
 * index.vue
-->
<template>
  <div class="personal-wrap">
    <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
      <div class="header">
        <div class="left">
          <div class="head-wrap">
            <img :src="HEAD_IMG" alt="头像" class="head-img" />
          </div>
        </div>
        <div class="right">
          <div class="userInfo">
            <div class="username">dnhyxc</div>
            <div class="job">前端工程师</div>
            <div class="motto">行到水穷处，坐看云起时</div>
            <div class="desc">我希望有个如你一般的人，陪我看日出</div>
          </div>
          <div class="actions">
            <div class="top">
              <span v-for="icon in ICONLINKS" :key="icon.name" class="icon">
                <i v-if="icon.label" :class="`${icon.className} font iconfont ${icon.name}`" />
              </span>
            </div>
            <div class="bottom">
              <el-button type="primary" @click="toSetting">修改个人资料</el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="content">
        <el-tabs type="border-card" class="el-tabs">
          <el-tab-pane v-for="tab in tabs" :key="tab.value" :label="tab.name" class="tab-pane">
            <div class="list-wrap">
              <LineCard
                v-for="data in dataSource"
                :key="data.id"
                :data="data"
                class="author-line-card"
                @click="(e: Event) => onClickCard(e, data.id!)"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loginStore } from '@/store';
import { HEAD_IMG, ICONLINKS, ABOUT_ME_TABS, ABOUT_TABS } from '@/constant';
import { TimelineArticles } from '@/typings/common';

const route = useRoute();
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

const tabs = computed(() => {
  const { authorId } = route.query;
  if (authorId && authorId !== loginStore.userInfo.userId) {
    console.log(loginStore.userInfo.userId, '111');

    return ABOUT_TABS;
  } else {
    console.log('222');
    return ABOUT_ME_TABS;
  }
});

// 点击卡片
const onClickCard = (e: Event, id: string) => {
  e.stopPropagation();
  router.push(`/detail/${id}`);
};

// 去修改资料
const toSetting = () => {
  router.push('/setting');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.personal-wrap {
  width: 100%;
  height: 100%;

  .header {
    display: flex;
    justify-content: flex-start;
    padding: 10px;
    background-image: @bg-lg-2;
    box-shadow: 0 0 1px @green-sky inset;
    border-radius: 5px;

    .left {
      width: 130px;
      height: 130px;
      margin-right: 10px;

      .head-wrap {
        width: 100%;
        height: 100%;
        border-radius: 5px;

        .head-img {
          width: 100%;
          height: 100%;
          border-radius: 5px;
          .imgStyle();
        }
      }
    }

    .right {
      flex: 1;
      display: flex;
      justify-content: space-between;

      .userInfo {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        margin-right: 10px;

        .username {
          font-size: 18px;
          font-weight: 700;
          .ellipsisMore(1);
        }

        .job,
        .motto,
        .desc {
          font-size: 14px;
          .ellipsisMore(1);
        }
      }

      .actions {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end;

        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .icon {
            display: block;
            width: auto;
            margin-left: 10px;
            cursor: pointer;

            &:first-child {
              margin-left: 0;
            }
          }
          .font {
            display: flex;
            justify-content: center;
            align-content: center;
            font-size: 28px;
            color: @theme-blue;
            padding: 2px;
            border-radius: 50px;

            &:hover {
              color: @active;
            }
          }

          .blog-icon {
            font-size: 25px;
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
