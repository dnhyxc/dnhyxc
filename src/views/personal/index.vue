<!--
 * 我的主页
 * @author: dnhyxc
 * @since: 2023-01-30
 * index.vue
-->
<template>
  <Loading :loading="personalStore.loading" class="personal-wrap">
    <template #default>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div
          v-if="isMounted"
          v-infinite-scroll="getMyArticleList"
          :infinite-scroll-delay="300"
          :infinite-scroll-disabled="disabled"
          :infinite-scroll-distance="2"
          class="pullup-content"
        >
          <div class="header">
            <div class="left">
              <div class="head-wrap">
                <img :src="HEAD_IMG" alt="头像" class="head-img" />
              </div>
            </div>
            <div class="right">
              <div class="userInfo">
                <div class="username">{{ personalStore.userInfo?.username || '-' }}</div>
                <div class="job">{{ personalStore.userInfo?.job || '-' }}</div>
                <div class="motto">{{ personalStore.userInfo?.motto || '-' }}</div>
                <el-tooltip v-if="personalStore.userInfo?.introduce" placement="top" effect="light">
                  <template #content>
                    <span class="introduce-tip">{{ personalStore.userInfo?.introduce }}</span>
                  </template>
                  <div class="desc">{{ personalStore.userInfo?.introduce || '-' }}</div>
                </el-tooltip>
                <div v-else class="desc">{{ personalStore.userInfo?.introduce || '-' }}</div>
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
            <el-tabs type="border-card" class="el-tabs" @tab-change="onTabChange">
              <el-tab-pane v-for="tab in tabs" :key="tab.value" :label="tab.name" class="tab-pane">
                <div class="list-wrap">
                  <LineCard
                    v-for="data in personalStore.articleList"
                    :key="data.id"
                    :data="data"
                    class="author-line-card"
                    :delete-article="deleteArticle"
                    :like-list-article="likeListArticle"
                  />
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
        <div v-if="noMore" class="no-more">没有更多了～～～</div>
      </el-scrollbar>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDeleteArticle } from '@/hooks';
import { articleStore, loginStore, personalStore } from '@/store';
import { HEAD_IMG, ICONLINKS, ABOUT_ME_TABS, ABOUT_TABS } from '@/constant';

const route = useRoute();
const router = useRouter();

const { deleteArticle } = useDeleteArticle({ pageType: 'personal' });

const isMounted = ref<boolean>(false);
const noMore = computed(() => {
  const { articleList, total } = personalStore;
  return articleList.length >= total && articleList.length;
});
const disabled = computed(() => personalStore.loading || noMore.value);

// 根据用户信息动态计算tabs
const tabs = computed(() => {
  const { authorId } = route.query;
  if (authorId && authorId !== loginStore.userInfo.userId) {
    return ABOUT_TABS;
  } else {
    return ABOUT_ME_TABS;
  }
});

onMounted(async () => {
  // 防止页面加载报错
  isMounted.value = true;
  // 重置选中tab key 为 0
  personalStore.currentTabKey = '0';
  // 清空原始数据
  personalStore.clearArticleList();
  const { authorId } = route.query;
  if (authorId && authorId !== loginStore.userInfo.userId) {
    // 获取个人主页信息
    await personalStore.getUserInfo(authorId as string);
  } else {
    // 当userId等于登录人的userId时，直接将loginStore中的用户信息赋值给personalStore
    personalStore.userInfo = loginStore.userInfo;
  }
  getMyArticleList();
});

// 获取各tab中的文章列表
const getMyArticleList = async () => {
  await personalStore.getMyArticleList();
};

// tab 切换
const onTabChange = (name: string) => {
  // name: 0：博主文章、name: 1：博主点赞、name: 2：时间轴
  // 设置选中tab
  personalStore.currentTabKey = name;
  // 切换时清空原有数据
  personalStore.clearArticleList();
  // 切换tab时，重新加载数据
  getMyArticleList();
};

// 文章点赞
const likeListArticle = (id: string) => {
  articleStore.likeListArticle({ id, pageType: 'personal' });
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

        .desc {
          cursor: pointer;
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

  .no-more {
    text-align: center;
    color: @font-4;
    margin: 15px 0 5px;
  }
}

.introduce-tip {
  display: inline-block;
  width: 300px;
}
</style>
