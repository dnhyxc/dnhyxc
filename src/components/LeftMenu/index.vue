<!--
 * 左侧菜单
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div id="__LEFT_MENU__" :class="`${checkOS() === 'mac' && 'mac-left-menu-wrap'} left-menu-wrap`">
    <el-scrollbar ref="scrollRef">
      <div v-for="menu in menuList" :key="menu.key" class="menu-list" @click="(e: Event) => onSelectMenu(e, menu as MenuListParams)">
        <el-tooltip class="box-item" effect="light" :content="menu.name" placement="right" popper-class="custom-dropdown-styles">
          <i
            :class="`${
              ((activeMenu.path === menu.path && route.path.includes(menu.path)) || route.path === menu.path) &&
              'active'
            } ${menu.key} font iconfont ${menu.icon}`"
          />
        </el-tooltip>
      </div>
    </el-scrollbar>
    <div class="setting">
      <el-popover
        v-if="loginStore?.userInfo?.userId"
        placement="top-start"
        popper-class="login-popover"
        :width="180"
        :show-arrow="false"
        trigger="hover"
      >
        <template #reference>
          <el-avatar
            shape="square"
            :size="checkOS() === 'mac' ? 40 : 38"
            fit="cover"
            :src="loginStore.userInfo?.headUrl || HEAD_IMG"
            class="avatar"
            @click.stop="toPersonal"
          />
        </template>
        <div class="drop-user-info-list">
          <div class="user-info">
            <el-avatar
              shape="square"
              :size="checkOS() === 'mac' ? 40 : 38"
              fit="cover"
              :src="loginStore.userInfo?.headUrl || HEAD_IMG"
              class="avatar"
              @click.stop="toPersonal"
            />
            <div class="username">{{ loginStore.userInfo?.username }}</div>
          </div>
          <div class="drop-item" @click="toPersonal">
            <i class="iconfont icon-gerenzhongxin" />
            <span class="dropdown-text">我的主页</span>
          </div>
          <div class="drop-item" @click="onQuit">
            <i class="iconfont icon-tuichu1" />
            <span class="dropdown-text">退出登录</span>
          </div>
        </div>
      </el-popover>
      <div v-else class="login-btn" @click.stop="onLogin">
        <div class="login">登录</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, inject, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MENULIST, HEAD_IMG } from '@/constant';
import { MenuListParams } from '@/typings/common';
import { loginStore } from '@/store';
import { checkOS } from '@/utils';
import { authRoutes } from '@/router';

const reload = inject<Function>('reload');

const router = useRouter();
const route = useRoute();

const activeMenu = ref<MenuListParams>(MENULIST[0]);
let timer: ReturnType<typeof setTimeout> | null = null;

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
});

// 计算菜单
const menuList = computed(() => {
  const { token, menus } = loginStore;
  const list = token ? MENULIST : MENULIST.filter((i) => i.show && !i.authorWiew);
  // 判断是否是博主，否则无法访问图片集
  const removeMenu = authRoutes.filter((i) => menus.some((j) => j !== i.name));
  // 根据权限设置菜单
  return list.filter((i) =>
    removeMenu.length ? removeMenu.some((j) => j.name !== i.key) : authRoutes.every((j) => j.name !== i.key),
  );
});

// 监听路由变化
watchEffect(() => {
  if (route.path.includes('/tag/list')) {
    const menu = MENULIST.find((i) => route.path.includes(i.path));
    if (menu) {
      activeMenu.value = menu;
    }
  }
});

// 选中菜单
const onSelectMenu = (e: Event, menu: MenuListParams) => {
  e.stopPropagation();
  activeMenu.value = menu;
  if (route.path === menu.path) return;
  router.push(menu.path);
};

// 去我的主页
const toPersonal = () => {
  router.push('/personal');
  if (route.path === '/personal') {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      reload?.();
      timer = null;
    }, 100);
  }
};

// 登录
const onLogin = () => {
  router.push('/login');
};

// 退出登录
const onQuit = () => {
  loginStore.onQuit();
  router.push('/login');
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.left-menu-wrap {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  box-sizing: border-box;
  width: 60px;
  height: 100%;
  padding-left: 1px;
  border-radius: 5px;
  overflow: auto;
  padding-top: 15px;

  .menu-list {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 60px;

    .font {
      display: block;
      font-size: 26px;
      line-height: 35px;
      font-weight: 700;
      color: @sub-2-blue;
      cursor: pointer;
      transition: all 0.3s;
      .menuLg();
      &:hover {
        transform: scale(1.15);
      }
    }

    .active {
      color: var(--active-color);
      .textLgActive();
    }

    .icon-outline-designtools {
      font-size: 25px;
    }

    .icon-luoxuan {
      font-size: 25px;
    }

    .icon-biaoqianku {
      font-size: 25px;
    }

    .icon-shenfenzheng {
      font-size: 23px;
    }
  }

  .setting {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    z-index: 99;

    .login-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 38px;
      height: 38px;
      border-radius: 5px;
      .clickNoSelectText();
      .bgLgColor();
      font-size: 14px;
      cursor: pointer;
      color: var(--active);
      box-shadow: 0 0 2px var(--shadow-color) inset;
    }

    .avatar {
      cursor: pointer;
      .clickNoSelectText();
    }
  }
}

.mac-left-menu-wrap {
  width: 62px;

  .icon-wrap {
    .page-icon {
      width: 38px;
      height: 38px;
      margin-bottom: 10px;
    }
  }

  .menu-list {
    .font {
      font-size: 32px;
    }

    .icon-luoxuan {
      font-size: 31px;
    }

    .icon-shenfenzheng {
      font-size: 28px;
    }

    .icon-biaoqianku {
      font-size: 30px;
    }

    .icon-b-chat,
    .icon-outline-designtools {
      font-size: 30px;
    }
  }
}

.drop-user-info-list {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--font-1);
  .clickNoSelectText();

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-bottom: 5px;
    .username {
      font-size: 18px;
      font-weight: 700;
      margin-top: 10px;
      text-align: center;
      width: 100%;
      .ellipsisMore(1);
    }
  }

  .drop-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-size: 14px;
    cursor: pointer;
    height: 32px;
    line-height: 32px;

    &:hover {
      background-color: var(--pre-bg-color);
      color: var(--theme-blue);
    }

    .dropdown-text {
      margin-left: 5px;
    }
  }
}
</style>
