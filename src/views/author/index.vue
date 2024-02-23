<!--
 * 关于博主
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <!-- <Loading :loading="authorStore.loading" :class="`${checkOS() === 'mac' && 'mac-author-wrap'} author-wrap`"> -->
  <Loading :loading="authorStore.loading" class="author-wrap">
    <template #default>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div
          v-if="isMounted"
          v-infinite-scroll="getAuthorArticles"
          :infinite-scroll-delay="300"
          :infinite-scroll-disabled="disabled"
          :infinite-scroll-distance="2"
          class="pullup-content"
        >
          <div class="cover">
            <div class="img-wrap">
              <Image :url="authorStore.userInfo?.mainCover || IMG1" :transition-img="IMG1" class="cover-img" />
            </div>
            <div class="author-info">
              <div class="head-img-wrap">
                <Image
                  :url="authorStore.userInfo?.headUrl || HEAD_IMG"
                  :transition-img="HEAD_IMG"
                  class="head-img"
                  :on-click="onPreview"
                />
              </div>
              <div class="infos">
                <div class="username">{{ authorStore.userInfo?.username }}</div>
                <div class="job">{{ authorStore.userInfo?.job }}</div>
                <div :class="`${viewMore ? 'all-user-detail' : 'user-detail'}`">
                  <div class="motto">
                    座右铭：
                    <span class="desc-text">{{ authorStore.userInfo?.motto }}</span>
                  </div>
                  <div class="desc">
                    个人介绍：
                    <span class="desc-text">
                      {{ authorStore.userInfo?.introduce }}
                    </span>
                  </div>
                  <div class="github">
                    github：
                    <span class="link" @click.stop="onJump(authorStore.userInfo?.github!, 'github')">{{
                      authorStore.userInfo?.github
                    }}</span>
                  </div>
                  <div class="juejin">
                    掘金：
                    <span class="link" @click.stop="onJump(authorStore.userInfo?.juejin!, '掘金')">{{
                      authorStore.userInfo?.juejin
                    }}</span>
                  </div>
                  <div class="zhihu">
                    知乎：
                    <span class="link" @click.stop="onJump(authorStore.userInfo?.zhihu!, '知乎')">{{
                      authorStore.userInfo?.zhihu
                    }}</span>
                  </div>
                  <div class="blog">
                    博客：
                    <span class="link" @click.stop="onJump(authorStore.userInfo?.blog!, '博客')">{{
                      authorStore.userInfo?.blog
                    }}</span>
                  </div>
                </div>
                <div class="view-more" @click="onShowMore">
                  <i :class="`font iconfont ${viewMore ? 'icon-arrow-up-bold' : 'icon-arrow-down-bold'}`" />
                  <span>{{ viewMore ? '显示简洁资料' : '查看更多资料' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="content">
            <el-tabs type="border-card" class="el-tabs" @tab-change="onTabChange">
              <el-tab-pane
                v-for="tab in AUTHOR_TABS"
                :key="tab.value"
                :label="tab.name"
                :class="`${showEmpty && 'tab-pane'}`"
              >
                <div v-if="tab.value === '1' || tab.value === '2'" class="list-wrap">
                  <LineCard
                    v-for="data in authorStore.articleList"
                    :key="data.id"
                    :data="data"
                    class="author-line-card"
                    :delete-article="deleteArticle"
                    :like-list-article="likeListArticle"
                  />
                </div>
                <div v-if="tab.value === '3'" class="list-wrap">
                  <FollowCard
                    v-for="data in followStore.followList"
                    :key="data.id"
                    :data="data"
                    class="author-line-card"
                    :on-follow="onFollow"
                    :is-auth-user-id="authorStore.userInfo?.userId"
                  />
                </div>
                <ElTimeline
                  v-if="tab.value === '4'"
                  :timeline-list="authorStore.timelineList"
                  :delete-time-line-article="deleteTimeLineArticle"
                  :like-list-article="likeListArticle"
                />
                <div v-if="noMore" class="no-more">没有更多了～～～</div>
                <Empty v-if="showEmpty" />
              </el-tab-pane>
            </el-tabs>
          </div>
          <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" class="to-top" />
          <ImagePreview
            v-model:previewVisible="previewVisible"
            :select-image="{ url: authorStore.userInfo?.headUrl || HEAD_IMG }"
          />
        </div>
      </el-scrollbar>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { ipcRenderer, shell } from 'electron';
import { ref, onMounted, computed, inject, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { HEAD_IMG, AUTHOR_TABS, IMG1 } from '@/constant';
import { authorStore, articleStore, followStore } from '@/store';
import { useDeleteArticle, useScroller } from '@/hooks';
import { scrollTo, checkUrl } from '@/utils';
import LineCard from '@/components/LineCard/index.vue';
import Image from '@/components/Image/index.vue';
import Loading from '@/components/Loading/index.vue';
import Empty from '@/components/Empty/index.vue';
import { ArticleItem, FollowItem, WinRefreshParams, TimelineArticles } from '@/typings/common';

const reload = inject<Function>('reload');

const route = useRoute();
const { scrollRef, scrollTop } = useScroller();

const viewMore = ref<boolean>(false);
const isMounted = ref<boolean>(false);
const previewVisible = ref<boolean>(false);
const noMore = computed(() => {
  const { followList, total: followTotal } = followStore;
  const { articleList, total, timelineList, currentTabKey } = authorStore;
  if (currentTabKey === '3') {
    return timelineList?.length;
  } else if (currentTabKey === '2') {
    return followList?.length && followList?.length >= followTotal;
  } else {
    return articleList.length && articleList.length >= total;
  }
});
const disabled = computed(() => authorStore.loading || noMore.value);
const showEmpty = computed(() => {
  const { followList } = followStore;
  const { timelineList, articleList, currentTabKey, loading } = authorStore;
  if (loading !== null && !loading && currentTabKey === '3' && !timelineList.length) {
    return true;
  } else if (loading !== null && !loading && currentTabKey === '2' && !followList.length) {
    return true;
  } else if (loading !== null && !loading && currentTabKey !== '2' && currentTabKey !== '3' && !articleList.length) {
    return true;
  } else {
    return false;
  }
});

const { deleteArticle } = useDeleteArticle({ pageType: 'author' });

onMounted(async () => {
  // 监听详情点赞状态，实时更改列表对应文章的点赞状态
  ipcRenderer.on('refresh', (_, params: WinRefreshParams) => {
    const { pageType, isLike = true } = params;
    // 需要判断是否是属于当前活动页面，并且只是点击点赞而不是收藏或评论防止重复触发
    if (route.name === 'author' && pageType !== 'list' && isLike) {
      reload && reload();
    }
  });
  // 防止页面加载报错
  isMounted.value = true;
  // 重置选中tab key 为 0
  authorStore.currentTabKey = '0';
  // 清空原始数据
  authorStore.clearArticleList();
  // 清除点赞列表数据
  followStore.clearInteractList();
  // 获取博主信息
  await authorStore.getUserInfo();
  getAuthorArticles();
});

onUnmounted(() => {
  // 清除点赞列表数据
  followStore.clearInteractList();
  authorStore.currentTabKey = '0';
});

// 获取各tab文章列表
const getAuthorArticles = async () => {
  await authorStore.getAuthorArticles();
};

// 预览
const onPreview = () => {
  previewVisible.value = true;
};

// tab 切换
const onTabChange = (name: string) => {
  // 设置选中tab
  authorStore.currentTabKey = name;
  // name: 0：博主文章、name: 1：博主点赞、name: 2：博主关注、name: 3：时间轴
  if (name === '0' || name === '1') {
    authorStore.clearArticleList();
    getAuthorArticles();
  } else if (name === '3') {
    authorStore.clearArticleList();
    authorStore.getAuthorTimeline();
  } else {
    followStore.clearInteractList();
    followStore.getFollowList(authorStore.userInfo?.userId);
  }
};

// 文章点赞
const likeListArticle = async (id: string, data?: ArticleItem) => {
  await articleStore.likeListArticle({ id, pageType: 'author', data });
  // 取消点赞文章重新刷新列表之后，自动滚动到之前查看页面的位置
  if (authorStore.currentTabKey === '1') {
    onScrollTo(scrollTop.value);
  }
};

// 删除博主页面时间轴
const deleteTimeLineArticle = async (data: ArticleItem | TimelineArticles) => {
  await authorStore.deleteTimelineArticle(data?.id!);
};

// 关注/取消关注
const onFollow = (id: string, data?: FollowItem) => {
  followStore.manageFollow(data?.userId!, id);
};

// 查看更多信息
const onShowMore = () => {
  viewMore.value = !viewMore.value;
};

// 跳转到对应的网站
const onJump = (url: string, name: string) => {
  if (checkUrl(url)) {
    // 使用浏览器打开链接
    shell.openExternal(url);
  } else {
    ElMessage({
      message: `${name} 链接无法使用`,
      type: 'warning',
      offset: 80,
    });
  }
};

// 置顶
const onScrollTo = (to?: number) => {
  scrollTo(scrollRef, to || 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.author-wrap {
  margin: 0 4px;
  margin: 8px 4px 0;
  height: calc(100% - 8px);

  .cover {
    width: 100%;
    height: auto;
    border-radius: 5px;
    padding-bottom: 20px;
    border: 1px solid var(--card-border);
    box-sizing: border-box;
    background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);

    .img-wrap {
      width: 100%;
      height: 198px;

      .cover-img {
        width: 100%;
        height: 100%;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        .imgStyle();
      }

      :deep {
        .image-item {
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
        }
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
        background-image: linear-gradient(120deg, var(--card-lg-color1) 0%, var(--card-lg-color2) 100%);
        box-shadow: 0 0 10px var(--shadow-color);
        cursor: pointer;

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
          color: var(--font-1);
        }

        .job {
          padding: 5px 0 3px 0;
          font-size: 14px;
          color: var(--font-1);
        }

        .user-detail {
          font-size: 14px;
          color: var(--font-4);
          transition: all 0.35s ease-in-out;
          max-height: 0;
          overflow: hidden;
        }

        .all-user-detail {
          font-size: 14px;
          color: var(--font-4);
          max-height: 100vh;
          transition: all 0.35s ease-in-out;
        }

        .view-more {
          font-size: 14px;
          color: var(--font-4);
          width: 110px;
          margin-top: 5px;
          cursor: pointer;
          .font {
            margin-right: 5px;
          }

          &:hover {
            color: var(--active-color);
          }
        }

        .user-detail,
        .all-user-detail {
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
              margin-top: 5px;
              cursor: pointer;
            }

            .desc-text {
              color: var(--font-1);
            }

            .link {
              color: var(--theme-blue);

              &:hover {
                color: var(--el-color-primary-light-5);
              }
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
      border: 1px solid var(--card-border);
      border-radius: 5px;
      background-color: transparent;

      :deep {
        .el-tabs__item.is-active {
          background-color: transparent;
          font-weight: 700;
        }
        .el-tabs__content {
          padding: 10px;
        }

        .el-tabs__header,
        .el-tabs__nav-wrap {
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
          background-color: transparent;
          background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
        }

        .el-tabs__header {
          border-bottom: 1px solid var(--card-border);

          .el-tabs__item {
            color: var(--font-1);
          }

          .el-tabs__item.is-active {
            border-left-color: var(--card-border);
            border-right-color: var(--card-border);
            color: var(--theme-blue);
          }
        }
      }

      .tab-pane {
        position: relative;
        min-height: 200px;
      }

      .list-wrap {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;

        .author-line-card {
          width: calc(50% - 5px);
          padding: 10px 10px;
          box-shadow: 0 0 5px var(--shadow-mack);
          background-image: linear-gradient(225deg, var(--bg-lg-color2) 100%, var(--bg-lg-color1) 100%);
          margin-bottom: 10px;
          border-radius: 5px;
          margin-right: 10px;

          :deep {
            .art-info {
              flex: 1;
            }
          }

          &:nth-child(odd) {
            &:nth-last-child(2) {
              margin-bottom: 0;
            }
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

    .no-more {
      text-align: center;
      color: var(--font-4);
      margin: 15px 0 5px;
    }
  }
}

// .mac-author-wrap {
//   padding-left: 5px;
//   padding-right: 3px;
//   width: calc(100% - 8px);
// }
</style>
