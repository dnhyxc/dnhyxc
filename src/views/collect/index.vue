<!--
 * 收藏集详情
 * @author: dnhyxc
 * @since: 2023-03-24
 * index.vue
-->
<template>
  <Loading :loading="personalStore.loading" class="collect-wrap">
    <template #default>
      <div class="header">
        <div class="left">
          <div class="head-wrap">
            <img :src="HEAD_IMG" alt="头像" class="head-img" />
          </div>
        </div>
        <div class="right">
          <div class="collect-info">
            <div class="collect-name">{{ personalStore.userInfo?.username || '-' }}</div>
            <el-tooltip v-if="personalStore.userInfo?.introduce" placement="top" effect="light">
              <template #content>
                <span class="introduce-tip">{{ personalStore.userInfo?.introduce }}</span>
              </template>
              <div class="desc">{{ personalStore.userInfo?.introduce || '-' }}</div>
            </el-tooltip>
            <div v-else class="desc">{{ personalStore.userInfo?.introduce || '-' }}</div>
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
          <div class="content">
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
          </div>
        </div>
        <div v-if="noMore" class="no-more">没有更多了～～～</div>
      </el-scrollbar>
    </template>
  </Loading>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDeleteArticle } from '@/hooks';
import { articleStore, loginStore, personalStore } from '@/store';
// import { formatDate } from '@/utils';
import { HEAD_IMG } from '@/constant';

const route = useRoute();
const router = useRouter();

const { authorId: userId } = route.query;

const { deleteArticle } = useDeleteArticle({ pageType: 'personal' });

const isMounted = ref<boolean>(false);
const noMore = computed(() => {
  const { articleList, total } = personalStore;
  return articleList.length >= total && articleList.length;
});
const disabled = computed(() => personalStore.loading || noMore.value);
// 判断是否展示删除、编辑收藏集的按钮
// const isShowCollectActions = computed(() => !userId || userId === loginStore.userInfo?.userId);

onMounted(async () => {
  // 防止页面加载报错
  isMounted.value = true;
  // 清空原始数据
  getCollectArticleList();
});

onUnmounted(() => {
  // 清空原始数据
  personalStore.clearArticleList();
});

// 获取收藏集的文章
const getCollectArticleList = () => {
  console.log('获取收藏的文章');
};

// 文章点赞
const likeListArticle = (id: string) => {
  articleStore.likeListArticle({ id, pageType: 'personal' });
};

// 返回我的主页
const toPersonal = () => {
  console.log(userId, 'userId', loginStore?.userInfo.userId);

  if (userId !== loginStore?.userInfo.userId) {
    console.log('不是当前用户');
    personalStore.currentTabKey = '1';
    router.push(`/personal?authorId=${userId}&tab=2`);
  } else {
    console.log('是当前用户');
    personalStore.currentTabKey = '2';
    router.push('/personal?tab=2');
  }
};

// // 编辑收藏集
// const onEditCollect = (id: string) => {
//   console.log(id, 'onEditCollect');
// };

// // 删除收藏集
// const deleteCollection = (id: string) => {
//   console.log('删除收藏集', id);
//   personalStore.delCollection(id);
// };

// // 去修改资料
// const toSetting = () => {
//   router.push('/setting');
// };
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

  .pullup-content {
    flex: 1;

    .content {
      flex: 1;
      position: relative;
      margin-top: 10px;
      border-radius: 5px;
      border: 1px solid red;
    }
  }

  .no-more {
    text-align: center;
    color: @font-4;
    margin: 15px 0 5px;
    .clickNoSelectText();
  }
}

.introduce-tip {
  display: inline-block;
  width: 300px;
}
</style>
