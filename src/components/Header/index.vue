<!--
 * Header组件
 * @author: dnhyxc
 * @since: 2023-01-28
 * index.vue
-->
<template>
  <div class="header-wrap">
    <div class="left">
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
            <el-icon class="el-input__icon" @click="onEnter"><Search /></el-icon>
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
</template>

<script setup lang="ts">
import { ref, watchEffect, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ipcRenderer } from 'electron';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { ACTION_SVGS, MENULIST } from '@/constant';
import { commonStore } from '@/store';

const router = useRouter();
const route = useRoute();

const toggle = ref<boolean>(false);
const showSearch = ref<boolean>(false);
const search = ref<string>('');
const searchRef = ref<HTMLInputElement | null>(null);

// 监听路由变化，设置当前选中菜单
watchEffect(() => {
  const menu = MENULIST.find((i) => i.path === route.path);
  commonStore.setCrumbsInfo({
    crumbsName: menu?.name || '设置',
    crumbsPath: route.path,
  });
  commonStore.setActivePath(route.path);
});

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
  height: 30px;
  padding: 15px;
  -webkit-app-region: drag;

  .left {
    display: flex;
    align-items: center;
    justify-content: flex-start;

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
        font-size: 16px;
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
        font-size: 19px;
        cursor: pointer;
        color: @font-3;
      }
    }
    .setting {
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-app-region: no-drag;
      .font {
        font-size: 20px;
        cursor: pointer;
        margin-left: 15px;
        color: @font-3;
      }
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
</style>
