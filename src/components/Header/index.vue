<!--
 * Header组件
 * @author: dnhyxc
 * @since: 2023-01-28
 * index.vue
-->
<template>
  <div :class="`${checkOS() === 'mac' && 'mac-header-wrap'} header-wrap`" @dblclick="onDblclick">
    <div class="left">
      <div class="icon-wrap">
        <!-- <img :src="PAGEICON" class="page-icon" /> -->
        <i class="page-icon iconfont icon-haidao_" />
      </div>
      <el-tooltip effect="light" content="后退" placement="bottom">
        <i class="font iconfont icon-arrow-left-bold" @click="goBack" />
      </el-tooltip>
      <el-tooltip effect="light" content="前进" placement="bottom">
        <i class="font iconfont icon-arrow-right-bold" @click="goForward" />
      </el-tooltip>
      <div class="title">{{ commonStore.crumbsInfo.crumbsName }}</div>
    </div>
    <div class="right">
      <div class="search-wrap">
        <el-tooltip v-if="!showSearch" effect="light" content="搜索" placement="bottom">
          <i class="font iconfont icon-sousuo2" @click="onClickSearch" />
        </el-tooltip>
        <el-input
          v-if="showSearch"
          ref="searchRef"
          v-model="search"
          class="search-inp"
          placeholder="请输入搜索内容"
          @blur="onBlur"
          @keyup.enter="onEnter"
        >
          <template #suffix>
            <el-icon class="el-input__icon" @click="onEnter">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>
      <el-tooltip effect="light" content="消息" placement="bottom">
        <div class="bell">
          <span class="msg-count">99+</span>
          <i class="bell-font iconfont icon-notification" />
        </div>
      </el-tooltip>
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
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ipcRenderer } from 'electron';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { ACTION_SVGS, MENULIST } from '@/constant';
import { commonStore } from '@/store';
import { checkOS } from '@/utils';
// import PAGEICON from '@/assets/svg/page_icon.svg';

const router = useRouter();
const route = useRoute();

const toggle = ref<boolean>(false);
const showSearch = ref<boolean>(false);
const search = ref<string>('');
const searchRef = ref<HTMLInputElement | null>(null);
const stickyStatus = ref<boolean>(false);

// 监听路由变化，设置当前选中菜单
watchEffect(() => {
  const menu = MENULIST.find((i) => route.path.includes(i.path));
  commonStore.setCrumbsInfo({
    crumbsName: menu?.name || '设置',
    crumbsPath: route.path,
  });
  commonStore.setActivePath(route.path);
});

// 双击放大窗口
const onDblclick = () => {
  toggle.value = !toggle.value;
  ipcRenderer.send('window-max');
};

// 后退
const goBack = () => {
  router.back();
};

// 前进
const goForward = () => {
  router.go(1);
};

// 点击右侧窗口控制按钮
const onClick = (item: { title: string; svg: string }) => {
  if (item.title === '最大化') {
    toggle.value = !toggle.value;
    ipcRenderer.send('window-max');
  }

  if (item.title === '最小化') {
    ipcRenderer.send('window-min');
  }

  if (item.title === '关闭') {
    ipcRenderer.send('window-close');
  }
};

// 置顶
const onSticky = () => {
  stickyStatus.value = !stickyStatus.value;
  ipcRenderer.send('win-show', stickyStatus.value);
};

// 渲染进程监听窗口是否最大化
ipcRenderer.on('mainWin-max', (_, status) => {
  toggle.value = status;
});

// 点击去设置页
const toSetting = () => {
  commonStore.setCrumbsInfo({
    crumbsName: '账号设置',
    crumbsPath: '/setting',
  });
  router.push('/setting');
};

// 点击搜索
const onClickSearch = () => {
  showSearch.value = true;
  nextTick(() => {
    searchRef.value?.focus();
  });
};

// 搜索框失去焦点
const onBlur = () => {
  showSearch.value = false;
  search.value = '';
};

// 输入框回车
const onEnter = () => {
  if (!search.value.trim()) {
    ElMessage({
      message: '请输入搜索内容',
      type: 'warning',
    });
    return;
  }
  console.log(search.value, 'sousuoneirong');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

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

    .search-wrap {
      display: flex;
      align-items: center;
      -webkit-app-region: no-drag;

      .font {
        font-size: 15px;
        cursor: pointer;
        -webkit-app-region: no-drag;
        color: @font-3;
      }

      .search-inp {
        width: 180px;
        margin-left: 15px;

        .el-input__icon {
          font-size: 16px;
        }

        :deep {
          .el-input__wrapper {
            background-color: @menu-weak;
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

      .msg-count {
        position: absolute;
        top: -6px;
        right: -12px;
        font-size: 13px;
        color: @font-danger;
        font-weight: 700;
        cursor: pointer;
      }

      .bell-font {
        font-size: 17px;
        cursor: pointer;
        color: @font-3;
      }
    }

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

    .setting {
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-app-region: no-drag;

      .font {
        font-size: 19px;
        cursor: pointer;
        margin-left: 15px;
        color: @font-3;
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
}

.mac-header-wrap {
  padding: 10 12px;
}
</style>
