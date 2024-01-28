<!--
 * Header组件
 * @author: dnhyxc
 * @since: 2023-01-28
 * index.vue
-->
<template>
  <div id="__HEADER__" :class="`${checkOS() === 'mac' && 'mac-header-wrap'} header-wrap`">
    <div class="left">
      <div class="icon-wrap" @click="goHome">
        <i class="page-icon iconfont icon-haidao_" />
      </div>
      <el-tooltip effect="light" content="后退" placement="bottom">
        <i class="font iconfont icon-arrow-left-bold" @click="goBack" />
      </el-tooltip>
      <el-tooltip effect="light" content="前进" placement="bottom">
        <i class="font iconfont icon-arrow-right-bold" @click="goForward" />
      </el-tooltip>
      <el-tooltip effect="light" content="刷新" placement="bottom">
        <i class="font iconfont icon-reload" @click="onReload" />
      </el-tooltip>
      <div class="title">{{ route.meta.title }}</div>
    </div>
    <div class="right">
      <div class="search-wrap">
        <el-popover
          v-if="!commonStore.showSearch && NEED_HEAD_SEARCH.includes(route.path)"
          placement="bottom"
          popper-class="header-search-popover"
          :show-arrow="false"
          trigger="hover"
        >
          <template #reference>
            <i class="font iconfont icon-sousuo2 search-icon" @click="onClickSearch" />
          </template>
          <div class="search-list">
            <div class="search-item" @click="onCheckSearchType(1)">普通搜索</div>
            <div class="search-item" @click="onCheckSearchType(2)">高级搜索</div>
          </div>
        </el-popover>
        <el-tooltip
          v-if="!commonStore.showSearch && !NEED_HEAD_SEARCH.includes(route.path) && route.path !== '/search'"
          effect="light"
          content="高级搜索"
          placement="bottom"
        >
          <i class="font iconfont icon-sousuo2 senior-search" @click="onClickSearch" />
        </el-tooltip>
        <el-tooltip v-if="commonStore.showSearch" effect="light" content="高级搜索" placement="bottom">
          <i class="iconfont icon-qiehuan" @click="onCheckSearchType(2)" />
        </el-tooltip>
        <el-input
          v-if="commonStore.showSearch"
          ref="searchRef"
          v-model.trim="search"
          class="search-inp"
          placeholder="请输入搜索内容"
          @keyup.enter="onEnter"
        >
          <template #suffix>
            <i class="iconfont icon-shibai clear-search-icon" @click="onEnter" />
          </template>
        </el-input>
      </div>
      <el-popover
        v-if="loginStore.userInfo?.userId"
        v-model:visible="messageStore.visible"
        placement="bottom"
        :width="300"
        trigger="click"
        popper-class="msg-popover"
      >
        <div class="title-popover">
          <span class="title-text">我的消息列表</span>
          <span class="del-action">
            <i
              :class="`scroll-icon iconfont ${scrollTop > 0 ? 'icon-shuangjiantou-shang' : 'icon-shuangjiantou-xia'}`"
              @click="onScrollTo"
            />
            <span v-if="messageStore.msgList?.length" class="del-all" @click="onDeleteAll">全部删除</span>
          </span>
        </div>
        <Messages ref="messageRef" />
        <template #reference>
          <div class="bell">
            <el-tooltip effect="light" content="消息" placement="bottom">
              <div class="msg">
                <span
                  v-if="messageStore.msgCount && !messageStore.visible"
                  :class="`${messageStore.msgCount > 99 && 'max-msg-count'} msg-count`"
                >
                  {{ messageStore.msgCount > 99 ? '99+' : messageStore.msgCount }}
                </span>
                <i class="bell-font iconfont icon-notification" />
              </div>
            </el-tooltip>
          </div>
        </template>
      </el-popover>
      <div class="setting">
        <el-tooltip effect="light" content="设置" placement="bottom">
          <i class="font iconfont icon-shezhi" @click="toSetting" />
        </el-tooltip>
      </div>
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
          <el-button link class="radio-close" @click.prevent="onAppClose(1)">
            <i class="font iconfont icon-3zuidahua-3" />
            最小化到托盘，不退出程序
          </el-button>
          <el-button link class="radio-close" @click.prevent="onAppClose(2)">
            <i class="font out-icon iconfont icon-tuichu1" />
            退出程序
          </el-button>
        </div>
        <div class="close-info">
          <el-checkbox v-model="remindStatus">
            <span class="info-text">不在提醒</span>
          </el-checkbox>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import Store from 'electron-store';
import { ref, watchEffect, nextTick, onUnmounted, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ipcRenderer } from 'electron';
import { ACTION_SVGS, CLOSE_CONFIG, CLOSE_PROMPT, NEED_HEAD_SEARCH } from '@/constant';
import { commonStore, messageStore, loginStore } from '@/store';
import { checkOS, ipcRenderers } from '@/utils';
import Messages from '@/components/Messages/index.vue';

