<!--
 * 标签文章列表
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="articles-wrap">
    <div class="left">
      <div class="title">
        <span>文章标签列表</span>
        <i
          :class="`font iconfont ${scrollTop > 0 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
          @click="onScrollTo"
        />
      </div>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div
          v-for="i in [
            { value: 1, name: 'Vue3' },
            { value: 2, name: 'Electron' },
            { value: 3, name: 'React' },
            { value: 4, name: 'webpack' },
            { value: 5, name: 'node' },
            { value: 6, name: 'vite' },
            { value: 7, name: 'vite2' },
            { value: 8, name: 'vite3' },
            { value: 9, name: 'vite4' },
            { value: 10, name: 'vite5' },
          ]"
          :key="i.name"
          class="tag-wrap"
        >
          <div :class="`${currentTag === i.name && 'active'} tag`" @click="onCheckTag(i.name)">
            <div class="tag-name">{{ i.name }}</div>
            <div class="tag-count">包含（{{ i.value }}） 篇</div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="right">
      <div class="header">当前选中{{ currentTag }}</div>
      <div class="content">
        <el-scrollbar wrap-class="scrollbar-wrapper">
          <div
            v-infinite-scroll="onFetchData"
            :infinite-scroll-delay="300"
            :infinite-scroll-disabled="disabled"
            :infinite-scroll-distance="2"
            class="article-list"
          >
            <LineCard
              v-for="data in dataSource"
              :key="data.id"
              :data="data"
              class="author-line-card"
              @click="(e:Event) => onClickCard(e, data.id!)"
            />
            <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" class="to-top" />
          </div>
          <div v-if="loading" class="loading">Loading...</div>
          <div v-if="noMore" class="no-more">没有更多了～～～</div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { scrollTo } from '@/utils';
import { useScroller } from '@/hooks';
import { TimelineArticles } from '@/typings/common';

const loading = ref<boolean>(false);

const { scrollRef, scrollTop } = useScroller();

const route = useRoute();
const router = useRouter();

const currentTag = ref<string>(route.query?.tag as string);
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
  {
    title: 'Electron vue3 项目搭建',
    id: '63e3187be2d6bf53efaa6a6a',
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
    title: 'Vue3 + vite',
    id: '63e3187be2d6bf53efaa6a9a',
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
    title: 'Vue3 + vite',
    id: '63e3187be2d6bf53efaa0a9a',
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
    title: 'Vue3 + vite',
    id: '63e3187be2d6bf53efal6a9a',
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
    title: 'Vue3 + vite',
    id: '63e3187be2d6bf530fal6a9a',
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
    title: 'Vue3 + vite',
    id: '63e3187be2d6bf53ef5l6a9a',
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

const noMore = computed(() => dataSource.value.length > 31);
const disabled = computed(() => loading.value || noMore.value);

// 请求数据
const onFetchData = async () => {
  console.log('正在加载更多');

  try {
    loading.value = true;
    const newData: any = await ajaxGet(/* url */);
    loading.value = false;
    console.log(newData, 'newData');

    if (dataSource.value.length > 31) return;
    dataSource.value = [...dataSource.value, ...newData];
  } catch (err) {
    // handle err
    console.log(err);
  }
};

const ajaxGet = async (/* url */) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
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
      ]);
    }, 1000);
  });
};

// 滚动到某位置
const onScrollTo = () => {
  const bottom = scrollRef.value?.wrapRef?.firstElementChild?.offsetHeight;
  scrollTo(scrollRef, scrollTop.value > 0 ? 0 : bottom);
};

// 选中标签
const onCheckTag = (tag: string) => {
  console.log(tag, 'tag');

  currentTag.value = tag;

  router.push(`/tag/list?tag=${tag}`);
};

// 点击卡片
const onClickCard = (e: Event, id: string) => {
  e.stopPropagation();
  router.push(`/detail/${id}`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.articles-wrap {
  display: flex;
  justify-content: flex-start;
  height: 100%;
  box-sizing: border-box;

  .left {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 220px;
    height: 100%;
    box-shadow: @shadow-mack;
    border-radius: 5px;
    padding: 5px;

    :deep {
      .scrollbar-wrapper {
        flex: 1;
      }
    }

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      color: @active;
      border-bottom: 1px solid @card-border;
      margin-bottom: 6px;
      padding-bottom: 9px;
      border-radius: 5px;
      padding: 2px 5px 8px;
      .textLg();

      .font {
        font-size: 18px;
        cursor: pointer;
      }
    }

    .tag-wrap {
      margin-bottom: 10px;
      border-radius: 5px;

      &:first-child {
        margin-top: 5px;
      }

      &:last-child {
        margin-bottom: 5px;
      }

      &:nth-child(odd) {
        .tag {
          background-image: @bg-lg-2;
        }
      }

      &:nth-child(even) {
        .tag {
          background-image: @bg-lg--2;
        }
      }

      &:hover {
        color: @active;
      }

      .tag {
        position: relative;
        box-sizing: border-box;
        width: calc(100% - 10px);
        padding: 5px;
        margin-left: 5px;
        border-radius: 5px;
        cursor: pointer;
        border-bottom: 1px solid @card-border;
        box-shadow: 0 0 5px @shadow-color;

        .tag-name {
          font-size: 16px;
          margin-bottom: 5px;
          .ellipsisMore(1);
        }

        .tag-count {
          font-size: 13px;
          .ellipsisMore(1);
        }
      }

      .active {
        color: @active;
        &::before {
          position: absolute;
          top: 50%;
          left: -5px;
          transform: translateY(-50%);
          content: '';
          width: 4px;
          height: 60%;
          border-top-right-radius: 5px;
          border-bottom-right-radius: 5px;
          background-color: @active;
        }
      }
    }
  }

  .right {
    flex: 1;
    margin-left: 10px;
    box-shadow: @shadow-mack;
    border-radius: 5px;
    padding: 5px 5px;

    .header {
      font-size: 18px;
      font-weight: 700;
      color: @active;
      padding-top: 2px;
      padding-bottom: 8px;
      border-bottom: 1px solid @card-border;
      border-radius: 5px;
      .textLg();
    }

    .content {
      height: calc(100% - 45px);
      margin-top: 6px;

      .article-list {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;

        .author-line-card {
          width: calc(50% - 10px);
          padding: 10px;
          box-shadow: 0 0 5px @shadow-color;
          border-radius: 5px;
          margin: 5px;

          &:nth-child(odd) {
            background-image: @bg-lg-2;
          }

          &:nth-child(even) {
            background-image: @bg-lg--2;
          }

          :deep {
            .art-info {
              flex: 0.6;
            }

            .img-wrap {
              flex: 0.4;
              min-width: initial;
            }
          }
        }
      }

      .loading,
      .no-more {
        text-align: center;
        color: @font-4;
        padding: 10px 0 5px 0;
      }
    }
  }
}
</style>
