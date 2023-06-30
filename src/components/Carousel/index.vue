<!--
 * 轮播图组件
 * @author: dnhyxc
 * @since: 2023-02-01
 * index.vue
-->
<template>
  <div class="carousel-wrap">
    <el-carousel v-if="data?.length > 0" :interval="6000" trigger="click" type="card" height="210px" class="carousel">
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
    <el-carousel v-else :interval="5000" trigger="click" type="card" height="210px" class="carousel">
      <el-carousel-item v-for="item in 5" :key="item">
        <div class="carousel-item">
          <Image :url="IMG1" :transition-img="IMG1" class="img" />
        </div>
      </el-carousel-item>
    </el-carousel>
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
  height: 230px;
  margin-bottom: 10px;
  padding: 0 0 10px 0;
  border-radius: 5px;

  :deep {
    .el-carousel__mask {
      background-color: @carousel-bg-color;
    }
    .el-carousel__item--card {
      box-sizing: border-box;
      border-radius: 5px;
      // box-shadow: 0 0 1px 0 var(--shadow-mack);
    }
  }

  .carousel {
    border-radius: 5px;
    padding-top: 2px;

    .carousel-item {
      position: relative;
      box-sizing: border-box;
      height: 100%;
      border-radius: 5px;
      padding: 0 5px;

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
              backdrop-filter: blur(3px);
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
              backdrop-filter: blur(3px);
              padding: 0 5px 2px 5px;
              border-radius: 5px;
            }

            .author {
              display: inline-block;
              padding: 0 5px 2px 5px;
              margin: 0 10px 0 5px;

              &:hover {
                color: var(--theme-blue);
                background-color: rgba(225, 225, 225, 0.85);
              }
            }
          }
        }

        .bottom {
          box-sizing: border-box;
          text-align: right;

          .classify,
          .tag {
            display: inline-block;
            backdrop-filter: blur(3px);
            color: @fff;
            padding: 0 5px 2px 5px;
            margin: 0 5px 5px 0;
            border-radius: 5px;

            &:hover {
              color: var(--theme-blue);
              background-color: rgba(225, 225, 225, 0.85);
            }
          }

          .tag {
            margin-left: 10px;
          }
        }
      }

      :deep {
        .img {
          box-sizing: border-box;
          width: 100%;
          height: 210px;

          .image-item {
            border-radius: 5px;
            .imgStyle();
          }
        }
      }
    }

    :deep {
      .is-active {
        // box-shadow: 0 0 3px var(--shadow-mack);
        border-radius: 5px;
      }
    }
  }

  :deep {
    // 更改轮播图小圆点样式
    .el-carousel__indicators--outside {
      .is-active {
        box-shadow: none;

        button {
          background-color: var(--theme-blue);
        }
      }
    }
  }
}
</style>
