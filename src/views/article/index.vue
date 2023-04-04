<!--
 * 文章详情新窗口
 * @author: dnhyxc
 * @since: 2023-04-03
 * index.vue
-->
<template>
  <Loading :loading="articleStore.loading" class="detail-wrap">
    <div :class="`${checkOS() === 'mac' && 'mac-header-wrap'} header-wrap`" @dblclick="onDblclick">
      <div class="left">
        <div class="icon-wrap">
          <i class="page-icon iconfont icon-haidao_" />
        </div>
        <div class="title">{{ commonStore.crumbsInfo.crumbsName }}</div>
      </div>
      <div class="right">
        <div class="sticky">
          <el-tooltip effect="light" content="置顶" placement="bottom">
            <i :class="`${stickyStatus && 'active'} font iconfont icon-pin1`" @click="onSticky" />
          </el-tooltip>
        </div>
        <div v-if="checkOS() !== 'mac'" class="page-actions">
          <div v-for="svg in ACTION_SVGS" :key="svg.title" class="icon" @click="onClick(svg)">
            <el-tooltip
              effect="light"
              :content="svg.title === '最大化' ? (toggle ? '还原' : svg.title) : svg.title"
              placement="bottom"
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
      <el-dialog v-model="closeVisible" title="关闭应用" width="380">
        <div class="dl-content">
          <div class="actions">
            <el-button link class="radio-close" @click.stop="onAppClose">
              <i class="font out-icon iconfont icon-tuichu1" />
              退出程序
            </el-button>
          </div>
        </div>
      </el-dialog>
    </div>
    <div class="content-wrap">
      <div class="content">
        <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
          <div ref="articleInfoRef" class="articleInfo">
            <PageHeader />
            <Preview
              v-if="articleStore.articleDetail.content"
              :mackdown="articleStore.articleDetail.content"
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
          :id="(route.params.id as string)"
          class="action-list"
          :scroll-height="articleInfoRef?.offsetHeight"
          :on-scroll-to="() => onScrollTo(articleInfoRef?.offsetHeight)"
        />
        <Toc class="toc-list" />
        <AnotherArticle
          v-if="articleStore.articleDetail.content"
          :id="(route.params.id as string)"
          class="another-list"
        />
      </div>
    </div>
  </Loading>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { onMounted, onUnmounted, nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useScroller } from '@/hooks';
import { articleStore, commonStore } from '@/store';
import { scrollTo, checkOS } from '@/utils';
import { ACTION_SVGS } from '@/constant';
import PageHeader from '@/components/PreviewHeader/index.vue';
import Preview from '@/components/Preview/index.vue';
import Multibar from '@/components/Multibar/index.vue';
import Toc from '@/components/Toc/index.vue';
import ToTopIcon from '@/components/ToTopIcon/index.vue';
import AnotherArticle from '@/components/AnotherArticle/index.vue';
import Comment from '@/components/Comment/index.vue';
import Loading from '@/components/Loading/index.vue';

const route = useRoute();

const articleInfoRef = ref<HTMLDivElement | null>(null);

// 评论输入框焦点控制变量
const focus = ref<boolean>(false);
// 窗口大小控制状态
const toggle = ref<boolean>(false);
// 指定控制状态
const stickyStatus = ref<boolean>(false);
// 窗口关闭状态
const closeVisible = ref<boolean>(false);
const timerRef = ref<ReturnType<typeof setTimeout> | null>();

// scrollRef：el-scrollbar ref，scrollTop：滚动距离
const { scrollRef, scrollTop } = useScroller();

onMounted(async () => {
  // 渲染进程监听窗口是否最大化
  ipcRenderer.on('newWin-max', (_, status) => {
    toggle.value = status;
  });

  nextTick(() => {
    commonStore.detailScrollRef = scrollRef.value;
  });
  await articleStore.getArticleDetail(route.params.id as string);
  // 在详情获取成功后，如果路由路径中携带了scrollTo参数，则说明是从列表中点击评论进来的，需要跳转到评论
  if (route.query?.scrollTo) {
    onScrollTo(articleInfoRef.value?.offsetHeight);
  }
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
  stickyStatus.value = !stickyStatus.value;
  ipcRenderer.send('new-win-show', stickyStatus.value, id);
};

// 最小化程序
const onAppClose = (type?: number) => {
  closeVisible.value = false;
  if (timerRef.value) {
    clearTimeout(timerRef.value);
    timerRef.value = null;
  }
  ipcRenderer.send('new-win-out');
};

// 双击放大窗口
const onDblclick = () => {
  toggle.value = !toggle.value;
  ipcRenderer.send('new-win-max');
};

// 点击右侧窗口控制按钮
const onClick = (item: { title: string; svg: string }) => {
  const { id } = route.params;

  if (item.title === '最大化') {
    toggle.value = !toggle.value;
    ipcRenderer.send('new-win-max', id);
  }

  if (item.title === '最小化') {
    ipcRenderer.send('new-win-min', id);
  }

  if (item.title === '关闭') {
    ipcRenderer.send('new-win-out', id);
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

  .header-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 35px;
    padding: 10px 18px 10px 12px;
    -webkit-app-region: drag;
    .left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
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
          color: @sub-2-blue;
          cursor: pointer;
          -webkit-app-region: no-drag;
          .textLg();
        }
      }
      .font {
        margin-right: 20px;
        cursor: pointer;
        -webkit-app-region: no-drag;
        color: @font-2;

        &:hover {
          color: @active;
          font-weight: 700;
        }
      }
      .title {
        font-size: 18px;
        font-weight: 700;
      }
    }
    .right {
      display: flex;
      align-items: center;

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
          color: @font-3;
        }
        .active {
          color: @sub-2-blue;
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
          color: @theme-blue;
        }

        .out-icon {
          color: @font-warning;
        }
      }
    }
  }
  .mac-header-wrap {
    padding: 10 12px;
  }

  .content-wrap {
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    padding: 0 20px 0 18px;

    .content {
      position: relative;
      flex: 1;
      display: flex;
      justify-content: center;
      box-sizing: border-box;
      margin-right: 10px;
      .pageHeight();
      border-radius: 5px;
      box-shadow: @shadow-mack;

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
      .preview-content {
        max-width: calc(100vw - 352px);
      }
    }
    .right {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      max-width: 260px;
      width: 30%;
      box-sizing: border-box;
      border-radius: 5px;
      max-height: calc(100vh - 75px);

      .action-list {
        margin-bottom: 10px;
      }

      .toc-list {
        box-sizing: border-box;
        flex: 1;
      }
    }
  }
}
</style>
