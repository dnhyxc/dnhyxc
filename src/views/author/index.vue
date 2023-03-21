<!--
 * 关于博主
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
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
                <Image :url="authorStore.userInfo?.headUrl || HEAD_IMG" :transition-img="HEAD_IMG" class="head-img" />
              </div>
              <div class="infos">
                <div class="username">{{ authorStore.userInfo?.username }}</div>
                <div class="job">{{ authorStore.userInfo?.job }}</div>
                <div v-if="viewMore" class="user-detail">
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
                    <span class="link">{{ authorStore.userInfo?.github }}</span>
                  </div>
                  <div class="juejin">
                    掘金：
                    <span class="link">{{ authorStore.userInfo?.juejin }}</span>
                  </div>
                  <div class="zhihu">
                    知乎：
                    <span class="link">{{ authorStore.userInfo?.zhihu }}</span>
                  </div>
                  <div class="blog">
                    博客：
                    <span class="link">{{ authorStore.userInfo?.blog }}</span>
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
            <el-tabs type="border-card" class="el-tabs" @tab-change="onTabChange">
              <el-tab-pane v-for="tab in AUTHOR_TABS" :key="tab.value" :label="tab.name">
                <div v-if="tab.value !== '3'" class="list-wrap">
                  <LineCard
                    v-for="data in authorStore.articleList"
                    :key="data.id"
                    :data="data"
                    class="author-line-card"
                    :delete-article="deleteArticle"
                    :like-list-article="likeListArticle"
                  />
                </div>
                <Timeline
                  v-if="tab.value === '3'"
                  :data-source="authorStore.timelineList"
                  :delete-article="deleteTimeLineArticle"
                  :like-list-article="likeListArticle"
                />
                <div v-if="noMore" class="no-more">没有更多了～～～</div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-scrollbar>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { HEAD_IMG, AUTHOR_TABS, IMG1 } from '@/constant';
import { authorStore, articleStore } from '@/store';
import { useDeleteArticle } from '@/hooks';
import LineCard from '@/components/LineCard/index.vue';
import Image from '@/components/Image/index.vue';
import Loading from '@/components/Loading/index.vue';

const viewMore = ref<boolean>(false);
const isMounted = ref<boolean>(false);
const noMore = computed(() => {
  const { articleList, total, timelineList, currentTabKey } = authorStore;
  return (
    articleList.length >= total && (currentTabKey === '2' ? articleList.length : timelineList[0]?.articles?.length)
  );
});
const disabled = computed(() => authorStore.loading || noMore.value);

const { deleteArticle } = useDeleteArticle({ pageType: 'author' });

onMounted(async () => {
  // 防止页面加载报错
  isMounted.value = true;
  // 重置选中tab key 为 0
  authorStore.currentTabKey = '0';
  // 清空原始数据
  authorStore.clearArticleList();
  // 获取博主信息
  await authorStore.getUserInfo();
  getAuthorArticles();
});

// 获取各tab文章列表
const getAuthorArticles = async () => {
  await authorStore.getAuthorArticles();
};

// tab 切换
const onTabChange = (name: string) => {
  // name: 0：博主文章、name: 1：博主点赞、name: 2：时间轴
  if (name !== '2') {
    // 设置选中tab
    authorStore.currentTabKey = name;
    authorStore.clearArticleList();
    getAuthorArticles();
  } else {
    authorStore.currentTabKey = '2';
    authorStore.clearArticleList();
    authorStore.getAuthorTimeline();
  }
};

// 文章点赞
const likeListArticle = (id: string) => {
  articleStore.likeListArticle({ id, pageType: 'author' });
};

// 删除博主页面时间轴
const deleteTimeLineArticle = (id: string) => {
  authorStore.deleteTimelineArticle(id);
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

    .no-more {
      text-align: center;
      color: @font-4;
      margin: 15px 0 5px;
    }
  }
}
</style>