const router = useRouter();
const route = useRoute();
const store = new Store();

const toggle = ref<boolean>(false);
const showSearch = ref<boolean>(false);
const search = ref<string>('');
const searchRef = ref<HTMLInputElement | null>(null);
const stickyStatus = ref<boolean>(false);
const closeVisible = ref<boolean>(false);
const remindStatus = ref<boolean>((store.get(CLOSE_PROMPT) as boolean) || false);
const timerRef = ref<ReturnType<typeof setTimeout> | null>();
const messageRef = ref<any>();
const scrollTop = ref<number>(0);

// 监听路由变化，设置当前选中菜单
watchEffect(() => {
  // 监听不再提示的勾选状态，实时设置store
  if (remindStatus.value !== (store.get(CLOSE_PROMPT) as boolean)) {
    store.set(CLOSE_PROMPT, remindStatus.value);
  }
  scrollTop.value = messageRef.value?.scrollTop;
});

onMounted(() => {
  // 渲染进程监听窗口是否最大化
  ipcRenderer.on('mainWin-max', (_, status) => {
    toggle.value = status;
  });
});

// 清除副作用
onUnmounted(() => {
  if (timerRef.value) {
    clearTimeout(timerRef.value);
  }
  messageStore.visible = false;
});

// 监听页面搜索关键词，如果articleStore.keyword为空，则清除输入框内容
watch(
  () => commonStore.keyword,
  (newVal) => {
    if (!newVal) {
      search.value = '';
    }
  },
);

// 后退
const goBack = () => {
  router.back();
};

// 前进
const goForward = () => {
  router.go(1);
};

// 刷新
const onReload = () => {
  location.reload();
};

// 返回首页
const goHome = () => {
  router.push('/home');
};

// 点击右侧窗口控制按钮
const onClick = (item: { title: string; svg: string }) => {
  if (item.title === '最大化') {
    toggle.value = !toggle.value;
    ipcRenderers.sendWindowMax();
  }

  if (item.title === '最小化') {
    ipcRenderers.sendWindowMin();
  }

  if (item.title === '关闭') {
    const closeConfig = store.get(CLOSE_CONFIG);
    const closePrompt = store.get(CLOSE_PROMPT);
    if (!closePrompt) {
      closeVisible.value = true;
      return;
    }
    closePrompt && closeConfig === 1 && ipcRenderers.sendWindowCLose();
    closePrompt && closeConfig === 2 && ipcRenderers.sendWindowOut();
  }
};

// 最小化程序
const onAppClose = (type: number) => {
  closeVisible.value = false;
  store.set(CLOSE_CONFIG, type);
  if (timerRef.value) {
    clearTimeout(timerRef.value);
    timerRef.value = null;
  }
  // 设置一定的延时等待弹窗先关闭，再关闭程序
  timerRef.value = setTimeout(() => {
    if (type === 1) {
      ipcRenderers.sendWindowCLose();
    } else {
      ipcRenderers.sendWindowOut();
    }
  }, 100);
};

// 置顶
const onSticky = () => {
  stickyStatus.value = !stickyStatus.value;
  ipcRenderers.sendWinSticky(stickyStatus.value);
};

// 点击去设置页
const toSetting = () => {
  router.push('/setting');
};

// 点击搜索
const onClickSearch = () => {
  if (NEED_HEAD_SEARCH.includes(route.path)) {
    showSearch.value = true;
    commonStore.showSearch = true;
    nextTick(() => {
      searchRef.value?.focus();
    });
  } else {
    router.push('/search');
  }
};

// 选择搜索类型
const onCheckSearchType = (value: number) => {
  if (value === 1 && NEED_HEAD_SEARCH.includes(route.path)) {
    showSearch.value = true;
    commonStore.showSearch = true;
    nextTick(() => {
      searchRef.value?.focus();
    });
  } else {
    router.push('/search');
  }
};

// 输入框回车
const onEnter = async (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  if (commonStore.keyword !== value) {
    commonStore.keyword = value;
  }
};

// 删除全部消息
const onDeleteAll = async () => {
  await messageStore.deleteAllMessage();
};

