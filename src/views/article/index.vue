<!--
 * 文章详情新窗口
 * @author: dnhyxc
 * @since: 2023-04-03
 * index.vue
-->
<template>
  <Loading :loading="articleStore.loading" :class="`detail-wrap ${checkOS() === 'mac' && 'mac-detail-wrap'}`">
    <div class="container">
      <div class="header-wrap" @dblclick="onDblclick">
        <div class="left">
          <div class="icon-wrap">
            <i class="page-icon iconfont icon-haidao_" />
          </div>
          <div class="title">{{ route.meta.title }}</div>
        </div>
        <div class="right">
          <div class="sticky">
            <el-tooltip effect="light" content="置顶" placement="bottom" popper-class="custom-dropdown-styles">
              <i
                :class="`${articleStore.stickyStatus && 'active'} font iconfont icon-pin1`"
                @click="onSticky"
              />
            </el-tooltip>
          </div>
          <div class="page-actions">
            <div v-for="svg in ACTION_SVGS" :key="svg.title" class="icon" @click="onClick(svg)">
              <el-tooltip
                effect="light"
                :content="svg.title === '最大化' ? (toggle ? '还原' : svg.title) : svg.title"
                placement="bottom"
                popper-class="custom-dropdown-styles"
              >
                <div
                  :class="`icon-text iconfont ${
                    svg.title === '最大化' ? (toggle ? 'icon-3zuidahua-3' : 'icon-3zuidahua-1') : svg.icon
                  }`"
                />
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
      <div class="content-wrap">
        <div class="content">
          <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
            <div ref="articleInfoRef">
              <PageHeader v-if="articleStore.articleDetail.authorId" />
              <Preview
                v-if="articleStore.articleDetail.content"
                :markdown="articleStore.articleDetail.content"
                class="preview-content"
              />
            </div>
            <Comment
              v-if="articleStore.articleDetail.authorId"
              :id="(route.params.id as string)"
              :author-id="articleStore.articleDetail.authorId!"
              :focus="focus"
              @update-focus="updateFocus"
            />
          </el-scrollbar>
          <ToTopIcon v-if="scrollTop >= 500" :on-scroll-to="onScrollTo" />
        </div>
        <div class="right">
          <Multibar
            v-if="getStoreUserInfo()?.userInfo?.userId"
            :id="(route.params.id as string)"
            class="action-list"
            :scroll-height="articleInfoRef?.offsetHeight"
            :on-scroll-to="() => onScrollTo(articleInfoRef?.offsetHeight)"
          />
          <Toc :class="`${!getStoreUserInfo()?.userInfo?.userId && 'hide-toc-list-border'} toc-list`" />
          <AnotherArticle
            v-if="articleStore.articleDetail.content"
            :id="(route.params.id as string)"
            :classify="articleStore.articleDetail?.classify!"
            :tag="articleStore.articleDetail?.tag!"
            class="another-list"
          />
        </div>
      </div>
    </div>
  </Loading>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { onMounted, onUnmounted, nextTick, ref, inject, watchEffect, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScroller } from '@/hooks';
import { articleStore, commonStore } from '@/store';
import { scrollTo, checkOS, locSetItem, locRemoveItem, getStoreUserInfo, ipcRenderers, modifyTheme } from '@/utils';
import { ACTION_SVGS } from '@/constant';
import { createWebSocket } from '@/socket';
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

const route = useRoute();
const router = useRouter();

const articleInfoRef = ref<HTMLDivElement | null>(null);

// 评论输入框焦点控制变量
const focus = ref<boolean>(false);
// 窗口大小控制状态
const toggle = ref<boolean>(false);
// 指定控制状态

// scrollRef：el-scrollbar ref，scrollTop：滚动距离
const { scrollRef, scrollTop } = useScroller();

onMounted(async () => {
  // 监听更换主题
  ipcRenderer.on('set-theme', (_, theme) => {
    modifyTheme(theme);
  });

  // 登录或者退出时刷新页面
  ipcRenderer.on('restore', (_, data, id) => {
    const info = data && JSON.parse(data);
    if (info.token) {
      locSetItem('userInfo', JSON.stringify(info.userInfo));
      locSetItem('token', info.token);
    } else {
      locRemoveItem('userInfo');
      locRemoveItem('token');
    }
    // 刷新页面
    reload && reload();
  });

  await nextTick(() => {
    commonStore.detailScrollRef = scrollRef.value;
    // 判断页面是否加载完成
    commonStore.updatePageLoadStatus();
  });

  await articleStore.getArticleDetail({ id: route.params.id as string, router });
  // 在详情获取成功后，如果路由路径中携带了scrollTo参数，则说明是从列表中点击评论进来的，需要跳转到评论
  if (route.query?.scrollTo) {
    onScrollTo(articleInfoRef.value?.offsetHeight);
  }

  // 渲染进程监听窗口是否最大化
  ipcRenderer.on('newWin-max', (_, status) => {
    toggle.value = status;
  });

  // 监听主进程发布的刷新页面的消息
  ipcRenderer.on('refresh', (_, params: WinRefreshParams) => {
    const { id, pageType, isTop } = params;
    articleStore.stickyStatus = isTop;
    if (pageType !== 'article' && id === route.params.id) {
      reload && reload();
    }
  });

  // 登录或者退出时刷新页面
  await ipcRenderer.invoke('userInfo', route.params.id);

  // 接受主进程传送的用户信息
  ipcRenderer.once('userInfo', (_, data) => {
    const info = data && JSON.parse(data);
    if (info.token) {
      locSetItem('userInfo', JSON.stringify(info.userInfo));
      locSetItem('token', info.token);
      // 链接websocket
      createWebSocket();
    }
  });

  watchEffect(() => {
    const { userInfo } = getStoreUserInfo();
    if (userInfo?.userId) {
      createWebSocket();
    }
  });
});

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

// 置顶
const onSticky = () => {
  const { id } = route.params;
  articleStore.stickyStatus = !articleStore.stickyStatus;
  ipcRenderers.sendNewWinSticky(articleStore.stickyStatus, id as string);
};

// 双击放大窗口
const onDblclick = () => {
  const { id } = route.params;
  toggle.value = !toggle.value;
  ipcRenderers.sendNewWinMax(id as string);
};

// 点击右侧窗口控制按钮
const onClick = (item: { title: string; svg: string }) => {
  const { id } = route.params;
  if (item.title === '最大化' && checkOS() === 'mac') {
    if (!toggle.value) {
      toggle.value = true;
      ipcRenderers.sendNewWinMax(id as string);
    } else {
      toggle.value = false;
      ipcRenderers.sendNewWinRestore(id as string);
    }
  }

  if (item.title === '最大化' && checkOS() !== 'mac') {
    toggle.value = !toggle.value;
    ipcRenderers.sendNewWinMax(id as string);
  }

  if (item.title === '最小化') {
    ipcRenderers.sendNewWinMin(id as string);
  }

  if (item.title === '关闭') {
    ipcRenderers.sendNewWinOut(id as string);
  }
};

// 滚动置顶
const onScrollTo = (height?: number) => {
  // height 有值说明是点击评论滑动到评论区域，默认使最外层输入框获取焦点
  if (height) {
    focus.value = true;
  }
  scrollTo(scrollRef, height || 0);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.detail-wrap {
  display: flex;
  justify-content: center;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  background-image: var(--bg-image-url);
  background-position: var(--bg-position);
  background-repeat: var(--bg-repeat);
  background-size: var(--bg-img-size);
  animation: var(--bg-animation);
  .bgKeyframes(bgmove);

  .container {
    height: 100%;
    backdrop-filter: var(--backdrop-filter);

    .header-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 55px;
      padding: 0 16px 0 16px;
      -webkit-app-region: drag;

      .left {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        color: var(--font-1);

        .icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;

          .page-icon {
            display: inline-block;
            min-height: 40px;
            line-height: 40px;
            font-size: 35px;
            margin-bottom: 2px;
            margin-right: 20px;
            color: var(--theme-blue);
            cursor: pointer;
            -webkit-app-region: no-drag;
            .menuLg();
          }
        }

        .title {
          font-size: 18px;
          font-weight: 700;
          color: var(--font-color);
          .menuLg();
        }
      }

      .right {
        display: flex;
        align-items: center;
        color: var(--font-1);

        .sticky {
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-app-region: no-drag;

          .font {
            font-size: 16px;
            cursor: pointer;
            margin-left: 15px;
            margin-top: 2px;
            color: var(--font-color);
            font-weight: var(--font-weight);
            .menuLg();
          }

          .active {
            color: var(--theme-blue);
          }
        }

        .page-actions {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
        }

        .icon {
          -webkit-app-region: no-drag;
          cursor: pointer;
          color: var(--font-color);
          font-weight: var(--font-weight);
          .menuLg();

          .icon-text {
            margin-left: 15px;
            font-size: 16px;
          }
        }
      }

      .dl-content {
        .actions {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding-left: 20px;
        }

        .radio-close {
          padding: 0;
          margin-left: 0;
          margin-top: 20px;
          font-size: 16px;

          .font {
            margin-right: 10px;
            color: var(--theme-blue);
          }

          .out-icon {
            color: @font-warning;
          }
        }
      }
    }

    .content-wrap {
      display: flex;
      justify-content: center;
      box-sizing: border-box;
      height: 100%;
      padding: 0 18px;

      .content {
        position: relative;
        display: flex;
        justify-content: center;
        box-sizing: border-box;
        margin-right: 10px;
        height: calc(100vh - 72px);
        width: 77%;
        border-radius: 5px;
        box-shadow: 0 0 5px 0 var(--shadow-mack);
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
      }

      .right {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        width: 23%;
        max-width: 260px;
        min-width: 195px;
        box-sizing: border-box;
        border-radius: 5px;
        max-height: calc(100vh - 72px);

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
  }
}

.mac-detail-wrap {
  --header-height: 55px;

  .container {
    .header-wrap {
      height: var(--header-height);
      box-sizing: border-box;
      border-bottom: 1px solid var(--card-border);
      .clickNoSelectText;
    }

    .content-wrap {
      padding: 0;

      .content {
        height: calc(100vh - var(--header-height));
        margin-right: 0;
        border-radius: 0;
        box-shadow: none;
        border-right: 1px solid var(--card-border);
      }

      .right {
        max-height: calc(100vh - var(--header-height));
        background-color: var(--pre-hover-bg);
        border-radius: 0;

        .action-list {
          border-bottom: 1px solid var(--card-border);

          :deep {
            .action {
              box-shadow: none;
              background-color: transparent;
              border-radius: 0;

              &:not(:nth-child(1)) {
                border-left: 1px solid var(--card-border);
              }

              &:not(:nth-child(4)) {
                border-right: 1px solid var(--card-border);
              }
            }

            .like-wrap {
              border-top-left-radius: 0;
              border-bottom-left-radius: 0;
            }

            .share-wrap {
              border-top-right-radius: 0;
              border-bottom-right-radius: 0;
            }
          }
        }

        .toc-list {
          border-radius: 0;
          box-shadow: none;
          background-color: transparent;
          border-top: 1px solid var(--card-border);
          padding-bottom: 3px;

          :deep {
            .title {
              padding: 8px 10px;
            }
          }
        }

        .hide-toc-list-border {
          border-top: none;
        }

        .another-list {
          box-sizing: border-box;

          :deep {
            .list {

              .article {
                box-shadow: none;
                border-radius: 0;
                border-top: 1px solid var(--card-border);
                background-color: transparent;

                &:first-child {
                  border-bottom: 1px solid var(--card-border);
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
