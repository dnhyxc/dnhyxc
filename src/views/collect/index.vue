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
            <div class="collect-title">
              <span class="collect-name">
                <i v-if="collectStore.collectInfo?.status === 2" class="iconfont icon-33" />
                {{ collectStore.collectInfo?.name || '-' }}
              </span>
              <div class="create-time">
                {{ formatDate(collectStore.collectInfo?.createTime!, 'YYYY/MM/DD') || '-' }}
              </div>
              <span class="modify">
                <i class="iconfont icon-bianji" @click.stop="onEditCollect">&nbsp;编辑</i>
                <i class="iconfont icon-shanchu" @click.stop="onDeleteCollect">&nbsp;删除</i>
              </span>
            </div>
            <el-tooltip v-if="collectStore.collectInfo?.desc?.length! > 100" placement="bottom" effect="light">
              <template #content>
                <span class="introduce-tip">{{ collectStore.collectInfo?.desc }}</span>
              </template>
              <div class="desc">{{ collectStore.collectInfo?.desc || '-' }}</div>
            </el-tooltip>
            <div v-else class="desc">{{ collectStore.collectInfo?.desc || '-' }}</div>
          </div>
          <div class="user-info">
            <div class="username">{{ personalStore.userInfo?.username || '-' }}</div>
            <div class="more-collect" @click.stop="toPersonal">
              更多收藏集
              <i class="iconfont icon-arrow-right-bold" />
            </div>
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
            <Card :data="i" :like-list-article="likeListArticle" class="card" without-to-detail>
              <template #actions>
                <div v-if="personalStore.userInfo?.userId === loginStore.userInfo?.userId" class="action art-action">
                  <span class="move" @click.stop="onMoveTo(i)">转移</span>
                  <span class="remove" @click.stop="onReomve(i)">移除</span>
                </div>
              </template>
            </Card>
          </div>
          <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" class="to-top" />
        </div>
        <div v-if="noMore" class="no-more">没有更多了～～～</div>
        <Empty v-if="showEmpty" />
      </el-scrollbar>
    </template>
  </Loading>
  <AddCollectModel
    v-model:build-visible="buildVisible"
    v-model:collect-visible="collectVisible"
    :default-values="currentCollectValues"
    :is-edit="isEdit"
  />
  <CollectModel
    v-model:collect-visible="collectVisible"
    v-model:build-visible="buildVisible"
    :article-id="moveArticleId"
  />
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScroller } from '@/hooks';
import { articleStore, collectStore, loginStore, personalStore } from '@/store';
import { ArticleItem, CollectParams } from '@/typings/common';
import { formatDate, scrollTo, showMessage } from '@/utils';
import { HEAD_IMG } from '@/constant';
import Card from '@/components/Card/index.vue';
import CollectModel from '@/components/CollectModel/index.vue';
import AddCollectModel from '@/components/AddCollectModel/index.vue';
import Empty from '@/components/Empty/index.vue';

const reload = inject<Function>('reload');

const route = useRoute();
const router = useRouter();
const { scrollRef, scrollTop } = useScroller();

const { authorId: userId } = route.query;
const { id: collectId } = route.params;

const isMounted = ref<boolean>(false);
const collectVisible = ref<boolean>(false);
const buildVisible = ref<boolean>(false);
const moveArticleId = ref<string>('');
// 传入创建收藏集弹窗，判断是否是编辑
const isEdit = ref<boolean>(false);
const currentCollectValues = ref<CollectParams>({
  name: '',
  desc: '',
  status: '1',
});
// 判断是否是点击的编辑打开的新建收藏集
const fromEdit = ref<boolean>(false);

const noMore = computed(() => {
  const { articleList, total } = collectStore;
  return articleList.length >= total && articleList.length;
});
const disabled = computed(() => collectStore.loading || noMore.value);
const showEmpty = computed(
  () => collectStore.loading !== null && !collectStore.loading && !collectStore.articleList?.length,
);

onMounted(async () => {
  // 监听详情点赞状态，实时更改列表对应文章的点赞状态
  ipcRenderer.on('refresh', (_, id, pageType, isLike = true) => {
    // 需要判断是否是属于当前活动页面，并且只是点击点赞而不是收藏或评论防止重复触发
    if (route.name === 'collect' && pageType !== 'list' && isLike) {
      reload && reload();
    }
  });
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
const likeListArticle = async (id: string, data?: ArticleItem) => {
  await articleStore.likeListArticle({ id, pageType: 'collect', data });
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
const onMoveTo = (data: ArticleItem) => {
  if (data?.isDelete) {
    return showMessage();
  }
  // 清空收藏集弹窗中的页码及收藏集列表数据
  collectStore.init();
  collectVisible.value = true;
  moveArticleId.value = data.id;
};

// 移除文章
const onReomve = async (data: ArticleItem) => {
  if (data?.isDelete) {
    return showMessage();
  }
  collectStore.removeArticle(data.id, collectId as string);
};

// 编辑收藏夹
const onEditCollect = () => {
  const { desc = '', name = '', status = '', id = '' } = collectStore.collectInfo;
  buildVisible.value = true;
  isEdit.value = true;
  fromEdit.value = true;
  // 设置新建弹窗初始化内容
  currentCollectValues.value = {
    desc,
    name,
    status,
    id,
  };
};

// 删除收藏夹
const onDeleteCollect = () => {
  collectStore.deleteCollect(toPersonal);
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
    background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
    box-shadow: 0 0 8px 0 var(--shadow-mack);
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
        color: var(--font-2);

        .collect-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          font-size: 18px;
          font-weight: 700;

          .collect-name {
            flex: 1;
            margin-right: 20px;
            .ellipsisMore(1);

            .icon-33 {
              font-size: 18px;
            }
          }

          .create-time {
            font-size: 14px;
            font-weight: 300;
          }

          .modify {
            font-size: 16px;
            font-weight: 300;
            cursor: pointer;
            display: none;
            .clickNoSelectText();

            .icon-bianji {
              color: var(--theme-blue);
              margin-left: 10px;
            }

            .icon-shanchu {
              color: @font-danger;
              margin-left: 10px;
            }
          }
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
        color: var(--font-2);

        .username {
          flex: 1;
          font-size: 18px;
          margin-right: 20px;
          text-align: right;
          .ellipsisMore(1);
        }

        .more-collect {
          display: flex;
          align-items: center;
          font-size: 14px;
          cursor: pointer;
          color: var(--theme-blue);
          .clickNoSelectText();
        }
      }

      &:hover {
        .modify {
          display: block !important;
        }
      }
    }
  }

  :deep {
    .scrollbar-wrapper(12px);

    .el-tabs {
      background-color: transparent;
    }
  }

  .art-action {
    .move {
      display: inline-block;
      margin-right: 10px;
      color: @fff;
      font-size: 14px;
      background-color: @card-action-color;
      backdrop-filter: blur(10px);
      padding: 0px 5px 2px;
      border-radius: 5px;
    }

    .remove {
      display: inline-block;
      color: @font-danger;
      background-color: @card-action-color;
      font-size: 14px;
      backdrop-filter: blur(10px);
      padding: 0px 5px 2px;
      border-radius: 5px;
    }

    .move,
    .remove {
      &:hover {
        color: var(--active-color);
      }
    }
  }

  .no-more {
    text-align: center;
    color: var(--font-4);
    padding-top: 12px;
    .clickNoSelectText();
  }
}

.introduce-tip {
  display: inline-block;
  width: 300px;
}
</style>