// 滚动到顶部
const onScrollTo = () => {
  messageRef.value?.onScrollTo();
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.header-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  padding: 10px 22px 10px 12px;
  -webkit-app-region: drag;

  .left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 41px;
    color: var(--font-1);
    font-weight: var(--font-weight);

    .icon-wrap {
      position: absolute;
      top: 15px;
      left: 13px;
      display: flex;
      align-items: center;
      justify-content: center;

      .page-icon {
        display: inline-block;
        min-height: 40px;
        line-height: 40px;
        font-size: 35px;
        margin-bottom: 2px;
        color: var(--theme-blue);
        cursor: pointer;
        -webkit-app-region: no-drag;
        transition: all 0.3s;
        font-weight: 500;
        .menuLg();
        &:hover {
          transform: scale(1.15);
        }
      }
    }

    .font {
      cursor: pointer;
      -webkit-app-region: no-drag;
      color: var(--font-color);
      .headerTextLg();
      height: 30px;
      width: 30px;
      line-height: 30px;
      text-align: center;

      &:hover {
        color: var(--active-color);
        font-weight: 700;
      }
    }

    .icon-reload {
      margin-right: 10px;
    }

    .title {
      font-size: 18px;
      color: var(--font-color);
      font-weight: 700;
      .headerTextLg();
    }
  }

  .right {
    display: flex;
    align-items: center;
    color: var(--font-1);
    font-weight: var(--font-weight);

    .search-wrap {
      display: flex;
      align-items: center;
      -webkit-app-region: no-drag;
      color: var(--font-1);

      .font {
        height: 30px;
        line-height: 30px;
        font-size: 15px;
        cursor: pointer;
        -webkit-app-region: no-drag;
        color: var(--font-color);
        .headerTextLg();

        &:hover {
          color: var(--active-color);
        }
      }

      .senior-search {
        margin-top: -1px;
      }

      .icon-qiehuan {
        color: var(--font-color);
        .headerTextLg();
        font-size: 20px;
        cursor: pointer;

        &:hover {
          color: var(--active-color);
        }
      }

      .search-inp {
        width: 180px;
        margin-left: 15px;
        -webkit-app-region: no-drag;

        .clear-search-icon {
          color: var(--placeholder-color);
          margin-bottom: 1px;
          cursor: pointer;
        }

        :deep {
          .el-input__wrapper {
            height: 30px;
            background-color: var(--input-bg-color);
            border-radius: 30px;
            box-shadow: 0 0 0 1px var(--search-border-color) inset;
          }
          .el-input__inner {
            color: var(--font-color);

            &::-webkit-input-placeholder {
              color: var(--placeholder-color);
            }
          }
        }
      }
    }

    .bell {
      position: relative;
      display: flex;
      align-items: center;
      -webkit-app-region: no-drag;
      margin-left: 15px;
      height: 30px;
      line-height: 30px;
      cursor: pointer;

      .msg-count {
        position: absolute;
        top: -5px;
        right: -5px;
        font-size: 12px;
        color: @font-danger;
        font-weight: 700;
      }

      .max-msg-count {
        right: -12px;
      }

      .bell-font {
        font-size: 17px;
        cursor: pointer;
        color: var(--font-color);
        .headerTextLg();

        &:hover {
          color: var(--active-color);
        }
      }
    }

    .sticky {
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-app-region: no-drag;

      .font {
        height: 30px;
        line-height: 30px;
        font-size: 16px;
        cursor: pointer;
        margin-left: 15px;
        margin-top: 1px;
        color: var(--font-color);
        .headerTextLg();
      }

      &:hover {
        .font {
          color: var(--active-color);
        }
      }

      .active {
        color: var(--theme-blue);
      }
    }

    .setting {
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-app-region: no-drag;

      .font {
        height: 30px;
        line-height: 30px;
        font-size: 19px;
        cursor: pointer;
        margin-left: 15px;
        color: var(--font-color);
        .headerTextLg();
      }

      &:hover {
        .font {
          color: var(--active-color);
        }
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
      height: 30px;
      line-height: 30px;
      .headerTextLg();

      .icon-text {
        margin-left: 15px;
        font-size: 16px;
      }

      &:hover {
        color: var(--active-color);
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

    .close-info {
      display: flex;
      margin-top: 15px;

      .info-text {
        display: inline-block;
        margin-top: 2px;
      }
    }
  }

  :deep {
    .el-dialog__body {
      padding: 0 20px 15px 20px;
    }
  }
}

.mac-header-wrap {
  padding: 28px 22px 10px 10px;

  .left {
    padding-left: 45px;

    .icon-wrap {
      top: 30px;
      left: 11px;
      .page-icon {
        font-size: 40px;
      }
    }
  }
}

.title-popover {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--font-1);
  padding: 0 3px 10px;
  font-size: 16px;
  z-index: 99;

  .title-text {
    color: var(--font-color);
    .headerTextLg();
  }

  .del-action {
    display: flex;
    align-items: center;
  }

  .scroll-icon {
    font-size: 16px;
    margin-right: 10px;
    cursor: pointer;
    color: var(--theme-blue);

    &:hover {
      color: var(--active-color);
    }
  }

  .del-all {
    font-size: 14px;
    color: var(--theme-blue);
    cursor: pointer;
    .clickNoSelectText();
    z-index: 99;

    &:hover {
      color: var(--active-color);
    }
  }
}

.search-list {
  position: relative;
  z-index: 99;

  .search-item {
    height: 32px;
    line-height: 32px;
    text-align: center;
    cursor: pointer;
    color: var(--font-color);

    &:hover {
      color: var(--active-color);
    }
  }
}
</style>
