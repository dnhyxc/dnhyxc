<!--
 * 轮播图组件
 * @author: dnhyxc
 * @since: 2023-02-01
 * index.vue
-->
<template>
  <div class="carousel-wrap">
    <el-carousel
      v-if="data?.length > 0"
      :interval="5000"
      trigger="click"
      height="200px"
      indicator-position="none"
      class="carousel"
    >
      <el-carousel-item v-for="item in data" :key="item" @click="toDetail(item.id)">
        <div class="carousel-item">
          <div class="article-info">
            <div class="top">
              <div class="header">
                <div class="title">{{ item.title }}</div>
              </div>
              <div class="create-info">
                <span class="author" @click.stop="toPersonal(item.authorId!)">{{ item.authorName }}</span>
                <span class="date">{{ formatGapTime(item.createTime!) }}</span>
              </div>
            </div>
            <div class="bottom">
              <span class="classify" @click.stop="toClassify(item.classify!)">分类: {{ item.classify }}</span>
              <span class="tag" @click.stop="toTag(item.tag!)">标签: {{ item.tag }}</span>
            </div>
          </div>
          <Image :url="item.coverImage || IMG1" :transition-img="IMG1" class="img" />
        </div>
      </el-carousel-item>
    </el-carousel>
    <el-carousel v-else :interval="5000" trigger="click" direction="vertical" height="200px" class="carousel">
      <el-carousel-item v-for="item in 5" :key="item">
        <div class="carousel-item">
          <Image :url="IMG1" :transition-img="IMG1" class="img" />
        </div>
      </el-carousel-item>
    </el-carousel>
    <div v-for="(item, index) in mostLikeAndNewArticles" :key="item.id" class="hot" @click="toDetail(item.id)">
      <div class="carousel-item">
        <div class="article-info">
          <div class="top">
            <div class="header">
              <div class="title title-text">{{ index ? '最热文章' : '最新文章' }}</div>
            </div>
            <div class="header">
              <div class="title">{{ item.title }}</div>
            </div>
            <div class="create-info">
              <span class="author" @click.stop="toPersonal(item.authorId!)">{{ item.authorName }}</span>
              <span class="date">{{ formatGapTime(item.createTime!) }}</span>
            </div>
          </div>
          <div class="bottom hot-bottom">
            <span class="classify" @click.stop="toClassify(item.classify!)">分类: {{ item.classify }}</span>
            <span class="tag" @click.stop="toTag(item.tag!)">标签: {{ item.tag }}</span>
          </div>
        </div>
        <Image :url="item.coverImage || IMG1" :transition-img="IMG1" class="img" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArticleItem } from '@/typings/common';
import { formatGapTime } from '@/utils';
import { IMG1 } from '@/constant';
import Image from '@/components/Image/index.vue';

const router = useRouter();

interface IProps {
  data: ArticleItem[];
  mostLikeAndNewArticles: ArticleItem[];
}

defineProps<IProps>();

// 去详情页
const toDetail = (id: string) => {
  router.push(`/detail/${id}`);
};

// 去我的主页
const toPersonal = (id: string) => {
  router.push(`/personal?authorId=${id}`);
};

// 去分类
const toClassify = (name: string) => {
  router.push(`/classify?classify=${name}`);
};

// 去标签列表
const toTag = (name: string) => {
  router.push(`/tag/list?tag=${name}`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.carousel-wrap {
  display: flex;
  justify-content: space-between;
  height: 220px;
  margin-bottom: 30px;
  padding: 0 1px 10px 0;
  border-radius: 5px;
  padding-top: 5px;
  box-sizing: border-box;

  .hot {
    flex: 0.5;

    .header {
      justify-content: center;
      .title {
        margin: 5px 0 0 !important;
      }
    }

    .create-info {
      text-align: center;

      .author {
        margin: 0 10px 0 0 !important;
      }
    }
  }

  .carousel {
    flex: 1;
    border-radius: 5px;
  }

  .carousel-item {
    position: relative;
    box-sizing: border-box;
    height: 100%;
    border-radius: 5px;
    padding: 0 5px;

    &:hover {
      .img {
        filter: contrast(80%);
      }

      .title-text {
        color: var(--active) !important;
      }
    }

    .article-info {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 6px 5px 5px;
      border-radius: 5px;

      .top {
        position: relative;
        z-index: 88;
        box-sizing: border-box;

        .header {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          width: 100%;
          overflow: hidden;

          .title {
            display: inline-block;
            font-size: 18px;
            padding: 0 5px 2px 5px;
            margin: 5px 0 0 5px;
            border-radius: 5px;
            color: @fff;
            .ellipsisMore(1);
          }
        }

        .create-info {
          margin-top: 8px;
          .ellipsisMore(1);

          .author,
          .date {
            color: @fff;
            padding: 0 5px 2px 5px;
            border-radius: 5px;
          }

          .author {
            display: inline-block;
            padding: 0 5px 2px 5px;
            margin: 0 10px 0 5px;
            cursor: pointer;

            &:hover {
              color: var(--theme-blue);
              backdrop-filter: blur(10px);
              background-color: @card-action-color;
            }
          }
        }
      }

      .bottom {
        position: relative;
        z-index: 88;
        box-sizing: border-box;
        text-align: right;

        .classify,
        .tag {
          display: inline-block;
          color: @fff;
          padding: 0 5px 2px 5px;
          margin: 0 5px 5px 0;
          border-radius: 5px;
          cursor: pointer;

          &:hover {
            color: var(--theme-blue);
            backdrop-filter: blur(10px);
            background-color: var(--card-btn-mark);
          }
        }

        .tag {
          margin-left: 10px;
        }
      }

      .hot-bottom {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 0 5px 0;
        text-align: center;

        .tag {
          margin-left: 0;
        }
      }
    }

    :deep {
      .img {
        box-sizing: border-box;
        width: 100%;
        height: 200px;
        filter: contrast(100%);
        transition: all 0.5s;

        .image-item {
          border-radius: 5px;
          .imgStyle();
        }
      }
    }
  }
}
</style>
