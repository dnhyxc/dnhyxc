<!--
 * 收藏集详情
 * @author: dnhyxc
 * @since: 2023-03-24
 * index.vue
-->
<template>
  <Loading :loading="collectStore.loading" class="collect-wrap">
    <template #default>
      <div class="header">
        <div class="left">
          <div class="head-wrap">
            <img :src="HEAD_IMG" alt="头像" class="head-img" />
          </div>
        </div>
        <div class="right">
          <div class="collect-info">
            <div class="collect-name">{{ collectStore.collectInfo?.name || '-' }}</div>
            <el-tooltip v-if="collectStore.collectInfo?.desc" placement="top" effect="light">
              <template #content>
                <span class="introduce-tip">{{ collectStore.collectInfo?.desc }}</span>
              </template>
              <div class="desc">{{ collectStore.collectInfo?.desc || '-' }}</div>
            </el-tooltip>
            <div v-else class="desc">{{ collectStore.collectInfo?.desc || '-' }}</div>
          </div>
          <div class="user-info">
            <span class="username">{{ personalStore.userInfo?.username || '-' }}</span>
            <span class="more-collect" @click.stop="toPersonal">
              更多收藏集
              <i class="iconfont icon-arrow-right-bold" />
            </span>
          </div>
        </div>
      </div>
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div
          v-if="isMounted"
          v-infinite-scroll="getCollectArticleList"
          :infinite-scroll-delay="300"
          :infinite-scroll-disabled="disabled"
          :infinite-scroll-distance="2"
          class="pullup-content"
        >
          <div v-for="i of collectStore.articleList" :key="i.id" class="pullup-list-item">
            <Card :data="i" :like-list-article="likeListArticle">
              <template #actions>
                <div class="action art-action">
                  <span class="move" @click.stop="onMoveTo(i.id)">转移</span>
                  <span class="remove" @click.stop="onReomve(i.id)">移除</span>
                </div>
              </template>
            </Card>
          </div>
          <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" class="to-top" />
        </div>
        <div v-if="noMore" class="no-more">没有更多了～～～</div>
      </el-scrollbar>
    </template>
  </Loading>
  <CollectModel v-model:collect-visible="collectVisible" :article-id="moveArticleId" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScroller } from '@/hooks';
import { articleStore, collectStore, loginStore, personalStore } from '@/store';
// import { formatDate } from '@/utils';
import { scrollTo } from '@/utils';
import { HEAD_IMG } from '@/constant';
import Card from '@/components/Card/index.vue';
import CollectModel from '@/components/CollectModel/index.vue';

const route = useRoute();
const router = useRouter();
const { scrollRef, scrollTop } = useScroller();

const { authorId: userId } = route.query;
const { id: collectId } = route.params;

const isMounted = ref<boolean>(false);
const collectVisible = ref<boolean>(false);
const moveArticleId = ref<string>('');
const noMore = computed(() => {
  const { articleList, total } = collectStore;
  return articleList.length >= total && articleList.length;
});
const disabled = computed(() => collectStore.loading || noMore.value);
// 判断是否展示删除、编辑收藏集的按钮
// const isShowCollectActions = computed(() => !userId || userId === loginStore.userInfo?.userId);

onMounted(async () => {
  // 防止页面加载报错
  isMounted.value = true;
  if (!personalStore.userInfo?.userId) {
    // 获取个人主页信息
    await personalStore.getUserInfo(userId as string);
  }
  // 获取收藏集详情
  collectStore.getCollectInfo(collectId as string);
});

onUnmounted(() => {
  // 清空原始数据
  personalStore.clearArticleList();
});

// 获取收藏集的文章
const getCollectArticleList = () => {
  collectStore.getCollectArticles();
};

// 文章点赞
const likeListArticle = (id: string) => {
  articleStore.likeListArticle({ id, pageType: 'collect' });
};

// 返回我的主页
const toPersonal = () => {
  personalStore.currentTabKey = '1';
  if (userId !== loginStore?.userInfo.userId) {
    router.push(`/personal?authorId=${userId}&tab=2`);
  } else {
    router.push('/personal?tab=2');
  }
};

// 移动文章至别的分组
const onMoveTo = (id: string) => {
  // 清空收藏集弹窗中的页码及收藏集列表数据
  collectStore.init();
  collectVisible.value = true;
  moveArticleId.value = id;
};

// 移除文章
const onReomve = (id: string) => {
  console.log('移除文章', id);
  collectStore.removeArticle(id, collectId as string);
};

// 置顶
const onScrollTo = () => {
  scrollTo(scrollRef, 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.collect-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .header {
    display: flex;
    justify-content: flex-start;
    padding: 10px;
    background-image: @bg-lg-2;
    box-shadow: 0 0 1px @green-sky inset;
    border-radius: 5px;
    height: 120px;
    margin-bottom: 10px;

    .left {
      width: 120px;
      height: 120px;
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
      flex-direction: column;
      justify-content: space-between;

      .collect-info {
        display: flex;
        flex-direction: column;
        margin-right: 10px;

        .collect-name {
          font-size: 18px;
          font-weight: 700;
          .ellipsisMore(1);
        }

        .desc {
          margin-top: 10px;
          font-size: 14px;
          .ellipsisMore(3);
          cursor: pointer;
        }
      }

      .user-info {
        font-size: 14px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        vertical-align: middle;
        width: 100%;

        .username {
          font-size: 18px;
          margin-right: 20px;
          .ellipsisMore(1);
        }

        .more-collect {
          display: flex;
          align-items: center;
          font-size: 14px;
          cursor: pointer;
          color: @theme-blue;
          .clickNoSelectText();
        }
      }
    }
  }

  :deep {
    .scrollbar-wrapper(12px);
  }

  .move {
    margin-right: 10px;
    color: @theme-blue;
    font-size: 14px;
  }

  .remove {
    color: @font-danger;
    font-size: 14px;
  }

  .no-more {
    text-align: center;
    color: @font-4;
    margin-top: 3px;
    .clickNoSelectText();
  }
}

.introduce-tip {
  display: inline-block;
  width: 300px;
}
</style>
