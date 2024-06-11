<!--
 * 文章详情
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <Loading :loading="articleStore.loading" :class="`${checkOS() === 'mac' && 'mac-detail-wrap'} detail-wrap`">
    <div class="content">
      <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
        <div ref="articleInfoRef" class="article-info">
          <PageHeader v-if="articleStore.articleDetail?.authorId" />
          <Preview
            v-if="articleStore.articleDetail.content"
            :markdown="articleStore.articleDetail.content"
            :copy-code-success="onCopyCodeSuccess"
            :on-scroll="route.query?.scrollTo ? onScroll : undefined"
          />
          <div v-if="articleStore.articleDetail.content" class="classifys">
            <div class="classify">
              <span class="label">分类：</span>
              <span class="tag_item" @click.stop="toClassify(articleStore.articleDetail.classify!)">{{
                articleStore.articleDetail.classify
              }}</span>
            </div>
            <div class="classify tag">
              <span class="label">标签：</span>
              <span class="tag_item" @click.stop="toTag(articleStore.articleDetail.tag!)">{{
                articleStore.articleDetail.tag
              }}</span>
            </div>
          </div>
        </div>
        <Comment
          v-if="articleStore.articleDetail.authorId"
          :id="(route.params.id as string)"
          :author-id="articleStore.articleDetail.authorId!"
          :focus="focus"
          :on-scroll-to="onScrollTo"
          @update-focus="updateFocus"
        />
      </el-scrollbar>
      <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
    </div>
    <div class="right">
      <Multibar
        :id="(route.params.id as string)"
        :scroll-height="articleInfoRef?.offsetHeight"
        :on-scroll-to="() => onScrollTo(articleInfoRef?.offsetHeight)"
      />
      <Toc class="toc-list" />
      <AnotherArticle
        v-if="articleStore.articleDetail.content"
        :id="(route.params.id as string)"
        :classify="articleStore.articleDetail?.classify!"
        :tag="articleStore.articleDetail?.tag!"
        class="another-list"
      />
    </div>
  </Loading>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { onMounted, onUnmounted, nextTick, ref, inject, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScroller } from '@/hooks';
import { scrollTo, checkOS, message } from '@/utils';
import { articleStore, commonStore } from '@/store';
import { WinRefreshParams } from '@/typings/common';
import PageHeader from '@/components/PreviewHeader/index.vue';
import Multibar from '@/components/Multibar/index.vue';
import Toc from '@/components/Toc/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';
import AnotherArticle from '@/components/AnotherArticle/index.vue';
import Loading from '@/components/Loading/index.vue';

const Preview = defineAsyncComponent(() => import('@/components/Preview/index.vue'));
const Comment = defineAsyncComponent(() => import('@/components/Comment/index.vue'));

const reload = inject<Function>('reload');

const router = useRouter();
const route = useRoute();

const articleInfoRef = ref<HTMLDivElement | null>(null);

// 评论输入框焦点控制变量
const focus = ref<boolean>(false);

// scrollRef：el-scrollbar ref，scrollTop：滚动距离
const { scrollRef, scrollTop } = useScroller();

onMounted(async () => {
  nextTick(() => {
    commonStore.detailScrollRef = scrollRef.value;
  });
  await articleStore.getArticleDetail({ id: route.params.id as string, router });

  // 监听主进程发布的刷新页面的消息
  ipcRenderer.on('refresh', (_, params: WinRefreshParams) => {
    const { id, pageType } = params;
    // 需要判断是否是属于当前活动页面，并且pageType不等于detail，防止重复触发
    if (pageType !== 'detail' && id === route.params.id) {
      reload && reload();
    }
  });
});

// 在详情获取成功后，如果路由路径中携带了scrollTo参数，则说明是从列表中点击评论进来的，需要跳转到评论
const onScroll = () => {
  onScrollTo(articleInfoRef.value?.offsetHeight);
};

// 组件卸载前，清楚store中的详情信息
onUnmounted(() => {
  articleStore.articleDetail = { id: '' };
  articleStore.commentList = [];
  articleStore.anotherArticleList = [];
});

// 更改输入框焦点状态
const updateFocus = (value: boolean) => {
  focus.value = value;
};

// 复制成功回调
const onCopyCodeSuccess = (value?: string) => {
  message({
    title: '复制成功！',
    type: 'success',
  });
};

// 去分类页
const toClassify = (classify: string) => {
  router.push(`/classify?classify=${classify}`);
};

// 去标签
const toTag = (tag: string) => {
  if (route.path !== '/tag/list') {
    router.push(`/tag/list?tag=${tag}`);
  }
};

// 置顶
const onScrollTo = (height?: number, fromEmoji?: boolean) => {
  // height 有值说明是点击评论滑动到评论区域，默认使最外层输入框获取焦点
  if (height) {
    focus.value = true;
  }
  scrollTo(scrollRef, fromEmoji ? scrollTop.value + height! : height || 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.detail-wrap {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  margin: 8px 5px 0;
  height: calc(100% - 8px);

  .content {
    position: relative;
    width: 75%;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    margin-right: 10px;
    border-radius: 5px;
    box-shadow: 0 0 5px 0 var(--card-shadow);
    background-color: var(--pre-hover-bg);

    :deep {
      .el-scrollbar {
        border-radius: 5px;
        width: 100%;
      }

      .scrollbar-wrapper {
        box-sizing: border-box;
        height: 100%;
        border-radius: 5px;
      }
    }

    .article-info {
      .classifys {
        display: flex;
        justify-content: flex-start;
        padding: 5px 20px 15px;
        color: var(--theme-blue);
        margin-bottom: 30px;

        .classify {
          .label {
            font-size: 13px;
            color: var(--font-5);
          }

          .tag_item {
            font-size: 14px;
            padding: 3px 10px 5px;
            border-radius: 5px;
            background-image: linear-gradient(225deg, var(--bg-lg-color1) 0%, var(--bg-lg-color2) 100%);
            .ellipsis();
            cursor: pointer;

            &:hover {
              color: var(--hover-text-color);
            }
          }
        }

        .tag {
          margin-left: 30px;
        }
      }
    }
  }

  .right {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 25%;
    min-width: 195px;
    max-width: 260px;
    max-height: 100%;
    box-sizing: border-box;
    border-radius: 5px;

    .toc-list {
      box-sizing: border-box;
      flex: 1;
      background-color: var(--pre-hover-bg);
    }

    & > :last-child {
      margin-bottom: 0;
    }
  }
}

.mac-detail-wrap {
  padding-right: 0;
}
</style>
