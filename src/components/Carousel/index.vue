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
      <el-carousel-item v-for="(item, index) in data" :key="item" @click="toDetail(item.id)">
        <ContextMenu class="block" :menu="CARD_CONTEXT_MENU" @select="(e) => onSelectMenu(e, item)">
          <div :class="`carousel-item-${index} carousel-item`">
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
            <Image :url="item.coverImage || IMG1" :transition-img="IMG1" class="img" position="center" />
          </div>
        </ContextMenu>
      </el-carousel-item>
    </el-carousel>
    <el-carousel v-else :interval="5000" trigger="click" height="200px" indicator-position="none" class="carousel">
      <el-carousel-item v-for="item in 5" :key="item">
        <div class="carousel-item">
          <Image :url="IMG1" :transition-img="IMG1" class="img" />
        </div>
      </el-carousel-item>
    </el-carousel>
    <div
      v-for="(item, index) in mostLikeAndNewArticles"
      :key="item?.id"
      :class="`hot ${checkOS() === 'mac' && 'mac-hot'}`"
      @click="toDetail(item.id)"
    >
      <ContextMenu class="block" :menu="CARD_CONTEXT_MENU" @select="(e) => onSelectMenu(e, item)">
        <div :class="`${index === 0 ? 'new-article' : 'hot-article'} carousel-item`">
          <div class="article-info">
            <div class="top">
              <div class="header">
                <div class="title title-text">{{ index ? '最热文章' : '最新文章' }}</div>
              </div>
              <div class="header">
                <div class="title">{{ item?.title }}</div>
              </div>
              <div class="create-info">
                <span class="author" @click.stop="toPersonal(item.authorId!)">{{ item?.authorName }}</span>
                <span class="date">{{ formatGapTime(item?.createTime!) }}</span>
              </div>
            </div>
            <div class="bottom hot-bottom">
              <span class="classify" @click.stop="toClassify(item?.classify!)">分类: {{ item?.classify }}</span>
              <span class="tag" @click.stop="toTag(item.tag!)">标签: {{ item?.tag }}</span>
            </div>
          </div>
          <Image :url="item?.coverImage || IMG1" :transition-img="IMG1" class="img" position="center" />
        </div>
      </ContextMenu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArticleItem } from '@/typings/common';
import { checkOS, formatGapTime, getGradient, ipcRenderers } from '@/utils';
import { CARD_CONTEXT_MENU, IMG1 } from '@/constant';
import Image from '@/components/Image/index.vue';
import ContextMenu from '@/components/ContextMenu/index.vue';
import { loginStore } from '@/store';

const router = useRouter();
const route = useRoute();

interface IProps {
  data: ArticleItem[];
  mostLikeAndNewArticles: ArticleItem[];
}

const props = defineProps<IProps>();

// 拼接渐变色
const carousel0 = computed(() => {
  const gradient = props.data?.[0]?.gradient;
  return getGradient(gradient);
});

const carousel1 = computed(() => {
  const gradient = props.data?.[1]?.gradient;
  return getGradient(gradient);
});

const carousel2 = computed(() => {
  const gradient = props.data?.[2]?.gradient;
  return getGradient(gradient);
});

const carousel3 = computed(() => {
  const gradient = props.data?.[3]?.gradient;
  return getGradient(gradient);
});

const carousel4 = computed(() => {
  const gradient = props.data?.[4]?.gradient;
  return getGradient(gradient);
});

const newArticleLg = computed(() => {
  const gradient = props.mostLikeAndNewArticles?.[0]?.gradient;
  return getGradient(gradient);
});

const hotArticleLg = computed(() => {
  const gradient = props.mostLikeAndNewArticles?.[1]?.gradient;
  return getGradient(gradient);
});

const onSelectMenu = (menu: { label: string; value: number }, item: ArticleItem) => {
  if (menu.value === 1) {
    onOpenNewWindow(item);
  } else {
    toDetail(item.id);
  }
};

const onOpenNewWindow = async (data: ArticleItem) => {
  const {userInfo, token} = loginStore;
  ipcRenderers.sendNewWin({
    path: `article/${ data.id }?from=${ route.name as string }`,
    id: data.id, // articleId
    userInfo: JSON.stringify({userInfo, token}),
  });
};

// 去详情页
const toDetail = (id: string) => {
  router.push(`/detail/${ id }`);
};

// 去我的主页
const toPersonal = (id: string) => {
  router.push(`/personal?authorId=${ id }`);
};

// 去分类
const toClassify = (name: string) => {
  router.push(`/classify?classify=${ name }`);
};

// 去标签列表
const toTag = (name: string) => {
  router.push(`/tag/list?tag=${ name }`);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.commonStyle {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  content: '';
  width: 100%;
  height: 100%;
}

.carousel-wrap {
  display: flex;
  justify-content: space-between;
  border-radius: 5px;
  box-sizing: border-box;

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
      .title-text {
        color: var(--hover-text-color) !important;
      }
    }

    .article-info {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
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
        width: 100%;
        // mix-blend-mode: difference;

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
            text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
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
            text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
          }

          .author {
            display: inline-block;
            padding: 0 5px 2px 5px;
            margin: 0 10px 0 5px;
            cursor: pointer;
            color: var(--el-color-primary);

            &:hover {
              color: var(--hover-text-color);
            }
          }
        }
      }

      .bottom {
        position: relative;
        z-index: 88;
        box-sizing: border-box;
        text-align: right;
        width: 100%;
        //mix-blend-mode: difference;

        .classify,
        .tag {
          display: inline-block;
          color: var(--el-color-primary);
          padding: 0 5px 2px 5px;
          margin: 0 5px 5px 0;
          border-radius: 5px;
          cursor: pointer;
          text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);

          &:hover {
            color: var(--hover-text-color);
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
        width: fit-content;

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
        }
      }
    }
  }

  .new-article, .hot-article {
    .top {
      width: fit-content;
    }
  }

  .carousel-item-0 {
    &:hover {
      .image-wrap-style::before {
        .commonStyle();
        background-image: v-bind(carousel0);
      }
    }
  }

  .carousel-item-1 {
    &:hover {
      .image-wrap-style::before {
        .commonStyle();
        background-image: v-bind(carousel1);
      }
    }
  }

  .carousel-item-2 {
    &:hover {
      .image-wrap-style::before {
        .commonStyle();
        background-image: v-bind(carousel2);
      }
    }
  }

  .carousel-item-3 {
    &:hover {
      .image-wrap-style::before {
        .commonStyle();
        background-image: v-bind(carousel3);
      }
    }
  }

  .carousel-item-4 {
    &:hover {
      .image-wrap-style::before {
        .commonStyle();
        background-image: v-bind(carousel4);
      }
    }
  }

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

    &:hover {
      .new-article {
        .image-wrap-style {
          &::before {
            .commonStyle();
            background-image: v-bind(newArticleLg);
          }
        }
      }

      .hot-article {
        .image-wrap-style {
          &::before {
            .commonStyle();
            background-image: v-bind(hotArticleLg);
          }
        }
      }
    }
  }

  .mac-hot {
    .carousel-item {
      padding: 0 3px 0 5px;

      &:first-child {
        padding-right: 5px;
      }
    }
  }
}
</style>
